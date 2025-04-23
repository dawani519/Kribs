import React from 'react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Conversation } from '../types';
import { cn, getInitials, truncateText } from '../lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: number;
  emptyMessage?: string;
  onSelectConversation?: (id: number) => void;
}

/**
 * ConversationList component - displays a list of conversations (chats)
 */
const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  emptyMessage = "No conversations found",
  onSelectConversation,
}) => {
  const [, navigate] = useLocation();
  
  // Handle conversation click
  const handleConversationClick = (id: number) => {
    if (onSelectConversation) {
      onSelectConversation(id);
    } else {
      navigate(`/chat/${id}`);
    }
  };
  
  // If there are no conversations, show empty state
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        // Determine the other person's name
        const otherPersonName = conversation.ownerName || conversation.renterName || 'User';
        
        // Format last message time
        const lastMessageTime = formatDistanceToNow(new Date(conversation.lastMessageTime), { 
          addSuffix: true 
        });
        
        // Determine if this is the active conversation
        const isActive = activeConversationId === conversation.id;
        
        return (
          <Card 
            key={conversation.id}
            className={cn(
              "cursor-pointer hover:bg-neutral-50 transition-colors duration-200",
              isActive && "bg-neutral-100 hover:bg-neutral-100 border-primary"
            )}
            onClick={() => handleConversationClick(conversation.id)}
          >
            <CardContent className="p-3 flex items-center space-x-3">
              {/* Avatar with property image or user profile */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                {conversation.listingPhoto ? (
                  <AvatarImage src={conversation.listingPhoto} alt={conversation.listingTitle || 'Property'} />
                ) : (
                  <AvatarImage src="" alt={otherPersonName} />
                )}
                <AvatarFallback>{getInitials(otherPersonName)}</AvatarFallback>
              </Avatar>
              
              {/* Conversation details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm truncate">
                    {otherPersonName}
                  </h4>
                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                    {lastMessageTime}
                  </span>
                </div>
                
                {/* Listing title if available */}
                {conversation.listingTitle && (
                  <p className="text-xs text-neutral-600 truncate">
                    Re: {conversation.listingTitle}
                  </p>
                )}
                
                {/* Unread badge */}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-neutral-500 truncate">
                    {truncateText("Last message content would go here...", 30)}
                  </p>
                  
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 rounded-full bg-primary">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationList;