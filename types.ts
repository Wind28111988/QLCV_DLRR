
export enum TaskStatus {
  TO_DO = 'Cần làm',
  IN_PROGRESS = 'Đang làm',
  COMPLETED = 'Hoàn thành'
}

export enum TaskComplexity {
  MEDIUM = 'Trung bình',
  HARD = 'Khó',
  VERY_HARD = 'Rất khó'
}

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export interface User {
  id: string;
  name: string;        // Cột A
  position: string;    // Cột B
  unit: string;        // Cột C
  gender: Gender;      // Cột D
  dob: string;         // Cột E
  phone: string;       // Cột F
  email: string;       // Cột G
  password: string;    
  delegateLevel: string; // Cột H (X1, X2, X3...)
  notes: string;       // Cột I (AD = Admin)
  mustChangePassword: boolean;
}

export interface Task {
  id: string;
  userId: string;
  content: string;
  startTime: number;
  completedTime?: number;
  status: TaskStatus;
  complexity: TaskComplexity;
  leadId: string;
  collaboratorIds: string[];
  unit: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  tasksByUnit: Record<string, number>;
}
