import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '../../../shared/schema';

// Define the chat state
interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  realtimeEnabled: boolean;
}

// Initial state
const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  realtimeEnabled: false
};

// Async thunks for chat actions
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/conversations', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch conversations');
      }
      
      const data = await response.json();
      return data.conversations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      return {
        conversationId,
        messages: data.messages
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: { conversationId: number; content: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/conversations/${messageData.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageData.content
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to send message');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (data: { ownerId: number; listingId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create conversation');
      }
      
      const responseData = await response.json();
      return responseData.conversation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create conversation');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to mark messages as read');
      }
      
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch conversation');
      }
      
      const data = await response.json();
      return data.conversation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversation');
    }
  }
);

export const checkExistingConversation = createAsyncThunk(
  'chat/checkExistingConversation',
  async ({ ownerId, listingId }: { ownerId: number; listingId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/conversations/find?ownerId=${ownerId}&listingId=${listingId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No existing conversation, not an error
        }
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to check existing conversation');
      }
      
      const data = await response.json();
      return data.conversation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check existing conversation');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/conversations/unread', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch unread count');
      }
      
      const data = await response.json();
      return data.count;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

// Create the chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Add the message to the messages array
      state.messages.push(action.payload);
      
      // Update the conversation's last message if it matches
      const conversationIndex = state.conversations.findIndex(
        c => c.id === action.payload.conversationId
      );
      
      if (conversationIndex >= 0) {
        state.conversations[conversationIndex].lastMessageTime = action.payload.createdAt;
        
        // Increment unread count if not from current user and not in active conversation
        if (
          state.activeConversation?.id !== action.payload.conversationId &&
          !action.payload.isRead
        ) {
          state.unreadCount += 1;
        }
        
        // Sort conversations by last message time
        state.conversations.sort((a, b) => {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setRealtimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realtimeEnabled = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations = action.payload;
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages = action.payload.messages;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isLoading = false;
      state.messages.push(action.payload);
      
      // Update the conversation's last message time
      const conversationIndex = state.conversations.findIndex(
        c => c.id === action.payload.conversationId
      );
      
      if (conversationIndex >= 0) {
        state.conversations[conversationIndex].lastMessageTime = action.payload.createdAt;
        
        // Sort conversations by last message time
        state.conversations.sort((a, b) => {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Create conversation
    builder.addCase(createConversation.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeConversation = action.payload;
      
      // Add to conversations if not already there
      const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
      if (existingIndex === -1) {
        state.conversations.unshift(action.payload);
      } else {
        state.conversations[existingIndex] = action.payload;
      }
    });
    builder.addCase(createConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Mark messages as read
    builder.addCase(markMessagesAsRead.fulfilled, (state, action) => {
      // Update messages
      state.messages = state.messages.map(message => {
        if (message.conversationId === action.payload && !message.isRead) {
          return { ...message, isRead: true };
        }
        return message;
      });
      
      // Update unread count
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    });
    
    // Fetch conversation
    builder.addCase(fetchConversation.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeConversation = action.payload;
      
      // Update in conversations array if exists
      const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
      if (existingIndex >= 0) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    });
    builder.addCase(fetchConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Check existing conversation
    builder.addCase(checkExistingConversation.fulfilled, (state, action) => {
      if (action.payload) {
        state.activeConversation = action.payload;
      }
    });
    
    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { 
  setActiveConversation, 
  addMessage, 
  clearMessages, 
  setRealtimeEnabled, 
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;