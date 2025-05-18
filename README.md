Notification Service

A robust service for managing Email, SMS, and In-App notifications with message queuing and retry capabilities.

Core Features
- In-App notifications
- Email notifications via Gmail SMTP
- SMS notifications via Twilio
- Message queuing with RabbitMQ
- Automatic retry mechanism
- MongoDB storage
- REST API

Requirements
- Node.js (v14+)
- MongoDB
- RabbitMQ
- Gmail account (for email notifications)
- Twilio account (for SMS notifications)

Getting Started

Install the service:
```bash
git clone <your-repo-url>
cd notification-service
npm install
```

Set up your environment:
```bash
cp .env.example .env
```

Configuration

Basic Setup
The following variables are required in your .env file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notification-service
NODE_ENV=development
RABBITMQ_URL=amqp://localhost:5672
```

Email Configuration
To enable email notifications:
1. Turn on 2-Step Verification in your Google Account
2. Create an App Password:
   - Navigate to Google Account Settings > Security > 2-Step Verification > App passwords
   - Choose 'Mail' and your device
   - Use the generated password
3. Add these to your .env:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

SMS Configuration
To enable SMS notifications:
1. Create a Twilio account
2. Add these credentials to your .env:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

Usage

Start the service:
```bash
# Development
npm run dev

# Production
npm start
```

API Reference

Send Notification
POST /api/notifications

In-App Notification:
```json
{
    "userId": "user123",
    "type": "IN_APP",
    "title": "Welcome",
    "content": "Welcome to our platform!"
}
```

Email Notification:
```json
{
    "userId": "user123",
    "type": "EMAIL",
    "title": "Welcome Email",
    "content": "Welcome to our platform!",
    "metadata": {
        "email": "recipient@example.com"
    }
}
```

SMS Notification:
```json
{
    "userId": "user123",
    "type": "SMS",
    "title": "SMS Alert",
    "content": "Your OTP is 123456",
    "metadata": {
        "phoneNumber": "+1234567890"
    }
}
```

Fetch User Notifications
GET /api/users/:userId/notifications

Parameters:
- limit: Number of notifications (default: 10)
- offset: Pagination offset (default: 0)
- type: Filter by notification type

Technical Details

The service is built with:
- Express.js server
- MongoDB database
- RabbitMQ message queue
- Nodemailer for emails
- Twilio SDK for SMS

Error Recovery
- Automatic retry for failed deliveries
- 3 retry attempts maximum
- Comprehensive error logging
- Clean shutdown process

Common Issues

MongoDB Connection
- Check if MongoDB is running
- Verify MONGODB_URI in .env

RabbitMQ Connection
- Ensure RabbitMQ is running
- Check RABBITMQ_URL in .env

Email Delivery
- Verify Gmail credentials
- Confirm 2-Step Verification status
- Validate App Password

SMS Delivery
- Check Twilio credentials
- Verify phone number format
- Monitor Twilio account balance

Security
- Keep .env file private
- Store credentials securely
- Use environment variables
- Implement proper auth

License
ISC 