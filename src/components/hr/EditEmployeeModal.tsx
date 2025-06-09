"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEmployee } from '@/lib/employeeService';
import type { Employee } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const editEmployeeSchema = z.object({
  id: z.string(), // Readonly
  name: z.string().min(1, "Name is required"),
  designation: z.enum(['Employee', 'HR']),
  passwordInput: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')), // Optional: only if changing
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
}

export default function EditEmployeeModal({ employee, isOpen, onClose, onEmployeeUpdated }: EditEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        passwordInput: '', // Keep password field blank by default for security
        email: employee.email || '',
        phone: employee.phone || '',
      });
    }
  }, [employee, form, isOpen]);

  if (!employee) return null;

  const onSubmit: SubmitHandler<EditEmployeeFormValues> = async (data) => {
    setIsSubmitting(true);
    const employeeToUpdate: Employee = {
        id: data.id,
        name: data.name,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        // Conditionally update password if a new one is provided
        ...(data.passwordInput && { password: data.passwordInput }),
    };

    const result = updateEmployee(employeeToUpdate);
    if (result.success) {
      toast({ title: "Success", description: "Employee details updated." });
      onEmployeeUpdated();
      onClose();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to update employee." });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Employee: {employee.name}</DialogTitle>
          <DialogDescription>
            Update the details for this employee. Leave password blank to keep it unchanged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-id" className="text-right">Employee ID</Label>
            <Input id="edit-id" {...form.register('id')} className="col-span-3" readOnly disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Full Name</Label>
            <Input id="edit-name" {...form.register('name')} className="col-span-3" />
            {form.formState.errors.name && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-designation" className="text-right">Designation</Label>
            <Select
              onValueChange={(value) => form.setValue('designation', value as 'Employee' | 'HR')}
              defaultValue={form.getValues('designation')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.designation && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.designation.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-passwordInput" className="text-right">New Password</Label>
            <Input id="edit-passwordInput" type="password" {...form.register('passwordInput')} className="col-span-3" placeholder="Leave blank to keep current"/>
            {form.formState.errors.passwordInput && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.passwordInput.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Email</Label>
            <Input id="edit-email" type="email" {...form.register('email')} className="col-span-3" />
            {form.formS<ctrl63>