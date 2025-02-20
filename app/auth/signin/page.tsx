import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import SignInForm from "./signin-from";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      showSignIn={false}
    >
      <SignInForm />
    </AuthLayout>
  );
}
