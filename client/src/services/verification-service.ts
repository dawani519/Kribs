import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS, VERIFICATION_METHODS } from "@/config/constants";

interface Verification {
  id: number;
  userId: number;
  type: string; // nin, bvn
  documentNumber: string;
  status: string; // pending, verified, rejected
  verificationData: any;
  createdAt: string;
  updatedAt: string;
}

interface NINVerificationRequest {
  ninNumber: string;
  selfieImage?: File;
}

interface BVNVerificationRequest {
  bvnNumber: string;
  dateOfBirth: string;
}

class VerificationService {
  /**
   * Get all verifications for the current user
   */
  async getVerifications(): Promise<Verification[]> {
    const response = await apiRequest('GET', API_ENDPOINTS.VERIFICATIONS, undefined);
    return response.json();
  }

  /**
   * Verify identity with NIN
   */
  async verifyWithNIN(data: NINVerificationRequest): Promise<Verification> {
    // In a real app, we would handle file upload separately
    // For this demo, we'll just send the NIN number
    
    const verificationData = {
      type: VERIFICATION_METHODS.NIN,
      documentNumber: data.ninNumber,
      verificationData: {
        ninNumber: data.ninNumber
      }
    };
    
    const response = await apiRequest('POST', API_ENDPOINTS.VERIFICATIONS, verificationData);
    return response.json();
  }

  /**
   * Verify identity with BVN
   */
  async verifyWithBVN(data: BVNVerificationRequest): Promise<Verification> {
    const verificationData = {
      type: VERIFICATION_METHODS.BVN,
      documentNumber: data.bvnNumber,
      verificationData: {
        bvnNumber: data.bvnNumber,
        dateOfBirth: data.dateOfBirth
      }
    };
    
    const response = await apiRequest('POST', API_ENDPOINTS.VERIFICATIONS, verificationData);
    return response.json();
  }

  /**
   * Check if user is verified
   */
  async isUserVerified(): Promise<boolean> {
    try {
      const verifications = await this.getVerifications();
      return verifications.some(v => v.status === 'verified');
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }

  /**
   * Get user's verification method
   */
  async getUserVerificationMethod(): Promise<string | null> {
    try {
      const verifications = await this.getVerifications();
      const verifiedRecord = verifications.find(v => v.status === 'verified');
      return verifiedRecord ? verifiedRecord.type : null;
    } catch (error) {
      console.error('Error getting verification method:', error);
      return null;
    }
  }
}

export default new VerificationService();
