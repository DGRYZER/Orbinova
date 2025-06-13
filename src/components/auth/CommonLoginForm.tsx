
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doesHrIdExist } from '@/lib/employeeService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const loginSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface CommonLoginFormProps {
  role: 'HR' | 'Employee';
  title: string;
  description: string;
}

export default function CommonLoginForm({ role, title, description }: CommonLoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccountNotFoundDialog, setShowAccountNotFoundDialog] = useState(false);
  const [failedLoginEmployeeId, setFailedLoginEmployeeId] = useState('');


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setFailedLoginEmployeeId(data.employeeId); // Store employeeId for potential dialog
    try {
      const user = await login(data.employeeId, data.password, role);
      if (!user) {
        if (role === 'HR') {
          const hrExists = doesHrIdExist(data.employeeId);
          if (!hrExists) {
            setShowAccountNotFoundDialog(true);
          } else {
            // HR ID exists, but password was wrong or other issue
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: "Invalid Employee ID or password.",
            });
          }
        } else {
          // For Employee role or other non-HR specific failures
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid Employee ID, password, or role.",
          });
        }
      }
      // Successful login redirect is handled by useAuth's login method
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-400/20 via-teal-500/20 to-blue-600/20">
        <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="text"
                  {...form.register('employeeId')}
                  placeholder="Enter your Employee ID"
                  className={form.formState.errors.employeeId ? 'border-destructive' : ''}
                />
                {form.formState.errors.employeeId && (
                  <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="Enter your password"
                    className={form.formState.errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Login
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-primary hover:underline">
                Back to login selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showAccountNotFoundDialog} onOpenChange={setShowAccountNotFoundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              The HR account with ID "{failedLoginEmployeeId}" does not exist.
              Would you like to create a new HR account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/hr-signup')}>
              Go to HR Sign Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
