
// MongoDB cannot connect directly from browser environments - use REST API endpoints instead
export const getMongoClient = () => {
  console.warn(
    "IMPORTANT: MongoDB connections require a Node.js backend server environment. The browser cannot directly connect to MongoDB.\n" +
    "For this application, please ensure you have set up a proper backend API server that can connect to MongoDB.\n" +
    "The current application is configured to use REST API endpoints defined in src/services/api.ts"
  );
  
  // Show connection error in development environment
  if (import.meta.env.DEV) {
    console.error(
      "MongoDB Connection Error: Direct MongoDB connections are not possible in a browser environment.\n" +
      "This application uses simulated API endpoints that would normally be implemented on a Node.js backend server.\n" +
      "To implement a real MongoDB connection:\n" +
      "1. Create a Node.js/Express backend server\n" +
      "2. Connect to MongoDB from the backend server\n" +
      "3. Create REST API endpoints on the backend server\n" +
      "4. Update the API_URL in your .env file to point to your backend server"
    );
  }
  
  return null;
};

export default getMongoClient;

// MongoDB connection error codes and messages
export const MONGODB_ERROR_CODES = {
  UNABLE_TO_CONNECT: "UNABLE_TO_CONNECT",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED", 
  CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT",
  NETWORK_ERROR: "NETWORK_ERROR"
};

export const getMongoErrorMessage = (errorCode: string): string => {
  const errorMessages = {
    [MONGODB_ERROR_CODES.UNABLE_TO_CONNECT]: 
      "Unable to connect to MongoDB. Please check your connection string and network connectivity.",
    [MONGODB_ERROR_CODES.AUTHENTICATION_FAILED]: 
      "MongoDB authentication failed. Please check your credentials.",
    [MONGODB_ERROR_CODES.CONNECTION_TIMEOUT]: 
      "Connection to MongoDB timed out. Please try again later.",
    [MONGODB_ERROR_CODES.NETWORK_ERROR]: 
      "Network error occurred while connecting to MongoDB."
  };
  
  return errorMessages[errorCode] || "Unknown MongoDB error occurred.";
};

/*
// Example backend server connection pattern:
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db();
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
*/
