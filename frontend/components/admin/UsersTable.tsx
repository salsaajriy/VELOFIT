'use client';

import { useState } from 'react';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiShield, FiUser } from 'react-icons/fi';
import { User } from '@/types';

interface UsersTableProps {
  users: User[];
  loading: boolean;
}

export default function UsersTable({ users, loading }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomBadgeColor = (email: string) => {
    const colors = [
      { bg: 'bg-green-100', text: 'text-green-700' },
      { bg: 'bg-blue-100', text: 'text-blue-700' },
      { bg: 'bg-purple-100', text: 'text-purple-700' },
      { bg: 'bg-pink-100', text: 'text-pink-700' },
      { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">User Monitoring</h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor all active users and their roles
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 sm:w-80">
            <FiSearch className="text-xl text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 px-5 font-semibold text-white transition-all hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-lg">
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>

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
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Join Date
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => {
              const colors = getRandomBadgeColor(user.email);
              return (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg} ${colors.text} font-semibold text-sm`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role === 'admin' ? <FiShield className="text-xs" /> : <FiUser className="text-xs" />}
                      {user.role}
                    </span>
                   </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(user.created_at)}
                   </td>
                 </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          No users found
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            <span className="px-3 py-1 text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}