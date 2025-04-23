import React from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '../lib/utils';
import { RootState } from '../redux/store';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  showAvatar?: boolean;
}

/**
 * Chat message component - displays a single message in a chat conversation
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, showAvatar = true }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isCurrentUser = user?.id === message.senderId;
  
  // Format time
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div
      className={cn(
        "flex w-full mb-4 max-w-[80%]", 
        isCurrentUser 
          ? "ml-auto flex-row-reverse" 
          : "mr-auto"
      )}
    >
      {/* Avatar - only show for other user's messages or if explicitly requested */}
      {showAvatar && !isCurrentUser && (
        <div className="flex-shrink-0 mr-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt="User" />
            <AvatarFallback>{getInitials('User Name')}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Message bubble */}
      <div className="flex flex-col">
        <div
          className={cn(
            "p-3 rounded-lg",
            isCurrentUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-secondary text-secondary-foreground rounded-tl-none"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        
        {/* Timestamp */}
        <span 
          className={cn(
            "text-xs text-neutral-500 mt-1",
            isCurrentUser ? "text-right" : "text-left"
          )}
        >
          {formattedTime}
          {message.isRead && isCurrentUser && (
            <span className="ml-1 text-primary">✓</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;