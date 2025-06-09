import CommonLoginForm from "@/components/auth/CommonLoginForm";

export default function EmployeeLoginPage() {
  return (
    <CommonLoginForm
      role="Employee"
      title="Employee Login"
      description="Access your dashboard to mark attendance and view records."
    />
  );
}
