import CommonLoginForm from "@/components/auth/CommonLoginForm";

export default function HrLoginPage() {
  return (
    <CommonLoginForm
      role="HR"
      title="HR Login"
      description="Access the HR dashboard to manage employees and attendance."
    />
  );
}