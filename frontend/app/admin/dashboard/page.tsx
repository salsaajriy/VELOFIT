import {
  FiGrid,
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi2";
import { FaHelmetSafety  } from "react-icons/fa6";

const users = [
  {
    initials: "JD",
    name: "Johnathan Doe",
    email: "john.doe@velofit.com",
    deviceId: "VF - H882 - 9901",
    joinDate: "Oct 24, 2023",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  {
    initials: "AS",
    name: "Alice Smith",
    email: "asmith@runner.io",
    deviceId: "VF - H882 - 1042",
    joinDate: "Nov 12, 2023",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
  },
  {
    initials: "RK",
    name: "Robert Kurosawa",
    email: "robert.k@techlife.jp",
    deviceId: "VF - H882 - 7723",
    joinDate: "Dec 01, 2023",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-230px flex-col border-r border-slate-200 bg-white md:flex">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <span className="text-lg font-bold">☠</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Velofit</span>
            </div>
          </div>

          <nav className="px-4">
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-700"
            >
              <FiGrid className="text-lg" />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200 text-slate-700">
                <span className="text-sm font-semibold">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
          </header>

          <div className="px-6 py-8 md:px-10">
            {/* Stat cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <HiOutlineUsers className="text-2xl" />
                </div>
                <p className="mb-2 text-lg text-slate-500">Total Users</p>
                <p className="text-5xl font-semibold tracking-tight text-slate-900">
                  12,842
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FaHelmetSafety  className="text-2xl" />
                </div>
                <p className="mb-2 text-lg text-slate-500">Connected Helmets</p>
                <p className="text-5xl font-semibold tracking-tight text-slate-900">
                  8,105
                </p>
              </div>
            </div>

            {/* Table card */}
            <section className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    User Monitoring
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Monitor all active helmet owners.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 sm:w-370px">
                    <FiSearch className="text-xl text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d86b0f] px-5 font-semibold text-white transition hover:bg-[#c9610d]">
                    <FiDownload />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-sm font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-5">Name</th>
                      <th className="px-6 py-5">Email</th>
                      <th className="px-6 py-5">Linked Device ID</th>
                      <th className="px-6 py-5">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.name} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${user.badgeBg} ${user.badgeText} font-semibold`}>
                              {user.initials}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600">{user.email}</td>
                        <td className="px-6 py-5 text-slate-500">{user.deviceId}</td>
                        <td className="px-6 py-5 text-slate-600">{user.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-5">
                <p className="text-sm text-slate-500">Showing 3 of 12,842 users</p>

                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                    <FiChevronLeft />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}