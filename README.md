# Sweet Shop Management System

A full-stack application for managing a sweet shop, built with Node.js, Express, and React.

## Project Link

The deployed project link is currently available to collaborators only.

## Project Overview

This project implements a Sweet Shop Management System with the following features:

- **User Authentication**: Register and log in with JWT-based authentication.
- **Sweet Management**: Browse, search by name or category, filter by price range, and view sweets.
- **Inventory Management**: Purchase sweets to decrease stock and restock items as an administrator.
- **Admin Panel**: Add, update, and delete sweets from a dedicated admin interface.
- **Dark Mode**: Supports a dark theme for the user interface.
- **Responsive Design**: Works across desktop and mobile screen sizes.

## Tech Stack

### Backend

- **Node.js & TypeScript**: Core runtime and language.
- **Express**: Web framework.
- **SQLite & Prisma**: Database and ORM.
- **Jest & Supertest**: Testing framework.
- **JWT & bcrypt**: Authentication and password security.

### Frontend

- **React (Vite)**: Frontend framework.
- **TypeScript**: Type safety.
- **Tailwind CSS**: Styling.
- **Axios**: API requests.
- **React Router**: Navigation.
- **React Hot Toast**: Notifications.

## Setup Instructions

### Prerequisites

- Node.js 14 or later
- npm

### Quick Start

1. **Clone the repository.**

2. **Install dependencies:**

   ```bash
   # Install root tooling and all project dependencies
   npm run install-all
   ```

   You can also install each workspace separately:

   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment setup:**

   - The backend runs on port `5000` by default.
   - The frontend runs on Vite's default development port, `5173`.
   - The frontend should use the backend base URL `http://localhost:5000`.
   - Create environment files in `backend` and `frontend` only when local configuration overrides are required.
   - Keep secrets and local credentials out of version control.

4. **Database setup and seeding:**

   From the backend directory, run:

   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

   The seed command creates the initial development data. Check the seed/configuration files for the current local admin setup instead of relying on credentials copied from this README.

5. **Start the application:**

   Run both applications from the repository root:

   ```bash
   npm run dev
   ```

   Or run them separately:

   ```bash
   # Backend
   cd backend && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

6. **Access the app:**

   Open the local frontend URL printed by Vite, normally `http://localhost:5173`.

## Admin Access

To access the Admin Panel:

1. Start the backend and frontend.
2. Use the development admin account created by the backend seed configuration.
3. Log in and select the **Admin** link in the navigation bar.
4. Use the panel to add, edit, and delete sweets.

Do not commit real credentials or publish development passwords in documentation.

## Features Breakdown

### Customer Features

- **Browse Sweets**: View available inventory.
- **Search and Filter**: Search by name or filter by category and price.
- **Purchase**: Buy sweets and update stock automatically.
- **Dark Mode**: Toggle between light and dark themes.

### Admin Features

- **Dashboard**: View inventory and stock status.
- **Add Sweet**: Create new inventory items.
- **Edit Sweet**: Update details, prices, and stock levels.
- **Delete Sweet**: Remove inventory items.
- **Stock Alerts**: Identify low-stock and out-of-stock items.
- **Add Images**: Attach product images to inventory items.

## Testing

To run the backend tests:

```bash
cd backend
npm test
```

## Deployment

### Frontend (Vercel)

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the **Root Directory** to `frontend`.
4. Use the detected build command, or run `npm run build`.
5. Use `dist` as the output directory.
6. Configure any required environment variables and deploy.

### Backend (Render)

1. Push the repository to GitHub.
2. Create a new Web Service in Render.
3. Connect the repository.
4. Set the **Root Directory** to `backend`.
5. Use `npm install && npm run build` as the build command.
6. Use `npm start` as the start command.
7. Add the required environment variables.
8. Deploy.

## My AI Usage

### AI Tools Used

- **Trae (IDE & Assistant)**: Used for boilerplate generation, refactoring, and debugging.
- **GitHub Copilot**: Used for code-completion suggestions during development.

### How They Were Used

- **Project Scaffolding**: Assisted with the initial project structure and base configuration for the Express backend and React frontend.
- **API Development**: Assisted with REST endpoint design and Prisma schema structure.
- **Frontend Logic**: Assisted with React components and hooks for the shopping cart and authentication flows.
- **Testing**: Assisted with unit-test templates for backend routes and frontend components.
- **Debugging**: Assisted with investigating issues such as CORS errors and type mismatches.

### Reflection on AI Impact

AI reduced boilerplate work and helped identify implementation issues during development. All generated suggestions were reviewed manually before being included in the project, and architectural decisions remained under developer control.
