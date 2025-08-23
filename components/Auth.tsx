import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon, GithubIcon } from './icons';

interface AuthProps {
    onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API calls
        if (view === 'login' || view === 'signup') {
            onLogin();
        } else if (view === 'forgotPassword') {
            setResetEmailSent(true);
        }
    }
    
    const isLoginView = view === 'login';
    const isSignupView = view === 'signup';
    const isForgotPasswordView = view === 'forgotPassword';

    const renderContent = () => {
        if (isForgotPasswordView) {
            if (resetEmailSent) {
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Check your email</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-4">
                            We've sent a password reset link to the email address you provided.
                        </p>
                        <button 
                            onClick={() => { setView('login'); setResetEmailSent(false); }} 
                            className="font-semibold text-teal-500 hover:text-teal-400 mt-6"
                        >
                            Back to Sign In
                        </button>
                    </div>
                );
            }
            return (
                 <div className="animate-fade-in">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-teal-500 mb-2">Reset Password</h1>
                        <p className="text-slate-500 dark:text-slate-400">Enter your email to get a reset link.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                            <div className="mt-1">
                                <input type="email" name="email" id="email" autoComplete="email" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700" placeholder="you@example.com"/>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105">
                                Send Reset Link
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Remember your password?
                            <button onClick={() => setView('login')} className="font-semibold text-teal-500 hover:text-teal-400 ml-1">
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            );
        }

        // Login and Signup Views
        return (
            <div className="animate-fade-in">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-teal-500 mb-2">EduQuest</h1>
                    <p className="text-slate-500 dark:text-slate-400">{isLoginView ? 'Welcome back! Please sign in.' : 'Create an account to start learning.'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignupView && (
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                            <div className="mt-1">
                                <input type="text" name="name" id="name" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700" placeholder="Your Name"/>
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                        <div className="mt-1">
                            <input type="email" name="email" id="email" autoComplete="email" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700" placeholder="you@example.com"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="mt-1">
                            <input type="password" name="password" id="password" autoComplete="current-password" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700" placeholder="••••••••"/>
                        </div>
                    </div>
                    
                    {isLoginView && (
                        <div className="flex items-center justify-end text-sm">
                            <button type="button" onClick={() => setView('forgotPassword')} className="font-semibold text-teal-500 hover:text-teal-400">
                                Forgot your password?
                            </button>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform hover:scale-105">
                            {isLoginView ? 'Sign In' : 'Create Account'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div>
                            <button onClick={onLogin} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <span className="sr-only">Sign in with Google</span>
                                <GoogleIcon className="w-5 h-5"/>
                            </button>
                        </div>

                        <div>
                            <button onClick={onLogin} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <span className="sr-only">Sign in with Facebook</span>
                                <FacebookIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <button onClick={onLogin} className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600">
                                <span className="sr-only">Sign in with GitHub</span>
                                <GithubIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setView(isLoginView ? 'signup' : 'login')} className="font-semibold text-teal-500 hover:text-teal-400 ml-1">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-teal-50 via-sky-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 min-h-[620px] flex flex-col justify-center border border-slate-200/50 dark:border-slate-700/50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default Auth;