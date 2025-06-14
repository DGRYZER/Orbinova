
import type { Employee } from '@/types';
import { getItem, setItem } from './localStorageUtils';

<<<<<<< HEAD
const EMPLOYEES_KEY = 'attendease-employees';
=======
const EMPLOYEES_KEY = 'Orbinova-employees';
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a

export function getAllEmployees(): Employee[] {
  return getItem<Employee[]>(EMPLOYEES_KEY) || [];
}

export function getEmployeeById(id: string): Employee | undefined {
  const employees = getAllEmployees();
  return employees.find(emp => emp.id === id);
}

<<<<<<< HEAD
export function doesHrIdExist(employeeId: string): boolean {
  const employees = getAllEmployees();
  return employees.some(emp => emp.id === employeeId && emp.designation === 'HR');
}

=======
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
export function addEmployee(newEmployeeData: Omit<Employee, 'password' | 'id'> & { id: string; passwordInput: string }): { success: boolean, message?: string } {
  const employees = getAllEmployees();
  if (employees.some(emp => emp.id === newEmployeeData.id)) {
    return { success: false, message: 'Employee ID already exists.' };
  }
  
  const employeeToAdd: Employee = {
    id: newEmployeeData.id,
    name: newEmployeeData.name,
    designation: newEmployeeData.designation,
    password: newEmployeeData.passwordInput,
    email: newEmployeeData.email,
    phone: newEmployeeData.phone,
  };

  setItem<Employee[]>(EMPLOYEES_KEY, [...employees, employeeToAdd]);
  return { success: true };
}

export function updateEmployee(updatedEmployeeData: Partial<Employee> & { id: string }): { success: boolean, message?: string } {
  let employees = getAllEmployees();
  const index = employees.findIndex(emp => emp.id === updatedEmployeeData.id);
  if (index === -1) {
    return { success: false, message: 'Employee not found.' };
  }

  // Merge existing data with updated data
  const employeeToUpdate = { ...employees[index], ...updatedEmployeeData };

  // Ensure password is not accidentally wiped if not provided in update form
  if (!updatedEmployeeData.password && employees[index].password) {
    employeeToUpdate.password = employees[index].password;
  }
  
  employees[index] = employeeToUpdate;
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
<<<<<<< HEAD

=======
>>>>>>> 4dad47e2bf19a5cfe0a46d24b505fba4ef12689a
