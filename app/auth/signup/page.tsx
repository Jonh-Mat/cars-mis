import { Metadata } from "next";
import SignUpForm from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-8">
          Create an Account
        </h1>
        <SignUpForm />
      </div>
    </div>
  );
}
