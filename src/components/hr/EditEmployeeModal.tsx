
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEmployee } from '@/lib/employeeService';
import type { Employee } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

const editEmployeeSchema = z.object({
  id: z.string(), // Readonly
  name: z.string().min(1, "Name is required"),
  designation: z.enum(['Employee', 'HR']),
  passwordInput: z.string().min(6, "New password must be at least 6 characters").optional().or(z.literal('')),
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
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Phone Verification State
  const [isPhoneVerifiedState, setIsPhoneVerifiedState] = useState(employee?.isPhoneVerified || false);
  const [showPhoneOtpDialog, setShowPhoneOtpDialog] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // Password Change OTP State
  const [showPasswordChangeOtpDialog, setShowPasswordChangeOtpDialog] = useState(false);
  const [passwordChangeOtpInput, setPasswordChangeOtpInput] = useState('');
  const [generatedPasswordChangeOtp, setGeneratedPasswordChangeOtp] = useState('');
  const [isPasswordChangeOtpVerified, setIsPasswordChangeOtpVerified] = useState(false);
  const [passwordChangeAttempted, setPasswordChangeAttempted] = useState(false);


  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });
  
  const resetAllOtpStates = useCallback(() => {
    setShowPhoneOtpDialog(false);
    setPhoneOtpInput('');
    setGeneratedPhoneOtp('');
    
    setShowPasswordChangeOtpDialog(false);
    setPasswordChangeOtpInput('');
    setGeneratedPasswordChangeOtp('');
    setIsPasswordChangeOtpVerified(false);
    setPasswordChangeAttempted(false);
  }, []);


  useEffect(() => {
    if (employee && isOpen) {
      form.reset({
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        passwordInput: '',
        email: employee.email || '',
        phone: employee.phone || '',
      });
      setIsPhoneVerifiedState(employee.isPhoneVerified || false);
      setShowPassword(false);
      resetAllOtpStates();
    }
  }, [employee, form, isOpen, resetAllOtpStates]);


  const handleModalClose = () => {
    setShowPassword(false);
    resetAllOtpStates();
    onClose();
  };

  // --- Phone Verification Logic ---
  const handleSendPhoneOtp = () => {
    const phoneValue = form.getValues('phone');
    if (!phoneValue || phoneValue.trim() === '') {
      toast({ variant: "destructive", title: "Error", description: "Please enter a phone number first." });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(otp);
    // console.log(`Phone Verification OTP for ${phoneValue}: ${otp}`); // Removed for security
    toast({ title: "OTP Sent (Simulated)", description: `An OTP has been sent to ${phoneValue}. Please check your device.` });
    setShowPhoneOtpDialog(true);
  };

  const handleVerifyPhoneOtp = () => {
    if (phoneOtpInput === generatedPhoneOtp) {
      setIsPhoneVerifiedState(true);
      toast({ title: "Success", description: "Phone number verified successfully." });
      setShowPhoneOtpDialog(false);
      setPhoneOtpInput('');
    } else {
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP for phone. Please try again." });
    }
  };

  // --- Password Change OTP Logic ---
  const generateAlphanumericOtp = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  };

  const handleSendPasswordChangeOtp = () => {
    const otp = generateAlphanumericOtp(10);
    setGeneratedPasswordChangeOtp(otp);
    // console.log(`Password Change OTP for ${employee?.name}: ${otp}`); // Removed for security
    toast({ title: "Password OTP Sent (Simulated)", description: `A password change OTP has been sent to the verified phone number. Please check your device.` });
    setShowPasswordChangeOtpDialog(true);
  };

  const handleVerifyPasswordChangeOtp = () => {
    if (passwordChangeOtpInput === generatedPasswordChangeOtp) {
      setIsPasswordChangeOtpVerified(true);
      toast({ title: "Success", description: "Password change OTP verified. Click 'Save Changes' again to apply." });
      setShowPasswordChangeOtpDialog(false);
      setPasswordChangeOtpInput('');
    } else {
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP for password change. Please try again." });
    }
  };


  const onSubmit: SubmitHandler<EditEmployeeFormValues> = async (data) => {
    setIsSubmitting(true);
    
    const employeeUpdatePayload: Partial<Employee> & { id: string } = {
        id: data.id,
        name: data.name,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        isPhoneVerified: isPhoneVerifiedState,
    };

    if (data.passwordInput && data.passwordInput.trim() !== '') {
      setPasswordChangeAttempted(true); // Mark that a password change was intended
      if (!isPhoneVerifiedState) {
        toast({ variant: "destructive", title: "Verification Required", description: "Please verify the phone number before changing the password." });
        setIsSubmitting(false);
        return;
      }
      if (!isPasswordChangeOtpVerified) {
        toast({ title: "OTP Required for Password", description: "Please verify OTP to change password." });
        handleSendPasswordChangeOtp(); // Trigger OTP dialog for password change
        setIsSubmitting(false);
        return;
      }
      // If OTP is verified for password change
      employeeUpdatePayload.password = data.passwordInput;
    } else {
      setPasswordChangeAttempted(false); // No password change was intended this time
    }
    
    const result = updateEmployee(employeeUpdatePayload as Employee);
    if (result.success) {
      toast({ title: "Success", description: "Employee details updated." });
      onEmployeeUpdated();
      handleModalClose();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to update employee." });
    }
    setIsSubmitting(false);
    // Reset password change OTP verification status for next attempt if password was changed
    if (data.passwordInput && data.passwordInput.trim() !== '') {
        setIsPasswordChangeOtpVerified(false); 
    }
  };
  
  // Effect to reset password OTP verification if password input changes
  const watchedPasswordInput = form.watch('passwordInput');
  useEffect(() => {
    if (passwordChangeAttempted) { // Only reset if a change was previously processed/attempted
      setIsPasswordChangeOtpVerified(false);
    }
  }, [watchedPasswordInput, passwordChangeAttempted]);


  if (!employee) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Employee: {employee.name}</DialogTitle>
            <DialogDescription>
              Update the details for this employee. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {/* ID, Name, Designation */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-id" className="text-right">Employee ID</Label>
              <Input id="edit-id" {...form.register('id')} className="col-span-3" readOnly disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Full Name</Label>
              <Input id="edit-name" {...form.register('name')} className="col-span-3" />
              {form.formState.errors.name && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-designation" className="text-right">Designation</Label>
              <Select onValueChange={(value) => form.setValue('designation', value as 'Employee' | 'HR')} value={form.watch('designation')}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* New Password */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-passwordInput" className="text-right">New Password</Label>
              <div className="col-span-3 relative">
                <Input id="edit-passwordInput" type={showPassword ? "text" : "password"} {...form.register('passwordInput')} className="pr-10" placeholder="Leave blank to keep current"/>
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.passwordInput && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.passwordInput.message}</p>}
            </div>
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input id="edit-email" type="email" {...form.register('email')} className="col-span-3" />
              {form.formState.errors.email && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            {/* Phone Number with Verification */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Phone</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="edit-phone" {...form.register('phone')} className="flex-grow" disabled={isPhoneVerifiedState} />
                {isPhoneVerifiedState ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={handleSendPhoneOtp} disabled={!form.watch('phone')}>
                    Verify
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
               <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Phone OTP Verification Dialog */}
      <Dialog open={showPhoneOtpDialog} onOpenChange={(open) => { if(!open) {setShowPhoneOtpDialog(false); setPhoneOtpInput('');} else setShowPhoneOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              An OTP has been sent to {form.getValues('phone')}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="phoneOtp" placeholder="Enter 6-digit OTP" value={phoneOtpInput} onChange={(e) => setPhoneOtpInput(e.target.value)} maxLength={6}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPhoneOtpDialog(false); setPhoneOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPhoneOtp}>Verify Phone OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change OTP Verification Dialog */}
      <Dialog open={showPasswordChangeOtpDialog} onOpenChange={(open) => { if(!open) {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');} else setShowPasswordChangeOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Password Change</DialogTitle>
            <DialogDescription>
              To change the password, an OTP has been sent to the verified phone number. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="passwordChangeOtp" placeholder="Enter 10-character OTP" value={passwordChangeOtpInput} onChange={(e) => setPasswordChangeOtpInput(e.target.value)} maxLength={10}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPasswordChangeOtp}>Verify Password Change OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
