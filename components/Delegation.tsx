
import React, { useState, useMemo, useRef } from 'react';
import { User, TaskStatus, TaskComplexity, Attachment } from '../types';
import { Send, Users, UserPlus, AlertCircle, ShieldAlert, Paperclip, X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

interface DelegationProps {
  currentUser: User;
  users: User[];
  onAssign: (content: string, complexity: TaskComplexity, leadId: string, collaboratorIds: string[], attachments?: Attachment[]) => void;
}

const Delegation: React.FC<DelegationProps> = ({ currentUser, users, onAssign }) => {
  const [content, setContent] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>(TaskComplexity.MEDIUM);
  const [selectedUnit, setSelectedUnit] = useState(currentUser.unit);
  const [leadId, setLeadId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canDelegateTo = (targetLevel: string) => {
    const currRank = parseInt(currentUser.delegateLevel.replace(/\D/g, '')) || 99;
    const targetRank = parseInt(targetLevel.replace(/\D/g, '')) || 99;
    return targetRank > currRank;
  };

  const units = useMemo(() => Array.from(new Set(users.map(u => u.unit))), [users]);
  const targetEmployees = useMemo(() => users.filter(u => u.unit === selectedUnit && canDelegateTo(u.delegateLevel)), [selectedUnit, users, currentUser.delegateLevel]);
  const leadOptions = useMemo(() => targetEmployees.map(u => ({ id: u.id, label: u.name, subLabel: `${u.position} - ${u.delegateLevel}` })), [targetEmployees]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (attachments.length + files.length > 5) {
      alert("Tối đa 5 tệp.");
      return;
    }
    // Fix: cast FileList to File array to ensure 'file' properties (name, type) are recognized and 'file' is assignable to Blob.
    const loaders = (Array.from(files) as File[]).map(file => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve({ name: file.name, type: file.type, data: ev.target?.result as string });
        reader.readAsDataURL(file);
      });
    });
    const newAtts = await Promise.all(loaders);
    setAttachments([...attachments, ...newAtts]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !leadId) {
      alert('Vui lòng nhập đầy đủ nội dung và chọn người chủ trì.');
      return;
    }
    onAssign(content, complexity, leadId, collaboratorIds, attachments);
    alert('Đã giao nhiệm vụ thành công!');
    setContent('');
    setLeadId('');
    setCollaboratorIds([]);
    setAttachments([]);
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
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Cấp bậc: {currentUser.delegateLevel}</span>
            </div>
          </div>
          <Send className="absolute -right-4 -bottom-4 text-white/10 rotate-12" size={160} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Nội dung công việc</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập mô tả chi tiết nhiệm vụ..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Mức độ phức tạp</label>
              <select value={complexity} onChange={(e) => setComplexity(e.target.value as TaskComplexity)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold">
                {Object.values(TaskComplexity).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Đơn vị tiếp nhận</label>
              <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setLeadId(''); setCollaboratorIds([]); }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700">Tệp đính kèm (Tối đa 5)</label>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 font-bold text-xs uppercase flex items-center space-x-1 hover:text-indigo-800">
                <Paperclip size={14} /> <span>Thêm file</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf" />
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center space-x-2 text-xs font-bold">
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700">Lựa chọn nhân sự</label>
            {targetEmployees.length > 0 ? (
              <div className="space-y-6">
                <SearchableSelect label="Người chủ trì" options={leadOptions} value={leadId} onChange={setLeadId} placeholder="-- Chọn người chủ trì --" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {targetEmployees.filter(u => u.id !== leadId).map(u => (
                    <button key={u.id} type="button" onClick={() => setCollaboratorIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])} className={`px-4 py-3 rounded-xl text-sm border font-medium transition-all ${collaboratorIds.includes(u.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl text-center">
                <ShieldAlert size={40} className="mx-auto text-amber-500 mb-3" />
                <p className="text-amber-800 font-bold">Không tìm thấy nhân sự phù hợp (Cấp bậc thấp hơn bạn)</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={!leadId} className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all ${leadId ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            Xác nhận giao nhiệm vụ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Delegation;
