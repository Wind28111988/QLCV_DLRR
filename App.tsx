
import React, { useState, useEffect, useRef } from 'react';
import { User, Task, TaskStatus, TaskComplexity, Attachment } from './types';
import { INITIAL_USERS, INITIAL_TASKS } from './constants';
import { Menu, Loader2, RefreshCw } from 'lucide-react';
import { cloudStorage } from './storage';
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
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'search' | 'delegate' | 'import' | 'profile'>('dashboard');
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tải dữ liệu từ Supabase khi khởi chạy
  useEffect(() => {
    const initData = async () => {
      try {
        const [dbUsers, dbTasks] = await Promise.all([
          cloudStorage.getUsers(),
          cloudStorage.getTasks()
        ]);
        
        // Nếu DB trống (lần đầu), sử dụng dữ liệu mặc định và đẩy lên DB
        if (dbUsers.length === 0) {
          for (const u of INITIAL_USERS) await cloudStorage.upsertUser(u);
          setUsers(INITIAL_USERS);
        } else {
          setUsers(dbUsers);
        }

        if (dbTasks.length === 0 && dbUsers.length === 0) {
          // Chỉ insert tasks mặc định nếu là hệ thống mới hoàn toàn
          setTasks(INITIAL_TASKS);
        } else {
          setTasks(dbTasks);
        }

        // Tự động đăng nhập nếu có session cũ
        const savedUserStr = localStorage.getItem('tm_current_user');
        if (savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          const latestUsers = dbUsers.length > 0 ? dbUsers : INITIAL_USERS;
          const stillExists = latestUsers.find(u => u.id === parsedUser.id);
          if (stillExists) setCurrentUser(stillExists);
        }
      } catch (err) {
        console.error("Supabase Connection Error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!user.mustChangePassword) {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tm_current_user');
    setActiveTab('dashboard');
    setViewedUserId(null);
    setIsSidebarOpen(false);
  };

  const handleChangePassword = async (newPass: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, password: newPass, mustChangePassword: false };
    setIsSyncing(true);
    await cloudStorage.upsertUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setIsSyncing(false);
  };

  const handleResetPassword = async (email: string, newPass: string) => {
    const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      const updated = { ...targetUser, password: newPass, mustChangePassword: false };
      setIsSyncing(true);
      await cloudStorage.upsertUser(updated);
      setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? updated : u));
      setIsSyncing(false);
    }
  };

  const addTask = async (content: string, complexity: TaskComplexity, leadId?: string, collaboratorIds?: string[], attachments?: Attachment[]) => {
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
      unit: currentUser.unit,
      attachments: attachments || []
    };
    
    setIsSyncing(true);
    await cloudStorage.insertTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    setIsSyncing(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates = {
      status: newStatus,
      completedTime: newStatus === TaskStatus.COMPLETED ? Date.now() : task.completedTime,
      startTime: (newStatus === TaskStatus.IN_PROGRESS && task.status === TaskStatus.TO_DO) ? Date.now() : task.startTime
    };

    setIsSyncing(true);
    await cloudStorage.updateTask(taskId, updates);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setIsSyncing(false);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setIsSyncing(true);
    await cloudStorage.updateTask(taskId, updates);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setIsSyncing(false);
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      setIsSyncing(true);
      await cloudStorage.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setIsSyncing(false);
    }
  };

  const handleImport = async (newUsers: User[]) => {
    setIsSyncing(true);
    // Lưu từng user mới vào Supabase
    for (const u of newUsers) {
      await cloudStorage.upsertUser(u);
    }
    setUsers(newUsers);
    setIsSyncing(false);
    alert('Dữ liệu đã được cập nhật thành công lên hệ thống Cloud!');
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center px-4">Kết nối cơ sở dữ liệu Supabase...</p>
      </div>
    );
  }

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
      
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">Q</div>
          <span className="font-black text-slate-800 uppercase tracking-tight text-sm">Quản lý GDT</span>
        </div>
        <div className="flex items-center space-x-2">
          {isSyncing && <RefreshCw className="text-indigo-400 animate-spin" size={18} />}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-full">
        <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {activeTab === 'dashboard' && 'Tổng quan'}
              {activeTab === 'tasks' && 'Việc của tôi'}
              {activeTab === 'search' && 'Báo cáo & Tra cứu'}
              {activeTab === 'delegate' && 'Giao nhiệm vụ'}
              {activeTab === 'import' && 'Nhập dữ liệu'}
              {activeTab === 'profile' && 'Cá nhân'}
              {isSyncing && <RefreshCw className="text-indigo-400 animate-spin hidden md:block" size={24} />}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Hệ thống: <span className="text-indigo-600 font-bold tracking-widest uppercase">Supabase Cloud</span>
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
