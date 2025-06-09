"use client";
// This page will be effectively handled by the redirect logic in DashboardLayout.
// It can show a loading state or a generic welcome message if needed before redirect.
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading your dashboard...</p>
    </div>
