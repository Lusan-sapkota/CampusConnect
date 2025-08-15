import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Upload, X, User, Mail, Phone, BookOpen, Calendar, FileText, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OTPInput } from './OTPInput';

interface OTPVerificationFormProps {
  onComplete: (otp: string) => Promise<void>;
  onResend: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({ onComplete, onResend, isLoading, error }) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  // Timer effect for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setIsSubmitting(true);
      await onComplete(otp);
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    setOtp('');

    const success = await onResend();

    if (success) {
      // Increase timer with each attempt: 30s, 60s, 90s, etc.
      const newTimer = 30 + (resendAttempts * 30);
      setResendTimer(newTimer);
      setResendAttempts(prev => prev + 1);
    }

    setIsResending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OTPInput
        value={otp}
        onChange={setOtp}
        length={6}
        autoFocus
        disabled={isSubmitting}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={otp.length !== 6 || isSubmitting}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending || resendTimer > 0}
        className="w-full text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium py-2 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isResending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Sending...
          </>
        ) : resendTimer > 0 ? (
          `Resend in ${resendTimer}s`
        ) : (
          'Resend verification code'
        )}
      </button>
    </form>
  );
};

interface CompleteSignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  major: string;
  yearOfStudy: string;
  userRole: string;
  bio: string;
  profilePicture: File | null;
  acceptTerms: boolean;
}

const CompleteSignupForm: React.FC<CompleteSignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { state, completeSignup } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'otp' | 'success'>('form');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [developmentOTP, setDevelopmentOTP] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    major: '',
    yearOfStudy: '',
    userRole: '',
    bio: '',
    profilePicture: null,
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Allowed email domains for campus
  const ALLOWED_EMAIL_DOMAINS = [
    'student.university.edu',
    'university.edu',
    'campus.edu',
    'college.edu',
  ];

  // Success redirect effect - must be at top level
  useEffect(() => {
    if (currentStep === 'success') {
      const timer = setTimeout(() => {
        onSuccess?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onSuccess]);

  const validateEmailDomain = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (!validateEmailDomain(formData.email)) {
      errors.email = `Email must be from an approved campus domain: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Major validation
    if (!formData.major.trim()) {
      errors.major = 'Major/Field of study is required';
    }

    // Year of study validation
    if (!formData.yearOfStudy) {
      errors.yearOfStudy = 'Year of study is required';
    }

    // User role validation
    if (!formData.userRole) {
      errors.userRole = 'User role is required';
    }

    // Bio validation (optional but limit characters)
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, profilePicture: 'Image must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, profilePicture: file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Clear any previous error
      setValidationErrors(prev => ({ ...prev, profilePicture: '' }));
    }
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({ ...prev, profilePicture: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const signupData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      major: formData.major,
      yearOfStudy: formData.yearOfStudy,
      userRole: formData.userRole,
      bio: formData.bio,
      profilePicture: formData.profilePicture,
    };

    const result = await completeSignup(signupData);

    if (result.success) {
      setCurrentStep('otp');
    }
  };

  const handleOTPVerification = async (otp: string) => {
    const signupData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      major: formData.major,
      yearOfStudy: formData.yearOfStudy,
      userRole: formData.userRole,
      bio: formData.bio,
      profilePicture: formData.profilePicture,
    };

    const signupDataWithRole = {
      ...signupData,
      userRole: formData.userRole
    };
    const result = await completeSignup(signupDataWithRole, otp);
    if (result.success) {
      setCurrentStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
  };

  const getNameInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (currentStep === 'otp') {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Registration</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We've sent a verification code to <strong>{formData.email}</strong>
          </p>
        </div>

        <OTPVerificationForm
          onComplete={handleOTPVerification}
          onResend={async () => {
            const result = await completeSignup({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              major: formData.major,
              yearOfStudy: formData.yearOfStudy,
              userRole: formData.userRole,
              bio: formData.bio,
              profilePicture: formData.profilePicture,
            });
            return result.success;
          }}
          isLoading={state.isLoading}
          error={state.error}
        />

        <button
          onClick={() => setCurrentStep('form')}
          className="w-full mt-4 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
        >
          Back to signup form
        </button>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to CampusConnect!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your account has been created successfully. You'll be redirected shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Join CampusConnect and connect with your campus community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="text-center">
          <div className="relative inline-block">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                {formData.firstName && formData.lastName ? (
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {getNameInitials(formData.firstName, formData.lastName)}
                  </span>
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Upload a profile picture (optional)
          </p>
          {validationErrors.profilePicture && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.profilePicture}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter your first name"
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter your last name"
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Campus Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="your.email@university.edu"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="+1 (555) 123-4567"
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Academic Information
            </h3>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Major/Field of Study *
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.major ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Computer Science"
              />
              {validationErrors.major && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.major}</p>
              )}
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Year of Study *
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.yearOfStudy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                <option value="">Select year</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="graduate">Graduate</option>
                <option value="phd">PhD</option>
              </select>
              {validationErrors.yearOfStudy && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.yearOfStudy}</p>
              )}
            </div>

            {/* User Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Role *
              </label>
              <select
                value={formData.userRole}
                onChange={(e) => handleInputChange('userRole', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.userRole ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                <option value="">Select role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="management">Management</option>
              </select>
              {validationErrors.userRole && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.userRole}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${validationErrors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            placeholder="Tell us a bit about yourself... (optional)"
          />
          <div className="flex justify-between items-center mt-1">
            {validationErrors.bio && (
              <p className="text-red-500 text-sm">{validationErrors.bio}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {formData.bio.length}/500
            </p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="mt-1 w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
            I accept the{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
              Privacy Policy
            </a>
          </label>
        </div>
        {validationErrors.acceptTerms && (
          <p className="text-red-500 text-sm">{validationErrors.acceptTerms}</p>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{state.error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={state.isLoading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {state.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default CompleteSignupForm;