
import { supabase } from './supabase';

export const cloudStorage = {
  // Lấy toàn bộ người dùng
  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  },

  // Lấy toàn bộ công việc
  async getTasks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('startTime', { ascending: false });
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data || [];
  },

  // Thêm hoặc cập nhật User
  async upsertUser(user: any) {
    const { error } = await supabase
      .from('users')
      .upsert(user);
    if (error) console.error('Error upserting user:', error);
  },

  // Thêm công việc mới
  async insertTask(task: any) {
    const { error } = await supabase
      .from('tasks')
      .insert(task);
    if (error) console.error('Error inserting task:', error);
  },

  // Cập nhật công việc
  async updateTask(taskId: string, updates: any) {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
    if (error) console.error('Error updating task:', error);
  },

  // Xóa công việc
  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) console.error('Error deleting task:', error);
  }
};
