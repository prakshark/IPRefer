# IP Protection System

A web application that helps protect intellectual property by detecting and preventing unauthorized use of logos, company names, and taglines.

## Features

- User registration and authentication
- Add and manage IP assets (logos, company names, taglines)
- Automatic detection of similar content
- Real-time camera-based logo detection
- Notification system for infringement attempts
- Modern and responsive UI

## Tech Stack

- Frontend: React, Material-UI, ML5.js
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Machine Learning: ML5.js for image recognition

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Modern web browser with camera access

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Register a new account or login with existing credentials
2. Add your IP assets (logos, company names, or taglines)
3. Use the "Check Asset" feature to verify if content is already registered
4. Use the "Camera Check" feature to detect logos in real-time
5. Monitor notifications for any infringement attempts

## Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Real-time infringement detection
- Automatic notification system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 