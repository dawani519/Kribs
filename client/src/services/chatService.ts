import { supabase } from '../config/supabaseClient';
import { Message, Conversation, NewMessage, NewConversation } from '../types';
import { store } from '../redux/store';
import { addRealTimeMessage, addRealTimeConversation } from '../redux/chatSlice';

/**
 * Chat service for handling all chat-related operations
 */
class ChatService {
  private subscriptions: { [key: string]: () => void } = {};

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(title),
        owner:users!owner_id(firstName, lastName),
        renter:users!renter_id(firstName, lastName)
      `)
      .or(`renter_id.eq.${user.user.id},owner_id.eq.${user.user.id}`)
      .order('last_message_time', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(conv => ({
      id: conv.id,
      listingId: conv.listing_id,
      ownerId: conv.owner_id,
      renterId: conv.renter_id,
      lastMessageTime: conv.last_message_time,
      createdAt: conv.created_at,
      listingTitle: conv.listing?.title,
      ownerName: `${conv.owner?.firstName} ${conv.owner?.lastName}`,
      renterName: `${conv.renter?.firstName} ${conv.renter?.lastName}`,
      unreadCount: conv.unread_count || 0
    }));
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      text: msg.text,
      isRead: msg.is_read,
      createdAt: msg.created_at
    }));
  }

  /**
   * Start a new conversation or get an existing one
   */
  async startConversation(conversationData: NewConversation): Promise<Conversation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if conversation already exists between these users for this listing
    const { data: existingConversation, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', conversationData.listingId)
      .eq('owner_id', conversationData.ownerId)
      .eq('renter_id', user.user.id)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 is the error when no rows found, which is expected if conversation doesn't exist
      throw new Error(searchError.message);
    }

    if (existingConversation) {
      // Return existing conversation
      return {
        id: existingConversation.id,
        listingId: existingConversation.listing_id,
        ownerId: existingConversation.owner_id,
        renterId: existingConversation.renter_id,
        lastMessageTime: existingConversation.last_message_time,
        createdAt: existingConversation.created_at
      };
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: conversationData.listingId,
        owner_id: conversationData.ownerId,
        renter_id: user.user.id,
        last_message_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      listingId: data.listing_id,
      ownerId: data.owner_id,
      renterId: data.renter_id,
      lastMessageTime: data.last_message_time,
      createdAt: data.created_at
    };
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(messageData: NewMessage): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update the conversation's last message time
    await supabase
      .from('conversations')
      .update({ last_message_time: new Date().toISOString() })
      .eq('id', messageData.conversationId);

    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender_id: user.user.id,
        text: messageData.text,
        is_read: false
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      text: data.text,
      isRead: data.is_read,
      createdAt: data.created_at
    };
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markMessagesAsRead(conversationId: number): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.user.id);

    if (error) throw new Error(error.message);

    // Update unread count in the conversation
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }

  /**
   * Subscribe to real-time updates for a specific conversation
   */
  subscribeToConversation(conversationId: number): void {
    // Unsubscribe from any existing subscription for this conversation
    this.unsubscribeFromConversation(conversationId);

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Add the new message to the Redux store
        const message: Message = {
          id: payload.new.id,
          conversationId: payload.new.conversation_id,
          senderId: payload.new.sender_id,
          text: payload.new.text,
          isRead: payload.new.is_read,
          createdAt: payload.new.created_at
        };
        store.dispatch(addRealTimeMessage(message));
      })
      .subscribe();

    // Store the unsubscribe function
    this.subscriptions[`conversation:${conversationId}`] = () => {
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to new conversations for the current user
   */
  subscribeToNewConversations(): void {
    const { data: user } = supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('new_conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `owner_id=eq.${user.user.id}` // For conversations where user is the owner
      }, (payload) => {
        const conversation: Conversation = {
          id: payload.new.id,
          listingId: payload.new.listing_id,
          ownerId: payload.new.owner_id,
          renterId: payload.new.renter_id,
          lastMessageTime: payload.new.last_message_time,
          createdAt: payload.new.created_at
        };
        store.dispatch(addRealTimeConversation(conversation));
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `renter_id=eq.${user.user.id}` // For conversations where user is the renter
      }, (payload) => {
        const conversation: Conversation = {
          id: payload.new.id,
          listingId: payload.new.listing_id,
          ownerId: payload.new.owner_id,
          renterId: payload.new.renter_id,
          lastMessageTime: payload.new.last_message_time,
          createdAt: payload.new.created_at
        };
        store.dispatch(addRealTimeConversation(conversation));
      })
      .subscribe();

    // Store the unsubscribe function
    this.subscriptions['new_conversations'] = () => {
      channel.unsubscribe();
    };
  }

  /**
   * Unsubscribe from updates for a specific conversation
   */
  unsubscribeFromConversation(conversationId: number): void {
    const key = `conversation:${conversationId}`;
    if (this.subscriptions[key]) {
      this.subscriptions[key]();
      delete this.subscriptions[key];
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    Object.values(this.subscriptions).forEach(unsubscribe => unsubscribe());
    this.subscriptions = {};
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;