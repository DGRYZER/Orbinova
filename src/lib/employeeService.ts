import type { Employee } from '@/types';
import { getItem, setItem } from './localStorageUtils';

const EMPLOYEES_KEY = 'attendease-employees';

export function getAllEmployees(): Employee[] {
  return getItem<Employee[]>(EMPLOYEES_KEY) || [];
}

export function getEmployeeById(id: string): Employee | undefined {
  const employees = getAllEmployees();
  return employees.find(emp => emp.id === id);
}

export function addEmployee(newEmployee: Omit<Employee, 'password'> & { passwordInput: string }): { success: boolean, message?: string } {
  const employees = getAllEmployees();
  if (employees.some(emp => emp.id === newEmployee.id)) {
    return { success: false, message: 'Employee ID already exists.' };
  }
  const employeeWithPassword: Employee = {
    ...newEmployee,
    password: newEmployee.passwordInput,
  };
  // No need to store passwordInput
  delete (employeeWithPassword as any).passwordInput;

  setItem<Employee[]>(EMPLOYEES_KEY, [...employees, employeeWithPassword]);
  return { success: true };
}

export function updateEmployee(updatedEmployee: Employee): { success: boolean, message?: string } {
  let employees = getAllEmployees();
  const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
  if (index === -1) {
    return { success: false, message: 'Employee not found.' };
  }
  // Ensure password is not accidentally wiped if not provided in update form
  if (!updatedEmployee.password && employees[index].password) {
    updatedEmployee.password = employees[index].password;
  }
  employees[index] = updatedEmployee;
  setItem<Employee[]>(EMPLOYEES_KEY, employees);
  return { success: true };
}

export function removeEmployee(employeeId: string): { success: boolean, message?: string } {
  let employees = getAllEmployees();
  // Prevent HR from deleting themselves if they are the only HR
  const hrUsers = employees.filter(emp => emp.designation === 'HR');
  const targetEmployee = employees.find(emp => emp.id === employeeId);

  if (targetEmployee?.designation === 'HR' && hrUsers.length <= 1) {
    return { success: false, message: 'Cannot delete the last HR admin.' };
  }

  const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
  if (employees.length === filteredEmployees.length) {
    return { success: false, message: 'Employee not found.' };
  }
  setItem<Employee[]>(EMPLOYEES_KEY, filteredEmployees);
  // Consider also removing associated attendance records or anonymizing them
  return { success: true };
}