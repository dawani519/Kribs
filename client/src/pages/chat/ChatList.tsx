import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { API_ENDPOINTS, ROUTES } from "@/config/constants";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import chatService from "@/services/chat-service";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: number;
  listingId: number;
  renterId: number;
  ownerId: number;
  lastMessageAt: string;
  createdAt: string;
  listing?: any;
  owner?: any;
  renter?: any;
  lastMessage?: any;
  hasUnread?: boolean;
}

const ChatList = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [API_ENDPOINTS.CONVERSATIONS],
    queryFn: async () => {
      const response = await chatService.getConversations();
      
      // Enhance conversations with additional info
      const enhancedConversations = await Promise.all(
        response.map(async (conversation: Conversation) => {
          // In a real app, we would fetch the listing details, other user details
          // and last message in a single API call
          // For this demo, we're mocking this data
          
          const otherUserId = user?.id === conversation.renterId 
            ? conversation.ownerId 
            : conversation.renterId;
          
          const mockOtherUser = {
            id: otherUserId,
            firstName: "User",
            lastName: otherUserId.toString(),
            avatarUrl: null
          };
          
          const mockListing = {
            id: conversation.listingId,
            title: "Property Listing",
            price: 250000
          };
          
          const messages = await chatService.getMessages(conversation.id, 1);
          const lastMessage = messages.length > 0 ? messages[0] : null;
          
          // Check if there are unread messages
          const hasUnread = messages.some(
            (message: any) => !message.read && message.senderId !== user?.id
          );
          
          return {
            ...conversation,
            listing: mockListing,
            owner: conversation.ownerId === user?.id ? user : mockOtherUser,
            renter: conversation.renterId === user?.id ? user : mockOtherUser,
            lastMessage,
            hasUnread
          };
        })
      );
      
      return enhancedConversations;
    },
    enabled: !!user,
  });
  
  const handleConversationClick = (conversationId: number) => {
    navigate(`/chat/${conversationId}`);
  };
  
  const handleBrowseListings = () => {
    navigate(ROUTES.HOME);
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="px-4 py-3">
        <h2 className="text-xl font-semibold mb-3">Messages</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-3 flex items-center shadow-sm">
              <div className="h-12 w-12 rounded-full bg-neutral-200 flex-shrink-0"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="px-4 py-3">
        <h2 className="text-xl font-semibold mb-3">Messages</h2>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-500">Failed to load conversations</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-3">
      <h2 className="text-xl font-semibold mb-3">Messages</h2>
      
      {/* Conversation List */}
      {conversations.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-neutral-100 mb-3">
            <i className="fas fa-comments text-neutral-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-800">No messages yet</h3>
          <p className="text-sm text-neutral-600 mt-1">Browse listings and connect with landlords</p>
          <Button 
            onClick={handleBrowseListings}
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            Browse Listings
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation: Conversation) => {
            const otherUser = user?.id === conversation.renterId 
              ? conversation.owner 
              : conversation.renter;
            
            const needsUnlock = !conversation.lastMessage && user?.id !== conversation.ownerId;
            
            return (
              <div 
                key={conversation.id}
                onClick={() => !needsUnlock && handleConversationClick(conversation.id)}
                className={`bg-white rounded-xl p-3 flex items-center shadow-sm ${
                  needsUnlock ? 'opacity-50' : 'cursor-pointer hover:bg-neutral-50'
                } ${conversation.hasUnread ? 'relative' : ''}`}
              >
                {conversation.hasUnread && (
                  <div className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full mr-3 mt-3"></div>
                )}
                
                <div className="h-12 w-12 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                  {otherUser?.avatarUrl ? (
                    <img 
                      src={otherUser.avatarUrl} 
                      alt="Contact" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-500 font-medium">
                      {getInitials(`${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`)}
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {otherUser?.firstName} {otherUser?.lastName}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {conversation.lastMessageAt
                        ? formatRelativeTime(conversation.lastMessageAt)
                        : formatRelativeTime(conversation.createdAt)
                      }
                    </span>
                  </div>
                  
                  {needsUnlock ? (
                    <p className="text-sm text-neutral-600 truncate">
                      <i className="fas fa-lock-open mr-1 text-xs"></i> Unlock chat - ₦5,000
                    </p>
                  ) : conversation.lastMessage ? (
                    <p className={`text-sm truncate ${conversation.hasUnread ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
                      {conversation.lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-600 truncate">
                      Start a conversation about {conversation.listing?.title || 'the listing'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
