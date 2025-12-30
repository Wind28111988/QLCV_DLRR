
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskComplexity } from '../types';
import { Clock, CheckCircle2, PlayCircle, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (content: string, complexity: TaskComplexity) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<{ 
  task: Task; 
  now: number;
  editingTaskId: string | null;
  editContent: string;
  editComplexity: TaskComplexity;
  setEditContent: (v: string) => void;
  setEditComplexity: (v: TaskComplexity) => void;
  handleSaveEdit: () => void;
  setEditingTaskId: (v: string | null) => void;
  handleStartEdit: (t: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, s: TaskStatus) => void;
}> = ({ 
  task, now, editingTaskId, editContent, editComplexity, 
  setEditContent, setEditComplexity, handleSaveEdit, 
  setEditingTaskId, handleStartEdit, onDeleteTask, onUpdateStatus 
}) => {
  const isEditing = editingTaskId === task.id;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getComplexityColor = (comp: TaskComplexity) => {
    switch (comp) {
      case TaskComplexity.VERY_HARD: return 'bg-rose-100 text-rose-700 border-rose-200';
      case TaskComplexity.HARD: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-indigo-500 mb-4 animate-in zoom-in-95">
        <textarea
          autoFocus
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] text-sm font-medium"
        />
        <div className="mt-3 flex items-center justify-between">
          <select
            value={editComplexity}
            onChange={(e) => setEditComplexity(e.target.value as TaskComplexity)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-xs font-bold"
          >
            {Object.values(TaskComplexity).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex space-x-2">
            <button onClick={handleSaveEdit} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><Check size={16} /></button>
            <button onClick={() => setEditingTaskId(null)} className="bg-slate-100 text-slate-400 p-2 rounded-lg hover:bg-slate-200"><X size={16} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-5 shadow-sm border border-slate-200 rounded-2xl mb-4 group hover:border-indigo-300 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${getComplexityColor(task.complexity)}`}>
          {task.complexity}
        </span>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleStartEdit(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={14} /></button>
          <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14} /></button>
        </div>
      </div>
      <p className="font-bold text-slate-700 leading-snug mb-4 text-sm">{task.content}</p>
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          <Clock size={12} className="mr-1" />
          {task.status === TaskStatus.COMPLETED 
            ? formatDuration((task.completedTime || 0) - task.startTime) 
            : formatDuration(now - task.startTime)}
        </div>
        <div className="flex space-x-2">
          {task.status === TaskStatus.TO_DO && (
            <button onClick={() => onUpdateStatus(task.id, TaskStatus.IN_PROGRESS)} className="text-indigo-600 hover:scale-110 transition-transform">
              <PlayCircle size={22} />
            </button>
          )}
          {task.status === TaskStatus.IN_PROGRESS && (
            <button onClick={() => onUpdateStatus(task.id, TaskStatus.COMPLETED)} className="text-emerald-600 hover:scale-110 transition-transform">
              <CheckCircle2 size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onAddTask, onUpdateStatus, onUpdateTask, onDeleteTask }) => {
  const [newContent, setNewContent] = useState('');
  const [newComplexity, setNewComplexity] = useState<TaskComplexity>(TaskComplexity.MEDIUM);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editComplexity, setEditComplexity] = useState<TaskComplexity>(TaskComplexity.MEDIUM);
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTasks = useMemo(() => 
    tasks.filter(t => t.content.toLowerCase().includes(searchTerm.toLowerCase())), 
    [tasks, searchTerm]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAddTask(newContent.trim(), newComplexity);
      setNewContent('');
    }
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editContent.trim()) {
      onUpdateTask(editingTaskId, { content: editContent.trim(), complexity: editComplexity });
      setEditingTaskId(null);
    }
  };

  const handleStartEdit = (t: Task) => {
    setEditingTaskId(t.id);
    setEditContent(t.content);
    setEditComplexity(t.complexity);
  };

  const columns = [
    { title: "Cần làm", status: TaskStatus.TO_DO, color: "text-slate-500", bg: "bg-slate-100/50" },
    { title: "Đang làm", status: TaskStatus.IN_PROGRESS, color: "text-indigo-600", bg: "bg-indigo-50/50" },
    { title: "Hoàn thành", status: TaskStatus.COMPLETED, color: "text-emerald-600", bg: "bg-emerald-50/50" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Thêm nhiệm vụ mới..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={newComplexity}
              onChange={(e) => setNewComplexity(e.target.value as TaskComplexity)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-xs font-bold uppercase tracking-widest"
            >
              {Object.values(TaskComplexity).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center">
              <Plus size={24} />
            </button>
          </div>
        </form>
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-medium outline-none focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
        {columns.map(col => (
          <div 
            key={col.status} 
            className="flex-shrink-0 w-full md:w-1/3 min-w-[300px] snap-center bg-slate-100/30 rounded-[2rem] p-4 flex flex-col h-fit border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className={`text-sm font-black uppercase tracking-widest ${col.color}`}>{col.title}</h3>
              <span className="bg-white px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200 shadow-sm">
                {filteredTasks.filter(t => t.status === col.status).length}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              {filteredTasks.filter(t => t.status === col.status).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  now={now}
                  editingTaskId={editingTaskId}
                  editContent={editContent}
                  editComplexity={editComplexity}
                  setEditContent={setEditContent}
                  setEditComplexity={setEditComplexity}
                  handleSaveEdit={handleSaveEdit}
                  setEditingTaskId={setEditingTaskId}
                  handleStartEdit={handleStartEdit}
                  onDeleteTask={onDeleteTask}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
              {filteredTasks.filter(t => t.status === col.status).length === 0 && (
                <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl uppercase text-[10px] font-black tracking-widest">
                  Trống
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TaskBoard;
