'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Key, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getRolesListApi,
  createRoleApi,
  deleteRoleApi,
  getPermissionsApi,
  togglePermissionApi,
  refreshContextApi
} from '@/lib/api';

const RESOURCES = [
  { code: 'student:profile', label: 'Student Directory' },
  { code: 'staff:profile', label: 'HR & Staff Ledger' },
  { code: 'attendance:record', label: 'Attendance Register' },
  { code: 'finance:fee', label: 'Fees & Accounting' },
  { code: 'exam:setup', label: 'Examination Grading' },
];

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'];

interface Role {
  id: string;
  name: string;
  code: string;
  isSystem: boolean;
  description?: string;
}

interface Permission {
  resource: string;
  action: string;
}

interface RolePermissions {
  id: string;
  name: string;
  code: string;
  permissions: Permission[];
}

interface PermissionMatrixProps {
  triggerToast: (msg: string) => void;
}

export default function PermissionMatrix({ triggerToast }: PermissionMatrixProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [matrix, setMatrix] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', code: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rolesRes = await getRolesListApi();
      const matrixRes = await getPermissionsApi();
      
      setRoles(rolesRes);
      
      // Map matrixRes to matrix state
      // matrixRes has elements like { id, name, code, permissions: [ {resource, action} ] }
      setMatrix(matrixRes);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load authorization matrix.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name || !newRole.code) return;
    setIsSubmitting(true);
    try {
      const created = await createRoleApi(newRole.name, newRole.code, newRole.description);
      triggerToast(`Custom role "${created.name}" created.`);
      setShowNewRole(false);
      setNewRole({ name: '', code: '', description: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await deleteRoleApi(roleId);
      triggerToast('Custom role removed successfully.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
    }
  };

  const handleToggle = async (roleId: string, roleCode: string, resource: string, action: string, currentVal: boolean) => {
    try {
      await togglePermissionApi(roleId, resource, action, !currentVal);
      
      // Update local matrix state
      setMatrix(prev => prev.map(item => {
        if (item.id === roleId) {
          const filtered = item.permissions.filter(p => !(p.resource === resource && p.action === action));
          if (!currentVal) {
            filtered.push({ resource, action });
          }
          return { ...item, permissions: filtered };
        }
        return item;
      }));

      setNeedsRefresh(true);
      triggerToast(`Permission modified. Apply refresh to activate.`);
    } catch (err) {
      alert('Failed to update permission');
    }
  };

  const handleRefreshSession = async () => {
    try {
      const data = await refreshContextApi();
      setNeedsRefresh(false);
      triggerToast('Session context successfully refreshed. Permissions are active.');
      // Reload page state dynamically if desired
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert('Failed to refresh context');
    }
  };

  const hasPermission = (roleId: string, resource: string, action: string) => {
    const roleRecord = matrix.find(m => m.id === roleId);
    if (!roleRecord) return false;
    return roleRecord.permissions.some(
      p => p.resource === resource && p.action.toUpperCase() === action.toUpperCase()
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-4">Loading authorization matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {needsRefresh && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-semibold">
              <span className="font-black">Session Refresh Required:</span> You have modified role permissions. Click refresh to apply changes to your active context without logging out.
            </div>
          </div>
          <button
            onClick={handleRefreshSession}
            className="flex items-center gap-2 rounded-xl bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-black shadow-md hover:bg-amber-400 transition"
          >
            <RefreshCw className="h-4 w-4 animate-spin-reverse" />
            <span>Apply Changes</span>
          </button>
        </div>
      )}

      {/* Premium header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Access Control Matrix</h4>
          <p className="text-[10px] text-zinc-400 font-medium">Fine-tune functional permissions per role.</p>
        </div>
        <button
          onClick={() => setShowNewRole(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Custom Role</span>
        </button>
      </div>

      {/* Role list / deletion list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="border border-zinc-150 rounded-xl p-4 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-900/20 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[9px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 font-mono">
                  {role.code}
                </span>
                {role.isSystem ? (
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-extrabold text-sky-600 dark:text-sky-400 uppercase">
                    System Role
                  </span>
                ) : (
                  <button 
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-2">{role.name}</h5>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">{role.description || 'Custom organization-defined role access rights.'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Permission grid matrix */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
              <th className="p-4 min-w-[200px]">Resource / Module Scope</th>
              {roles.map(role => (
                <th key={role.id} className="p-4 text-center min-w-[140px] border-l border-zinc-100 dark:border-zinc-850">
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-800 dark:text-zinc-200 font-black">{role.name}</span>
                    <span className="text-[8px] font-mono mt-0.5 text-zinc-450 dark:text-zinc-500">{role.code}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {RESOURCES.map(res => (
              <React.Fragment key={res.code}>
                {/* Header for Resource */}
                <tr className="bg-zinc-50/40 dark:bg-zinc-950/10">
                  <td colSpan={roles.length + 1} className="p-3 font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[9px] bg-zinc-100/30 dark:bg-zinc-900/30">
                    {res.label} ({res.code})
                  </td>
                </tr>
                {/* Actions rows */}
                {ACTIONS.map(action => (
                  <tr key={`${res.code}:${action}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition">
                    <td className="p-4 pl-8 font-semibold text-zinc-650 dark:text-zinc-400 flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{action}</span>
                    </td>
                    {roles.map(role => {
                      const allowed = hasPermission(role.id, res.code, action);
                      return (
                        <td key={role.id} className="p-4 text-center border-l border-zinc-100 dark:border-zinc-850">
                          <button
                            onClick={() => handleToggle(role.id, role.code, res.code, action, allowed)}
                            className={`mx-auto h-5 w-10 rounded-full transition-colors relative flex items-center ${
                              allowed ? 'bg-sky-600 justify-end' : 'bg-zinc-250 dark:bg-zinc-800 justify-start'
                            }`}
                          >
                            <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm mx-0.5" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create custom role overlay modal */}
      {showNewRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-4">
              <Shield className="h-4.5 w-4.5 text-primary" />
              <span>Register Custom Role</span>
            </h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Role Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attendance Auditor"
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Role Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="ATTENDANCE_AUDITOR"
                  value={newRole.code}
                  onChange={e => setNewRole({ ...newRole, code: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-mono uppercase"
                />
                <p className="text-[8px] text-zinc-400 mt-1">Unique alphanumeric identifier code.</p>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
                <textarea
                  placeholder="Describe scope of authority..."
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewRole(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
