import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import PageHeader from '../../components/PageHeader';
import ConversationList from '../../components/ConversationList';
import ChatMessage from '../../components/ChatMessage';
import { Conversation, Message } from '../../types';
import { supabase } from '../../config/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const ChatPage: React.FC = () => {
  const [, navigate] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state
  const [activeTab, setActiveTab] = useState<string>('all');
  const [message, setMessage] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get user from auth state
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Fetch conversations on mount (simulated for now)
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch from Supabase
        // For now, just set some sample data after a delay
        setTimeout(() => {
          setConversations([
            {
              id: 1,
              renterId: 1,
              ownerId: 2,
              listingId: 1,
              lastMessageTime: new Date().toISOString(),
              ownerName: 'John Landlord',
              renterName: 'Jane Tenant',
              listingTitle: 'Modern 3 Bedroom Apartment',
              listingPhoto: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
              unreadCount: 3
            },
            {
              id: 2,
              renterId: 1,
              ownerId: 3,
              listingId: 2,
              lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              ownerName: 'Mike Agent',
              renterName: 'Jane Tenant',
              listingTitle: 'Luxury Villa with Pool',
              listingPhoto: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
              unreadCount: 0
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, []);
  
  // Select conversation and fetch messages
  const handleSelectConversation = (id: number) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversation(conversation);
      
      // Fetch messages for this conversation (simulated)
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            conversationId: id,
            senderId: conversation.ownerId,
            content: 'Hello, I saw you were interested in this property.',
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            conversationId: id,
            senderId: conversation.renterId,
            content: 'Yes, I would like to know if it\'s still available and if viewing is possible this weekend?',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            conversationId: id,
            senderId: conversation.ownerId,
            content: 'It is still available. I can arrange a viewing for Saturday at 2pm if that works for you?',
            isRead: true,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }, 500);
    }
  };
  
  // Send message
  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return;
    
    // Create new message
    const newMessage: Message = {
      id: Date.now(),
      conversationId: activeConversation.id,
      senderId: user?.id || 1, // Default to 1 for demo
      content: message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // Update messages state
    setMessages([...messages, newMessage]);
    
    // In a real implementation, we would send to Supabase
    
    // Clear input
    setMessage('');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Messages" 
        description="Chat with property owners and potential tenants" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <ConversationList 
                  conversations={conversations}
                  activeConversationId={activeConversation?.id}
                  onSelectConversation={handleSelectConversation}
                  emptyMessage="No conversations found"
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <ConversationList 
                  conversations={conversations.filter(c => c.unreadCount && c.unreadCount > 0)}
                  activeConversationId={activeConversation?.id}
                  onSelectConversation={handleSelectConversation}
                  emptyMessage="No unread messages"
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Chat area */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-white flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="border-b p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    {activeConversation.ownerName || activeConversation.renterName}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/listings/${activeConversation.listingId}`)}>
                    View Property
                  </Button>
                </div>
                {activeConversation.listingTitle && (
                  <p className="text-sm text-neutral-500">
                    Re: {activeConversation.listingTitle}
                  </p>
                )}
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                      showAvatar={true} 
                    />
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </div>
            </>
          ) : (
            // No conversation selected
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center p-6">
                <h3 className="font-semibold text-lg mb-2">No Conversation Selected</h3>
                <p className="text-neutral-500 mb-4">
                  Select a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;