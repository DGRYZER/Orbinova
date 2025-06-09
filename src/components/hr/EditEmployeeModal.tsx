
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

  // Phone verification state removed

  const [showPasswordChangeOtpDialog, setShowPasswordChangeOtpDialog] = useState(false);
  const [passwordChangeOtpInput, setPasswordChangeOtpInput] = useState('');
  const [emailForPasswordOtp, setEmailForPasswordOtp] = useState('');
  const [isPasswordChangeOtpVerified, setIsPasswordChangeOtpVerified] = useState(false);
  const [passwordChangeAttempted, setPasswordChangeAttempted] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const [isVerifyingPasswordOtp, setIsVerifyingPasswordOtp] = useState(false);

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
  });
  
  const watchedEmail = form.watch('email');
  const watchedPasswordInput = form.watch('passwordInput');

  const resetAllOtpStates = useCallback(() => {
    // Phone verification OTP states removed
    setShowPasswordChangeOtpDialog(false);
    setPasswordChangeOtpInput('');
    setPasswordChangeAttempted(false);
    setIsSendingPasswordOtp(false);
    setIsVerifyingPasswordOtp(false);
    setEmailForPasswordOtp('');
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
      // isPhoneVerifiedState removed
      setShowPassword(false);
      resetAllOtpStates();
      setIsPasswordChangeOtpVerified(false); 
    }
  }, [employee, form, isOpen, resetAllOtpStates]);

  const handleModalClose = () => {
    setShowPassword(false);
    resetAllOtpStates();
    setIsPasswordChangeOtpVerified(false); 
    onClose();
  };

  // handleSendContactOtp and handleVerifyContactOtp removed

  const handleSendPasswordChangeOtp = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue || emailValue.trim() === '') {
        toast({ variant: "destructive", title: "Email Required", description: "An email address is needed to send the password change OTP."});
        return;
    }
    setEmailForPasswordOtp(emailValue);
    setIsSendingPasswordOtp(true);
    // Simulate API call to backend to send email OTP
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      // In a real app, this would call a backend API to send an email.
      // The backend would generate OTP and send it.
      toast({ 
        title: "Password OTP Sending Simulated", 
        description: `For password change, an OTP has been 'sent' to ${emailValue}. Please enter any 10-character alphanumeric code in the next dialog.` 
      });
      setShowPasswordChangeOtpDialog(true); // Show dialog to enter OTP
    } catch (error) {
      // console.error("Simulated send password OTP error:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not simulate password change OTP sending. Please try again." });
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const handleVerifyPasswordChangeOtp = async () => {
    if (!passwordChangeOtpInput) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the password change OTP." });
        return;
    }
    setIsVerifyingPasswordOtp(true);
    // Simulate API call to backend to verify OTP
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      // SIMULATED VERIFICATION LOGIC
      // In a real app, the backend would check against a stored OTP.
      // For this simulation: check for 10 char alphanumeric
      if (passwordChangeOtpInput.length === 10 && /^[a-zA-Z0-9]+$/.test(passwordChangeOtpInput)) { 
        setIsPasswordChangeOtpVerified(true);
        toast({ title: "Success", description: "Password change OTP verified (Simulated). Click 'Save Changes' again to apply the new password." });
        setShowPasswordChangeOtpDialog(false);
        setPasswordChangeOtpInput('');
      } else {
        throw new Error("Invalid OTP (Simulated - please enter a 10-character alphanumeric string for password change).");
      }
    } catch (error) {
      // console.error("Simulated verify password OTP error:", error);
      toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Invalid OTP for password change. Please try again." });
    } finally {
      setIsVerifyingPasswordOtp(false);
    }
  };

  const onSubmit: SubmitHandler<EditEmployeeFormValues> = async (data) => {
    // Phone verification check removed
    
    setIsSubmitting(true);
    
    const employeeUpdatePayload: Partial<Employee> & { id: string } = {
        id: data.id,
        name: data.name,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        // isPhoneVerified removed
    };

    if (data.passwordInput && data.passwordInput.trim() !== '') {
      setPasswordChangeAttempted(true); 
      if (!employeeUpdatePayload.email || employeeUpdatePayload.email.trim() === '') {
        toast({ variant: "destructive", title: "Email Required", description: "An email address is required to change the password." });
        setIsSubmitting(false);
        return;
      }
      if (!isPasswordChangeOtpVerified) {
        toast({ title: "OTP Required for Password Change", description: "Please verify the password change OTP sent to your email. Click 'Send OTP for Password' if you haven't." });
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
  };
  
  useEffect(() => {
    if (passwordChangeAttempted && (!watchedPasswordInput || watchedPasswordInput.trim() === '')) {
        setIsPasswordChangeOtpVerified(false);
        setPasswordChangeAttempted(false); 
    }
  }, [watchedPasswordInput, passwordChangeAttempted]);

  useEffect(() => {
    // This effect previously handled resetting isPhoneVerifiedState.
    // Now it only resets password OTP verification if email changes.
    const currentEmailValue = form.getValues('email');
    if (employee && currentEmailValue !== employee.email) {
        setIsPasswordChangeOtpVerified(false);
    }
  }, [watchedEmail, form, employee]);


  if (!employee) return null;

  const emailFieldHasValue = watchedEmail && watchedEmail.trim() !== '';

  const canSubmit = 
    // Phone verification condition removed
    !((watchedPasswordInput && watchedPasswordInput.trim() !== '') && (!emailFieldHasValue || !isPasswordChangeOtpVerified) && passwordChangeAttempted);


  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Employee: {employee.name}</DialogTitle>
            <DialogDescription>
              Update the details for this employee. Leave password blank to keep it unchanged. Password change OTPs are sent via email.
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
             {watchedPasswordInput && watchedPasswordInput.trim() !== '' && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3 flex items-center gap-2">
                        {isPasswordChangeOtpVerified ? (
                             <div className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" /> Password OTP Verified
                            </div>
                        ) : (
                            <Button 
                                type="button" 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                    setPasswordChangeAttempted(true); 
                                    handleSendPasswordChangeOtp();
                                }}
                                disabled={isSendingPasswordOtp || !emailFieldHasValue}
                            >
                                {isSendingPasswordOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP for Password
                            </Button>
                        )}
                    </div>
                     {!emailFieldHasValue && <p className="col-span-3 col-start-2 text-xs text-muted-foreground">An email is required to change password.</p>}
                </div>
            )}
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
                />
                {/* Phone verification UI removed */}
              </div>
               {/* Conditional text related to phone verification removed */}
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

      {/* Contact OTP Dialog removed */}

      {/* Password Change OTP Dialog */}
      <Dialog open={showPasswordChangeOtpDialog} onOpenChange={(open) => { if(!open) {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');} else setShowPasswordChangeOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Password Change (Simulated Email OTP)</DialogTitle>
            <DialogDescription>
              OTP 'sent' to {emailForPasswordOtp}. For testing, please enter a 10-character alphanumeric string below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="passwordChangeOtp" placeholder="Enter 10-character OTP" value={passwordChangeOtpInput} onChange={(e) => setPasswordChangeOtpInput(e.target.value)} maxLength={10}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPasswordChangeOtpDialog(false); setPasswordChangeOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPasswordChangeOtp} disabled={isVerifyingPasswordOtp}>
                {isVerifyingPasswordOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Password OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
