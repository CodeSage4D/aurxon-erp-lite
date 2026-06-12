'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, CheckCircle, AlertCircle, Calendar, Edit2, Mail } from 'lucide-react';
import {
  getMembershipsApi,
  getRolesListApi,
  updateMembershipApi,
  inviteMemberApi
} from '@/services/api';

interface Role {
  id: string;
  name: string;
  code: string;
}

interface Membership {
  id: string;
  joinedAt: string;
  status: string;
  role: Role;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    studentProfile?: { firstName: string; lastName: string } | null;
    staffProfile?: { firstName: string; lastName: string; designation: string } | null;
  };
}

interface MembershipManagerProps {
  triggerToast: (msg: string) => void;
}

export default function MembershipManager({ triggerToast }: MembershipManagerProps) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', roleId: '' });
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ roleId: '', status: '' });
  const [updatingMember, setUpdatingMember] = useState(false);

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const list = await getMembershipsApi();
      const rolesList = await getRolesListApi();
      setMembers(list);
      setRoles(rolesList);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load membership records.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.roleId) return;
    setSubmittingInvite(true);
    try {
      await inviteMemberApi(inviteForm.email, inviteForm.roleId);
      triggerToast(`Invitation dispatched to ${inviteForm.email}`);
      setShowInvite(false);
      setInviteForm({ email: '', roleId: '' });
      await loadMemberships();
    } catch (err: any) {
      alert(err.message || 'Invitation failed');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const startEdit = (member: Membership) => {
    setEditingId(member.id);
    setEditForm({ roleId: member.role.id, status: member.status });
  };

  const handleUpdate = async (membershipId: string) => {
    setUpdatingMember(true);
    try {
      await updateMembershipApi(membershipId, {
        roleId: editForm.roleId,
        status: editForm.status
      });
      triggerToast('Membership record updated.');
      setEditingId(null);
      await loadMemberships();
    } catch (err: any) {
      alert(err.message || 'Failed to update membership');
    } finally {
      setUpdatingMember(false);
    }
  };

  const getDisplayName = (m: Membership) => {
    if (m.user.staffProfile) {
      return `${m.user.staffProfile.firstName} ${m.user.staffProfile.lastName}`;
    }
    if (m.user.studentProfile) {
      return `${m.user.studentProfile.firstName} ${m.user.studentProfile.lastName}`;
    }
    return m.user.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-4">Loading organization directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Trigger controls */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Organization Directory</h4>
          <p className="text-[10px] text-zinc-400 font-medium">Control active staff and student memberships.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
              <th className="p-4">User Profile</th>
              <th className="p-4">Email</th>
              <th className="p-4">Active Role</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
            {members.map((m) => {
              const isEditing = editingId === m.id;
              const displayName = getDisplayName(m);
              
              return (
                <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0 uppercase">
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{displayName}</span>
                      {m.user.staffProfile && (
                        <p className="text-[9px] text-zinc-400 mt-0.5 font-semibold">{m.user.staffProfile.designation}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-zinc-650 dark:text-zinc-400 font-mono">{m.user.email}</td>
                  <td className="p-4">
                    {isEditing ? (
                      <select
                        value={editForm.roleId}
                        onChange={e => setEditForm({ ...editForm, roleId: e.target.value })}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200/55 dark:bg-zinc-800/40 dark:border-zinc-700/40 px-2.5 py-1 text-[10px] font-bold text-zinc-800 dark:text-zinc-300">
                        <Shield className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{m.role.name}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-zinc-450 dark:text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{new Date(m.joinedAt).toLocaleDateString()}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : m.status === 'SUSPENDED'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-zinc-100 text-zinc-550 border-zinc-200'
                      }`}>
                        {m.status === 'ACTIVE' ? (
                          <CheckCircle className="h-3 w-3 shrink-0" />
                        ) : (
                          <AlertCircle className="h-3 w-3 shrink-0" />
                        )}
                        <span>{m.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-500 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(m.id)}
                          disabled={updatingMember}
                          className="rounded-lg bg-sky-600 text-white px-2.5 py-1 text-[10px] font-bold shadow-md hover:bg-sky-500 transition disabled:opacity-50"
                        >
                          {updatingMember ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(m)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-2 py-1.5 text-[10px] font-bold text-zinc-500 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Manage</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Member dialog */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-4">
              <Mail className="h-4.5 w-4.5 text-primary" />
              <span>Send Organization Invitation</span>
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. principal-incoming@school.edu"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Assigned Access Role</label>
                <select
                  required
                  value={inviteForm.roleId}
                  onChange={e => setInviteForm({ ...inviteForm, roleId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold"
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <p className="text-[8px] text-zinc-400 mt-1">Defines structural permissions for the invited account.</p>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {submittingInvite ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
