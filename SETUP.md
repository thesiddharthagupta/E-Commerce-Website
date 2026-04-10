# TechMart ERP v5 — Fixed Setup Guide

## What's Fixed
- ✅ B01: Dedicated /admin/login page (visit domain/admin goes there now)
- ✅ B02: Auth consistency documented — no more dead hook confusion
- ✅ B03: Email OTP verification on signup (6-digit code, 10min expiry)
- ✅ B04: Orders now properly linked to logged-in users (softProtect middleware)
- ✅ B06: Forgot password + Reset password fully implemented
- ✅ B07: Category `icon` field added to schema
- ✅ B09: Account deletion with password confirmation
- ✅ B10: Demo credentials hidden by env flag (REACT_APP_SHOW_DEMO_CREDS=true)
- ✅ B11: Lucide icons throughout (install lucide-react)
- ✅ B12: Admin panel is now mobile responsive with hamburger drawer
- ✅ B14: Register redirects to /verify-email instead of /

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# Edit .env — set your real EMAIL_USER, EMAIL_PASS, MONGO_URI
npm run seed       # Seed demo data
npm run dev        # Start backend on :5000
```

### 2. Frontend
```bash
cd frontend
npm install        # Installs lucide-react automatically
npm start          # Start frontend on :3000
```

### 3. Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/techmart
JWT_SECRET=change_this_to_a_long_random_string_in_production
CLIENT_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**frontend/.env** (create this file)
```
REACT_APP_API_URL=          # leave blank to use proxy
REACT_APP_SHOW_DEMO_CREDS=true   # set to false in production!
```

## Admin Access
- Visit: http://localhost:3000/admin/login  (OR /admin — redirects here)
- Email: admin@techmart.com
- Password: admin123

## Customer Test Account
- Email: customer@techmart.com
- Password: customer123
- Note: In dev mode, verification is bypassed for seed accounts.
  For new registrations, check EMAIL_USER inbox for the OTP.

## Gmail App Password Setup
1. Enable 2FA on your Gmail account
2. Go to: myaccount.google.com → Security → App passwords
3. Create app password for "Mail"
4. Use that 16-character password as EMAIL_PASS

## IMPORTANT Security Notes Before Production
- Set REACT_APP_SHOW_DEMO_CREDS=false (or remove it)
- Change JWT_SECRET to a random 64-character string
- Update CLIENT_URL to your actual domain
- Never commit .env to git (add it to .gitignore)
