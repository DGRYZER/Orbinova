
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addEmployee } from '@/lib/employeeService';

const hrSignUpSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  name: z.string().min(1, { message: "Full Name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type HrSignUpFormValues = z.infer<typeof hrSignUpSchema>;

export default function HrSignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<HrSignUpFormValues>({
    resolver: zodResolver(hrSignUpSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit: SubmitHandler<HrSignUpFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = addEmployee({
        id: data.employeeId,
        name: data.name,
        designation: 'HR', // Implicitly HR
        passwordInput: data.password,
        email: data.email,
        phone: data.phone,
      });

      if (result.success) {
        toast({
          title: "Sign Up Successful",
          description: "Your HR account has been created. Please log in.",
        });
        router.push('/hr-login');
      } else {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: result.message || "Could not create HR account. The Employee ID might already exist.",
        });
      }
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">HR Account Sign Up</CardTitle>
          <CardDescription>Create a new HR administrator account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                {...form.register('employeeId')}
                placeholder="Enter desired Employee ID (e.g., HR002)"
                className={form.formState.errors.employeeId ? 'border-destructive' : ''}
              />
              {form.formState.errors.employeeId && (
                <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                {...form.register('name')}
                placeholder="Enter your full name"
                className={form.formState.errors.name ? 'border-destructive' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  placeholder="Create a password (min. 6 characters)"
                  className={form.formState.errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
               <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...form.register('confirmPassword')}
                  placeholder="Confirm your password"
                  className={form.formState.errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Enter your email address"
                className={form.formState.errors.email ? 'border-destructive' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="Enter your phone number"
                className={form.formState.errors.phone ? 'border-destructive' : ''}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Sign Up
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
  );
}
