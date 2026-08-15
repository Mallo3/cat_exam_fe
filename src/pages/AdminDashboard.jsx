import React, { useState, useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Users, LogOut, CheckCircle, Clock, ShieldCheck, FileJson } from 'lucide-react';
import ExamUploader from '../components/ExamUploader';

export default function AdminDashboard() {
  const { logout } = useExamStore();
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create User State
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'exams'

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const API_SECRET = import.meta.env.VITE_API_SECRET || 'cat_prep_secret_2026';

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, examsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${API_SECRET}` } }),
        fetch(`${API_BASE}/exams`, { headers: { Authorization: `Bearer ${API_SECRET}` } })
      ]);
      
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!examsRes.ok) throw new Error('Failed to fetch exams');
      
      const usersData = await usersRes.json();
      const examsData = await examsRes.json();
      
      setUsers(usersData.filter(u => !u.isAdmin));
      setExams(examsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGrantRetake = async (mobile) => {
    const examId = selectedExams[mobile] || (exams.length > 0 ? exams[0].examId : null);
    if (!examId) return alert('No exam selected');
    if (!window.confirm(`Are you sure you want to grant a retake for ${examId} to ${mobile}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/${mobile}/retake`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_SECRET}` 
        },
        body: JSON.stringify({ examId })
      });
      if (!res.ok) throw new Error('Failed to update user');
      
      // Optimistically update UI
      setUsers(users.map(u => {
        if (u.mobile === mobile) {
          const updatedAllowed = u.allowedRetakes ? [...u.allowedRetakes] : [];
          if (!updatedAllowed.includes(examId)) updatedAllowed.push(examId);
          return { ...u, allowedRetakes: updatedAllowed };
        }
        return u;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);
    setIsCreating(true);

    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_SECRET}`
        },
        body: JSON.stringify({ name: newUserName, mobile: newUserMobile, password: newUserPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setCreateSuccess(true);
      setNewUserName('');
      setNewUserMobile('');
      setNewUserPassword('');
      setCreateSuccess(true);
      fetchDashboardData(); // Refresh the list
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-blue-900 text-white flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-blue-300" />
          <span className="font-bold text-xl tracking-wide">Admin Portal</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage users, exam attempts, and upload new exams.</p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'users' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'exams' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileJson size={16} />
              <span>Exam Uploader</span>
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg"
              >
                <Clock size={16} />
                <span>Refresh Users Data</span>
              </button>
            </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
            <p className="text-sm text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-blue-50 flex items-center space-x-2">
                <ShieldCheck className="text-blue-600 w-5 h-5" />
                <span className="font-bold text-blue-800 uppercase tracking-wide text-sm">Add Basic User</span>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mobile (Roll No)</label>
                    <input
                      type="text"
                      required
                      value={newUserMobile}
                      onChange={(e) => setNewUserMobile(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="text"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. secret123"
                    />
                  </div>
                  
                  {createError && <p className="text-xs text-red-600 font-bold">{createError}</p>}
                  {createSuccess && <p className="text-xs text-green-600 font-bold">User created successfully!</p>}
                  
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors mt-2"
                  >
                    {isCreating ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
              <div className="p-4 border-b bg-gray-50 flex items-center space-x-2">
                <Users className="text-gray-500 w-5 h-5" />
                <span className="font-bold text-gray-700 uppercase tracking-wide text-sm">Registered Candidates</span>
              </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-gray-200">Name</th>
                  <th className="p-4 font-bold border-b border-gray-200">Mobile (Roll No)</th>
                  <th className="p-4 font-bold border-b border-gray-200">Status</th>
                  <th className="p-4 font-bold border-b border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-700 font-medium">{user.mobile}</span>
                      </td>
                      <td className="p-4">
                        {user.allowedRetakes?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.allowedRetakes.map(examId => (
                              <span key={examId} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                {examId}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={selectedExams[user.mobile] || (exams.length > 0 ? exams[0].examId : '')}
                            onChange={(e) => setSelectedExams({ ...selectedExams, [user.mobile]: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:border-blue-500"
                          >
                            {exams.map(ex => (
                              <option key={ex.examId} value={ex.examId}>{ex.examId}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleGrantRetake(user.mobile)}
                            className="text-sm font-bold px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 active:scale-95 border border-blue-200 transition-colors"
                          >
                            Grant
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </>
)}

        {activeTab === 'exams' && (
          <ExamUploader onSuccess={() => {
            alert('Exam created! Candidates will now see it.');
          }} />
        )}
      </main>
    </div>
  );
}
