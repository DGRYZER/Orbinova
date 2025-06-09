
"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

const editEmployeeSchema = z.object({
  id: z.string(), 
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

  const [isPhoneVerifiedState, setIsPhoneVerifiedState] = useState(employee?.isPhoneVerified || false);
  const [showPhoneOtpDialog, setShowPhoneOtpDialog] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [originalPhone, setOriginalPhone] = useState(employee?.phone || '');
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);

  const [showPasswordChangeOtpDialog, setShowPasswordChangeOtpDialog] = useState(false);
  const [passwordChangeOtpInput, setPasswordChangeOtpInput] = useState('');
  const [isPasswordChangeOtpVerified, setIsPasswordChangeOtpVerified] = useState(false);
  const [passwordChangeAttempted, setPasswordChangeAttempted] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const [isVerifyingPasswordOtp, setIsVerifyingPasswordOtp] = useState(false);

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });
  
  const watchedPhone = form.watch('phone');
  const watchedPasswordInput = form.watch('passwordInput');

  const resetAllOtpStates = useCallback(() => {
    setShowPhoneOtpDialog(false);
    setPhoneOtpInput('');
    setIsSendingPhoneOtp(false);
    setIsVerifyingPhoneOtp(false);
    
    setShowPasswordChangeOtpDialog(false);
    setPasswordChangeOtpInput('');
    setIsPasswordChangeOtpVerified(false);
    setPasswordChangeAttempted(false);
    setIsSendingPasswordOtp(false);
    setIsVerifyingPasswordOtp(false);
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
      setOriginalPhone(employee.phone || '');
      setShowPassword(false);
      resetAllOtpStates();
    }
  }, [employee, form, isOpen, resetAllOtpStates]);

  const handleModalClose = () => {
    setShowPassword(false);
    resetAllOtpStates();
    onClose();
  };

  const handleSendPhoneOtp = async () => {
    const phoneValue = form.getValues('phone');
    if (!phoneValue || phoneValue.trim() === '') {
      toast({ variant: "destructive", title: "Error", description: "Please enter a phone number first." });
      return;
    }
    setIsSendingPhoneOtp(true);
    try {
      // Placeholder for API call
      // await fetch('/api/send-phone-otp', { method: 'POST', body: JSON.stringify({ phone: phoneValue }) });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      toast({ title: "OTP Sent (Simulated)", description: `An OTP has been 'sent' to ${phoneValue}.` });
      setShowPhoneOtpDialog(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not send OTP for phone. Please try again." });
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const phoneValue = form.getValues('phone');
     if (!phoneOtpInput) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the OTP." });
        return;
    }
    setIsVerifyingPhoneOtp(true);
    try {
      // Placeholder for API call
      // const response = await fetch('/api/verify-phone-otp', { method: 'POST', body: JSON.stringify({ phone: phoneValue, otp: phoneOtpInput }) });
      // if (!response.ok) throw new Error("Invalid OTP");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      if (phoneOtpInput.length === 6) { // Simple client-side check for simulation
        setIsPhoneVerifiedState(true);
        toast({ title: "Success", description: "Phone number verified successfully." });
        setShowPhoneOtpDialog(false);
        setPhoneOtpInput('');
      } else {
        throw new Error("Invalid OTP format (Simulated - enter 6 digits).");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP for phone. Please try again." });
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleSendPasswordChangeOtp = async () => {
    const phoneValue = form.getValues('phone'); // Assuming OTP sent to employee's verified phone
    if (!phoneValue || !isPhoneVerifiedState) {
        toast({ variant: "destructive", title: "Phone Verification Required", description: "A verified phone number is needed to send password change OTP."});
        return;
    }
    setIsSendingPasswordOtp(true);
    try {
      // Placeholder for API call
      // await fetch('/api/send-password-change-otp', { method: 'POST', body: JSON.stringify({ phone: phoneValue }) });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      toast({ title: "Password OTP Sent (Simulated)", description: `A password change OTP has been 'sent'.` });
      setShowPasswordChangeOtpDialog(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not send password change OTP. Please try again." });
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const handleVerifyPasswordChangeOtp = async () => {
    const phoneValue = form.getValues('phone');
    if (!passwordChangeOtpInput) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the password change OTP." });
        return;
    }
    setIsVerifyingPasswordOtp(true);
    try {
      // Placeholder for API call
      // const response = await fetch('/api/verify-password-change-otp', { method: 'POST', body: JSON.stringify({ phone: phoneValue, otp: passwordChangeOtpInput }) });
      // if (!response.ok) throw new Error("Invalid OTP");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      if (passwordChangeOtpInput.length === 10) { // Simple client-side check for simulation (10 alphanumeric)
        setIsPasswordChangeOtpVerified(true);
        toast({ title: "Success", description: "Password change OTP verified. Click 'Save Changes' again to apply." });
        setShowPasswordChangeOtpDialog(false);
        setPasswordChangeOtpInput('');
      } else {
        throw new Error("Invalid OTP format (Simulated - enter 10 alphanumeric characters).");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP for password change. Please try again." });
    } finally {
      setIsVerifyingPasswordOtp(false);
    }
  };

  const onSubmit: SubmitHandler<EditEmployeeFormValues> = async (data) => {
    const currentPhone = form.getValues('phone');
    if (currentPhone && currentPhone.trim() !== '' && !isPhoneVerifiedState) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please verify the phone number before saving changes.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const employeeUpdatePayload: Partial<Employee> & { id: string } = {
        id: data.id,
        name: data.name,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        isPhoneVerified: (data.phone && data.phone.trim() !== '') ? isPhoneVerifiedState : false,
    };

    if (data.passwordInput && data.passwordInput.trim() !== '') {
      setPasswordChangeAttempted(true); 
      if (!employeeUpdatePayload.phone || !employeeUpdatePayload.isPhoneVerified) {
        toast({ variant: "destructive", title: "Verification Required", description: "A verified phone number is required to change the password." });
        setIsSubmitting(false);
        return;
      }
      if (!isPasswordChangeOtpVerified) {
        toast({ title: "OTP Required for Password", description: "Please verify OTP to change password." });
        handleSendPasswordChangeOtp(); 
        setIsSubmitting(false);
        return;
      }
      employeeUpdatePayload.password = data.passwordInput;
    } else {
      setPasswordChangeAttempted(false); 
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
    if (data.passwordInput && data.passwordInput.trim() !== '') {
        setIsPasswordChangeOtpVerified(false); 
    }
  };
  
  useEffect(() => {
    if (passwordChangeAttempted) { 
      setIsPasswordChangeOtpVerified(false);
    }
  }, [watchedPasswordInput, passwordChangeAttempted]);

  useEffect(() => {
    const currentPhoneValue = form.getValues('phone');
    if (currentPhoneValue !== originalPhone) {
      setIsPhoneVerifiedState(false);
    } else if (employee) {
      setIsPhoneVerifiedState(employee.isPhoneVerified || false);
    }
  }, [watchedPhone, originalPhone, form, employee]);

  if (!employee) return null;

  const phoneFieldHasValue = watchedPhone && watchedPhone.trim() !== '';
  const canSubmit = !(phoneFieldHasValue && !isPhoneVerifiedState);

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input id="edit-email" type="email" {...form.register('email')} className="col-span-3" />
              {form.formState.errors.email && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Phone</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                  id="edit-phone" 
                  {...form.register('phone')} 
                  className="flex-grow" 
                  disabled={isPhoneVerifiedState && phoneFieldHasValue} 
                />
                {phoneFieldHasValue && isPhoneVerifiedState ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  phoneFieldHasValue && (
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        onClick={handleSendPhoneOtp} 
                        disabled={isSendingPhoneOtp || !watchedPhone || (!!watchedPhone && isPhoneVerifiedState)}
                    >
                      {isSendingPhoneOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify
                    </Button>
                  )
                )}
              </div>
            </div>

            <DialogFooter>
               <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPhoneOtpDialog} onOpenChange={(open) => { if(!open) {setShowPhoneOtpDialog(false); setPhoneOtpInput('');} else setShowPhoneOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              An OTP has been 'sent' to {form.getValues('phone')}. Please enter it below. (For testing, enter a 6-digit number).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="phoneOtp" placeholder="Enter 6-digit OTP" value={phoneOtpInput} onChange={(e) => setPhoneOtpInput(e.target.value)} maxLength={6}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPhoneOtpDialog(false); setPhoneOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPhoneOtp} disabled={isVerifyingPhoneOtp}>
                {isVerifyingPhoneOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Phone OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordChangeOtpDialog} onOpenChange={(open) => { if(!open) {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');} else setShowPasswordChangeOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Password Change</DialogTitle>
            <DialogDescription>
              To change the password, an OTP has been 'sent'. Please enter it below. (For testing, enter a 10-character alphanumeric string).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="passwordChangeOtp" placeholder="Enter 10-character OTP" value={passwordChangeOtpInput} onChange={(e) => setPasswordChangeOtpInput(e.target.value)} maxLength={10}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPasswordChangeOtp} disabled={isVerifyingPasswordOtp}>
                {isVerifyingPasswordOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Password Change OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    