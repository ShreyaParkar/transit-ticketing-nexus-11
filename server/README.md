
# Transit Ticketing API Server

This is the backend server for the Transit Ticketing Nexus application.

## Setup Instructions

### Prerequisites
- Node.js v14+ installed
- MongoDB account (using MongoDB Atlas or local MongoDB)

### Installation

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

3. Start the development server:
```
npm run dev
```

4. For production:
```
npm start
```

## API Endpoints

- `/api/buses` - Bus management
- `/api/routes` - Routes management
- `/api/stations` - Station management
- `/api/tickets` - Ticket management
- `/api/passes` - Pass management
- `/api/pass-usage` - Pass usage management
- `/api/payments` - Payment management
- `/api/users` - User management
