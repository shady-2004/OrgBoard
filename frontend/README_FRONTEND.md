# OrgBoard Frontend

A modern React application for organization and employee management.

## Features

- 🔐 Authentication (Login/Register)
- 👥 User Management
- 🏢 Organization Management  
- 👨‍💼 Employee Management
- 📝 Daily Operations Tracking
- 🏭 Office Operations Management
- 🇸🇦 Saudization Compliance
- ⚙️ Settings Management
- 📊 Dashboard with Statistics

## Tech Stack

- **React** - UI Library
- **React Router** - Routing
- **TanStack Query (React Query)** - Data Fetching & State Management
- **Axios** - HTTP Client
- **React Hook Form** - Form Management
- **Vite** - Build Tool

## Project Structure

```
src/
├── api/                    # API calls
├── components/             # Reusable components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── hooks/                 # Custom hooks
├── pages/                 # Page components
├── routes/                # Routing configuration
├── store/                 # State management
└── utils/                 # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` by default. 
You can change this in the `.env` file.

## Authentication

The app uses JWT tokens stored in localStorage. The token is automatically 
attached to all API requests via Axios interceptors.

## Development

### Adding a New Page

1. Create page component in `src/pages/[feature]/`
2. Add route in `src/routes/AppRouter.jsx`
3. Add navigation link in `src/components/layout/Sidebar.jsx`

### Adding a New API Endpoint

1. Create or update API file in `src/api/`
2. Use React Query hooks in components for data fetching

## License

MIT
