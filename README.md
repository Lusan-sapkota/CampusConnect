# CampusConnect

CampusConnect is a modern campus social and community engagement platform. It enables students to discover events, join groups, share posts, and connect with peers all with seamless authentication and a responsive, theme-aware UI.

---

## 🚀 Features

- **Public Browsing:** Home, Groups, and Events pages are accessible without login.
- **Seamless Authentication:** OTP-based login, password reset, and secure session management.
- **Event & Group Management:** Create, join, and manage campus events and groups.
- **Post Sharing:** Academic, social, and announcement posts with likes and comments.
- **Profile Management:** Edit profile, upload profile picture, and manage academic info.
- **Responsive UI:** Mobile-friendly, dark/light theme support, and smooth navigation.
- **Security:** Campus email validation, password strength checks, and secure file uploads.

---

## 🌐 Demo Frontend

[CampusConnect Demo](https://campus-connect-rho-swart.vercel.app/)

> This is a frontend-only demo. For full functionality, clone the repository and run both backend and frontend locally.

## ⚡️ Quick Start

### 1. Backend Setup

```sh
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python init_database.py        # Initialize the database
python run.py                  # Start the backend server
```

### 2. Frontend Setup

```sh
cd frontend
npm install
npm run dev                    # Start the frontend (Vite dev server)
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 🔑 Authentication Flow

- **OTP-based login:** Users sign in with campus email and OTP.
- **Session management:** Secure tokens, automatic expiration, and logout.
- **Protected actions:** Creating/joining events/groups, liking posts, and profile management require authentication.
- **Smart prompts:** AuthRequiredButton and ProtectedRoute components guide users to sign in when needed.

---

## 📝 API Endpoints

- **Auth:** `/api/auth/signup`, `/api/auth/send-otp`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/profile`
- **Events:** `/api/events` (CRUD, join)
- **Groups:** `/api/groups` (CRUD, join)
- **Posts:** `/api/posts` (CRUD, like, comment)

See [frontend/src/api/README.md](frontend/src/api/README.md) for usage examples.

---

## 🎨 UI/UX

- **Dark/Light Theme:** Automatic theme switching, accessible colors.
- **Mobile Responsive:** Touch-friendly forms, navigation, and profile management.
- **Loading/Error States:** Clear feedback for all actions.
- **Accessibility:** Keyboard navigation and ARIA support.

---

## 🛡️ Security

- Campus email domain validation
- Password complexity enforcement
- Secure session tokens
- File upload validation (profile pictures)
- API protection for all modification endpoints

---

## 🧪 Testing

- Backend: `python test_database.py`
- Frontend: `npm run lint`
- Manual: Visit `/auth-demo` for authentication testing

---

## 📚 Documentation

- [SEAMLESS-AUTH-FLOW.md](SEAMLESS-AUTH-FLOW.md): Seamless authentication flow details
- [COMPLETE-AUTH-SYSTEM.md](COMPLETE-AUTH-SYSTEM.md): Full authentication system documentation
- [auth-system-README.md](auth-system-README.md): Auth system usage and troubleshooting

---

## 📄 License

MIT License © 2025 Lusan Sapkota

---

## 🤝 Contributing

Pull requests and issues are welcome! Please read the documentation and follow code style guidelines.

---

## 📬 Support

For support, please open an issue on GitHub or contact the maintainers.
