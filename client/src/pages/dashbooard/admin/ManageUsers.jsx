// src/pages/Dashboard/ManageUsers/ManageUsers.jsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FiShield, FiUser, FiSearch, FiRefreshCcw } from "react-icons/fi";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SectionTitle from "../../../components/sectionTitle/SectionTitle";
import LoadingSpinner from "../../../components/spinner/LoadingSpinner";
import { Pagination } from "../../../components/pagination/Pagination";

const ROLE_OPTIONS = [
  { value: "", label: "সব রোল" },
  { value: "admin", label: "অ্যাডমিন" },
  { value: "manager", label: "ম্যানেজার" }, // যদি ব্যবহার করেন
  { value: "user", label: "ইউজার" },
];

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();

  // ---- UI state (edit locally, then Apply) ----
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });

  // ---- Applied params (drive the query) ----
  const [applied, setApplied] = useState({
    search: "",
    role: "",
    page: 1,
    limit: 10,
  });

  const [pageSize, setPageSize] = useState(10);

  // Build params for request from APPLIED only
  const params = useMemo(() => {
    const p = {
      page: applied.page,
      limit: applied.limit,
    };
    if (applied.search) p.search = applied.search;
    if (applied.role) p.role = applied.role;
    return p;
  }, [applied]);

  // ---- Query users ----
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["users-admin", params],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/users", { params });
      // shape: { total, page, limit, pages, items }
      return data;
    },
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const pages = data?.pages || 1;

  // ---- Handlers ----
  const applyFilters = () =>
    setApplied({ ...filters, page: 1, limit: pageSize });

  const resetFilters = () => {
    const reset = { search: "", role: "" };
    setFilters(reset);
    setPageSize(10);
    setApplied({ ...reset, page: 1, limit: 10 });
  };

  const onEnterApply = (e) => {
    if (e.key === "Enter") applyFilters();
  };

  // Update role with confirmation
  const handleChangeRole = async (user, newRole) => {
    if (!newRole || newRole === user.role) return;

    Swal.fire({
      title: "নিশ্চিত?",
      html: `<b>${user.name || user.email}</b> এর রোল <b>${
        user.role || "user"
      }</b> থেকে <b>${newRole}</b> করা হবে।`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, পরিবর্তন করুন",
      cancelButtonText: "বাতিল",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.put(`/user/${user._id}/role`, { role: newRole });
          await refetch();
          Swal.fire({
            title: "সফল!",
            text: "রোল আপডেট হয়েছে।",
            icon: "success",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "ব্যর্থ!",
            text: "রোল আপডেট করা যায়নি। আবার চেষ্টা করুন।",
            icon: "error",
          });
        }
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <SectionTitle heading="ইউজার ম্যানেজমেন্ট" />

      {/* Filters */}
      <div className="bg-white border border-green-200 shadow-sm rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* search */}
          <div className="md:col-span-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                onKeyDown={onEnterApply}
                className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 outline-none focus:border-green-600"
                placeholder="নাম/ইমেইল দিয়ে খুঁজুন…"
              />
            </div>
          </div>

          {/* role filter */}
          <div className="md:col-span-3">
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters((f) => ({ ...f, role: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.label} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* actions */}
          <div className="md:col-span-4 flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            >
              <FiShield />
              প্রয়োগ করুন
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-green-300 px-4 py-2 hover:bg-green-50"
            >
              <FiRefreshCcw />
              রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-2xl border border-green-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">ইউজার</th>
              <th className="px-4 py-3">ইমেইল</th>
              <th className="px-4 py-3">বর্তমান রোল</th>
              <th className="px-4 py-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  কোনো ইউজার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              items.map((u, idx) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-3">
                    {(page - 1) * applied.limit + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.image || "https://i.ibb.co/5GzXkwq/user.png" // fallback
                        }
                        alt={u.name || u.email}
                        className="w-10 h-10 rounded-full object-cover border"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="hind-siliguri-medium">
                          {u.name || "—"}
                        </div>
                        {u.address && (
                          <div className="text-xs text-gray-500">
                            {u.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.role === "admin"
                          ? "bg-emerald-100 text-emerald-700"
                          : u.role === "manager"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Quick role change dropdown */}
                      <select
                        defaultValue={u.role || "user"}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none hover:border-green-600"
                        disabled={isFetching}
                        title="রোল পরিবর্তন করুন"
                      >
                        <option value="admin">admin</option>

                        <option value="user">user</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          Swal.fire({
                            title: u.name || u.email,
                            text: `রোল: ${u.role || "user"}`,
                            icon: "info",
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-green-50"
                        title="বিস্তারিত"
                      >
                        <FiUser size={16} />
                        বিস্তারিত
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <Pagination
          page={page}
          pages={pages}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setApplied((a) => ({ ...a, page: 1, limit: size }));
          }}
          onPageChange={(p) => setApplied((a) => ({ ...a, page: p }))}
        />
      )}
    </div>
  );
};

export default ManageUsers;
