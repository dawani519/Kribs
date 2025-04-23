import { supabase } from '../config/supabaseClient';
import { Verification, VerificationFormData } from '../types';

/**
 * Service for handling verification-related operations
 */
class VerificationService {
  /**
   * Get all verifications for the current user
   */
  async getVerifications(): Promise<Verification[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(verification => ({
      id: verification.id,
      userId: verification.user_id,
      type: verification.type,
      documentUrl: verification.document_url,
      status: verification.status,
      comments: verification.comments,
      createdAt: verification.created_at,
      updatedAt: verification.updated_at
    }));
  }

  /**
   * Create a new verification request
   */
  async createVerification(verificationData: VerificationFormData): Promise<Verification> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload document first
    const documentUrl = await this.uploadDocument(verificationData.document);

    // Create verification record
    const { data, error } = await supabase
      .from('verifications')
      .insert({
        user_id: user.user.id,
        type: verificationData.type,
        document_url: documentUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Format and return the verification
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      documentUrl: data.document_url,
      status: data.status,
      comments: data.comments,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Check the status of a verification
   */
  async checkStatus(id: number): Promise<Verification> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) throw new Error(error.message);

    // If verification is approved, update user's verification status
    if (data.status === 'approved' && !user.user.user_metadata?.is_verified) {
      await this.updateUserVerificationStatus(data.id, data.type);
    }

    // Format and return the verification
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      documentUrl: data.document_url,
      status: data.status,
      comments: data.comments,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Upload a document to Supabase storage
   */
  private async uploadDocument(document: File): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.user.id}/${Date.now()}-${document.name}`;
    
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, document);

    if (error) throw new Error(`Failed to upload document: ${error.message}`);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /**
   * Update user's verification status
   */
  private async updateUserVerificationStatus(verificationId: number, verificationType: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update the user's record
    const { error } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_method: verificationType,
        verification_id: verificationId
      })
      .eq('id', user.user.id);

    if (error) throw new Error(error.message);
  }
}

// Create and export a singleton instance
const verificationService = new VerificationService();
export default verificationService;