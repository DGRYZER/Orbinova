
import type { Employee, User } from '@/types';
import { getItem, setItem, removeItem } from './localStorageUtils';

const EMPLOYEES_KEY = 'attendease-employees';
const CURRENT_USER_KEY = 'attendease-currentUser';

// Initialize with a default HR admin if no employees exist
export function initializeDefaultAdmin(): void {
  if (typeof window !== 'undefined') {
    const employees = getItem<Employee[]>(EMPLOYEES_KEY);
    if (!employees || employees.length === 0) {
      const defaultAdmin: Employee = {
        id: 'HR001',
        name: 'Admin HR',
        designation: 'HR',
        password: 'hrpassword', // Default password for HR
        email: 'hr@example.com',
        // isPhoneVerified is removed
      };
      setItem<Employee[]>(EMPLOYEES_KEY, [defaultAdmin]);
    }
  }
}

initializeDefaultAdmin(); // Ensure admin exists on first load client-side

export function login(employeeId: string, passwordAttempt: string, designationAttempt: 'HR' | 'Employee'): User | null {
  const employees = getItem<Employee[]>(EMPLOYEES_KEY) || [];
  const employee = employees.find(
    (emp) => emp.id === employeeId && emp.designation === designationAttempt
  );

  if (employee && employee.password === passwordAttempt) {
    const currentUser: User = {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      email: employee.email,
      phone: employee.phone,
      // isPhoneVerified is removed
    };
    setItem<User>(CURRENT_USER_KEY, currentUser);
    return currentUser;
  }
  return null;
}

export function logout(): void {
  removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  return getItem<User>(CURRENT_USER_KEY);
}
