# Las Tortilhas Restaurant Website

## Overview

Las Tortilhas is a full-stack web application for a Mexican restaurant located in Luanda, Angola. The application features a modern, responsive frontend built with React and a RESTful API backend powered by Express.js. The system allows customers to browse the menu, make reservations, and submit contact inquiries.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme inspired by Mexican flag colors
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Animations**: Framer Motion for smooth animations and transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for API request/response validation
- **Development**: Currently uses in-memory storage with plans for PostgreSQL integration

## Key Components

### Frontend Components
1. **Navigation**: Fixed header with smooth scroll navigation
2. **Hero Section**: Eye-catching landing area with restaurant branding
3. **Menu Showcase**: Grid display of featured menu items with pricing
4. **About Section**: Restaurant story and statistics
5. **Features Section**: Highlights of restaurant qualities
6. **Location Section**: Contact information and location details
7. **Contact/Reservation Form**: Interactive form for table reservations
8. **Footer**: Links and social media integration

### Backend Components
1. **API Routes**: RESTful endpoints for reservations and contacts
2. **Storage Layer**: Abstracted storage interface supporting both memory and database implementations
3. **Validation**: Centralized schema validation using Zod
4. **Error Handling**: Structured error responses with proper HTTP status codes

### Shared Components
1. **Database Schema**: Drizzle schema definitions for users, reservations, and contacts
2. **Type Definitions**: Shared TypeScript types between frontend and backend
3. **Validation Schemas**: Zod schemas for data validation

## Data Flow

### Reservation Process
1. Customer fills out reservation form with name, phone, email, date, time, guest count, and optional notes
2. Frontend validates form data using Zod schemas
3. API request sent to `/api/reservations` endpoint
4. Backend validates request and stores reservation
5. Success response triggers toast notification
6. Form resets for new reservations

### Contact Inquiries
1. Customer submits contact form with name, email, phone, and message
2. Frontend validation ensures required fields are completed
3. API request sent to `/api/contacts` endpoint
4. Backend processes and stores contact information
5. Confirmation displayed to user

### Menu Display
1. Static menu data loaded from constants file
2. Grid layout displays items with images, descriptions, and prices
3. Interactive elements provide user feedback
4. Responsive design adapts to different screen sizes

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for smooth interactions
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Neon database client
- **zod**: TypeScript-first schema validation
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced development experience
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: Direct TypeScript execution using tsx
- **Database**: In-memory storage for rapid development
- **Integration**: Vite proxy configuration for API requests

### Production Build
- **Frontend**: Static asset generation with Vite build
- **Backend**: ESBuild compilation to optimized JavaScript
- **Database**: PostgreSQL connection via environment variables
- **Deployment**: Single-process architecture serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string for production
- **NODE_ENV**: Environment detection for conditional behavior
- **REPL_ID**: Replit-specific environment detection

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 29, 2025. Initial setup