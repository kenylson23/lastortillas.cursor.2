# Las Tortillas Mexican Grill Website

## Overview

Las Tortillas Mexican Grill is a full-stack web application for a Mexican restaurant located in Luanda, Angola. Founded on February 14, 2018, the restaurant has established itself as a family-friendly dining destination. The application features a modern, responsive frontend built with React and a RESTful API backend powered by Express.js. The system allows customers to browse the menu, make reservations, and submit contact inquiries.

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

### Production Build (Replit)
- **Type**: Full-stack application with Express backend and React frontend
- **Build Command**: `npm run dev`
- **Database**: PostgreSQL with Drizzle ORM
- **Backend**: Express.js with TypeScript
- **Frontend**: React with Vite build system

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **API**: RESTful endpoints for reservations, contacts, and menu items
- **WhatsApp Integration**: Direct linking to +244 949639932

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

- July 17, 2025: Resolved database connection issues and completed deployment testing
  - Fixed DATABASE_URL environment variable configuration
  - Successfully recreated PostgreSQL database with proper schema
  - Validated all database tables and relationships are working correctly
  - Completed comprehensive build testing with successful production compilation
  - Verified all API endpoints are functional (menu-items, reservations, contacts, orders, tables)
  - Confirmed both development and production builds work correctly
  - Application running successfully on port 5000 with full database connectivity
- July 17, 2025: Migrated database from Replit PostgreSQL to Supabase
  - Updated database connection to use Supabase pooler connection string
  - Successfully connected to Supabase database with existing schema
  - Verified data persistence and retrieval working correctly
  - All API endpoints functioning properly with Supabase backend
  - Application performance maintained with cloud database connection
  - Enhanced scalability and reliability with Supabase infrastructure
- June 29, 2025: Initial setup
- June 29, 2025: Configured WhatsApp integration (+244 949639932) for reservations
- January 17, 2025: Removed all Vercel deployment configuration
  - Deleted vercel.json, API folder, and all build scripts
  - Updated documentation to reflect full-stack Replit deployment
  - Cleaned up project structure for simplified development
  - Updated build process for simplified Replit deployment
  - Removed all Vercel-specific configuration files and scripts
- January 17, 2025: Completed migration from Prisma to Drizzle ORM
  - Removed all Prisma dependencies and configuration files
  - Updated table schema to match Prisma structure exactly
  - Fixed storage interface to work with new schema field names
  - Successfully migrated to pure Drizzle ORM implementation
  - All API endpoints working correctly with new database layer
- July 8, 2025: Fixed concurrent reservation booking issues
  - Implemented mutex pattern to prevent race conditions in reservation creation
  - Added real-time availability checking with debounced API calls
  - Created availability endpoints for frontend validation
  - Added proper error handling for duplicate reservations
  - Improved user experience with visual availability status indicators
- July 8, 2025: Updated restaurant operating hours
  - Changed from single schedule (11:00-23:00 daily) to split schedule
  - Monday-Thursday: 11:00-23:00
  - Friday-Sunday: 11:00-01:00  
  - Added new reservation time slots (22:00, 23:00, 00:00)
  - Updated all references in footer, contact section, and restaurant info
- July 13, 2025: Updated restaurant name
  - Changed from "Las Tortilhas" to "Las Tortillas Mexican Grill"
  - Updated all references across the website (navigation, hero, footer, features)
  - Updated WhatsApp messages and contact forms
  - Updated HTML title, meta tags, and project documentation
- July 13, 2025: Updated restaurant slogan
  - New slogan: "Quer passar o dia com a família? É no Las Tortillas"
  - Updated hero section, meta descriptions, and restaurant description
  - Reinforced family-friendly positioning and local connection
- July 13, 2025: Optimized Hero section messaging
  - Made text more assertive and clear
  - New description: "O único restaurante mexicano com ambiente 100% familiar em Luanda"
  - Eliminated confusion and strengthened value proposition
- July 13, 2025: Updated restaurant founding information
  - Added founding date: February 14, 2018
  - Documented restaurant's 7-year history in Luanda
  - Reinforced established reputation and local presence
- July 13, 2025: Major performance optimization implementation
  - Implemented lazy loading system for all images with intersection observer
  - Added comprehensive caching system for backend APIs (5s availability, 30s reservations)
  - Optimized hero image loading with preload and loading states
  - Memoized React components to prevent unnecessary re-renders
  - Added performance-focused CSS with content-visibility and will-change
  - Implemented HTTP cache headers and resource hints for faster loading
  - Created image cache system with error handling and loading indicators
  - Reduced initial bundle size through code splitting and optimization
  - Enhanced TanStack Query configuration with intelligent retry logic
- July 13, 2025: Multi-location system implementation
  - Added support for 3 Las Tortillas locations: 2 restaurants + 1 mobile unit
  - Created modal/overlay system for detailed location information
  - Implemented LocationModal component with full location details
  - Added OurLocations section replacing single location display
  - Updated Hero messaging to reflect multi-location presence
  - Fixed About and Features sections animation issues by removing ScrollReveal
  - Removed logo from navigation bar as requested
  - Updated navigation to include "Nossos Locais" section
  - Fixed image loading issues in About section for Vercel deployment
  - Updated location names to Portuguese: "Centro" → "Talatona", "Mobile" → "Móvel"
  - Optimized WhatsApp redirects using window.location.href for faster response
- July 13, 2025: Custom authentication system implementation
  - Completely removed Replit Auth system per user request
  - Implemented simple localStorage-based authentication for admin access
  - Created new Login page with secure credentials (username: "administrador", password: "lasTortillas2025!")
  - Added protected route system for admin panel with automatic redirection
  - Updated navigation to show login/logout functionality based on authentication state
  - Added custom toast notification system for user feedback
  - Implemented useAuth hook for authentication state management
  - Admin login now redirects to complete management dashboard
  - Both desktop and mobile navigation updated with authentication controls
  - Enhanced form security with autoComplete="off" to prevent browser password suggestions
- July 13, 2025: Image upload system implementation
  - Added complete image upload functionality for menu items
  - Implemented multer middleware for file processing and validation
  - Created ImageUpload component with device storage access
  - Added image preview, validation (5MB max, images only), and error handling
  - Configured server to serve uploaded images from /uploads directory
  - Fixed menu item update issues with proper data validation
  - Both add and edit forms now support image upload from device storage
  - Images are automatically uploaded and stored on the server
- July 13, 2025: Enhanced order system with comprehensive improvements
  - Created OrderTracking component for real-time order status updates
  - Added OrderStats component with analytics and performance metrics
  - Implemented EnhancedCart with delivery fee calculation and improved UX
  - Added order tracking page accessible at /rastreamento route
  - Enhanced navigation with order tracking link
  - Improved order confirmation with tracking information
  - Added automatic delivery fee calculation (500 AOA for delivery)
  - Implemented preparation time estimates based on menu items
  - Added order status update API endpoint with validation
  - Enhanced admin panel with detailed order statistics and analytics
  - Improved order management with real-time updates every 30 seconds
  - Added comprehensive order filtering by status, location, and date
  - Implemented order sharing functionality via WhatsApp
  - Added detailed order progress tracking with visual indicators
- July 13, 2025: Integrated order tracking into online menu panel
  - Removed tracking button from main navigation as requested
  - Created tabbed interface in OnlineMenu component (Menu/Track Order)
  - Order tracking now embedded within ordering system for better UX
  - Order success modal redirects directly to tracking tab
  - Streamlined user flow keeping tracking within order context
- July 13, 2025: Advanced administrative order management system
  - Expanded OrderManagement with comprehensive admin controls
  - Added detailed order modal with complete customer and order information
  - Implemented visual status update buttons with icons and disabled states
  - Added "Call Customer" functionality for direct phone contact
  - Created WhatsApp sharing feature for formatted order details
  - Implemented secure order deletion with confirmation dialog
  - Added estimated delivery time update fields (ready for backend integration)
  - Created administrative notes system for internal order tracking
  - Fixed duplicate status update issues with proper state management
  - Added loading states and disabled buttons to prevent multiple submissions
  - Implemented DELETE order API endpoint with proper validation
  - Removed duplicate status controls from order list to prevent confusion
  - Centralized all order management actions within the detailed modal interface
- July 13, 2025: Integrated table selection for dine-in orders
  - Added tableId field to order schema with foreign key relationship
  - Implemented automatic table selection in online ordering system
  - Added table availability query and display in cart component
  - Created validation to require table selection for dine-in orders
  - Integrated table information display in order management system
  - Added table synchronization with order lifecycle management
  - Implemented automatic table status updates (available/occupied)
  - Tables are marked as occupied when dine-in order is created
  - Tables are automatically freed when orders are completed/cancelled/deleted
  - Enhanced order details with table information in admin panel
  - Updated WhatsApp sharing to include table details for dine-in orders
- July 13, 2025: Removed reservation button from navigation
  - Removed reservation button from both desktop and mobile navigation
  - Cleaned up navigation component to focus on menu links only
  - Maintained only menu hamburger button for mobile navigation
  - Removed duplicate reservation button from mobile menu
- July 13, 2025: Enhanced button design in navigation
  - Upgraded "Pedir Online" and "Login" buttons with modern gradient design
  - Added SVG icons to all navigation buttons for better visual hierarchy
  - Implemented hover effects with shadow, transform, and gradient transitions
  - Applied consistent styling across desktop and mobile versions
  - Enhanced mobile menu buttons with rounded corners and improved spacing
  - Added admin and logout buttons with matching modern design system
- July 13, 2025: Mexican branding and visual identity implementation
  - Created comprehensive Mexican color palette with authentic gradients (sunset, fiesta, terra, fresh)
  - Added Mexican-themed CSS utilities with gradient backgrounds and text effects
  - Implemented Mexican shadows and hover-lift animations for premium feel
  - Applied consistent Mexican flag colors throughout the interface
  - Added themed emojis and visual elements (🌮, 🌶️, 📍) for cultural authenticity
- July 13, 2025: Unified header design for online ordering
  - Removed duplicate headers between Menu.tsx and OnlineMenu.tsx components
  - Created single unified header with gradient sunset background
  - Integrated location selection directly into main header as sub-bar
  - Added current location indicator with dynamic switching
  - Streamlined navigation with consolidated "Voltar" button and cart icon
  - Improved sticky positioning for better mobile experience
- July 13, 2025: Complete modern visual redesign with professional aesthetics
  - Implemented glassmorphism effects with backdrop blur for premium feel
  - Added floating background elements with subtle animations
  - Redesigned menu cards with sophisticated hover effects and 3D transformations
  - Created elegant badge system with rounded corners and refined typography
  - Suavized Mexican color palette for professional appearance while maintaining cultural identity
  - Applied modern card design with clean borders, subtle shadows, and responsive grid
  - Enhanced button interactions with smooth transitions and refined styling
  - Achieved enterprise-level visual quality comparable to premium food delivery platforms
  - Applied comprehensive red color palette across all interactive elements for better visibility
  - Updated navigation tabs, location selectors, menu categories, and cart elements with red branding
  - Final result: Professional, modern, and sophisticated interface with strong Mexican identity and excellent visibility
- July 13, 2025: Enhanced OrderSuccessModal with premium Mexican-themed design
  - Redesigned modal with modern Mexican flag gradient header (red, yellow, green)
  - Added elegant card layout with organized order information sections
  - Implemented sophisticated button design with hover effects and shadows
  - Added motivational messaging and improved visual hierarchy
  - Created premium feel comparable to professional delivery apps
  - Enhanced user experience with clear call-to-action for order tracking
- July 13, 2025: Comprehensive admin access improvements for efficient order management
  - Added "Fazer Pedido" button in admin panel header for quick order creation
  - Created admin quick access panel in OrderManagement with filter shortcuts
  - Implemented admin mode detection in online ordering system
  - Added admin-only features: auto-fill test data, add popular items, direct admin panel access
  - Created streamlined workflow for admins to create orders efficiently
  - Added visual admin mode indicator with blue gradient banner
  - Integrated quick action buttons for pending orders, ready orders, and view all filters
  - Enhanced admin productivity with one-click access to common functions
- July 13, 2025: Implemented cart persistence system to prevent data loss on page refresh
  - Added localStorage integration for cart items and customer information
  - Automatic saving of cart data per location (separate storage for each restaurant)
  - Intelligent data recovery on page reload with error handling
  - Cart and customer data automatically cleared after successful order completion
  - Admin panel includes "Limpar Tudo" button to clear all stored data across locations
  - Data persistence maintains user experience while switching between restaurant locations
  - Robust error handling prevents data corruption in localStorage