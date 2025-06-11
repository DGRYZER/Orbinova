
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Phone, Edit3 } from "lucide-react"; // Removed CheckCircle, ShieldAlert

export default function AccountPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <p>Loading account details...</p>;
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Account Details</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
              <CardDescription>{currentUser.designation}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" value={currentUser.id} readOnly disabled />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center">
              <Input id="email" value={currentUser.email || "Not set"} readOnly disabled className="flex-grow" />
              {/* Placeholder for email verification icon if implemented */}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex items-center gap-2">
              <Input id="phone" value={currentUser.phone || "Not set"} readOnly disabled className="flex-grow" />
              {/* Phone verification icons removed */}
            </div>
          </div>
          
          {/* <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Feature coming soon)
          </Button> */}
           <p className="text-xs text-muted-foreground mt-2">
            To change your password or update phone number, please contact HR. Self-service options are coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
