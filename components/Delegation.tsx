
import React, { useState, useMemo } from 'react';
import { User, TaskStatus, TaskComplexity } from '../types';
import { Send, Users, UserPlus, AlertCircle, ShieldAlert } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

interface DelegationProps {
  currentUser: User;
  users: User[];
  onAssign: (content: string, complexity: TaskComplexity, leadId: string, collaboratorIds: string[]) => void;
}

const Delegation: React.FC<DelegationProps> = ({ currentUser, users, onAssign }) => {
  const [content, setContent] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>(TaskComplexity.MEDIUM);
  const [selectedUnit, setSelectedUnit] = useState(currentUser.unit);
  const [leadId, setLeadId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);

  // Logic: X1 (Rank 1) là cao nhất. X2 (Rank 2) là trung bình. X3 (Rank 3) là thấp nhất.
  // Rank thấp hơn (số lớn hơn) mới có thể được giao việc từ Rank cao hơn (số nhỏ hơn).
  const canDelegateTo = (targetLevel: string) => {
    const currRank = parseInt(currentUser.delegateLevel.replace(/\D/g, '')) || 99;
    const targetRank = parseInt(targetLevel.replace(/\D/g, '')) || 99;
    // Chỉ cho phép giao việc cho người có Rank thấp hơn (Số Rank lớn hơn)
    return targetRank > currRank;
  };

  const units = useMemo(() => Array.from(new Set(users.map(u => u.unit))), [users]);
  
  const targetEmployees = useMemo(() => {
    return users.filter(u => u.unit === selectedUnit && canDelegateTo(u.delegateLevel));
  }, [selectedUnit, users, currentUser.delegateLevel]);

  const leadOptions = useMemo(() => {
    return targetEmployees.map(u => ({
      id: u.id,
      label: u.name,
      subLabel: `${u.position} - ${u.delegateLevel}`
    }));
  }, [targetEmployees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !leadId) {
      alert('Vui lòng nhập đầy đủ nội dung và chọn người chủ trì.');
      return;
    }

    onAssign(content, complexity, leadId, collaboratorIds);
    alert(`Đã giao việc thành công cho ${users.find(u => u.id === leadId)?.name}. Hệ thống đã ghi nhận nhiệm vụ.`);
    
    // Reset form
    setContent('');
    setComplexity(TaskComplexity.MEDIUM);
    setLeadId('');
    setCollaboratorIds([]);
  };

  const toggleCollaborator = (id: string) => {
    setCollaboratorIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center space-x-3">
              <Send size={28} />
              <span>Giao nhiệm vụ công tác</span>
            </h2>
            <div className="flex items-center space-x-4 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                Cấp bậc hiện tại: {currentUser.delegateLevel}
              </span>
              <p className="text-indigo-100 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                Nguyên tắc: Chỉ giao việc cho cấp thấp hơn.
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white/10 rotate-12">
            <Send size={160} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Nội dung công việc</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập mô tả chi tiết nhiệm vụ..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Mức độ phức tạp</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as TaskComplexity)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              >
                {Object.values(TaskComplexity).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Đơn vị tiếp nhận</label>
              <select
                value={selectedUnit}
                onChange={(e) => { setSelectedUnit(e.target.value); setLeadId(''); setCollaboratorIds([]); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Lựa chọn nhân sự</label>
            
            {targetEmployees.length > 0 ? (
              <div className="space-y-6">
                <SearchableSelect
                  label="Người chủ trì"
                  options={leadOptions}
                  value={leadId}
                  onChange={setLeadId}
                  placeholder="-- Chọn người chủ trì --"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest flex items-center">
                    <Users size={14} className="mr-1" /> Người phối hợp
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    {targetEmployees.filter(u => u.id !== leadId).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleCollaborator(u.id)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm border font-medium transition-all ${
                          collaboratorIds.includes(u.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        <UserPlus size={14} />
                        <span className="truncate">{u.name}</span>
                      </button>
                    ))}
                    {targetEmployees.filter(u => u.id !== leadId).length === 0 && (
                      <p className="col-span-full text-slate-400 text-center py-6 text-sm italic">Không có thêm nhân sự cấp dưới khả dụng.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl text-center">
                <ShieldAlert size={40} className="mx-auto text-amber-500 mb-3" />
                <h3 className="text-amber-800 font-bold">Không tìm thấy nhân sự phù hợp</h3>
                <p className="text-amber-600 text-sm mt-1">Đơn vị này không có nhân sự thuộc cấp bậc thấp hơn bạn.</p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={!leadId}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transform active:scale-[0.98] transition-all flex items-center justify-center space-x-3 ${
                leadId 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send size={24} />
              <span>Xác nhận giao nhiệm vụ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Delegation;
