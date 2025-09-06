import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const COLORS = [
  "#10B981", // emerald
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#EF4444", // red
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#8B5CF6", // violet
  "#F97316", // orange
];

const n = (v) => Number(v || 0);
const money = (v) => n(v).toLocaleString("bn-BD");
const int = (v) => n(v).toLocaleString("bn-BD");

// Small formatter for dates returned by API
const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

const AdminAnalytics = () => {
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/admin-stats");
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  const totals = data?.totals || {};
  const statusBreakdown = data?.statusBreakdown || [];
  const salesByDay = (data?.salesByDay || []).map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));
  const salesByMonth = data?.salesByMonth || [];
  const topProducts = data?.topProducts || [];
  const topCustomers = data?.topCustomers || [];

  // build pie data that always shows all statuses in a consistent order
  const pieData = useMemo(() => {
    const keys = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
    ];
    const map = Object.fromEntries(
      statusBreakdown.map((s) => [
        String(s.status || "").toLowerCase(),
        s.count,
      ])
    );
    return keys
      .map((k) => ({ status: k, count: map[k] || 0 }))
      .filter((x) => x.count > 0 || statusBreakdown.length === 0); // keep empty slate nice
  }, [statusBreakdown]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionTitle heading="অ্যাডমিন অ্যানালিটিক্স" />

      {/* States */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          ডেটা লোড করা যায়নি —{" "}
          {error?.response?.data?.message || error?.message || "ত্রুটি"}
        </div>
      )}

      {(isLoading || isFetching) && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-emerald-100 bg-white overflow-hidden"
            >
              <div className="h-full animate-pulse bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {!isLoading && !isError && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="মোট আয় (৳)"
            value={`৳ ${money(totals.totalRevenue)}`}
          />
          <KpiCard title="অর্ডার" value={int(totals.totalOrders)} />
          <KpiCard title="গ্রাহক" value={int(totals.totalUsers)} />
          <KpiCard title="পণ্য" value={int(totals.totalProducts)} />
          <KpiCard
            title="গড় অর্ডার ভ্যালু"
            value={`৳ ${money(totals.avgOrderValue)}`}
          />
        </div>
      )}

      {/* Charts */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line: Revenue by Day (last 30d) */}
          <ChartCard title="শেষ ৩০ দিনে দৈনিক আয়">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip formatter={(v) => `৳ ${money(v)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="আয় (৳)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar: Revenue by Month (last 12m) */}
          <ChartCard title="শেষ ১২ মাসে মাসিক আয়">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip formatter={(v) => `৳ ${money(v)}`} />
                <Legend />
                <Bar dataKey="revenue" name="আয় (৳)" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie: Order Status Breakdown */}
          <ChartCard title="অর্ডার স্ট্যাটাস">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip formatter={(v) => int(v)} />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={110}
                  label={(d) => `${d.payload.status} (${int(d.value)})`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Tables */}
      {!isLoading && !isError && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="rounded-2xl border border-emerald-100 bg-white">
            <div className="px-4 py-3 border-b border-emerald-100">
              <h3 className="text-lg hind-siliguri-medium">টপ পণ্য</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead className="bg-emerald-50 text-left">
                  <tr>
                    <Th className="w-12">#</Th>
                    <Th className="w-20">ছবি</Th>
                    <Th>নাম</Th>
                    <Th className="w-24 text-right">পরিমাণ</Th>
                    <Th className="w-28 text-right">আয় (৳)</Th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr
                      key={p.productId}
                      className="border-t border-emerald-100"
                    >
                      <Td className="w-12">{i + 1}</Td>
                      <Td className="w-20">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded-md object-cover border border-emerald-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border border-emerald-100 grid place-items-center text-xs text-gray-500">
                            N/A
                          </div>
                        )}
                      </Td>
                      <Td className="truncate">{p.name}</Td>
                      <Td className="w-24 text-right">{int(p.qty)}</Td>
                      <Td className="w-28 text-right">৳ {money(p.revenue)}</Td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <Td
                        className="py-6 text-center text-gray-500"
                        colSpan={5}
                      >
                        তথ্য নেই
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="rounded-2xl border border-emerald-100 bg-white">
            <div className="px-4 py-3 border-b border-emerald-100">
              <h3 className="text-lg hind-siliguri-medium">টপ গ্রাহক</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead className="bg-emerald-50 text-left">
                  <tr>
                    <Th className="w-12">#</Th>
                    <Th>ইমেইল</Th>
                    <Th className="w-24 text-right">অর্ডার</Th>
                    <Th className="w-28 text-right">আয় (৳)</Th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr
                      key={c._id || i}
                      className="border-t border-emerald-100"
                    >
                      <Td className="w-12">{i + 1}</Td>
                      <Td className="truncate">{c._id}</Td>
                      <Td className="w-24 text-right">{int(c.orders)}</Td>
                      <Td className="w-28 text-right">৳ {money(c.revenue)}</Td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr>
                      <Td
                        className="py-6 text-center text-gray-500"
                        colSpan={4}
                      >
                        তথ্য নেই
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Refresh */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          সর্বশেষ আপডেট:{" "}
          {data?.generatedAt
            ? new Date(data.generatedAt).toLocaleString("bn-BD")
            : "—"}
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-xl border border-emerald-200 px-3 py-1.5 hover:bg-emerald-50"
        >
          রিফ্রেশ
        </button>
      </div>
    </div>
  );
};

export default AdminAnalytics;

/* ---------- tiny subcomponents ---------- */
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-2 text-sm font-semibold text-emerald-800 ${className}`}
  >
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-2 text-sm text-gray-700 ${className}`}>{children}</td>
);

const KpiCard = ({ title, value }) => (
  <div className="rounded-2xl border border-emerald-100 bg-white p-4">
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    <div className="text-2xl hind-siliguri-medium text-emerald-700">
      {value}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="rounded-2xl border border-emerald-100 bg-white">
    <div className="px-4 py-3 border-b border-emerald-100">
      <h3 className="text-lg hind-siliguri-medium">{title}</h3>
    </div>
    <div className="p-3">{children}</div>
  </div>
);
