import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // renter, landlord, manager, admin
  companyName: text("company_name"),
  licenseNumber: text("license_number"),
  isVerified: boolean("is_verified").default(false),
  verificationMethod: text("verification_method"), // nin, bvn
  verificationId: text("verification_id"),
  createdAt: timestamp("created_at").defaultNow(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

// Verification model
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // nin, bvn
  documentNumber: text("document_number").notNull(),
  status: text("status").notNull(), // pending, verified, rejected
  verificationData: json("verification_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Property listing model
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 1 room, 2 room, self-contain, flat, duplex, warehouse, shop, hall
  category: text("category").notNull(), // long-term, short-term
  description: text("description").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  photos: json("photos").notNull(), // array of photo URLs
  availableFrom: timestamp("available_from"),
  availableTo: timestamp("available_to"),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareMeters: integer("square_meters"),
  approved: boolean("approved").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  approved: true,
  featured: true,
  createdAt: true,
  updatedAt: true,
});

// Amenities for listings
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  name: text("name").notNull(),
});

export const insertAmenitySchema = createInsertSchema(amenities).omit({
  id: true,
});

// Conversations between users
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  renterId: integer("renter_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
});

// Messages in conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  text: text("text").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id"),
  type: text("type").notNull(), // listing_fee, contact_fee
  amount: integer("amount").notNull(), // in kobo
  reference: text("reference").notNull(),
  status: text("status").notNull(), // pending, successful, failed
  paystackResponse: json("paystack_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Access control for contacts
export const contactAccess = pgTable("contact_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  granted: boolean("granted").notNull().default(false),
  paymentId: integer("payment_id"),
  grantedByAdmin: boolean("granted_by_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactAccessSchema = createInsertSchema(contactAccess).omit({
  id: true,
  grantedByAdmin: true,
  createdAt: true,
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // message, payment, listing, verification
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false),
  data: json("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ContactAccess = typeof contactAccess.$inferSelect;
export type InsertContactAccess = z.infer<typeof insertContactAccessSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings, { relationName: 'userListings' }),
  conversationsAsOwner: many(conversations, { relationName: 'owner' }),
  conversationsAsRenter: many(conversations, { relationName: 'renter' }),
  messages: many(messages),
  payments: many(payments),
  verifications: many(verifications),
  contactAccess: many(contactAccess),
  notifications: many(notifications),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id], relationName: 'userListings' }),
  amenities: many(amenities),
  conversations: many(conversations),
  payments: many(payments),
  contactAccess: many(contactAccess),
}));

export const amenitiesRelations = relations(amenities, ({ one }) => ({
  listing: one(listings, { fields: [amenities.listingId], references: [listings.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  listing: one(listings, { fields: [conversations.listingId], references: [listings.id] }),
  owner: one(users, { fields: [conversations.ownerId], references: [users.id], relationName: 'owner' }),
  renter: one(users, { fields: [conversations.renterId], references: [users.id], relationName: 'renter' }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  listing: one(listings, { fields: [payments.listingId], references: [listings.id] }),
  contactAccess: many(contactAccess),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  user: one(users, { fields: [verifications.userId], references: [users.id] }),
}));

export const contactAccessRelations = relations(contactAccess, ({ one }) => ({
  user: one(users, { fields: [contactAccess.userId], references: [users.id] }),
  listing: one(listings, { fields: [contactAccess.listingId], references: [listings.id] }),
  payment: one(payments, { fields: [contactAccess.paymentId], references: [payments.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
