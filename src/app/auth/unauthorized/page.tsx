import DefaultLayout from '@/components/Layouts/DefaultLaout'
import Link from 'next/link';
import React from 'react'

const Unauthorized = () => {
    return (
        <DefaultLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 md:p-8">
                {/* Error Illustration */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-16 h-16 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                </div>

                {/* Error Content */}
                <div className="text-center max-w-md space-y-4">
                    <h1 className="text-3xl font-bold text-dark dark:text-white">
                        Access Denied
                    </h1>
                    <p className="text-gray-6 dark:text-gray-5 text-lg">
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="border border-stroke dark:border-stroke-dark text-dark dark:text-white hover:bg-gray-1 dark:hover:bg-dark-3 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                            Sign In Again
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-sm"></div>
                <div className="absolute bottom-20 right-10 w-6 h-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-sm"></div>
            </div>
        </DefaultLayout>
    )
}

export default Unauthorized