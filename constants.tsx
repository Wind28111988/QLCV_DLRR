
import { User, Gender, TaskStatus, Task, TaskComplexity } from './types';

export const DEFAULT_PASSWORD = '123456';
// Cập nhật Admin tối cao mới theo yêu cầu
export const ADMIN_EMAIL_IMPORT = 'admin@gdt.gov.vn';
export const ADMIN_PREFIX = 'admin';
export const ADMIN_PASSWORD_2025 = 'admin@2025';

// Mã khôi phục hệ thống (Sử dụng để reset tài khoản admin khi quên pass)
export const SYSTEM_RECOVERY_CODE = 'GDT-RESET-2025';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-root',
    name: 'Quản trị hệ thống',
    position: 'Quản trị hệ thống',
    unit: 'Tổng cục',
    gender: Gender.MALE,
    dob: '1980-01-01',
    phone: '0000000000',
    email: 'admin@gdt.gov.vn',
    password: ADMIN_PASSWORD_2025,
    delegateLevel: 'X1',
    notes: 'AD',
    mustChangePassword: false, 
  },
  {
    id: 'u2',
    name: 'Trần Văn A',
    position: 'Phó trưởng phòng',
    unit: 'Công nghệ thông tin',
    gender: Gender.MALE,
    dob: '1990-05-12',
    phone: '0987654321',
    email: 'tva@gdt.gov.vn',
    password: DEFAULT_PASSWORD,
    delegateLevel: 'X2',
    notes: '',
    mustChangePassword: true,
  },
  {
    id: 'u3',
    name: 'Lê Thị B',
    position: 'Nhân viên',
    unit: 'Công nghệ thông tin',
    gender: Gender.FEMALE,
    dob: '1995-10-20',
    phone: '0901239876',
    email: 'ltb@gdt.gov.vn',
    password: DEFAULT_PASSWORD,
    delegateLevel: 'X3',
    notes: '',
    mustChangePassword: true,
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    userId: 'u2',
    content: 'Xây dựng module báo cáo chi tiết',
    startTime: Date.now() - 3600000 * 5,
    status: TaskStatus.IN_PROGRESS,
    complexity: TaskComplexity.HARD,
    leadId: 'u2',
    collaboratorIds: ['u3'],
    unit: 'Công nghệ thông tin'
  }
];
