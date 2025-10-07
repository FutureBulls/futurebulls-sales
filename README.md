# StockZy Learning Platform Dashboard

**StockZy Dashboard** is a comprehensive analytics and management platform designed specifically for the StockZy learning ecosystem. Built with Next.js 14, it provides powerful insights into student engagement, course performance, and revenue analytics.

## About StockZy

StockZy is your trusted e-Learning platform that helps learners understand financial markets step by step. With expert-led sessions, practical examples, and community support, students can build knowledge and skills that stay with them for life.

### Key Features
- **Expert-Led Masterclasses** - Learn from experienced educators
- **Practical Learning Labs** - Apply concepts in safe, guided environments  
- **Step-by-Step Learning Paths** - Progress from beginner to advanced levels
- **Community & Peer Learning** - Global learning community support
- **AI-Powered Learning Support** - Smart tools and analytics
- **Career-Oriented Learning** - Build valuable skills and earn certifications

By leveraging the latest features of **Next.js 14** and key functionalities like **server-side rendering (SSR)**, **static site generation (SSG)**, and seamless **API route integration**, the StockZy Dashboard ensures optimal performance for managing your learning platform.

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server running

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-dashboard-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy the environment template
   cp env-template.txt .env.local
   
   # Edit .env.local with your configuration
   # See SETUP-GUIDE.md for detailed instructions
   ```

4. **Required Environment Variables**
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_PAYLOAD_SECRET` - Secret for payload signing
   - `NEXTAUTH_URL` - Your application URL

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Quick Start
For a complete setup guide, see [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## Dashboard Features

**StockZy Analytics Dashboard** - A comprehensive platform for managing and analyzing your learning ecosystem with modern UI components and powerful analytics.

### Core Functionality
- **Revenue Analytics** - Track course enrollments and payment performance
- **Student Management** - Monitor active learners and course completion rates  
- **Onboarding Analytics** - Manage student enrollment and progress tracking
- **User Management** - Comprehensive user administration and role management
- **Real-time Data Export** - Download detailed CSV reports for analysis
- **Interactive Charts** - Visualize data with modern chart components
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Technical Features
- Built with **Next.js 14** and **React 18** for optimal performance
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for modern, responsive styling
- **Dark/Light Mode** support for better user experience
- **Authentication** integration with NextAuth
- **Real-time Data** updates and analytics
- **Modern UI Components** with smooth animations and transitions
- **Mobile-First** responsive design approach

All these features make the **StockZy Dashboard** a powerful, comprehensive solution for managing your learning platform effectively.
