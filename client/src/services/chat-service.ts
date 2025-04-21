import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/config/constants';
import { supabase } from '@/config/supabase';

interface Conversation {
  id: number;
  listingId: number;
  renterId: number;
  ownerId: number;
  lastMessageAt: string;
  createdAt: string;
  renterName?: string;
  ownerName?: string;
  listingTitle?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  read: boolean;
  createdAt: string;
}

interface NewMessageData {
  conversationId: number;
  text: string;
}

interface NewConversationData {
  listingId: number;
  ownerId: number;
}

class ChatService {
  private subscriptions: { [key: string]: any } = {};

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiRequest('GET', API_ENDPOINTS.CONVERSATIONS, undefined);
    return response.json();
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const response = await apiRequest(
      'GET',
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      undefined
    );
    return response.json();
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: NewMessageData): Promise<Message> {
    const response = await apiRequest(
      'POST',
      `${API_ENDPOINTS.CONVERSATIONS}/${messageData.conversationId}/messages`,
      { text: messageData.text }
    );
    return response.json();
  }

  /**
   * Start a new conversation with a property owner
   */
  async startConversation(data: NewConversationData): Promise<Conversation> {
    const response = await apiRequest('POST', API_ENDPOINTS.CONVERSATIONS, data);
    return response.json();
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: number): Promise<void> {
    await apiRequest(
      'POST',
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/read`,
      undefined
    );
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await apiRequest('GET', `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`, undefined);
    return response.json();
  }

  /**
   * Get or create a conversation with a property owner
   */
  async getOrCreateConversation(listingId: number, ownerId: number): Promise<Conversation> {
    try {
      // Try to get existing conversation first
      const response = await apiRequest(
        'GET',
        `${API_ENDPOINTS.CONVERSATIONS}/find?listingId=${listingId}&ownerId=${ownerId}`,
        undefined
      );
      
      return response.json();
    } catch (error) {
      // If not found, create a new one
      return this.startConversation({ listingId, ownerId });
    }
  }

  /**
   * Subscribe to real-time messages for a conversation
   */
  subscribeToChat(conversationId: number, callback: (message: Message) => void): () => void {
    const channelKey = `conversation:${conversationId}`;
    
    // Check if we're already subscribed
    if (this.subscriptions[channelKey]) {
      return this.subscriptions[channelKey];
    }
    
    // Create a new Supabase subscription
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            text: payload.new.text,
            read: payload.new.read,
            createdAt: payload.new.created_at,
          };
          
          callback(newMessage);
        }
      )
      .subscribe();
    
    // Store the unsubscribe function
    const unsubscribe = () => {
      channel.unsubscribe();
      delete this.subscriptions[channelKey];
    };
    
    this.subscriptions[channelKey] = unsubscribe;
    
    return unsubscribe;
  }

  /**
   * Get unread messages count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiRequest('GET', `${API_ENDPOINTS.CONVERSATIONS}/unread`, undefined);
    const data = await response.json();
    return data.count;
  }

  /**
   * Check if a user has existing conversation with the owner
   */
  async hasExistingConversation(listingId: number): Promise<boolean> {
    try {
      const response = await apiRequest(
        'GET',
        `${API_ENDPOINTS.CONVERSATIONS}/exists?listingId=${listingId}`,
        undefined
      );
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      return false;
    }
  }
}

export default new ChatService();