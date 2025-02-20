import { Metadata } from "next";
import SignUpForm from "./signup-form";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <AuthLayout title="Welcome Back">
      <SignUpForm />
    </AuthLayout>
  );
}
