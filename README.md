# Sweet Shop Management System

A full-stack application for managing a sweet shop, built with Node.js, Express, and React.

## Project Link: https://sweet-shop-management-system-smoky.vercel.app/

## Project Overview

This project implements a Sweet Shop Management System with the following features:
- **User Authentication**: Register and login with JWT-based authentication.
- **Sweet Management**: Browse, search (by name, category, and price range), and view sweets.
- **Inventory Management**: Purchase sweets (decreasing stock) and restock (admin only).
- **Admin Panel**: Dedicated interface for administrators to add, update, and delete sweets.
- **Dark Mode**: Fully supported dark mode for better user experience.
- **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

### Backend
- **Node.js & TypeScript**: Core runtime and language.
- **Express**: Web framework.
- **SQLite & Prisma**: Database and ORM.
- **Jest & Supertest**: Testing framework.
- **JWT & Bcrypt**: Authentication and security.

### Frontend
- **React (Vite)**: Frontend framework.
- **TypeScript**: Type safety.
- **Tailwind CSS**: Styling.
- **Axios**: API requests.
- **React Router**: Navigation.
- **React Hot Toast**: Notifications.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm

### Quick Start

1. **Clone the repository.**

2. **Install dependencies:**
   ```bash
   # Root
   npm install

   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup:**
   - The backend is configured to run on port `5000`.
   - The frontend connects to `http://localhost:5000`.
   - Create a `.env` file in `backend` and `frontend` if needed (defaults are provided).

4. **Database Setup & Seeding:**
   To set up the database and create the initial admin user:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   *Note: This creates an admin user with username: `admin` and password: `admin123`.*

5. **Start the Application:**
   You can run both backend and frontend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   Alternatively, run them separately:
   - Backend: `cd backend && npm run dev` (Runs on port 5000)
   - Frontend: `cd frontend && npm run dev` (Runs on port 5173)

6. **Access the App:**
   - Open your browser at `http://localhost:5173`.

## Admin Access
To access the Admin Panel:
1. Log in with the following credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
2. Once logged in, click the "Admin" link in the navigation bar.
3. You will have full access to add, edit, and delete sweets.

## Features Breakdown

### Customer Features
- **Browse Sweets**: View all available sweets.
- **Search & Filter**: Search by name or filter by category/price.
- **Purchase**: Buy sweets (stock updates automatically).
- **Dark Mode**: Toggle between light and dark themes.

### Admin Features
- **Dashboard**: View all inventory with stock status.
- **Add Sweet**: Create new inventory items.
- **Edit Sweet**: Update details, price, and stock levels.
- **Delete Sweet**: Remove items from inventory.
- **Stock Alerts**: Visual indicators for low stock and out-of-stock items.
- **Add Images**: Can add images of the items.

## Testing
To run the backend tests:
```bash
cd backend
npm test
```

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Configure the **Root Directory** to `frontend`.
4. The Build Command should automatically detect `npm run build`.
5. The Output Directory should automatically detect `dist`.
6. Deploy.

### Backend (Render)
1. Push your code to GitHub.
2. Create a new Web Service in Render.
3. Connect your repository.
4. Configure the **Root Directory** to `backend`.
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. Add Environment Variables (if any).
8. Deploy.

## My AI Usage

### AI Tools Used
- **Trae (IDE & Assistant)**: Used as the primary coding assistant for generating boilerplate, refactoring, and debugging.
- **GitHub Copilot**: Used for intelligent code completion and suggestions during development.

### How They Were Used
- **Project Scaffolding**: I used Trae to brainstorm the initial project structure and generate the base configuration for both the Express backend and React frontend.
- **API Development**: AI assisted in defining RESTful API endpoints and structuring the Prisma schema for efficient data modeling.
- **Frontend Logic**: Copilot helped generate React components and hooks, speeding up the implementation of features like the Shopping Cart context and Authentication flows.
- **Testing**: AI tools were used to generate unit test templates for the backend routes and frontend components, ensuring high code coverage.
- **Debugging**: When encountering errors (e.g., CORS issues or type mismatches), I used Trae to analyze the error logs and suggest fixes.

### Reflection on AI Impact
AI significantly accelerated the development lifecycle of this project. It removed much of the friction associated with boilerplate code and configuration, allowing me to focus on the core business logic and user experience. It acted as a tireless pair programmer, offering suggestions and catching potential issues before they became bugs. However, I maintained full control over the architectural decisions and manually reviewed all AI-generated code to ensure it adhered to best practices and project requirements. Using AI made the workflow more efficient and educational, as it often suggested modern solutions I might not have initially considered.

---

**Note**: For transparency, commits where AI played a significant role in code generation include `Co-authored-by` trailers in the commit message.
