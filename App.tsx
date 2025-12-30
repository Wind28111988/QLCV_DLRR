
import React, { useState, useEffect } from 'react';
import { User, Task, TaskStatus, TaskComplexity } from './types';
import { INITIAL_USERS, INITIAL_TASKS, DEFAULT_PASSWORD } from './constants';
import { Menu, X } from 'lucide-react';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import AdminSearch from './components/AdminSearch';
import Delegation from './components/Delegation';
import ImportData from './components/ImportData';
import UserProfile from './components/UserProfile';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tm_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'search' | 'delegate' | 'import' | 'profile'>('dashboard');
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tm_current_user');
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!user.mustChangePassword) {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setViewedUserId(null);
    setIsSidebarOpen(false);
  };

  const handleChangePassword = (newPass: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, password: newPass, mustChangePassword: false };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleResetPassword = (email: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPass, mustChangePassword: false } : u));
  };

  const addTask = (content: string, complexity: TaskComplexity, leadId?: string, collaboratorIds?: string[]) => {
    if (!currentUser) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      content,
      startTime: Date.now(),
      status: TaskStatus.TO_DO, 
      complexity: complexity,
      leadId: leadId || currentUser.id,
      collaboratorIds: collaboratorIds || [],
      unit: currentUser.unit
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedTime: newStatus === TaskStatus.COMPLETED ? Date.now() : t.completedTime,
          startTime: newStatus === TaskStatus.IN_PROGRESS && t.status === TaskStatus.TO_DO ? Date.now() : t.startTime
        };
      }
      return t;
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleImport = (newUsers: User[]) => {
    setUsers(newUsers);
    alert('Dữ liệu đã được cập nhật thành công!');
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} onResetPassword={handleResetPassword} />;
  }

  if (currentUser.mustChangePassword) {
    return <ChangePassword onComplete={handleChangePassword} />;
  }

  const isAdmin = currentUser.notes === 'AD';

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        isAdmin={isAdmin} 
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">Q</div>
          <span className="font-black text-slate-800 uppercase tracking-tight text-sm">Quản lý GDT</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-full">
        <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'dashboard' && 'Tổng quan'}
              {activeTab === 'tasks' && 'Việc của tôi'}
              {activeTab === 'search' && 'Báo cáo & Tra cứu'}
              {activeTab === 'delegate' && 'Giao nhiệm vụ'}
              {activeTab === 'import' && 'Nhập dữ liệu'}
              {activeTab === 'profile' && 'Cá nhân'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Đơn vị: <span className="text-indigo-600 font-bold">{currentUser.unit}</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                {currentUser.name.charAt(0)}
             </div>
             <div className="pr-4">
               <p className="text-xs font-black text-slate-800 uppercase leading-none">{currentUser.name}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{currentUser.position}</p>
             </div>
          </div>
        </header>

        <div className="w-full animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <Dashboard users={users} tasks={tasks} currentUser={currentUser} onUserClick={(uid) => {
              setViewedUserId(uid);
              setActiveTab('search');
            }} />
          )}
          
          {activeTab === 'tasks' && (
            <TaskBoard 
              tasks={tasks.filter(t => t.userId === currentUser.id || t.leadId === currentUser.id || t.collaboratorIds.includes(currentUser.id))} 
              onAddTask={addTask}
              onUpdateStatus={updateTaskStatus}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}

          {activeTab === 'search' && (
            <AdminSearch 
              users={users} 
              tasks={tasks} 
              isAdmin={isAdmin}
              currentUser={currentUser}
              onUpdateTask={updateTask}
              onResetUserPassword={handleResetPassword}
              initialSelectedUserId={viewedUserId}
            />
          )}

          {activeTab === 'delegate' && (
            <Delegation 
              currentUser={currentUser} 
              users={users} 
              onAssign={addTask}
            />
          )}

          {activeTab === 'import' && (
            <ImportData currentUser={currentUser} onImport={handleImport} />
          )}

          {activeTab === 'profile' && (
            <UserProfile user={currentUser} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
