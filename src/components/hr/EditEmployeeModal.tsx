
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

  // isPhoneVerifiedState indicates if the contact method (phone, verified via email OTP) is considered verified
  const [isPhoneVerifiedState, setIsPhoneVerifiedState] = useState(employee?.isPhoneVerified || false);
  const [showContactOtpDialog, setShowContactOtpDialog] = useState(false);
  const [contactOtpInput, setContactOtpInput] = useState('');
  const [emailForContactOtp, setEmailForContactOtp] = useState('');
  
  const [originalPhone, setOriginalPhone] = useState(employee?.phone || '');
  const [originalEmail, setOriginalEmail] = useState(employee?.email || ''); // Track original email

  const [isSendingContactOtp, setIsSendingContactOtp] = useState(false);
  const [isVerifyingContactOtp, setIsVerifyingContactOtp] = useState(false);

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
  
  const watchedPhone = form.watch('phone');
  const watchedEmail = form.watch('email');
  const watchedPasswordInput = form.watch('passwordInput');

  const resetAllOtpStates = useCallback(() => {
    setShowContactOtpDialog(false);
    setContactOtpInput('');
    setIsSendingContactOtp(false);
    setIsVerifyingContactOtp(false);
    setEmailForContactOtp('');
    
    setShowPasswordChangeOtpDialog(false);
    setPasswordChangeOtpInput('');
    setPasswordChangeAttempted(false);
    setIsSendingPasswordOtp(false);
    setIsVerifyingPasswordOtp(false);
    setEmailForPasswordOtp('');
    // isPasswordChangeOtpVerified is reset when modal opens or password input is cleared
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
      setOriginalEmail(employee.email || '');
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

  const handleSendContactOtp = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue || emailValue.trim() === '') {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter an email address to receive the contact verification OTP." });
      return;
    }
    setEmailForContactOtp(emailValue);
    setIsSendingContactOtp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast({ 
        title: "OTP Sending Simulated", 
        description: `For contact verification, an OTP has been 'sent' to ${emailValue}. Please enter any 6-digit code in the next dialog.` 
      });
      setShowContactOtpDialog(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not simulate OTP sending. Please try again." });
    } finally {
      setIsSendingContactOtp(false);
    }
  };

  const handleVerifyContactOtp = async () => {
     if (!contactOtpInput) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the OTP." });
        return;
    }
    setIsVerifyingContactOtp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      if (contactOtpInput.length === 6 && /^\d+$/.test(contactOtpInput)) { 
        setIsPhoneVerifiedState(true); // Mark contact method as verified
        toast({ title: "Success", description: "Contact method verified successfully (Simulated)." });
        setShowContactOtpDialog(false);
        setContactOtpInput('');
      } else {
        throw new Error("Invalid OTP (Simulated - please enter a 6-digit number for contact verification).");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Invalid OTP. Please try again." });
    } finally {
      setIsVerifyingContactOtp(false);
    }
  };

  const handleSendPasswordChangeOtp = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue || emailValue.trim() === '') {
        toast({ variant: "destructive", title: "Email Required", description: "An email address is needed to send the password change OTP."});
        return;
    }
    setEmailForPasswordOtp(emailValue);
    setIsSendingPasswordOtp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      toast({ 
        title: "Password OTP Sending Simulated", 
        description: `For password change, an OTP has been 'sent' to ${emailValue}. Please enter any 10-character alphanumeric code in the next dialog.` 
      });
      setShowPasswordChangeOtpDialog(true);
    } catch (error) {
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
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      if (passwordChangeOtpInput.length === 10 && /^[a-zA-Z0-9]+$/.test(passwordChangeOtpInput)) { 
        setIsPasswordChangeOtpVerified(true);
        toast({ title: "Success", description: "Password change OTP verified (Simulated). Click 'Save Changes' again to apply the new password." });
        setShowPasswordChangeOtpDialog(false);
        setPasswordChangeOtpInput('');
      } else {
        throw new Error("Invalid OTP (Simulated - please enter a 10-character alphanumeric string for password change).");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Invalid OTP for password change. Please try again." });
    } finally {
      setIsVerifyingPasswordOtp(false);
    }
  };

  const onSubmit: SubmitHandler<EditEmployeeFormValues> = async (data) => {
    const currentPhone = form.getValues('phone');
    if (currentPhone && currentPhone.trim() !== '' && !isPhoneVerifiedState) {
      toast({
        variant: "destructive",
        title: "Contact Verification Required",
        description: "If a phone number is provided, please verify it (via email OTP) before saving changes.",
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
    const currentPhoneValue = form.getValues('phone');
    const currentEmailValue = form.getValues('email');

    if (currentPhoneValue !== originalPhone || currentEmailValue !== originalEmail) {
      // If phone or email changes, reset the verification status associated with the "Verify Phone" button.
      // Also, if email (which is now used for password OTP) changes, reset password OTP verification.
      setIsPhoneVerifiedState(false); 
      setIsPasswordChangeOtpVerified(false); 
    } else if (employee) {
      setIsPhoneVerifiedState(employee.isPhoneVerified || false);
    }
  }, [watchedPhone, watchedEmail, originalPhone, originalEmail, form, employee]);

  if (!employee) return null;

  const phoneFieldHasValue = watchedPhone && watchedPhone.trim() !== '';
  const emailFieldHasValue = watchedEmail && watchedEmail.trim() !== '';

  const canSubmit = 
    !(phoneFieldHasValue && !isPhoneVerifiedState) && // If phone is entered, it must be "verified" (via email OTP)
    !((watchedPasswordInput && watchedPasswordInput.trim() !== '') && (!emailFieldHasValue || !isPasswordChangeOtpVerified) && passwordChangeAttempted);


  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Employee: {employee.name}</DialogTitle>
            <DialogDescription>
              Update the details for this employee. Leave password blank to keep it unchanged. OTPs are sent via email.
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
                  disabled={isPhoneVerifiedState && phoneFieldHasValue} 
                />
                {phoneFieldHasValue && isPhoneVerifiedState ? (
                  <CheckCircle className="h-5 w-5 text-green-500" title="Contact Verified"/>
                ) : (
                  phoneFieldHasValue && (
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        onClick={handleSendContactOtp} 
                        disabled={isSendingContactOtp || !emailFieldHasValue || (phoneFieldHasValue && isPhoneVerifiedState)}
                    >
                      {isSendingContactOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify Phone
                    </Button>
                  )
                )}
              </div>
               {phoneFieldHasValue && !emailFieldHasValue && !isPhoneVerifiedState &&
                 <p className="col-span-3 col-start-2 text-xs text-muted-foreground">An email is required to verify this phone number via OTP.</p>
               }
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

      {/* Contact OTP Dialog (Phone verification via Email OTP) */}
      <Dialog open={showContactOtpDialog} onOpenChange={(open) => { if(!open) {setShowContactOtpDialog(false); setContactOtpInput('');} else setShowContactOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Contact (Simulated Email OTP)</DialogTitle>
            <DialogDescription>
              OTP 'sent' to {emailForContactOtp}. For testing, please enter a 6-digit number below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="contactOtp" placeholder="Enter 6-digit OTP" value={contactOtpInput} onChange={(e) => setContactOtpInput(e.target.value)} maxLength={6}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowContactOtpDialog(false); setContactOtpInput('');}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyContactOtp} disabled={isVerifyingContactOtp}>
                {isVerifyingContactOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
