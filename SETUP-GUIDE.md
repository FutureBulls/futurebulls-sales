# StockZy Dashboard Setup Guide

## Environment Variables Configuration

This guide will help you set up all the required environment variables for the StockZy Learning Platform Dashboard.

### Step 1: Create Environment File

1. Copy the `env-template.txt` file to `.env.local` in your project root:
   ```bash
   cp env-template.txt .env.local
   ```

### Step 2: Required Environment Variables

#### Essential Variables (Must Configure)

1. **NEXT_PUBLIC_NEXTAUTH_SECRET**
   - Generate a random secret key for NextAuth.js
   - Use this command: `openssl rand -base64 32`
   - Example: `NEXT_PUBLIC_NEXTAUTH_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

2. **NEXT_PUBLIC_API_URL**
   - Your backend API URL
   - For development: `http://localhost:8000`
   - For production: `https://api.yourdomain.com`

3. **NEXT_PUBLIC_PAYLOAD_SECRET**
   - Secret key for payload signing
   - Generate a random string for security
   - Example: `NEXT_PUBLIC_PAYLOAD_SECRET=your-secure-payload-secret-key`

4. **NEXTAUTH_URL**
   - Your application URL
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`

### Step 3: Optional Configuration

#### Database (if using database)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/stockzy_dashboard
```

#### Razorpay Integration (if using Razorpay)
```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

#### Email Service (if using email)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@stockzy.com
FROM_NAME=StockZy Learning Platform
```

### Step 4: Environment-Specific Configuration

#### Development Environment
```env
APP_ENV=development
NODE_ENV=development
DEBUG=true
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Production Environment
```env
APP_ENV=production
NODE_ENV=production
DEBUG=false
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 5: Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use strong, unique secrets for production**
3. **Rotate secrets regularly**
4. **Use environment-specific configurations**
5. **Enable HTTPS in production**

### Step 6: Verification

After setting up your environment variables:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any missing environment variable errors

3. Test the authentication flow

4. Verify API connections

### Common Issues and Solutions

#### Issue: "NEXT_PUBLIC_NEXTAUTH_SECRET is not set"
**Solution**: Generate and set a proper secret key

#### Issue: API calls failing
**Solution**: Verify `NEXT_PUBLIC_API_URL` is correct and accessible

#### Issue: Authentication not working
**Solution**: Check `NEXTAUTH_URL` and `NEXT_PUBLIC_NEXTAUTH_SECRET` configuration

### Support

If you encounter any issues with the setup, please check:
1. All required environment variables are set
2. No typos in variable names
3. Backend API is running and accessible
4. Network connectivity

For additional help, refer to the StockZy documentation or contact support.
