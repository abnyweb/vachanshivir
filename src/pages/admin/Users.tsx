import { useState, useMemo, useEffect } from 'react';
import {
  Users, UserCheck, Shield, ShieldCheck, Search, Plus, Phone,
  CheckCircle2, ArrowUpRight, X, Edit2, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminPage } from '../../components/admin/AdminPage';
import { useStore } from '../../store/StoreContext';
import { useAuth } from '../../auth/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../components/common/ToastProvider';
import type { AdminUser, AdminRole } from '../../types';

export default function UsersPage() {
  useDocumentMeta('User Management — Vachan Shivir Admin');
  const { db, create, update, remove } = useStore();
  const { user: currentUser } = useAuth();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: AdminRole;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'PARTICIPANT',
    status: 'ACTIVE',
  });

  const usersList: AdminUser[] = useMemo(() => {
    return db.users || [];
  }, [db.users]);

  // Sync users from backend if available
  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return res.ok && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && Array.isArray(data.users)) {
          data.users.forEach((u: AdminUser) => {
            if (!usersList.some((existing) => existing.id === u.id)) {
              create('users', u);
            }
          });
        }
      })
      .catch(() => {
        /* use client store */
      });
  }, []);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (roleFilter === 'ADMINS') {
        if (u.role !== 'SUPER_ADMIN' && u.role !== 'CONTENT_ADMIN') return false;
      } else if (roleFilter !== 'all' && (u.role || '').toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'all' && (u.status || 'ACTIVE').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const n = (u.name || '').toLowerCase();
        const e = (u.email || '').toLowerCase();
        const p = (u.phone || '').toLowerCase();
        if (!n.includes(q) && !e.includes(q) && !p.includes(q)) return false;
      }
      return true;
    });
  }, [usersList, roleFilter, statusFilter, search]);

  const superAdminsCount = useMemo(() => usersList.filter((u) => u.role === 'SUPER_ADMIN').length, [usersList]);
  const contentAdminsCount = useMemo(() => usersList.filter((u) => u.role === 'CONTENT_ADMIN').length, [usersList]);
  const participantsCount = useMemo(() => usersList.filter((u) => u.role === 'PARTICIPANT' || !u.role).length, [usersList]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'PARTICIPANT',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'PARTICIPANT',
      status: u.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      notify('Name and email are required.', 'error');
      return;
    }

    if (editingUser) {
      update('users', editingUser.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
      });

      // Call backend API
      try {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch {
        /* fallback handled by store sync */
      }

      notify(`Updated user ${formData.name}`);
    } else {
      const now = new Date().toISOString();
      const newUser: AdminUser = {
        id: `usr_${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        authProvider: 'email',
        registeredAt: now,
        lastLogin: now,
      };

      create('users', newUser);

      // Call backend API
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      } catch {
        /* fallback handled by store sync */
      }

      notify(`Created user ${newUser.name}`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = async (u: AdminUser) => {
    if (u.role === 'SUPER_ADMIN' && superAdminsCount <= 1) {
      notify('Cannot delete the last Super Administrator.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to remove user account for ${u.name} (${u.email})?`)) {
      remove('users', u.id);
      try {
        await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      } catch {
        /* ignored */
      }
      notify(`Removed user ${u.name}`);
      if (selectedUser?.id === u.id) setSelectedUser(null);
    }
  };

  // Helper for role badge styling
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-900 border border-amber-400">
            <ShieldCheck size={11} className="text-amber-600" /> SUPER ADMIN
          </span>
        );
      case 'CONTENT_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-900 border border-indigo-400">
            <Shield size={11} className="text-indigo-600" /> CONTENT ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-900 border border-emerald-400">
            <UserCheck size={11} className="text-emerald-600" /> PARTICIPANT
          </span>
        );
    }
  };

  return (
    <AdminPage
      title="User Management & Access Control"
      description="Authorized administrators, pastoral delegates, and participant accounts with server-side role separation."
    >
      {/* 1. TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-raleway">{usersList.length}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1">Platform Accounts</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Super Admins</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-raleway">{superAdminsCount}</div>
          <div className="text-[11px] font-bold text-amber-600 mt-1">Authorized Whitelist</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Content Admins</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-raleway">{contentAdminsCount}</div>
          <div className="text-[11px] font-bold text-indigo-600 mt-1">Operational Staff</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Participants</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-raleway">{participantsCount}</div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1">Pastoral Delegates</div>
        </div>
      </div>

      {/* DIRECTORY ROLE TABS */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setRoleFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-raleway transition-all cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-navy-950 text-crossgold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          All Directory Accounts ({usersList.length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('ADMINS')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-raleway transition-all cursor-pointer flex items-center gap-1.5 ${
            roleFilter === 'ADMINS'
              ? 'bg-navy-950 text-crossgold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <Shield size={12} className="text-amber-500" />
          <span>Administrators & Staff ({superAdminsCount + contentAdminsCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('PARTICIPANT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-raleway transition-all cursor-pointer flex items-center gap-1.5 ${
            roleFilter === 'PARTICIPANT'
              ? 'bg-navy-950 text-crossgold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <UserCheck size={12} className="text-emerald-500" />
          <span>Public Participants & Delegates ({participantsCount})</span>
        </button>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-navy text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-navy cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="CONTENT_ADMIN">Content Admin</option>
              <option value="PARTICIPANT">Participant</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-navy cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add User Account</span>
        </button>
      </div>

      {/* 3. USER TABLE (DESKTOP) / CARDS (MOBILE) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 font-mono border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Auth Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name
                    ? u.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U';
                  const isCurrent = currentUser?.email.toLowerCase() === u.email.toLowerCase();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy font-black text-xs font-raleway flex items-center justify-center shrink-0 border border-slate-200">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 font-raleway flex items-center gap-1.5 truncate">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {u.phone || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-3 px-4">{renderRoleBadge(u.role)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200 capitalize">
                          {u.authProvider || 'google'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-navy transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.role === 'SUPER_ADMIN' && superAdminsCount <= 1}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No users matching current filters.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const initials = u.name
                ? u.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                : 'U';
              const isCurrent = currentUser?.email.toLowerCase() === u.email.toLowerCase();

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors active:bg-slate-100 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy font-black text-xs font-raleway flex items-center justify-center shrink-0 border border-slate-200">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 font-raleway text-xs flex items-center gap-1.5 truncate">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                      </div>
                    </div>
                    <div>{renderRoleBadge(u.role)}</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 font-mono">
                      <Phone size={12} className="text-slate-400" />
                      <span>{u.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. USER DETAIL DRAWER / MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5 animate-slideDown">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy font-black text-base font-raleway flex items-center justify-center border-2 border-crossgold/40">
                  {selectedUser.name
                    ? selectedUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-black font-raleway text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Assigned Role</div>
                <div>{renderRoleBadge(selectedUser.role)}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Auth Provider</div>
                <div className="font-mono text-slate-700 font-bold capitalize">
                  {selectedUser.authProvider || 'Google OAuth 2.0'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Phone Number</div>
                <div className="font-mono text-slate-700 font-bold">{selectedUser.phone || 'Not provided'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Account Status</div>
                <div className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </div>
              </div>
            </div>

            {/* CRM Contact Link Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 font-raleway flex items-center gap-1.5">
                  <Users size={14} className="text-amber-600" />
                  <span>Associated CRM Pastoral Profile</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                This user account is automatically matched with their CRM record for delegate tracking, history, and communications.
              </p>
              <Link
                to="/admin/crm/contacts"
                className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline font-raleway pt-1"
              >
                <span>Open in CRM Contacts Directory</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  openEditModal(u);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Edit Role / Details
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-navy text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5 animate-slideDown">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black font-raleway text-slate-900">
                {editingUser ? 'Edit User Account' : 'Add New User Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUser)}
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-navy disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-navy font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 font-raleway mb-1">
                    System Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-navy"
                  >
                    <option value="PARTICIPANT">Participant</option>
                    <option value="CONTENT_ADMIN">Content Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 font-raleway mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-navy"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
