import { 
  users, type User, type InsertUser,
  verifications, type Verification, type InsertVerification,
  listings, type Listing, type InsertListing,
  amenities, type Amenity, type InsertAmenity, 
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  payments, type Payment, type InsertPayment,
  contactAccess, type ContactAccess, type InsertContactAccess,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Verification methods
  createVerification(verification: InsertVerification): Promise<Verification>;
  getVerification(id: number): Promise<Verification | undefined>;
  getVerificationsByUserId(userId: number): Promise<Verification[]>;
  updateVerification(id: number, verification: Partial<Verification>): Promise<Verification | undefined>;
  
  // Listing methods
  createListing(listing: InsertListing): Promise<Listing>;
  getListing(id: number): Promise<Listing | undefined>;
  getListings(params?: { 
    userId?: number, 
    type?: string, 
    category?: string, 
    minPrice?: number, 
    maxPrice?: number,
    approved?: boolean,
    featured?: boolean,
    limit?: number, 
    offset?: number 
  }): Promise<Listing[]>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getRecentListings(limit?: number): Promise<Listing[]>;
  getNearbyListings(lat: number, lng: number, radiusKm: number, limit?: number): Promise<Listing[]>;
  updateListing(id: number, listing: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Amenity methods
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  getAmenitiesByListingId(listingId: number): Promise<Amenity[]>;
  
  // Conversation methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByParticipants(renterId: number, ownerId: number, listingId: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  updateConversationLastMessageTime(id: number): Promise<Conversation | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number, limit?: number, offset?: number): Promise<Message[]>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<boolean>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByReference(reference: string): Promise<Payment | undefined>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  
  // Contact access methods
  createContactAccess(access: InsertContactAccess): Promise<ContactAccess>;
  getContactAccess(userId: number, listingId: number): Promise<ContactAccess | undefined>;
  grantContactAccess(userId: number, listingId: number, paymentId?: number): Promise<ContactAccess>;
  grantContactAccessByAdmin(userId: number, listingId: number): Promise<ContactAccess>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private verifications: Map<number, Verification>;
  private listings: Map<number, Listing>;
  private amenities: Map<number, Amenity>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private payments: Map<number, Payment>;
  private contactAccesses: Map<number, ContactAccess>;
  private notifications: Map<number, Notification>;
  
  // Counters for IDs
  private userIdCounter: number;
  private verificationIdCounter: number;
  private listingIdCounter: number;
  private amenityIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private paymentIdCounter: number;
  private contactAccessIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.verifications = new Map();
    this.listings = new Map();
    this.amenities = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.payments = new Map();
    this.contactAccesses = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.verificationIdCounter = 1;
    this.listingIdCounter = 1;
    this.amenityIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.paymentIdCounter = 1;
    this.contactAccessIdCounter = 1;
    this.notificationIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isVerified: false,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Verification methods
  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const id = this.verificationIdCounter++;
    const now = new Date();
    const verification: Verification = {
      ...insertVerification,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.verifications.set(id, verification);
    return verification;
  }

  async getVerification(id: number): Promise<Verification | undefined> {
    return this.verifications.get(id);
  }

  async getVerificationsByUserId(userId: number): Promise<Verification[]> {
    return Array.from(this.verifications.values()).filter(
      (verification) => verification.userId === userId,
    );
  }

  async updateVerification(id: number, verificationData: Partial<Verification>): Promise<Verification | undefined> {
    const existingVerification = this.verifications.get(id);
    if (!existingVerification) return undefined;
    
    const updatedVerification = { 
      ...existingVerification, 
      ...verificationData,
      updatedAt: new Date()
    };
    this.verifications.set(id, updatedVerification);
    return updatedVerification;
  }

  // Listing methods
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.listingIdCounter++;
    const now = new Date();
    const listing: Listing = {
      ...insertListing,
      id,
      approved: false,
      featured: false,
      createdAt: now,
      updatedAt: now
    };
    this.listings.set(id, listing);
    return listing;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListings(params: { 
    userId?: number, 
    type?: string, 
    category?: string, 
    minPrice?: number, 
    maxPrice?: number,
    approved?: boolean,
    featured?: boolean,
    limit?: number, 
    offset?: number 
  } = {}): Promise<Listing[]> {
    let listings = Array.from(this.listings.values());
    
    if (params.userId !== undefined) {
      listings = listings.filter(listing => listing.userId === params.userId);
    }
    
    if (params.type !== undefined) {
      listings = listings.filter(listing => listing.type === params.type);
    }
    
    if (params.category !== undefined) {
      listings = listings.filter(listing => listing.category === params.category);
    }
    
    if (params.minPrice !== undefined) {
      listings = listings.filter(listing => listing.price >= params.minPrice);
    }
    
    if (params.maxPrice !== undefined) {
      listings = listings.filter(listing => listing.price <= params.maxPrice);
    }
    
    if (params.approved !== undefined) {
      listings = listings.filter(listing => listing.approved === params.approved);
    }
    
    if (params.featured !== undefined) {
      listings = listings.filter(listing => listing.featured === params.featured);
    }
    
    // Sort by creation date (newest first)
    listings = listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply offset and limit
    const offset = params.offset || 0;
    const limit = params.limit || listings.length;
    
    return listings.slice(offset, offset + limit);
  }

  async getFeaturedListings(limit = 5): Promise<Listing[]> {
    return this.getListings({ featured: true, approved: true, limit });
  }

  async getRecentListings(limit = 10): Promise<Listing[]> {
    return this.getListings({ approved: true, limit });
  }

  async getNearbyListings(lat: number, lng: number, radiusKm = 5, limit = 10): Promise<Listing[]> {
    // Calculate distance using Haversine formula
    const listings = Array.from(this.listings.values())
      .filter(listing => listing.approved)
      .map(listing => {
        const R = 6371; // Earth radius in km
        const dLat = this.deg2rad(listing.latitude - lat);
        const dLng = this.deg2rad(listing.longitude - lng);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(listing.latitude)) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        return { listing, distance };
      })
      .filter(item => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return listings.map(item => item.listing);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async updateListing(id: number, listingData: Partial<Listing>): Promise<Listing | undefined> {
    const existingListing = this.listings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { 
      ...existingListing, 
      ...listingData,
      updatedAt: new Date()
    };
    this.listings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteListing(id: number): Promise<boolean> {
    return this.listings.delete(id);
  }

  // Amenity methods
  async createAmenity(insertAmenity: InsertAmenity): Promise<Amenity> {
    const id = this.amenityIdCounter++;
    const amenity: Amenity = { ...insertAmenity, id };
    this.amenities.set(id, amenity);
    return amenity;
  }

  async getAmenitiesByListingId(listingId: number): Promise<Amenity[]> {
    return Array.from(this.amenities.values()).filter(
      (amenity) => amenity.listingId === listingId,
    );
  }

  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      lastMessageAt: now,
      createdAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByParticipants(renterId: number, ownerId: number, listingId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => 
        conversation.renterId === renterId && 
        conversation.ownerId === ownerId && 
        conversation.listingId === listingId
    );
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => 
        conversation.renterId === userId || conversation.ownerId === userId
      )
      .sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
  }

  async updateConversationLastMessageTime(id: number): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = {
      ...conversation,
      lastMessageAt: new Date()
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      read: false,
      createdAt: now
    };
    this.messages.set(id, message);
    
    // Update last message time for the conversation
    await this.updateConversationLastMessageTime(message.conversationId);
    
    return message;
  }

  async getMessagesByConversationId(conversationId: number, limit = 50, offset = 0): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(offset, offset + limit);
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<boolean> {
    const messagesToUpdate = Array.from(this.messages.values())
      .filter(message => 
        message.conversationId === conversationId && 
        message.senderId !== userId && 
        !message.read
      );
    
    for (const message of messagesToUpdate) {
      this.messages.set(message.id, { ...message, read: true });
    }
    
    return true;
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: now
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.reference === reference
    );
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment = { ...existingPayment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  // Contact access methods
  async createContactAccess(insertAccess: InsertContactAccess): Promise<ContactAccess> {
    const id = this.contactAccessIdCounter++;
    const now = new Date();
    const access: ContactAccess = {
      ...insertAccess,
      id,
      grantedByAdmin: false,
      createdAt: now
    };
    this.contactAccesses.set(id, access);
    return access;
  }

  async getContactAccess(userId: number, listingId: number): Promise<ContactAccess | undefined> {
    return Array.from(this.contactAccesses.values()).find(
      (access) => access.userId === userId && access.listingId === listingId
    );
  }

  async grantContactAccess(userId: number, listingId: number, paymentId?: number): Promise<ContactAccess> {
    const existingAccess = await this.getContactAccess(userId, listingId);
    
    if (existingAccess) {
      const updatedAccess = { 
        ...existingAccess, 
        granted: true,
        paymentId
      };
      this.contactAccesses.set(existingAccess.id, updatedAccess);
      return updatedAccess;
    }
    
    return this.createContactAccess({
      userId,
      listingId,
      granted: true,
      paymentId
    });
  }

  async grantContactAccessByAdmin(userId: number, listingId: number): Promise<ContactAccess> {
    const existingAccess = await this.getContactAccess(userId, listingId);
    
    if (existingAccess) {
      const updatedAccess = { 
        ...existingAccess, 
        granted: true,
        grantedByAdmin: true
      };
      this.contactAccesses.set(existingAccess.id, updatedAccess);
      return updatedAccess;
    }
    
    const access = await this.createContactAccess({
      userId,
      listingId,
      granted: true
    });
    
    const updatedAccess = {
      ...access,
      grantedByAdmin: true
    };
    this.contactAccesses.set(access.id, updatedAccess);
    return updatedAccess;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      read: false,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUserId(userId: number, unreadOnly = false): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    if (unreadOnly) {
      notifications = notifications.filter(notification => !notification.read);
    }
    
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const notifications = await this.getNotificationsByUserId(userId, true);
    
    for (const notification of notifications) {
      this.notifications.set(notification.id, { ...notification, read: true });
    }
    
    return true;
  }
}

export const storage = new MemStorage();
