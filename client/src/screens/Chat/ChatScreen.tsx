import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import {
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  setSelectedConversation,
} from '../../redux/chatSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import ChatMessage from '../../components/ChatMessage';
import chatService from '../../services/chatService';
import { NewMessage } from '../../types';

interface ChatScreenProps {
  conversationId?: string;
}

/**
 * Chat Screen component - displays a chat conversation
 */
const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>() || { id: conversationId };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedConversation, messages, isLoading, error } = useSelector(
    (state: RootState) => state.chat
  );
  
  // Load messages on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchMessages(Number(id)));
      
      // Subscribe to real-time updates
      chatService.subscribeToConversation(Number(id));
      
      // Mark messages as read
      dispatch(markMessagesAsRead(Number(id)));
      
      // Cleanup subscription on unmount
      return () => {
        chatService.unsubscribeFromConversation(Number(id));
      };
    }
  }, [dispatch, id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !messageText.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const newMessage: NewMessage = {
        conversationId: Number(id),
        text: messageText.trim(),
      };
      
      await dispatch(sendMessage(newMessage)).unwrap();
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get chat partner name
  const getChatPartnerName = () => {
    if (!selectedConversation || !user) return 'Chat';
    
    return selectedConversation.renterId === user.id
      ? selectedConversation.ownerName || 'Property Owner'
      : selectedConversation.renterName || 'Renter';
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/chat');
  };
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-red-500 mb-4">
          <i className="fas fa-exclamation-circle text-3xl"></i>
        </div>
        <p className="text-neutral-800 font-medium mb-2">Something went wrong</p>
        <p className="text-neutral-500 text-sm mb-4">{error}</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left"></i>
        </Button>
        
        <div className="flex-1">
          <h2 className="font-medium text-lg">{getChatPartnerName()}</h2>
          {selectedConversation?.listingTitle && (
            <p className="text-sm text-neutral-500">
              {selectedConversation.listingTitle}
            </p>
          )}
        </div>
        
        <Button variant="ghost" size="icon">
          <i className="fas fa-ellipsis-v"></i>
        </Button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-2"></div>
            <p className="text-neutral-500 text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-comments text-neutral-400 text-2xl"></i>
            </div>
            <p className="text-neutral-800 font-medium mb-1">No messages yet</p>
            <p className="text-neutral-500 text-sm px-8 mb-6">
              Start the conversation by sending a message below
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                showAvatar={
                  index === 0 ||
                  messages[index - 1].senderId !== message.senderId
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 p-3">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-neutral-500"
          >
            <i className="fas fa-paperclip"></i>
          </Button>
          
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim() || isSubmitting}
            className={`${
              !messageText.trim() || isSubmitting
                ? 'bg-neutral-200 text-neutral-500'
                : 'bg-primary text-white'
            }`}
          >
            {isSubmitting ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;