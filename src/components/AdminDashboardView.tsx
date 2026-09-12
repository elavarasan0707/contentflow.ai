import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  BarChart2, 
  Clock, 
  RotateCw 
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, User } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminDashboardView: React.FC = () => {
  const { success, error, info } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (err: any) {
      error(err.message || 'Failed to load admin stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleGrantCredits = async (userId: string, amount = 50) => {
    try {
      const res = await api.grantUserCredits(userId, amount);
      setUsers(prev => prev.map(u => u.id === userId ? res.user : u));
      success(`Granted +${amount} credits to user!`);
    } catch (err: any) {
      error(err.message || 'Could not grant credits');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? res.user : u));
      info(`User status updated to ${res.user.disabled ? 'Disabled' : 'Active'}`);
    } catch (err: any) {
      error(err.message || 'Could not toggle status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      success('User account deleted');
    } catch (err: any) {
      error(err.message || 'Could not delete user');
    }
  };

  return (
    <div id="admin-dashboard-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Analytics & User Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform usage metrics, user quota management, and system logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs self-start"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.total_users || users.length}</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            {stats?.active_users || 0} active accounts
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Generations</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.total_generations || 0}</span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
            {stats?.daily_generations || 0} today
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Content Type</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 capitalize">
            {stats?.most_popular_type || 'Reels'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">Highest user demand</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Latency</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">~1.2s</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Gemini 3.7 Flash API</span>
        </div>
      </div>

      {/* Content Distribution Breakdown */}
      {stats?.content_distribution && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Content Generation Breakdown by Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(stats.content_distribution).map(([type, count]) => (
              <div key={type} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">{type}</span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Accounts & Credit Quotas</h3>
            <p className="text-xs text-slate-500">Manage subscriptions, grant bonus credits, or toggle account access</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {users.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role & Tier</th>
                <th className="p-4">Credits Used</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase text-[10px]">
                        {u.tier}
                      </span>
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold uppercase text-[10px]">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-sans font-semibold text-slate-800">
                    {u.credits_used} / {u.credits_limit}
                  </td>
                  <td className="p-4">
                    {u.disabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3" /> Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleGrantCredits(u.id, 50)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Grant +50 Credits"
                      >
                        +50 Credits
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      >
                        {u.disabled ? 'Enable' : 'Disable'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Generation Logs */}
      {stats?.recent_logs && stats.recent_logs.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Generation Audit Logs
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.recent_logs.map(log => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl text-xs flex items-center justify-between gap-4 font-sans">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                    {log.type}
                  </span>
                  <span className="text-slate-700 truncate">{log.topic}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
