// Ensure this file is a client component as it uses hooks and context
"use client";

import type { User } from '@/types';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentUser as getStoredUser, login as apiLogin, logout as apiLogout, initializeDefaultAdmin } from '@/lib/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (employeeId: string, passwordAttempt: string, designationAttempt: 'HR' | 'Employee') => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeDefaultAdmin(); // Ensure default admin is set up
    const user = getStoredUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (employeeId: string, passwordAttempt: string, designationAttempt: 'HR' | 'Employee'): Promise<User | null> => {
    const user = apiLogin(employeeId, passwordAttempt, designationAttempt);
    setCurrentUser(user);
    if (user) {
      if (user.designation === 'HR') {
        router.push('/dashboard/hr');
      } else {
        router.push('/dashboard/employee');
      }
    }
    return user;
  }, [router]);

  const logout = useCallback(() => {
    apiLogout();
    setCurrentUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
