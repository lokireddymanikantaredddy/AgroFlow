# AgroFlow

AgroFlow is a comprehensive agricultural business management system designed to help manage inventory, sales, and customer relationships for agricultural businesses in India.

## Features

- **Product Management**
  - Add, edit, and delete products
  - Track inventory levels
  - Set stock thresholds for low stock alerts
  - Manage supplier information

- **Sales Management**
  - Process cash and credit sales
  - Generate invoices
  - Track payment status
  - Manage customer credit

- **Customer Management**
  - Maintain customer profiles
  - Track credit limits and balances
  - View purchase history
  - Process payments

## Tech Stack

- **Frontend**
  - React.js with Vite
  - TailwindCSS for styling
  - React Query for state management
  - Headless UI for components

- **Backend**
  - Node.js with Express
  - MongoDB for database
  - JWT for authentication
  - Email and SMS notifications

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AgroFlow.git
   cd AgroFlow
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service_config
   SMS_SERVICE=your_sms_service_config
   ```

4. Start the development servers:
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start them separately:
   # Frontend (from frontend directory)
   npm run dev

   # Backend (from backend directory)
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Default Admin Credentials

- Email: admin@agroflow.com
- Password: admin123

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 