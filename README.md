# Crazy Dragon Client

Frontend application for Crazy Dragon food delivery platform.

## Tech Stack

- React 19
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Stripe Elements
- Socket.IO Client

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5050
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

## Features

- User authentication
- Product browsing & search
- Shopping cart
- Checkout & payment
- Order tracking
- Product reviews
- User profile
- Admin dashboard
- Real-time notifications

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── features/       # Redux slices
├── routes/         # Route configuration
├── utils/          # Utility functions
└── assets/         # Images and static files
```

## Scripts

```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## License

All rights reserved © 2025 Crazy Dragon
