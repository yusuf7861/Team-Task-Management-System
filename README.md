# Ethara Task Manager 🚀

Ethara Task Manager is a robust, full-stack team collaboration platform designed to streamline project management and task tracking. Built with a modern tech stack, it provides role-based access control, real-time dashboard statistics, and comprehensive task management capabilities.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication system with secure login and signup flows.
- **👥 Role-Based Access Control**: 
  - **Admin**: Full control over projects, team management, and global task overview.
  - **Member**: Personal dashboard to track assigned tasks and subtasks.
- **📊 Interactive Dashboards**: Real-time statistics including total, completed, pending, and overdue tasks.
- **📂 Project Management**: Create and organize projects with detailed descriptions and timelines.
- **✅ Task & Subtask Tracking**:
  - Detailed task views with status updates (TODO, IN_PROGRESS, DONE).
  - Granular subtask management for complex requirements.
- **📧 Email Notifications**: Integrated mail system for team communication and updates.
- **📱 Responsive Design**: A premium, mobile-first UI built for a seamless experience across all devices.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (TSX)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [Spring Boot 4.0](https://spring.io/projects/spring-boot)
- **Language**: Java 21
- **Security**: [Spring Security](https://spring.io/projects/spring-security) with JWT
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/))
- **ORM**: [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- **Documentation**: [SpringDoc OpenAPI (Swagger)](https://springdoc.org/)
- **Build Tool**: [Maven](https://maven.apache.org/)

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js (v18+)
- PostgreSQL Database (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yusuf7861/Team-Task-Management-System.git
   cd Team-Task-Manager
   ```

2. **Backend Setup**
   - Create a `.env` file in `backend/taskmanager/` with the following:
     ```properties
     DB_URL=jdbc:postgresql://localhost:5432/taskmanager
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     ADMIN_EMAIL=admin@ethara.ai
     MAIL_USERNAME=your_email
     MAIL_PASSWORD=your_app_password
     JWT_SECRET=your_super_secret_key
     ```
   - Run the backend:
     ```bash
     cd backend/taskmanager
     mvn spring-boot:run
     ```

3. **Frontend Setup**
   - Create a `.env` file in `frontend/`:
     ```env
     VITE_API_BASE_URL=http://localhost:8080/api
     ```
   - Install dependencies and start:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

## 🔐 Testing Credentials

For evaluation purposes, you can use the following accounts:

### **Admin Account**
- **Email**: `yjamal710@gmail.com`
- **Password**: `QG1nQ0km`

### **Member Accounts**
- **User 1**:
  - **Email**: `wasi.test@gmail.com`
  - **Password**: `wasi@123`
- **User 2**:
  - **Email**: `vasikur.test@gmail.com`
  - **Password**: `vasikur@123`

## 🌐 Deployment

- **Frontend**: Deployed on [Vercel](https://teamtaskmanagement.yusufjamal.in)
- **Backend**: Deployed on [Azure App Service](https://teamtaskmanagerethara-fnhmeedjd7dfd0h4.westindia-01.azurewebsites.net/)

## 📝 License

This project was built for assignment purposes. All rights reserved.

---
Built with ❤️ by [Yusuf Jamal](https://github.com/yusuf7861)
