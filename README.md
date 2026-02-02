# Hospital Management System (HMS)

A modern, full-stack web application for managing hospital operations, featuring an "Elegant Premium" dark medical theme.

## Features

### 🏥 **Admin Dashboard**
- **Manage Doctors**: Add new doctors with photo uploads and phone numbers.
- **Approvals**: Review and approve/reject doctor leave requests.
- **Analytics**: View real-time stats on appointments and hospital capacity.

### 👨‍⚕️ **Doctor Dashboard**
- **Appointments**: View upcoming schedule and patient details.
- **Leave Management**: Request leave and return-to-work permissions.
- **Profile**: Manage availability status.

### 🤒 **Patient Dashboard**
- **Doctor Discovery**: Browse doctors with rich profiles (Experience, Ratings, Bio).
- **Appointments**: Book appointments with real-time conflict checking.
- **History**: View past medical history and appointment status.
- **Premium UI**: "Blue & Black" abstract dark theme with glassmorphism effects.

## Tech Stack
- **Frontend**: React (Vite), CSS3 (Variables, Gradients, Animations)
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer (Local uploads)

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm

### 1. Backend Setup
```bash
cd server
npm install
node seed.js  # Seeding database with initial Admin/Doctor/Patient
npm start
```
*Server runs on port 5000*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Client runs on port 5173/5174*

## Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hms.com` | `admin123` |
| **Doctor** | `sarah@hms.com` | `admin123` |
| **Patient** | `john@hms.com` | `admin123` |
