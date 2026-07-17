// app/admin/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiGrid,
  FiLogOut,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiWifi,
  FiWifiOff,
  FiBattery,
  FiBatteryCharging,
  FiAlertCircle,
} from "react-icons/fi";
import { FaHelmetSafety, FaMicrochip } from "react-icons/fa6";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdOutlineSpeed, MdOutlineBatteryAlert } from "react-icons/md";

// ============================================================
// TYPES
// ============================================================
interface UserWithHelmet {
  id: number;
  name: string;
  email: string;
  role: string;
  join_date: string;
  has_helmet: boolean;
  active_helmet: {
    device_name: string;
    battery: number;
  } | null;
  helmets: HelmetData[];
}

interface HelmetData {
  id: number;
  device_id: string;
  device_name: string;
  battery: number;
  battery_low: boolean;
  is_active: boolean;
  last_ping: string | null;
  status: "online" | "offline" | "low_battery" | "inactive";
}

interface DashboardStats {
  total_users: number;
  total_admins: number;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminDashboardPage() {
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_users: 0,
    total_admins: 0,
  });
  const [users, setUsers] = useState<UserWithHelmet[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithHelmet[]>([]);
  const [allHelmets, setAllHelmets] = useState<HelmetData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyHelmetUsers, setShowOnlyHelmetUsers] = useState(false);

  const itemsPerPage = 8;
  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/";

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, showOnlyHelmetUsers]);

  // ============================================================
  // FILTER FUNCTION
  // ============================================================
  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (showOnlyHelmetUsers) {
      filtered = filtered.filter((user) => user.has_helmet);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");
    const userDataStr = localStorage.getItem("user_data");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setAdminName(userData.name || "Admin");
      } catch (e) {}
    }

    await Promise.all([
      fetchDashboardStats(token),
      fetchUsersData(token),
      fetchHelmetsData(token),
    ]);

    setLoading(false);
  };

  // Endpoint: GET /admin/dashboard
  const fetchDashboardStats = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}` + `api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && data.data) {
        setDashboardStats({
          total_users: data.data.status.total_users,
          total_admins: data.data.status.total_admins,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  // Endpoint: GET /admin/users
  const fetchUsersData = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}` + `api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Endpoint: GET /admin/helmets
  const fetchHelmetsData = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}` + `api/admin/helmets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && data.data) {
        setAllHelmets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch helmets:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-700";
      case "offline":
        return "bg-gray-100 text-gray-500";
      case "low_battery":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "low_battery":
        return "Low Battery";
      default:
        return "Inactive";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <FiWifi className="text-xs" />;
      case "offline":
        return <FiWifiOff className="text-xs" />;
      case "low_battery":
        return <MdOutlineBatteryAlert className="text-xs" />;
      default:
        return <FiWifiOff className="text-xs" />;
    }
  };

  const getRandomAvatarColor = (email: string) => {
    const colors = [
      { bg: "bg-linear-to-br from-orange-400 to-amber-500" },
      { bg: "bg-linear-to-br from-blue-400 to-indigo-500" },
      { bg: "bg-linear-to-br from-green-400 to-emerald-500" },
      { bg: "bg-linear-to-br from-purple-400 to-violet-500" },
      { bg: "bg-linear-to-br from-pink-400 to-rose-500" },
      { bg: "bg-linear-to-br from-cyan-400 to-teal-500" },
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Hitung statistik dari data helmets yang ada
  const getHelmetStats = () => {
    const total_helmets = allHelmets.length;
    const active_helmets = allHelmets.filter((h) => h.is_active).length;
    const online_helmets = allHelmets.filter(
      (h) => h.status === "online",
    ).length;
    const low_battery_helmets = allHelmets.filter((h) => h.battery_low).length;
    const helmet_usage_rate =
      total_helmets > 0
        ? Math.round((active_helmets / total_helmets) * 100)
        : 0;

    return {
      total_helmets,
      active_helmets,
      online_helmets,
      low_battery_helmets,
      helmet_usage_rate,
    };
  };

  const helmetStats = getHelmetStats();

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <div className="flex min-h-screen">
        {/* ============================================================
            SIDEBAR
        ============================================================ */}
        <aside className="hidden w-50 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-amber-600 text-white shadow-lg">
                <FaHelmetSafety className="text-xl" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Velofit
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4">
            <div className="flex items-center gap-3 rounded-xl bg-linear-to-r from-orange-50 to-amber-50 px-4 py-3 text-orange-700">
              <FiGrid className="text-lg" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-amber-500 text-white shadow-md">
                <span className="text-sm font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {adminName}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  Administrator
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Logout"
              >
                <FiLogOut className="text-lg" />
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}
        <main className="flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-6 md:px-10 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Monitor users, helmets, and system activity
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-600">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-8 md:px-10">
            {/* ============================================================
                STAT CARDS
            ============================================================ */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Users Card */}
              <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <HiOutlineUsers className="text-2xl text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Users
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {dashboardStats.total_users.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Total Registered Users
                </p>
              </div>

              {/* Total Helmets Card */}
              <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                    <FaHelmetSafety className="text-2xl text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    Devices
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {helmetStats.total_helmets.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Total Connected Helmets
                </p>
              </div>

              {/* Online Helmets Card */}
              <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    <FiWifi className="text-2xl text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {helmetStats.online_helmets.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">Currently Online</p>
              </div>

              {/* Usage Rate Card */}
              <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-50 to-violet-50 flex items-center justify-center">
                    <MdOutlineSpeed className="text-2xl text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Rate
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {helmetStats.helmet_usage_rate}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Helmet Usage Rate</p>
              </div>
            </div>

            {/* Low Battery Alert Row */}
            {helmetStats.low_battery_helmets > 0 && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <FiAlertCircle className="text-amber-600 text-xl" />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">
                    {helmetStats.low_battery_helmets} helmets
                  </span>{" "}
                  have low battery (&lt;20%). Please remind users to charge
                  their devices.
                </p>
              </div>
            )}

            {/* ============================================================
                USERS TABLE SECTION
            ============================================================ */}
            <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
              {/* Table Header with Filters */}
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Users & Helmets Monitoring
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Monitor all users and their connected helmet status
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Search Box */}
                  <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 sm:w-72">
                    <FiSearch className="text-lg text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowOnlyHelmetUsers(!showOnlyHelmetUsers)}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all ${
                      showOnlyHelmetUsers
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FaHelmetSafety className="text-sm" />
                    {showOnlyHelmetUsers ? "With Helmets Only" : "All Users"}
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Connected Helmet
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Battery
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Join Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const avatarColor = getRandomAvatarColor(user.email);
                        const activeHelmet = user.active_helmet;
                        const activeHelmetData = user.helmets.find(
                          (h) => h.is_active,
                        );
                        const helmetStatus =
                          activeHelmetData?.status || "inactive";

                        return (
                          <tr
                            key={user.id}
                            className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColor.bg} text-white shadow-sm text-sm font-semibold`}
                                >
                                  {getInitials(user.name)}
                                </div>
                                <span className="font-medium text-slate-800">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4">
                              {user.has_helmet && activeHelmet ? (
                                <div className="flex items-center gap-2">
                                  <FaMicrochip className="text-slate-400 text-sm" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {activeHelmet.device_name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                  No helmet connected
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {user.has_helmet && activeHelmet ? (
                                <div className="flex items-center gap-2">
                                  {activeHelmet.battery < 20 ? (
                                    <FiBattery className="text-red-500 text-sm" />
                                  ) : activeHelmet.battery > 80 ? (
                                    <FiBatteryCharging className="text-green-500 text-sm" />
                                  ) : (
                                    <FiBattery className="text-yellow-500 text-sm" />
                                  )}
                                  <span
                                    className={`text-sm font-medium ${
                                      activeHelmet.battery < 20
                                        ? "text-red-600"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {activeHelmet.battery}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {user.has_helmet ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(helmetStatus)}`}
                                >
                                  {getStatusIcon(helmetStatus)}
                                  {getStatusText(helmetStatus)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500">
                                  <FiWifiOff className="text-xs" />
                                  No Device
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {formatDate(user.join_date)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                    of {filteredUsers.length} users
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                                currentPage === pageNum
                                  ? "bg-orange-600 text-white shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Summary Footer */}
            <div className="mt-6 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Online
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Offline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Low Battery
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  No Helmet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaHelmetSafety className="text-xs" />
                <span>
                  {users.filter((u) => u.has_helmet).length} of {users.length}{" "}
                  users have connected helmets
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
