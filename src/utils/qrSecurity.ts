
import CryptoJS from 'crypto-js';

// Simple QR code security utilities
const QR_SECRET = 'transit-app-qr-secret-2024'; // In production, use environment variable

export interface SecureQRData {
  userId: string;
  timestamp: number;
  nonce: string;
}

export const generateSecureQRCode = (userId: string): string => {
  const data: SecureQRData = {
    userId,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15)
  };
  
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), QR_SECRET).toString();
  return encrypted;
};

export const validateQRCode = (qrData: string): { isValid: boolean; userId?: string; error?: string } => {
  try {
    const decrypted = CryptoJS.AES.decrypt(qrData, QR_SECRET).toString(CryptoJS.enc.Utf8);
    const data: SecureQRData = JSON.parse(decrypted);
    
    // Check if QR code is not older than 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (data.timestamp < fiveMinutesAgo) {
      return { isValid: false, error: 'QR code has expired' };
    }
    
    // Validate userId format
    if (!data.userId || typeof data.userId !== 'string' || data.userId.length < 10) {
      return { isValid: false, error: 'Invalid user ID in QR code' };
    }
    
    return { isValid: true, userId: data.userId };
  } catch (error) {
    console.error('QR validation error:', error);
    return { isValid: false, error: 'Invalid QR code format' };
  }
};

export const sanitizeQRInput = (input: string): string => {
  // Remove any potentially dangerous characters
  return input.replace(/[<>\"'&]/g, '');
};
