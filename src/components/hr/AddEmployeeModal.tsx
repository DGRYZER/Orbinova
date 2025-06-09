
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
import { PlusCircle, Loader2, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

const employeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  designation: z.enum(['Employee', 'HR']),
  passwordInput: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  // isPhoneVerified is managed by state, not direct form input for zod validation here
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface AddEmployeeModalProps {
  onEmployeeAdded: () => void; // Callback to refresh employee list
}

export default function AddEmployeeModal({ onEmployeeAdded }: AddEmployeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showPhoneOtpDialog, setShowPhoneOtpDialog] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

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

  const resetOtpStates = () => {
    setShowPhoneOtpDialog(false);
    setPhoneOtpInput('');
    setGeneratedPhoneOtp('');
    // setIsPhoneVerified(false); // Don't reset verification status on simple close, only on form reset
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setShowPassword(false);
      setIsPhoneVerified(false); // Reset verification status when main dialog closes
      resetOtpStates();
    }
  };

  const handleSendPhoneOtp = () => {
    const phoneValue = form.getValues('phone');
    if (!phoneValue || phoneValue.trim() === '') {
      toast({ variant: "destructive", title: "Error", description: "Please enter a phone number first." });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    setGeneratedPhoneOtp(otp);
    // console.log(`Phone Verification OTP for ${phoneValue}: ${otp}`); // Simulate sending OTP - Removed for security
    toast({ title: "OTP Sent (Simulated)", description: `An OTP has been sent to ${phoneValue}. Please check your device.` });
    setShowPhoneOtpDialog(true);
  };

  const handleVerifyPhoneOtp = () => {
    if (phoneOtpInput === generatedPhoneOtp) {
      setIsPhoneVerified(true);
      toast({ title: "Success", description: "Phone number verified successfully." });
      setShowPhoneOtpDialog(false);
      setPhoneOtpInput('');
    } else {
      toast({ variant: "destructive", title: "Error", description: "Invalid OTP. Please try again." });
    }
  };

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (data) => {
    setIsSubmitting(true);
    const result = addEmployee({ ...data, isPhoneVerified });
    if (result.success) {
      toast({ title: "Success", description: "Employee added successfully." });
      onEmployeeAdded();
      setIsOpen(false); // This will trigger handleOpenChange which resets form and states
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to add employee." });
    }
    setIsSubmitting(false);
  };

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
            {/* Employee ID, Name, Designation */}
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
            {/* Password */}
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
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" {...form.register('email')} className="col-span-3" />
              {form.formState.errors.email && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            {/* Phone Number with Verification */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="phone" {...form.register('phone')} className="flex-grow" disabled={isPhoneVerified} />
                {isPhoneVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={handleSendPhoneOtp} disabled={!form.watch('phone')}>
                    Verify
                  </Button>
                )}
              </div>
               {form.formState.errors.phone && <p className="col-span-3 col-start-2 text-sm text-destructive">{form.formState.errors.phone.message}</p>}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Phone OTP Verification Dialog */}
      <Dialog open={showPhoneOtpDialog} onOpenChange={(open) => { if(!open) resetOtpStates(); else setShowPhoneOtpDialog(true);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              An OTP has been sent to {form.getValues('phone')}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="phoneOtp"
              placeholder="Enter 6-digit OTP"
              value={phoneOtpInput}
              onChange={(e) => setPhoneOtpInput(e.target.value)}
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {setShowPhoneOtpDialog(false); resetOtpStates();}}>Cancel</Button>
            <Button type="button" onClick={handleVerifyPhoneOtp}>Verify OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
