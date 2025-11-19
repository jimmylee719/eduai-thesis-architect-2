import React, { useEffect, useState } from 'react';
import { User, SystemLog } from '../types';
import { logService } from '../services/mockBackend';
import { LogOut, Shield, Activity, Users, Search, Clock } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const [fetchedLogs, fetchedUsers] = await Promise.all([
        logService.getLogs(),
        logService.getAllUsers()
      ]);
      setLogs(fetchedLogs);
      setUsers(fetchedUsers);
    };
    
    fetchData();
    
    // Poll for new logs every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userEmail.toLowerCase().includes(filter.toLowerCase()) ||
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">EduAI Admin Console</h1>
              <p className="text-xs text-slate-400">系統管理後台</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
              title="登出"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 <Users size={24} />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-medium">總使用者數</p>
                 <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                 <Activity size={24} />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-medium">總操作紀錄</p>
                 <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
              </div>
           </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
           <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-indigo-500" />
                即時使用者歷程
              </h2>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="搜尋使用者或動作..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64 transition-all"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10">
                   <tr>
                      <th className="px-6 py-3 w-48">時間</th>
                      <th className="px-6 py-3 w-48">使用者</th>
                      <th className="px-6 py-3 w-32">動作類型</th>
                      <th className="px-6 py-3">詳細內容</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                            {log.timestamp.toLocaleString()}
                         </td>
                         <td className="px-6 py-3 font-medium text-slate-700">
                            {log.userEmail}
                         </td>
                         <td className="px-6 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold
                              ${log.action === 'LOGIN' ? 'bg-blue-100 text-blue-700' : 
                                log.action === 'REGISTER' ? 'bg-green-100 text-green-700' :
                                log.action.includes('ERROR') ? 'bg-rose-100 text-rose-700' :
                                'bg-slate-100 text-slate-700'
                              }
                            `}>
                               {log.action}
                            </span>
                         </td>
                         <td className="px-6 py-3 text-slate-600 max-w-md truncate" title={log.details}>
                            {log.details}
                         </td>
                      </tr>
                   ))}
                   {filteredLogs.length === 0 && (
                      <tr>
                         <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            沒有符合的紀錄
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;