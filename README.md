# 💰 ExpenseHub – Expense Management System

A modern, full-stack **Expense Management Application** built with the MERN stack. ExpenseHub helps users manage their personal finances, track income and expenses, organize transactions, set budgets, and monitor financial activities through a clean and responsive dashboard.

## 🚀 Features

- 🔐 **User Authentication** – Secure registration, login, logout and password management.
- 📊 **Dashboard** – Get an overview of your financial activities.
- 💸 **Transaction Management** – Create, view, update and delete transactions.
- 🏷️ **Category Management** – Organize transactions using custom categories.
- 👥 **Party Management** – Manage parties and their financial records.
- 🎯 **Budget Management** – Create, track and manage budgets.
- 📈 **Financial Charts** – Visualize income, expenses and category-wise spending.
- 👤 **Profile Management** – Manage user profile information.
- ⚙️ **Settings** – Manage application preferences.
- 📱 **Responsive UI** – Designed for desktop, tablet and mobile devices.

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router DOM
- Bootstrap 5
- React-Bootstrap
- Axios
- Formik & Yup
- Chart.js
- React Toastify
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Cookie Parser
- CORS
- Dotenv

## 📂 Project Structure

```text
ExpenseHub/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       │   ├── charts/
│       │   ├── common/
│       │   └── layout/
│       ├── features/
│       │   ├── auth/
│       │   ├── budget/
│       │   ├── category/
│       │   ├── party/
│       │   └── transactions/
│       ├── page/
│       ├── routes/
│       ├── services/
│       ├── App.tsx
│       └── main.tsx
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── app.js
│       └── index.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to Project

```bash
cd ExpenseHub
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Setup Backend

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
```

Start the backend:

```bash
npm run dev
```

## 🌐 Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

## 🔒 Security

- JWT-based authentication.
- Password hashing using Bcrypt.
- Protected API routes.
- Environment variables for sensitive credentials.
- Secure authentication middleware.

## 🎯 Project Goal

The main goal of ExpenseHub is to provide a simple, efficient and user-friendly platform for managing personal finances. It focuses on clean architecture, reusable components, secure authentication and maintainable code.

## 👨‍💻 Developer

**Ronak Gaurkhede**

Full-Stack Developer | MERN Stack Developer

---

⭐ If you find this project useful, consider giving it a star!