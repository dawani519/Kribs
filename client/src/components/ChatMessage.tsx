import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Message } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  showAvatar?: boolean;
}

/**
 * Chat message component - displays a single message in a chat conversation
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, showAvatar = true }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if the message is from the current user
  const isOwnMessage = user?.id === message.senderId;
  
  // Format the message time
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
      data-testid="chat-message"
    >
      {!isOwnMessage && showAvatar && (
        <div className="h-8 w-8 rounded-full bg-neutral-200 flex-shrink-0 mr-2 overflow-hidden">
          {/* If we have user avatar, show it */}
          {false ? (
            <img 
              src="" 
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
              {/* Placeholder initials */}
              OU
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-3 py-2 rounded-lg 
            ${isOwnMessage ? 
              'bg-primary text-white rounded-tr-none' : 
              'bg-neutral-100 text-neutral-800 rounded-tl-none'
            } 
            max-w-[75%] break-words`}
        >
          <p>{message.text}</p>
        </div>
        
        <div className="flex items-center mt-1 text-xs text-neutral-500">
          <span>{formattedTime}</span>
          
          {isOwnMessage && (
            <span className="ml-2 flex items-center">
              {message.isRead ? (
                <i className="fas fa-check-double text-primary text-xs"></i>
              ) : (
                <i className="fas fa-check text-neutral-400 text-xs"></i>
              )}
            </span>
          )}
        </div>
      </div>
      
      {isOwnMessage && showAvatar && (
        <div className="h-8 w-8 rounded-full bg-neutral-200 flex-shrink-0 ml-2 overflow-hidden">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
              {/* User initials from first and last name */}
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;