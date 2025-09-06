require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://polli-ahaar.web.app"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

// token verify
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized!" });
  }
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized!" });
    }

    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i53p4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ******************************* DB/COLLECTIONS(START) *******************************************
    const db = client.db("PolliAhaarDB");
    const userCollection = db.collection("users");
    const productCollection = db.collection("products");
    const orderCollection = db.collection("orders");
    const reviewCollection = db.collection("reviews");
    // ******************************* DB/COLLECTIONS(END) *******************************************

    // ******************************* ADMIN MIDDLEWARE(START) *******************************************
    // admin verify
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden!" });
      }
      next();
    };
    // ******************************* ADMIN MIDDLEWARE(END) *******************************************

    // ******************************* JWT(START) *******************************************
    // generate jwt token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "24h",
      });
      res.send({ token });
    });
    // ******************************* JWT(END) *******************************************

    // ******************************* POST(START) *******************************************

    //save user data in the db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "Already exist", insertedId: null });
      }
      const result = await userCollection.insertOne({
        ...user,
        role: "user",
        timeStamp: Date.now(),
      });
      res.send(result);
    });

    // add product to db
    app.post("/add-product", verifyToken, verifyAdmin, async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.send(result);
    });

    // POST /orders

    // POST /orders (updated to accept name, label, imageUrl, productsSummary)
    app.post("/orders", verifyToken, async (req, res) => {
      try {
        const {
          items,
          productsSummary: clientSummary,
          shipping = {},
          payment = {},
        } = req.body;

        // --- basic validations ---
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).send({ message: "No items provided." });
        }

        // validate each item & normalize
        const normalizedItems = [];
        for (const it of items) {
          const { productId, qty } = it || {};
          if (!productId || !ObjectId.isValid(productId) || !qty) {
            return res.status(400).send({ message: "Invalid item payload." });
          }

          // normalize fields coming from the frontend
          const name = typeof it.name === "string" ? it.name.trim() : null;
          const label = (it.label ?? it.variantLabel ?? null) || null; // accept either field
          const imageUrl =
            typeof it.imageUrl === "string" && it.imageUrl.trim().length
              ? it.imageUrl.trim()
              : null;

          normalizedItems.push({
            productId: new ObjectId(productId),
            name, // ✅ store product name for audit/history
            label, // ✅ unified label field
            variantLabel: label, // ✅ keep legacy field for compatibility
            imageUrl, // ✅ store image url for order snapshot
            price: Number(it.price) || 0,
            qty: Number(qty) || 1,
          });
        }

        // --- compute totals (server-side safety) ---
        const subtotal = normalizedItems.reduce(
          (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
          0
        );
        const grandTotal = subtotal; // add delivery charge/discount here if you have

        // --- build products summary (server-side truth) ---
        const totalsByProduct = normalizedItems.reduce((acc, it) => {
          const key = it.productId.toString();
          if (!acc[key]) {
            acc[key] = {
              productId: it.productId,
              name: it.name ?? null,
              imageUrl: it.imageUrl ?? null,
              totalQty: 0,
            };
          }
          acc[key].totalQty += Number(it.qty) || 0;
          return acc;
        }, {});
        const serverSummary = Object.values(totalsByProduct);

        // choose server summary, but keep clientSummary if you want to inspect later
        const finalProductsSummary = serverSummary;

        // derive user email from token if available; fall back to shipping
        const userEmail =
          (req.user && (req.user.email || req.user.userEmail)) ||
          shipping?.email ||
          null;

        // --- order doc ---
        const now = new Date();
        const orderDoc = {
          userEmail,
          items: normalizedItems,
          productsSummary: finalProductsSummary, // ✅ saved with order
          shipping,
          payment,
          amounts: { subtotal, grandTotal },
          status: "pending", // pending | confirmed | shipped | delivered | cancelled
          createdAt: now,
          updatedAt: now,
        };

        // --- insert the order first ---
        const orderResult = await orderCollection.insertOne(orderDoc);

        // --- increment orderCount on each product (by qty) ---
        const incOps = normalizedItems.map((it) => ({
          updateOne: {
            filter: { _id: it.productId },
            update: { $inc: { orderCount: Number(it.qty) || 0 } }, // creates field if missing
          },
        }));
        if (incOps.length) {
          await productCollection.bulkWrite(incOps, { ordered: false });
        }

        // --- OPTIONAL: reduce stock on the specific variant ---
        // Product schema example:
        // { _id, variants: [{ label: "১ কেজি", stock: 10, ... }, ...] }
        const stockOps = normalizedItems
          .filter((it) => it.label) // use unified 'label'
          .map((it) => ({
            updateOne: {
              filter: { _id: it.productId },
              update: {
                $inc: { "variants.$[v].stock": -Math.abs(Number(it.qty) || 0) },
              },
              arrayFilters: [{ "v.label": it.label }],
            },
          }));
        if (stockOps.length) {
          await productCollection.bulkWrite(stockOps, { ordered: false });
        }

        return res.send({
          ok: true,
          orderId: orderResult.insertedId,
          message: "Order placed successfully.",
        });
      } catch (err) {
        console.error("POST /orders error:", err);
        return res.status(500).send({ message: "Failed to place order." });
      }
    });

    // Body shape:
    // {
    //   items: [
    //     { productId: "66b11...abc", variantLabel: "১ কেজি", price: 140, qty: 2 },
    //     { productId: "66b22...def", variantLabel: "500g",  price: 210, qty: 1 }
    //   ],
    //   shipping: { name, phone, address, note },   // whatever you collect
    //   payment:  { method: "COD" }                 // optional
    // }
    // app.post("/orders", verifyToken, async (req, res) => {
    //   try {
    //     const { items, shipping = {}, payment = {} } = req.body;

    //     // --- basic validations ---
    //     if (!Array.isArray(items) || items.length === 0) {
    //       return res.status(400).send({ message: "No items provided." });
    //     }
    //     for (const it of items) {
    //       if (!it.productId || !ObjectId.isValid(it.productId) || !it.qty) {
    //         return res.status(400).send({ message: "Invalid item payload." });
    //       }
    //     }

    //     // --- compute totals (server-side safety) ---
    //     const subtotal = items.reduce(
    //       (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
    //       0
    //     );
    //     const grandTotal = subtotal; // add delivery charge/discount here if you have

    //     // --- order doc ---
    //     const orderDoc = {
    //       userEmail: req.body.shipping?.email || null, // from verifyToken
    //       items: items.map((it) => ({
    //         productId: new ObjectId(it.productId),
    //         variantLabel: it.variantLabel ?? null,
    //         price: Number(it.price) || 0,
    //         qty: Number(it.qty) || 1,
    //       })),
    //       shipping,
    //       payment,
    //       amounts: { subtotal, grandTotal },
    //       status: "pending", // pending | confirmed | shipped | delivered | cancelled
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     };

    //     // --- insert the order first ---
    //     const orderResult = await orderCollection.insertOne(orderDoc);

    //     // --- increment orderCount on each product (by qty) ---
    //     const incOps = items.map((it) => ({
    //       updateOne: {
    //         filter: { _id: new ObjectId(it.productId) },
    //         update: { $inc: { orderCount: Number(it.qty) || 0 } }, // creates field if missing
    //       },
    //     }));
    //     if (incOps.length) {
    //       await productCollection.bulkWrite(incOps, { ordered: false });
    //     }

    //     // --- OPTIONAL: reduce stock on the specific variant ---
    //     // If your product doc looks like:
    //     // { _id, variants: [{ label: "১ কেজি", stock: 10, ... }, ...] }
    //     // this will subtract qty from the matching variant's stock (never below 0)
    //     const stockOps = items
    //       .filter((it) => it.variantLabel)
    //       .map((it) => ({
    //         updateOne: {
    //           filter: { _id: new ObjectId(it.productId) },
    //           update: {
    //             $inc: { "variants.$[v].stock": -Math.abs(Number(it.qty) || 0) },
    //           },
    //           arrayFilters: [{ "v.label": it.variantLabel }],
    //         },
    //       }));
    //     if (stockOps.length) {
    //       await productCollection.bulkWrite(stockOps, { ordered: false });
    //     }

    //     return res.send({
    //       ok: true,
    //       orderId: orderResult.insertedId,
    //       message: "Order placed successfully.",
    //     });
    //   } catch (err) {
    //     console.error("POST /orders error:", err);
    //     return res.status(500).send({ message: "Failed to place order." });
    //   }
    // });

    // *****REVIEWS RELATED API'S*******
    app.post("/review", verifyToken, async (req, res) => {
      try {
        const data = req.body;

        // Save review
        const result = await reviewCollection.insertOne(data);

        // Mark order as reviewed
        if (data.orderId) {
          await orderCollection.updateOne(
            { _id: new ObjectId(data.orderId) },
            { $set: { reviewed: true } }
          );
        }

        res.send(result);
      } catch (err) {
        console.error("POST /review error:", err);
        res.status(500).send({ message: "Failed to submit review." });
      }
    });

    // ******************************* POST(END) *******************************************

    // ******************************* GET(START) *******************************************

    //  ********USER RELATED API*********
    // get user data from db
    app.get("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // check if a user is admin
    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }

      res.send({ admin });
    });

    // ✅ Get all users (admin only)
    // Query params:
    //   - search: fuzzy on name/email
    //   - role: filter by role (e.g., "admin", "user")
    //   - page: number (default 1)
    //   - limit: number (default 20)
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { search = "", role, page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        if (role) query.role = role;
        if (search) {
          const rx = { $regex: search, $options: "i" };
          query.$or = [{ name: rx }, { email: rx }];
        }

        const [items, total] = await Promise.all([
          userCollection
            .find(query)
            .project({ password: 0 }) // never return passwords if present
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray(),
          userCollection.countDocuments(query),
        ]);

        res.send({
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          items,
        });
      } catch (err) {
        console.error("GET /users failed:", err);
        res.status(500).send({ message: "Failed to fetch users" });
      }
    });

    //  ********Product RELATED API*********
    // GET /products
    // Query:
    // - search: string (fuzzy on name/type/brand/originDistrict/variants.label)
    // - category: string
    // - status: "active" | "draft"
    // - featured: "true" | "false"
    // - origin: string
    // - brand: string
    // - type: string
    // - unit: "গ্রাম" | "কেজি" | "লিটার" | "পিস" | "বস্তা"
    // - inStock: "true" (at least one variant with stock > 0)
    // - minPrice, maxPrice: number (match any variant within range)
    // - sort: "newest" | "asc" | "des"   (asc/des = by lowest variant price)
    // - page, limit
    app.get("/products", async (req, res) => {
      try {
        const {
          search = "",
          category,
          status,
          featured,
          origin,
          brand,
          type,
          unit,
          inStock,
          minPrice,
          maxPrice,
          sort = "newest",
          page = 1,
          limit = 20,
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        // ---------- Build base match ----------
        const and = [];

        // simple equals filters
        if (category) and.push({ category });
        if (status) and.push({ status });
        if (origin) and.push({ originDistrict: origin });
        if (brand) and.push({ brand });
        if (type) and.push({ type });

        if (typeof featured !== "undefined") {
          and.push({ featured: String(featured).toLowerCase() === "true" });
        }

        // unit filter (any variant with this unit)
        if (unit) and.push({ "variants.unit": unit });

        // in-stock (any variant with stock > 0)
        if (String(inStock).toLowerCase() === "true") {
          and.push({ "variants.stock": { $gt: 0 } });
        }

        // price range on any variant
        const priceCond = {};
        if (minPrice !== undefined) priceCond.$gte = Number(minPrice);
        if (maxPrice !== undefined) priceCond.$lte = Number(maxPrice);
        if (Object.keys(priceCond).length) {
          and.push({ "variants.price": priceCond });
        }

        // search (case-insensitive)
        if (search) {
          const rx = { $regex: search, $options: "i" };
          and.push({
            $or: [
              { name: rx },
              { type: rx },
              { brand: rx },
              { originDistrict: rx },
              { description: rx },
              { "variants.label": rx },
            ],
          });
        }

        const matchStage = and.length ? { $and: and } : {};

        // ---------- Total count (no need to sort for counting) ----------
        const total = await productCollection.countDocuments(matchStage);

        // ---------- Fetch page (aggregation to support price sorting) ----------
        const pipeline = [{ $match: matchStage }];

        // compute min price per product for sorting/filtering UX
        pipeline.push({
          $addFields: {
            minPrice: { $min: "$variants.price" },
          },
        });

        if (sort === "asc") {
          pipeline.push({ $sort: { minPrice: 1, _id: -1 } });
        } else if (sort === "des") {
          pipeline.push({ $sort: { minPrice: -1, _id: -1 } });
        } else {
          // newest
          pipeline.push({ $sort: { _id: -1 } });
        }

        pipeline.push({ $skip: skip }, { $limit: limitNum });

        const items = await productCollection.aggregate(pipeline).toArray();

        res.send({
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          items,
        });
      } catch (err) {
        console.error("GET /products failed:", err);
        res.status(500).send({ message: "Failed to fetch products" });
      }
    });

    //  ********ORDERS RELATED API*********

    // GET /orders/my/:email
    app.get("/orders/my/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email?.toLowerCase();
        // const tokenEmail = req.user?.email?.toLowerCase();
        if (!email) return res.status(400).send({ message: "Email required" });

        // // enforce that callers can only read their own orders
        // if (email !== tokenEmail) {
        //   return res.status(403).send({ message: "Forbidden" });
        // }

        // pagination
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
          Math.max(parseInt(req.query.limit, 10) || 10, 1),
          100
        );
        const skip = (page - 1) * limit;

        const match = { userEmail: email }; // or { userEmail: email } based on your doc
        const total = await orderCollection.countDocuments(match);

        const items = await orderCollection
          .find(match)
          .sort({ _id: -1 }) // newest first
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          items,
        });
      } catch (err) {
        console.error("GET /orders/my/:email failed:", err);
        res.status(500).send({ message: "Failed to fetch orders" });
      }
    });

    // get a single order by id
    app.get("/orders/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid order ID" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await orderCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Order not found" });
        }

        res.send(result);
      } catch (err) {
        console.error("Error fetching order:", err);
        res.status(500).send({ message: "Server error while fetching order" });
      }
    });

    // ✅ Get all orders (admin only)
    app.get("/orders", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const {
          search = "",
          status,
          page = 1,
          limit = 20,
          sort = "newest",
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const query = {};

        // status filter
        if (status) {
          query.status = status;
        }

        // search across shipping fields + exact _id if valid
        if (search) {
          const rx = { $regex: search, $options: "i" };
          const or = [
            { "shipping.name": rx },
            { "shipping.email": rx },
            { "shipping.phone": rx },
            { "shipping.address": rx },
          ];

          // If search looks like an ObjectId, include exact _id match
          if (ObjectId.isValid(search)) {
            or.push({ _id: new ObjectId(search) });
          } else {
            // Optional: allow searching last 6-8 chars of _id by stringifying
            // Requires MongoDB 4.0+: $toString
            or.push({
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: search,
                  options: "i",
                },
              },
            });
          }
          query.$or = or;
        }

        const sortStage = sort === "oldest" ? { _id: 1 } : { _id: -1 };

        const [items, total] = await Promise.all([
          orderCollection
            .find(query)
            .project({
              // return the fields your UI needs
              items: 1,
              shipping: 1,
              status: 1,
              amounts: 1,
              createdAt: 1,
              reviewed: 1,
            })
            .sort(sortStage)
            .skip(skip)
            .limit(limitNum)
            .toArray(),
          orderCollection.countDocuments(query),
        ]);

        res.send({
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          items,
        });
      } catch (err) {
        console.error("GET /orders failed:", err);
        res.status(500).send({ message: "Failed to fetch orders" });
      }
    });

    // *******REVIEWS********
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // ********* User ANALYTICS*********
    app.get("/user-stats/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const registrations = await registrationCollection
        .aggregate([
          {
            $match: { "participant.email": email },
          },
          {
            $group: {
              _id: "$participant.email", //group id email
              totalCamps: { $sum: 1 }, // total registered camps
              // totalSpent: { $sum: "$price" }, // sum of total price in registration by price field
              totalSpent: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$payment_status", "paid"],
                    },
                    "$price",
                    0,
                  ],
                },
              },

              // statusCount: { $push: "$status" },
              confirmedCount: {
                $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
              },
              pendingCount: {
                $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
              },
              // paymentStatusCount: { $push: "$payment_status" },
              Paid: {
                $sum: {
                  $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0],
                },
              },
              unpaid: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$payment_status", "pending"],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      res.send(registrations[0] || {});
    });

    // ********* Admin ANALYTICS*********
    app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const totalCamps = await campCollection.countDocuments(); // Total campaigns
        const totalUsers = await userCollection.countDocuments(); // Total registered users

        // Total registrations & count of paid/unpaid users
        const totalRegistrations =
          await registrationCollection.countDocuments();
        const paidRegistrations = await registrationCollection.countDocuments({
          payment_status: "paid",
        });
        const unpaidRegistrations = totalRegistrations - paidRegistrations;

        // Total revenue
        const totalRevenueResult = await paymentCollection
          .aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
          ])
          .toArray();
        const totalRevenue =
          totalRevenueResult.length > 0
            ? totalRevenueResult[0].totalRevenue
            : 0;

        res.json({
          totalCamps,
          totalUsers,
          totalRegistrations,
          paidRegistrations,
          unpaidRegistrations,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ******************************* GET(END) *******************************************

    // ******************************* PUT/PATCH(START) *******************************************

    // user update by id
    app.patch("/user/update/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          image: data.image,
          address: data.address,
          phone: data.phone,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // ✅ Update user role (admin only)
    // Body: { role: "admin" | "user" | "manager" }  <-- adjust allowed roles as you need
    app.put("/user/:id/role", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const { role } = req.body;

        const ALLOWED_ROLES = new Set(["admin", "user"]); // ✏️ customize
        if (!ALLOWED_ROLES.has(role)) {
          return res.status(400).send({ message: "Invalid role" });
        }

        // (Optional) prevent self-demotion if you want:
        // if (req.user?._id === id && role !== "admin") {
        //   return res.status(400).send({ message: "You cannot change your own role." });
        // }

        const query = { _id: new ObjectId(id) };
        const update = { $set: { role } };
        const result = await userCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send({ modifiedCount: result.modifiedCount, role });
      } catch (err) {
        console.error("PUT /user/:id/role failed:", err);
        res.status(500).send({ message: "Failed to update user role" });
      }
    });

    // update product data
    app.put("/product/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };

      const update = {
        $set: data,
      };

      const options = { upsert: true };
      const result = await productCollection.updateOne(query, update, options);
      res.send(result);
    });

    //  ********ORDER RELATED API*********

    // PATCH: update shipping info of an order
    app.patch("/orders/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid order ID" });
        }

        const { shipping } = req.body;
        if (!shipping?.name || !shipping?.phone || !shipping?.address) {
          return res
            .status(400)
            .send({ message: "Missing required shipping fields" });
        }

        const query = { _id: new ObjectId(id) };
        const update = {
          $set: {
            shipping,
            updatedAt: new Date(),
          },
        };

        const result = await orderCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Order not found" });
        }

        res.send({
          message: "Order updated successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).send({ message: "Server error while updating order" });
      }
    });

    // PATCH: cancel order
    app.patch("/orders/:id/cancel", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid order ID" });
        }

        const query = { _id: new ObjectId(id) };

        // allow cancel only if status is still pending
        const order = await orderCollection.findOne(query);
        if (!order) {
          return res.status(404).send({ message: "Order not found" });
        }
        if (order.status && order.status.toLowerCase() !== "pending") {
          return res
            .status(400)
            .send({ message: "Only pending orders can be cancelled" });
        }

        const update = {
          $set: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        };

        const result = await orderCollection.updateOne(query, update);

        res.send({
          message: "Order cancelled successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (err) {
        console.error("Error cancelling order:", err);
        res
          .status(500)
          .send({ message: "Server error while cancelling order" });
      }
    });

    // ✅ Update order status (admin)
    app.patch(
      "/orders/:id/status",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const { status } = req.body || {};
          const allowed = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "completed",
            "cancelled",
          ];
          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid order ID" });
          }
          if (!allowed.includes(String(status || "").toLowerCase())) {
            return res.status(400).send({ message: "Invalid status" });
          }

          const query = { _id: new ObjectId(id) };
          const update = {
            $set: { status: status.toLowerCase(), updatedAt: new Date() },
          };

          const result = await orderCollection.updateOne(query, update);
          if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Order not found" });
          }
          res.send({
            message: "Status updated",
            modifiedCount: result.modifiedCount,
          });
        } catch (err) {
          console.error("PATCH /orders/:id/status failed:", err);
          res.status(500).send({ message: "Failed to update status" });
        }
      }
    );

    //  ********Registration RELATED API*********
    // update status in both registration collection and payment collection
    app.patch(
      "/registration/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: "confirmed" } };
        const result = await registrationCollection.updateOne(query, updateDoc);

        // update in payment collection as well
        // console.log(id);
        const filter = {
          registrationId: id,
        };
        const updateStatus = {
          $set: {
            status: "confirmed",
          },
        };

        //
        const paymentConfirm = await paymentCollection.updateOne(
          filter,
          updateStatus
        );

        res.send(result);
      }
    );

    // ******************************* PUT/PATCH(END) *******************************************

    // ******************************* DELETE(START) *****************************************

    // ********Product RELATED API'S************
    // delete product
    app.delete("/product/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // ******** ORDER related API's **************
    // ✅ Delete order (admin)
    app.delete("/orders/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid order ID" });
        }
        const result = await orderCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Order not found" });
        }
        res.send({
          message: "Order deleted",
          deletedCount: result.deletedCount,
        });
      } catch (err) {
        console.error("DELETE /orders/:id failed:", err);
        res.status(500).send({ message: "Failed to delete order" });
      }
    });

    // ******************************* DELETE(END) *******************************************

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Polli Ahaar Server..");
});

app.listen(port, () => {
  console.log(`polli ahaar is running on port ${port}`);
});
