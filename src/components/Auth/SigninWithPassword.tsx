"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from "next/navigation";

export default function SigninWithPassword() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigation = useRouter();
  const searchParams = useSearchParams();
  const redirect_url = searchParams.get("callbackUrl");
  const [showOtp, setShowOtp] = useState<boolean>(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const HandleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  const handleSubmitting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Email and password are required.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: redirect_url || "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (result?.ok) {
        // Successful login - redirect to dashboard or callback URL
        const redirectTo = redirect_url || "/dashboard";
        navigation.replace(redirectTo);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitting} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-dark dark:text-white mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full rounded-xl border border-stroke bg-white/50 dark:bg-dark-3/50 py-4 pl-4 pr-12 font-medium text-dark dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-5 dark:text-gray-6">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-dark dark:text-white mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full rounded-xl border border-stroke bg-white/50 dark:bg-dark-3/50 py-4 pl-4 pr-12 font-medium text-dark dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-5 dark:text-gray-6 hover:text-primary transition-colors" onClick={HandleShowPassword}>
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <label
          htmlFor="remember"
          className="flex cursor-pointer select-none items-center text-sm font-medium text-gray-6 dark:text-gray-5"
        >
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="sr-only peer"
          />
          <div className="relative w-4 h-4 mr-2 rounded border border-stroke dark:border-stroke-dark peer-checked:bg-primary peer-checked:border-primary transition-all duration-200">
            <svg className="absolute inset-0 w-3 h-3 m-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          Remember me
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign In to StockZy'
        )}
      </button>
    </form>
  );
}
