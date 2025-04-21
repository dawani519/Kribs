import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, VERIFICATION_METHODS } from '@/config/constants';

interface VerificationData {
  type: string; // 'nin' or 'bvn'
  documentNumber: string;
  verificationData?: any;
}

interface VerificationState {
  isVerified: boolean;
  isVerifying: boolean;
  verificationMethod: string | null;
  error: string | null;
  verifyWithNIN: (ninNumber: string) => Promise<void>;
  verifyWithBVN: (bvnNumber: string, dateOfBirth: string) => Promise<void>;
  verifications: any[];
  isLoading: boolean;
}

export function useVerification(): VerificationState {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationMethod, setVerificationMethod] = useState<string | null>(null);
  const { toast } = useToast();

  // Query to get user's verifications
  const { data: verifications = [], isLoading, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.VERIFICATIONS],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.VERIFICATIONS, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification data');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Check if user has any successful verifications
      const verified = data.some((v: any) => v.status === 'verified');
      if (verified) {
        setIsVerified(true);
        // Get the verification method used
        const method = data.find((v: any) => v.status === 'verified')?.type || null;
        setVerificationMethod(method);
      }
    },
    enabled: true,
  });

  // Mutation for creating a verification request
  const verificationMutation = useMutation({
    mutationFn: async (data: VerificationData) => {
      const response = await apiRequest('POST', API_ENDPOINTS.VERIFICATIONS, data);
      return response.json();
    },
    onSuccess: (data) => {
      refetch();
      toast({
        title: "Verification successful",
        description: "Your identity has been verified successfully.",
      });
      setIsVerified(true);
      setVerificationMethod(data.type);
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  // Function to verify with NIN
  const verifyWithNIN = async (ninNumber: string): Promise<void> => {
    // Validate NIN format
    if (!ninNumber || ninNumber.length !== 11) {
      toast({
        title: "Invalid NIN",
        description: "Please enter a valid 11-digit NIN number.",
        variant: "destructive",
      });
      return;
    }

    await verificationMutation.mutateAsync({
      type: VERIFICATION_METHODS.NIN,
      documentNumber: ninNumber,
      verificationData: {
        ninNumber,
      },
    });
  };

  // Function to verify with BVN
  const verifyWithBVN = async (bvnNumber: string, dateOfBirth: string): Promise<void> => {
    // Validate BVN format
    if (!bvnNumber || bvnNumber.length !== 11) {
      toast({
        title: "Invalid BVN",
        description: "Please enter a valid 11-digit BVN number.",
        variant: "destructive",
      });
      return;
    }

    // Validate date of birth
    if (!dateOfBirth) {
      toast({
        title: "Date of Birth Required",
        description: "Please enter your date of birth for BVN verification.",
        variant: "destructive",
      });
      return;
    }

    await verificationMutation.mutateAsync({
      type: VERIFICATION_METHODS.BVN,
      documentNumber: bvnNumber,
      verificationData: {
        bvnNumber,
        dateOfBirth,
      },
    });
  };

  return {
    isVerified,
    isVerifying: verificationMutation.isPending,
    verificationMethod,
    error: verificationMutation.error?.message || null,
    verifyWithNIN,
    verifyWithBVN,
    verifications: verifications || [],
    isLoading,
  };
}
