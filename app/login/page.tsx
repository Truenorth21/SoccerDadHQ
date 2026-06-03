import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in or sign up",
  description: "Sign in to SoccerDadHQ to write reviews, vote in rankings and manage your dashboard.",
};

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Suspense fallback={<div className="card h-96 w-full max-w-md animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
