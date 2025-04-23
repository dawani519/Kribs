import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/**
 * Uploads a file to Supabase storage
 * @param file File to upload
 * @param path Storage path
 * @returns URL of the uploaded file
 */
export const uploadFile = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('kribs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('kribs')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Deletes a file from Supabase storage
 * @param url URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const basePath = supabase.storage.from('kribs').getPublicUrl('').data.publicUrl;
    const filePath = url.replace(basePath, '');
    
    const { error } = await supabase.storage
      .from('kribs')
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Signs in with email and password
 * @param email User email
 * @param password User password
 */
export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

/**
 * Signs up with email and password
 * @param email User email
 * @param password User password
 * @param userData Additional user data
 */
export const signUpWithEmail = async (email: string, password: string, userData: any) => {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: userData
    }
  });
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  return await supabase.auth.signOut();
};

/**
 * Gets the current session
 */
export const getSession = async () => {
  return await supabase.auth.getSession();
};

/**
 * Sets up real-time subscription for a specific channel
 * @param channelName Name of the channel
 * @param callback Callback function to handle received messages
 */
export const subscribeToChannel = (channelName: string, callback: (payload: any) => void) => {
  return supabase
    .channel(channelName)
    .on('broadcast', { event: 'message' }, (payload) => {
      callback(payload);
    })
    .subscribe();
};

export default supabase;