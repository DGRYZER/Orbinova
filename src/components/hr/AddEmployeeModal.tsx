
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addEmployee } from '@/lib/employeeService';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

const employeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  designation: z.enum(['Employee', 'HR']),
  passwordInput: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface AddEmployeeModalProps {
  onEmployeeAdded: () => void;
}

export default function AddEmployeeModal({ onEmployeeAdded }: AddEmployeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // This flag is now set via email OTP
  const [showContactOtpDialog, setShowContactOtpDialog] = useState(false);
  const [contactOtpInput, setContactOtpInput] = useState('');
  const [emailForOtp, setEmailForOtp] = useState('');


  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: '',
      name: '',
      designation: 'Employee',
      passwordInput: '',
      email: '',
      phone: '',
    },
  });

  const watchedPhone = form.watch('phone');
  const watchedEmail = form.watch('email');


  const resetOtpStates = () => {
    setShowContactOtpDialog(false);
    setContactOtpInput('');
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
    setEmailForOtp('');
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setShowPassword(false);
      setIsPhoneVerified(false); 
      resetOtpStates();
    }
  };

  const handleSendContactOtp = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue || emailValue.trim() === '') {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter an email address first to receive the verification OTP." });
      return;
    }
    setEmailForOtp(emailValue);
    setIsSendingOtp(true);
    try {
      // SIMULATED API CALL - In a real app, this would call a backend API to send an email.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      toast({ 
        title: "OTP Sending Simulated", 
        description: `For testing, an OTP has been 'sent' to ${emailValue}. Please enter any 6-digit code in the next dialog.` 
      });
      setShowContactOtpDialog(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Could not simulate OTP sending. Please try again." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyContactOtp = async () => {
    if (!contactOtpInput) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the OTP." });
        return;
    }
    setIsVerifyingOtp(true);
    try {
      // SIMULATED API CALL & VERIFICATION 
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      if (contactOtpInput.length === 6 && /^\d+$/.test(contactOtpInput)) { 
          setIsPhoneVerified(true); // Flag indicates contact method verified
          toast({ title: "Success", description: "Contact method verified successfully (Simulated)." });
          setShowContactOtpDialog(false);
          setContactOtpInput('');
      } else {
          throw new Error("Invalid OTP (Simulated - please enter a 6-digit number).");
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message || "Invalid OTP. Please try again." });
    } finally {
        setIsVerifyingOtp(false);
    }
  };

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (data) => {
    if (data.phone && data.phone.trim() !== '' && !isPhoneVerified) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please verify the contact method (via email OTP) before adding the employee if a phone number is provided.",
      });
      return;
    }

    setIsSubmitting(true);
    const result = addEmployee({ ...data, isPhoneVerified });
    if (result.success) {
      toast({ title: "Success", description: "Employee added successfully." });
      onEmployeeAdded();
      handleOpenChange(false); 
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to add employee." });
    }
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    // Reset contact verification if phone number or email changes
    setIsPhoneVerified(false);
  }, [watchedPhone, watchedEmail]);

  const canSubmit = !(watchedPhone && watchedPhone.trim() !== '' && !isPhoneVerified);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Employee</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new employee to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">Employee ID</Label>
              <Input id="id" {...form.register('id')} className="col-span-3" />
              {form.formState.errors.id && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.id.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Full Name</Label>
              <Input id="name" {...form.register('name')} className="col-span-3" />
              {form.formState.errors.name && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="designation" className="text-right">Designation</Label>
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passwordInput" className="text-right">Password</Label>
              <div className="col-span-3 relative">
                <Input 
                  id="passwordInput" 
                  type={showPassword ? "text" : "password"} 
                  {...form.register('passwordInput')} 
                  className="pr-10" 
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
              {form.formState.errors.passwordInput && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.passwordInput.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" {...form.register('email')} className="col-span-3" />
              {form.formState.errors.email && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                    id="phone" 
                    {...form.register('phone')} 
                    className="flex-grow" 
                    disabled={isPhoneVerified && !!watchedPhone && watchedPhone.trim() !== ''} 
                />
                {isPhoneVerified && watchedPhone && watchedPhone.trim() !== '' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" title="Contact Verified"/>
                ) : (
                  watchedPhone && watchedPhone.trim() !== '' && (
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        onClick={handleSendContactOtp} 
                        disabled={isSendingOtp || !watchedEmail || (!!form.watch('phone') && isPhoneVerified)}
                    >
                      {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify Phone
                    </Button>
                  )
                )}
              </div>
               {form.formState.errors.phone && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.phone.message}</p>}
               {watchedPhone && watchedPhone.trim() !== '' && !watchedEmail && !isPhoneVerified &&
                 <p className="col-span-3 col-start-2 text-xs text-muted-foreground">An email address is required to verify this phone number via OTP.</p>
               }
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactOtpDialog} onOpenChange={(open) => { if(!open) resetOtpStates(); else setShowContactOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Contact (Simulated Email OTP)</DialogTitle>
            <DialogDescription>
              OTP 'sent' to {emailForOtp}. For testing, please enter a 6-digit number below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="contactOtp"
              placeholder="Enter 6-digit OTP"
              value={contactOtpInput}
              onChange={(e) => setContactOtpInput(e.target.value)}
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowContactOtpDialog(false); resetOtpStates();}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyContactOtp} disabled={isVerifyingOtp}>
                {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
    
