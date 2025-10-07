import React from "react";
import { Metadata } from "next";
import Signin from "@/components/Auth/Signin";

export const metadata: Metadata = {
  title: "Login | StockZy Learning Platform",
  description: "Access your StockZy learning platform dashboard",
};

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-dark dark:via-dark-2 dark:to-dark-3 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237C3AED' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/80 dark:bg-dark-2/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stroke dark:border-stroke-dark p-8 space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-white">Welcome to StockZy</h1>
              <p className="text-gray-6 dark:text-gray-5 text-sm mt-1">Sign in to your learning platform</p>
            </div>
          </div>

          {/* Login Form */}
          <Signin />

          {/* Footer */}
          <div className="text-center pt-4 border-t border-stroke dark:border-stroke-dark">
            <p className="text-xs text-gray-5 dark:text-gray-6">
              © 2025 StockZy Learning Platform. All rights reserved.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-sm"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-sm"></div>
      </div>
    </div>
  );
};

export default SignIn;
