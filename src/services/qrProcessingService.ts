
export const extractUserIdFromQR = (qrData: string): string | null => {
  try {
    console.log('Processing QR data:', qrData);
    
    // Try to parse as JSON first
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'user' && parsedData.userId) {
      console.log('Extracted user ID from user QR:', parsedData.userId);
      return parsedData.userId;
    }
    
    if (parsedData.type === 'pass' && parsedData.userId) {
      console.log('Extracted user ID from pass QR:', parsedData.userId);
      return parsedData.userId;
    }
    
    if (parsedData.type === 'transit_ticket' && parsedData.userId) {
      console.log('Extracted user ID from ticket QR:', parsedData.userId);
      return parsedData.userId;
    }
    
    // If it has a userId property directly
    if (parsedData.userId) {
      console.log('Extracted user ID from generic QR:', parsedData.userId);
      return parsedData.userId;
    }
    
    console.warn('No user ID found in parsed QR data:', parsedData);
    return null;
  } catch (error) {
    // If JSON parsing fails, treat as simple user ID
    console.log('QR data is not JSON, treating as simple user ID:', qrData);
    
    // Clean up the user ID if it has prefixes
    if (typeof qrData === 'string') {
      if (qrData.startsWith('user_')) {
        return qrData;
      }
      // Check if it looks like a user ID
      if (qrData.length > 10 && qrData.includes('user_')) {
        return qrData;
      }
      return qrData;
    }
    
    return null;
  }
};

export const extractPassDataFromQR = (qrData: string): any | null => {
  try {
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'pass') {
      return parsedData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const validateQRCode = (qrData: string): { isValid: boolean; error?: string } => {
  try {
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'user') {
      if (!parsedData.userId) {
        return { isValid: false, error: 'Invalid user QR code: missing user ID' };
      }
      return { isValid: true };
    }
    
    if (parsedData.type === 'pass') {
      if (!parsedData.passId || !parsedData.userId || !parsedData.expiryDate) {
        return { isValid: false, error: 'Invalid pass QR code: missing required fields' };
      }
      
      // Check if pass is expired
      const expiryDate = new Date(parsedData.expiryDate);
      if (expiryDate < new Date()) {
        return { isValid: false, error: 'Pass has expired' };
      }
      
      return { isValid: true };
    }
    
    if (parsedData.type === 'transit_ticket') {
      if (!parsedData.userId) {
        return { isValid: false, error: 'Invalid ticket QR code: missing user ID' };
      }
      return { isValid: true };
    }
    
    // If it has a userId, it's probably valid
    if (parsedData.userId) {
      return { isValid: true };
    }
    
    return { isValid: false, error: 'Unknown QR code type' };
  } catch (error) {
    // If not JSON, assume it's a simple user ID
    if (typeof qrData === 'string' && qrData.length > 0) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Invalid QR code format' };
  }
};
