import { eq, and, desc, or, gte, lte } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";
import { calculateDistance } from "../client/src/lib/utils";

// Storage interface for CRUD operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, user: Partial<schema.User>): Promise<schema.User | undefined>;
  
  // Verification methods
  createVerification(verification: schema.InsertVerification): Promise<schema.Verification>;
  getVerification(id: number): Promise<schema.Verification | undefined>;
  getVerificationsByUserId(userId: number): Promise<schema.Verification[]>;
  updateVerification(id: number, verification: Partial<schema.Verification>): Promise<schema.Verification | undefined>;
  
  // Listing methods
  createListing(listing: schema.InsertListing): Promise<schema.Listing>;
  getListing(id: number): Promise<schema.Listing | undefined>;
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
  }): Promise<schema.Listing[]>;
  getFeaturedListings(limit?: number): Promise<schema.Listing[]>;
  getRecentListings(limit?: number): Promise<schema.Listing[]>;
  getNearbyListings(lat: number, lng: number, radiusKm: number, limit?: number): Promise<schema.Listing[]>;
  updateListing(id: number, listing: Partial<schema.Listing>): Promise<schema.Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Amenity methods
  createAmenity(amenity: schema.InsertAmenity): Promise<schema.Amenity>;
  getAmenitiesByListingId(listingId: number): Promise<schema.Amenity[]>;
  
  // Conversation methods
  createConversation(conversation: schema.InsertConversation): Promise<schema.Conversation>;
  getConversation(id: number): Promise<schema.Conversation | undefined>;
  getConversationByParticipants(renterId: number, ownerId: number, listingId: number): Promise<schema.Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<schema.Conversation[]>;
  updateConversationLastMessageTime(id: number): Promise<schema.Conversation | undefined>;
  
  // Message methods
  createMessage(message: schema.InsertMessage): Promise<schema.Message>;
  getMessagesByConversationId(conversationId: number, limit?: number, offset?: number): Promise<schema.Message[]>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<boolean>;
  
  // Payment methods
  createPayment(payment: schema.InsertPayment): Promise<schema.Payment>;
  getPayment(id: number): Promise<schema.Payment | undefined>;
  getPaymentByReference(reference: string): Promise<schema.Payment | undefined>;
  updatePayment(id: number, payment: Partial<schema.Payment>): Promise<schema.Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<schema.Payment[]>;
  
  // Contact access methods
  createContactAccess(access: schema.InsertContactAccess): Promise<schema.ContactAccess>;
  getContactAccess(userId: number, listingId: number): Promise<schema.ContactAccess | undefined>;
  grantContactAccess(userId: number, listingId: number, paymentId?: number): Promise<schema.ContactAccess>;
  grantContactAccessByAdmin(userId: number, listingId: number): Promise<schema.ContactAccess>;
  
  // Notification methods
  createNotification(notification: schema.InsertNotification): Promise<schema.Notification>;
  getNotificationsByUserId(userId: number, unreadOnly?: boolean): Promise<schema.Notification[]>;
  markNotificationAsRead(id: number): Promise<schema.Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }
  
  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0];
  }
  
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const created = await db.insert(schema.users).values(user).returning();
    return created[0];
  }
  
  async updateUser(id: number, user: Partial<schema.User>): Promise<schema.User | undefined> {
    const updated = await db.update(schema.users).set(user).where(eq(schema.users.id, id)).returning();
    return updated[0];
  }
  
  // Verification methods
  async createVerification(verification: schema.InsertVerification): Promise<schema.Verification> {
    const created = await db.insert(schema.verifications).values(verification).returning();
    return created[0];
  }
  
  async getVerification(id: number): Promise<schema.Verification | undefined> {
    const verifications = await db.select().from(schema.verifications).where(eq(schema.verifications.id, id));
    return verifications[0];
  }
  
  async getVerificationsByUserId(userId: number): Promise<schema.Verification[]> {
    return await db.select().from(schema.verifications).where(eq(schema.verifications.userId, userId));
  }
  
  async updateVerification(id: number, verificationData: Partial<schema.Verification>): Promise<schema.Verification | undefined> {
    const updated = await db.update(schema.verifications).set(verificationData).where(eq(schema.verifications.id, id)).returning();
    return updated[0];
  }
  
  // Listing methods
  async createListing(listing: schema.InsertListing): Promise<schema.Listing> {
    const created = await db.insert(schema.listings).values(listing).returning();
    return created[0];
  }
  
  async getListing(id: number): Promise<schema.Listing | undefined> {
    const listings = await db.select().from(schema.listings).where(eq(schema.listings.id, id));
    return listings[0];
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
  } = {}): Promise<schema.Listing[]> {
    const query = db.select().from(schema.listings);
    
    if (params.userId) {
      query.where(eq(schema.listings.userId, params.userId));
    }
    
    if (params.type) {
      query.where(eq(schema.listings.type, params.type));
    }
    
    if (params.category) {
      query.where(eq(schema.listings.category, params.category));
    }
    
    if (params.minPrice) {
      query.where(gte(schema.listings.price, params.minPrice));
    }
    
    if (params.maxPrice) {
      query.where(lte(schema.listings.price, params.maxPrice));
    }
    
    if (params.approved !== undefined) {
      query.where(eq(schema.listings.approved, params.approved));
    }
    
    if (params.featured !== undefined) {
      query.where(eq(schema.listings.featured, params.featured));
    }
    
    query.orderBy(desc(schema.listings.createdAt));
    
    if (params.limit) {
      query.limit(params.limit);
    }
    
    if (params.offset) {
      query.offset(params.offset);
    }
    
    return await query;
  }
  
  async getFeaturedListings(limit = 5): Promise<schema.Listing[]> {
    return await db.select()
      .from(schema.listings)
      .where(and(
        eq(schema.listings.featured, true),
        eq(schema.listings.approved, true)
      ))
      .orderBy(desc(schema.listings.createdAt))
      .limit(limit);
  }
  
  async getRecentListings(limit = 10): Promise<schema.Listing[]> {
    return await db.select()
      .from(schema.listings)
      .where(eq(schema.listings.approved, true))
      .orderBy(desc(schema.listings.createdAt))
      .limit(limit);
  }
  
  async getNearbyListings(lat: number, lng: number, radiusKm = 5, limit = 10): Promise<schema.Listing[]> {
    // Get all approved listings
    const listings = await db.select()
      .from(schema.listings)
      .where(eq(schema.listings.approved, true));
    
    // Filter by distance (this would be better done in the database with a spatial query)
    const nearbyListings = listings.filter(listing => {
      const distance = calculateDistance(lat, lng, listing.latitude, listing.longitude);
      return distance <= radiusKm;
    });
    
    // Sort by creation date
    nearbyListings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Return limited results
    return nearbyListings.slice(0, limit);
  }
  
  async updateListing(id: number, listingData: Partial<schema.Listing>): Promise<schema.Listing | undefined> {
    const updated = await db.update(schema.listings).set(listingData).where(eq(schema.listings.id, id)).returning();
    return updated[0];
  }
  
  async deleteListing(id: number): Promise<boolean> {
    const deleted = await db.delete(schema.listings).where(eq(schema.listings.id, id)).returning();
    return deleted.length > 0;
  }
  
  // Amenity methods
  async createAmenity(amenity: schema.InsertAmenity): Promise<schema.Amenity> {
    const created = await db.insert(schema.amenities).values(amenity).returning();
    return created[0];
  }
  
  async getAmenitiesByListingId(listingId: number): Promise<schema.Amenity[]> {
    return await db.select().from(schema.amenities).where(eq(schema.amenities.listingId, listingId));
  }
  
  // Conversation methods
  async createConversation(conversation: schema.InsertConversation): Promise<schema.Conversation> {
    const created = await db.insert(schema.conversations).values(conversation).returning();
    return created[0];
  }
  
  async getConversation(id: number): Promise<schema.Conversation | undefined> {
    const conversations = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
    return conversations[0];
  }
  
  async getConversationByParticipants(renterId: number, ownerId: number, listingId: number): Promise<schema.Conversation | undefined> {
    const conversations = await db.select().from(schema.conversations).where(
      and(
        eq(schema.conversations.renterId, renterId),
        eq(schema.conversations.ownerId, ownerId),
        eq(schema.conversations.listingId, listingId)
      )
    );
    return conversations[0];
  }
  
  async getConversationsByUserId(userId: number): Promise<schema.Conversation[]> {
    return await db.select().from(schema.conversations).where(
      or(
        eq(schema.conversations.renterId, userId),
        eq(schema.conversations.ownerId, userId)
      )
    ).orderBy(desc(schema.conversations.lastMessageAt));
  }
  
  async updateConversationLastMessageTime(id: number): Promise<schema.Conversation | undefined> {
    const updated = await db.update(schema.conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(schema.conversations.id, id))
      .returning();
    return updated[0];
  }
  
  // Message methods
  async createMessage(message: schema.InsertMessage): Promise<schema.Message> {
    const created = await db.insert(schema.messages).values(message).returning();
    
    // Update conversation last message time
    await this.updateConversationLastMessageTime(message.conversationId);
    
    return created[0];
  }
  
  async getMessagesByConversationId(conversationId: number, limit = 50, offset = 0): Promise<schema.Message[]> {
    return await db.select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async markMessagesAsRead(conversationId: number, userId: number): Promise<boolean> {
    const updated = await db.update(schema.messages)
      .set({ read: true })
      .where(
        and(
          eq(schema.messages.conversationId, conversationId),
          eq(schema.messages.read, false)
        )
      )
      .returning();
    return updated.length > 0;
  }
  
  // Payment methods
  async createPayment(payment: schema.InsertPayment): Promise<schema.Payment> {
    const created = await db.insert(schema.payments).values(payment).returning();
    return created[0];
  }
  
  async getPayment(id: number): Promise<schema.Payment | undefined> {
    const payments = await db.select().from(schema.payments).where(eq(schema.payments.id, id));
    return payments[0];
  }
  
  async getPaymentByReference(reference: string): Promise<schema.Payment | undefined> {
    const payments = await db.select().from(schema.payments).where(eq(schema.payments.reference, reference));
    return payments[0];
  }
  
  async updatePayment(id: number, paymentData: Partial<schema.Payment>): Promise<schema.Payment | undefined> {
    const updated = await db.update(schema.payments).set(paymentData).where(eq(schema.payments.id, id)).returning();
    return updated[0];
  }
  
  async getPaymentsByUserId(userId: number): Promise<schema.Payment[]> {
    return await db.select().from(schema.payments).where(eq(schema.payments.userId, userId));
  }
  
  // Contact access methods
  async createContactAccess(access: schema.InsertContactAccess): Promise<schema.ContactAccess> {
    const created = await db.insert(schema.contactAccess).values(access).returning();
    return created[0];
  }
  
  async getContactAccess(userId: number, listingId: number): Promise<schema.ContactAccess | undefined> {
    const accesses = await db.select().from(schema.contactAccess).where(
      and(
        eq(schema.contactAccess.userId, userId),
        eq(schema.contactAccess.listingId, listingId)
      )
    );
    return accesses[0];
  }
  
  async grantContactAccess(userId: number, listingId: number, paymentId?: number): Promise<schema.ContactAccess> {
    // Check if access already exists
    const existingAccess = await this.getContactAccess(userId, listingId);
    
    if (existingAccess) {
      // Update existing access
      const updated = await db.update(schema.contactAccess)
        .set({ 
          granted: true,
          paymentId: paymentId || existingAccess.paymentId 
        })
        .where(eq(schema.contactAccess.id, existingAccess.id))
        .returning();
      
      return updated[0];
    } else {
      // Create new access
      return await this.createContactAccess({
        userId,
        listingId,
        granted: true,
        paymentId,
        grantedByAdmin: false
      });
    }
  }
  
  async grantContactAccessByAdmin(userId: number, listingId: number): Promise<schema.ContactAccess> {
    // Check if access already exists
    const existingAccess = await this.getContactAccess(userId, listingId);
    
    if (existingAccess) {
      // Update existing access
      const updated = await db.update(schema.contactAccess)
        .set({ 
          granted: true,
          grantedByAdmin: true 
        })
        .where(eq(schema.contactAccess.id, existingAccess.id))
        .returning();
      
      return updated[0];
    } else {
      // Create new access
      return await this.createContactAccess({
        userId,
        listingId,
        granted: true,
        grantedByAdmin: true
      });
    }
  }
  
  // Notification methods
  async createNotification(notification: schema.InsertNotification): Promise<schema.Notification> {
    const created = await db.insert(schema.notifications).values(notification).returning();
    return created[0];
  }
  
  async getNotificationsByUserId(userId: number, unreadOnly = false): Promise<schema.Notification[]> {
    let query = db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(eq(schema.notifications.read, false));
    }
    
    return await query.orderBy(desc(schema.notifications.createdAt));
  }
  
  async markNotificationAsRead(id: number): Promise<schema.Notification | undefined> {
    const updated = await db.update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.id, id))
      .returning();
    return updated[0];
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const updated = await db.update(schema.notifications)
      .set({ read: true })
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.read, false)
        )
      )
      .returning();
    return updated.length > 0;
  }
}

// Export a single instance
export const storage: IStorage = new DatabaseStorage();