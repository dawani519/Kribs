import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatService from '../services/chatService';
import { ChatState, Conversation, Message, NewMessage, NewConversation } from '../types';

// Initial state
const initialState: ChatState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      return await chatService.getMessages(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: NewMessage, { rejectWithValue }) => {
    try {
      return await chatService.sendMessage(messageData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (conversationData: NewConversation, { rejectWithValue }) => {
    try {
      return await chatService.startConversation(conversationData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start conversation');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      await chatService.markMessagesAsRead(conversationId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedConversation = action.payload;
    },
    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
      state.messages = [];
    },
    addRealTimeMessage: (state, action: PayloadAction<Message>) => {
      // Add to messages if it's for the selected conversation
      if (state.selectedConversation && state.selectedConversation.id === action.payload.conversationId) {
        state.messages.push(action.payload);
      }
      
      // Update unread count in conversation list
      state.conversations = state.conversations.map(conv => {
        if (conv.id === action.payload.conversationId) {
          return {
            ...conv,
            lastMessageTime: action.payload.createdAt,
            unreadCount: (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      });
    },
    // Handle real-time notification of new conversation
    addRealTimeConversation: (state, action: PayloadAction<Conversation>) => {
      // Add only if not already in the list
      if (!state.conversations.some(conv => conv.id === action.payload.id)) {
        state.conversations = [action.payload, ...state.conversations];
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
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
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
      state.isLoading = false;
      state.messages = action.payload;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
      state.isLoading = false;
      state.messages.push(action.payload);
      
      // Update last message time in conversation list
      state.conversations = state.conversations.map(conv => {
        if (conv.id === action.payload.conversationId) {
          return {
            ...conv,
            lastMessageTime: action.payload.createdAt
          };
        }
        return conv;
      });
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Start conversation
    builder.addCase(startConversation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(startConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
      state.isLoading = false;
      
      // Add to conversations if not already present
      if (!state.conversations.some(conv => conv.id === action.payload.id)) {
        state.conversations = [action.payload, ...state.conversations];
      }
      
      state.selectedConversation = action.payload;
    });
    builder.addCase(startConversation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Mark messages as read
    builder.addCase(markMessagesAsRead.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(markMessagesAsRead.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      
      // Update messages in current conversation
      state.messages = state.messages.map(message => ({
        ...message,
        isRead: true
      }));
      
      // Update unread count in conversations
      state.conversations = state.conversations.map(conv => {
        if (conv.id === action.payload) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      });
    });
    builder.addCase(markMessagesAsRead.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { 
  clearError, 
  setSelectedConversation, 
  clearSelectedConversation,
  addRealTimeMessage,
  addRealTimeConversation
} = chatSlice.actions;

export default chatSlice.reducer;