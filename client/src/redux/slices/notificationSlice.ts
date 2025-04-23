import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../../shared/schema';

// Define the notification state
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

// Async thunks for notification actions
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (unreadOnly: boolean = false, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications${unreadOnly ? '?unread=true' : ''}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch notifications');
      }
      
      const data = await response.json();
      return data.notifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to mark notification as read');
      }
      
      const data = await response.json();
      return data.notification;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to mark all notifications as read');
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Mark notification as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications[index] = action.payload;
        if (wasUnread && action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    });
    
    // Mark all notifications as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      state.unreadCount = 0;
    });
  },
});

export const { 
  addNotification, 
  clearNotifications, 
  setError, 
  clearError 
} = notificationSlice.actions;

export default notificationSlice.reducer;