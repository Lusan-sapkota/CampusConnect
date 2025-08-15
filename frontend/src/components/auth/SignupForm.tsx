import React, { useState } from 'react';
import { useSignup } from '../../hooks/useSignup';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface SignupFormProps {
    onSuccess?: () => void;
    onBackToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
    onSuccess,
    onBackToLogin,
}) => {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
        terms_accepted: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { state, signup, clearError } = useSignup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await signup(formData);

        if (success) {
            onSuccess?.();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error when user starts typing
        if (state.error) {
            clearError();
        }
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        Object.values(checks).forEach(check => {
            if (check) strength++;
        });

        return { strength, checks };
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const isPasswordValid = passwordStrength.strength === 5;
    const passwordsMatch = formData.password === formData.confirm_password;

    const isFormValid =
        formData.email &&
        formData.full_name.trim().length >= 2 &&
        isPasswordValid &&
        passwordsMatch &&
        formData.terms_accepted;

    if (state.currentStep === 'success') {
        return (
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Created!</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your account has been successfully created. You can now sign in with your email and password.
                    </p>
                    <button
                        onClick={onBackToLogin}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Continue to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Join CampusConnect with your campus email
                </p>
            </div>

            {state.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-red-600 dark:text-red-400 text-sm">{state.error}</p>
                    <button
                        onClick={clearError}
                        className="text-red-600 dark:text-red-400 text-xs underline mt-1"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Campus Email *
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={state.isLoading}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="your.name@university.edu"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be from an approved campus domain
                    </p>
                </div>

                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                    </label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={state.isLoading}
                        required
                        minLength={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password *
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={state.isLoading}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                        </button>
                    </div>

                    {formData.password && (
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-2 text-xs">
                                {passwordStrength.checks.length ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <X className="w-3 h-3 text-red-500" />
                                )}
                                <span className={passwordStrength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    At least 8 characters
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                {passwordStrength.checks.uppercase ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <X className="w-3 h-3 text-red-500" />
                                )}
                                <span className={passwordStrength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    One uppercase letter
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                {passwordStrength.checks.lowercase ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <X className="w-3 h-3 text-red-500" />
                                )}
                                <span className={passwordStrength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    One lowercase letter
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                {passwordStrength.checks.number ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <X className="w-3 h-3 text-red-500" />
                                )}
                                <span className={passwordStrength.checks.number ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    One number
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                {passwordStrength.checks.special ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <X className="w-3 h-3 text-red-500" />
                                )}
                                <span className={passwordStrength.checks.special ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    One special character
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            disabled={state.isLoading}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                        </button>
                    </div>

                    {formData.confirm_password && (
                        <div className="mt-1 flex items-center space-x-2 text-xs">
                            {passwordsMatch ? (
                                <Check className="w-3 h-3 text-green-500" />
                            ) : (
                                <X className="w-3 h-3 text-red-500" />
                            )}
                            <span className={passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                Passwords match
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-start space-x-2">
                    <input
                        id="terms_accepted"
                        name="terms_accepted"
                        type="checkbox"
                        checked={formData.terms_accepted}
                        onChange={handleInputChange}
                        disabled={state.isLoading}
                        required
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <label htmlFor="terms_accepted" className="text-sm text-gray-700 dark:text-gray-300">
                        I accept the{' '}
                        <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                            Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                            Privacy Policy
                        </a>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={state.isLoading || !isFormValid}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {state.isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                    Already have an account? Sign in
                </button>
            </div>
        </div>
    );
};