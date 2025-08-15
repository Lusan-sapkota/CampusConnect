# CampusConnect Authentication System

This document describes the comprehensive authentication system implemented for CampusConnect, including OTP-based login, password reset, and session management.

## 🚀 Features

- **OTP-based Authentication**: Secure email-based login without passwords
- **Password Reset**: Complete forgot password flow with OTP verification
- **Session Management**: JWT-like session tokens with automatic expiration
- **React Context**: Centralized authentication state management
- **Custom Hooks**: Reusable hooks for OTP and password reset flows
- **TypeScript Support**: Full type safety throughout the system
- **Responsive UI**: Mobile-friendly authentication components
- **Error Handling**: Comprehensive error handling and user feedback

## 📁 File Structure

```
frontend/src/
├── api/
│   ├── api.ts              # Main API client with auth endpoints
│   ├── types.ts            # TypeScript type definitions
│   └── index.ts            # API exports
├── contexts/
│   └── AuthContext.tsx     # Authentication context provider
├── hooks/
│   ├── useOTP.ts          # OTP management hook
│   ├── usePasswordReset.ts # Password reset flow hook
│   └── index.ts           # Hook exports
├── components/auth/
│   ├── LoginForm.tsx      # Login form with OTP
│   ├── ForgotPasswordForm.tsx # Password reset form
│   ├── OTPInput.tsx       # Reusable OTP input component
│   ├── ProtectedRoute.tsx # Route protection component
│   ├── UserProfile.tsx    # User profile management
│   └── index.ts           # Component exports
├── pages/
│   ├── AuthPage.tsx       # Main authentication page
│   └── AuthDemoPage.tsx   # Demo/testing page
└── auth-system-README.md  # This documentation
```

## 🔧 Backend Endpoints

The system connects to the following Flask backend endpoints:

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/login` - Login with email and OTP
- `POST /api/auth/logout` - Logout and invalidate session
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/profile` - Get current user profile

## 🎯 Usage Examples

### Basic Authentication Flow

```tsx
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { state, login, logout } = useAuth();

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div>
      <p>Welcome, {state.user?.email}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Using OTP Hook

```tsx
import { useOTP } from "../hooks/useOTP";

function OTPExample() {
  const { state, sendOTP, verifyOTP } = useOTP();

  const handleSendOTP = async () => {
    const success = await sendOTP({
      email: "user@example.com",
      purpose: "authentication",
    });

    if (success) {
      console.log("OTP sent successfully");
    }
  };

  return (
    <div>
      <button onClick={handleSendOTP} disabled={state.isLoading}>
        {state.isLoading ? "Sending..." : "Send OTP"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/public" element={<PublicPage />} />
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <PrivatePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## 🔐 Security Features

### Session Management

- Session tokens are stored in localStorage
- Automatic token validation on app startup
- Token expiration handling
- Secure logout with server-side session invalidation

### OTP Security

- Time-limited OTP codes (configurable expiration)
- Rate limiting for OTP requests
- Secure OTP generation and validation
- Purpose-specific OTP verification (auth vs password reset)

### Error Handling

- Custom ApiError class for detailed error information
- User-friendly error messages
- Network error handling
- Validation error display

## 🎨 UI Components

### LoginForm

- Email input with validation
- OTP input with auto-focus and paste support
- Loading states and error handling
- Responsive design

### ForgotPasswordForm

- Multi-step password reset flow
- Email → OTP → New Password → Success
- Form validation and error handling
- Step navigation controls

### OTPInput

- Configurable length (default 6 digits)
- Auto-focus and navigation between inputs
- Paste support for OTP codes
- Keyboard navigation (arrow keys, backspace)
- Disabled state support

### UserProfile

- Display user information
- Password change functionality
- Session management
- Logout functionality

## 🔄 State Management

The authentication system uses React Context for state management:

```tsx
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Actions

- `AUTH_START` - Begin authentication process
- `AUTH_SUCCESS` - Authentication successful
- `AUTH_ERROR` - Authentication failed
- `AUTH_LOGOUT` - User logged out
- `CLEAR_ERROR` - Clear error state

## 🧪 Testing

Visit `/auth-demo` when authenticated to test:

- API endpoint connectivity
- Authentication state debugging
- User profile management
- Error handling scenarios

## 🚀 Getting Started

1. **Wrap your app with AuthProvider**:

```tsx
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

2. **Use authentication in components**:

```tsx
import { useAuth } from "./contexts/AuthContext";

function MyComponent() {
  const { state, login, logout } = useAuth();
  // Use authentication state and methods
}
```

3. **Protect routes**:

```tsx
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>;
```

## 🔧 Configuration

### API Base URL

Update the API base URL in `frontend/src/api/api.ts`:

```tsx
const API_BASE = "http://localhost:5000/api";
```

### OTP Length

Configure OTP input length in components:

```tsx
<OTPInput length={6} value={otp} onChange={setOtp} />
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend URL
2. **Token Expiration**: Check if session tokens are being properly stored and sent
3. **OTP Not Received**: Verify email service configuration in backend
4. **Network Errors**: Check if backend server is running and accessible

### Debug Information

Use the AuthDemoPage (`/auth-demo`) to:

- View current authentication state
- Test API endpoints
- Debug session management
- Check error handling

## 📝 API Types

```tsx
interface AuthUser {
  user_id: string;
  email: string;
  session_token: string;
}

interface SendOTPRequest {
  email: string;
  user_name?: string;
  purpose: "authentication" | "password_reset";
}

interface LoginRequest {
  email: string;
  otp: string;
}

interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
  confirm_new_password: string;
}
```

## 🎉 Success!

Your authentication system is now fully implemented with:

- ✅ OTP-based login
- ✅ Password reset flow
- ✅ Session management
- ✅ React hooks and context
- ✅ TypeScript support
- ✅ Responsive UI components
- ✅ Comprehensive error handling
- ✅ Backend integration

The system is production-ready and can be easily extended with additional features like social login, multi-factor authentication, or role-based access control.
