import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertVerificationSchema,
  insertListingSchema,
  insertMessageSchema,
  insertPaymentSchema,
  insertContactAccessSchema,
  User,
} from "@shared/schema";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(
    session({
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new SessionStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "kribs-session-secret",
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Allow login with email or username
        const isEmail = username.includes("@");
        const user = isEmail
          ? await storage.getUserByEmail(username)
          : await storage.getUserByUsername(username);

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }

  // Middleware to check role
  function checkRole(roles: string[]) {
    return (req: Request, res: Response, next: Function) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as User;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    };
  }

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ authenticated: false });
    }
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    res.json({ authenticated: true, user: userWithoutPassword });
  });

  // User routes
  app.get("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const updatedUser = await storage.updateUser(user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Verification routes
  app.post("/api/verifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const validatedData = insertVerificationSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const verification = await storage.createVerification(validatedData);
      
      // In a real app, this would call Mono or Smile Identity API
      // For now, we'll just auto-approve verification
      const updatedVerification = await storage.updateVerification(
        verification.id,
        { status: "verified" }
      );
      
      // Update user verification status
      await storage.updateUser(user.id, { 
        isVerified: true,
        verificationMethod: validatedData.type,
        verificationId: validatedData.documentNumber
      });
      
      res.status(201).json(updatedVerification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating verification" });
    }
  });

  app.get("/api/verifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const verifications = await storage.getVerificationsByUserId(user.id);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching verifications" });
    }
  });

  // Listing routes
  app.post("/api/listings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const validatedData = insertListingSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const listing = await storage.createListing(validatedData);
      
      // Add amenities if provided
      if (req.body.amenities && Array.isArray(req.body.amenities)) {
        for (const amenityName of req.body.amenities) {
          await storage.createAmenity({
            listingId: listing.id,
            name: amenityName,
          });
        }
      }
      
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating listing" });
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const {
        userId,
        type,
        category,
        minPrice,
        maxPrice,
        limit,
        offset,
      } = req.query;
      
      const params: any = {};
      
      if (userId) params.userId = Number(userId);
      if (type) params.type = type as string;
      if (category) params.category = category as string;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (limit) params.limit = Number(limit);
      if (offset) params.offset = Number(offset);
      
      // Only show approved listings to the public
      params.approved = true;
      
      const listings = await storage.getListings(params);
      
      // Fetch amenities for each listing
      const listingsWithAmenities = await Promise.all(
        listings.map(async (listing) => {
          const amenities = await storage.getAmenitiesByListingId(listing.id);
          return { ...listing, amenities };
        })
      );
      
      res.json(listingsWithAmenities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching listings" });
    }
  });

  app.get("/api/listings/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const featuredListings = await storage.getFeaturedListings(limit);
      
      // Fetch amenities for each listing
      const listingsWithAmenities = await Promise.all(
        featuredListings.map(async (listing) => {
          const amenities = await storage.getAmenitiesByListingId(listing.id);
          return { ...listing, amenities };
        })
      );
      
      res.json(listingsWithAmenities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured listings" });
    }
  });

  app.get("/api/listings/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const recentListings = await storage.getRecentListings(limit);
      
      // Fetch amenities for each listing
      const listingsWithAmenities = await Promise.all(
        recentListings.map(async (listing) => {
          const amenities = await storage.getAmenitiesByListingId(listing.id);
          return { ...listing, amenities };
        })
      );
      
      res.json(listingsWithAmenities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent listings" });
    }
  });

  app.get("/api/listings/nearby", async (req, res) => {
    try {
      const { lat, lng, radius, limit } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const nearbyListings = await storage.getNearbyListings(
        Number(lat),
        Number(lng),
        radius ? Number(radius) : 5,
        limit ? Number(limit) : 10
      );
      
      // Fetch amenities for each listing
      const listingsWithAmenities = await Promise.all(
        nearbyListings.map(async (listing) => {
          const amenities = await storage.getAmenitiesByListingId(listing.id);
          return { ...listing, amenities };
        })
      );
      
      res.json(listingsWithAmenities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching nearby listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(Number(req.params.id));
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get amenities
      const amenities = await storage.getAmenitiesByListingId(listing.id);
      
      // Check if current user has access to contact info
      let hasContactAccess = false;
      if (req.isAuthenticated()) {
        const user = req.user as User;
        const access = await storage.getContactAccess(user.id, listing.id);
        hasContactAccess = access?.granted || false;
      }
      
      res.json({ ...listing, amenities, hasContactAccess });
    } catch (error) {
      res.status(500).json({ message: "Error fetching listing" });
    }
  });

  app.put("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const listingId = Number(req.params.id);
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if user owns the listing or is an admin
      if (listing.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }
      
      const updatedListing = await storage.updateListing(listingId, req.body);
      
      // Update amenities if provided
      if (req.body.amenities && Array.isArray(req.body.amenities)) {
        // Remove existing amenities (simplified approach)
        const existingAmenities = await storage.getAmenitiesByListingId(listingId);
        for (const amenity of existingAmenities) {
          // In a real app, we would use a proper delete method
          // For now, we'll just create new ones
        }
        
        // Add new amenities
        for (const amenityName of req.body.amenities) {
          await storage.createAmenity({
            listingId: listing.id,
            name: amenityName,
          });
        }
      }
      
      res.json(updatedListing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating listing" });
    }
  });

  app.delete("/api/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const listingId = Number(req.params.id);
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if user owns the listing or is an admin
      if (listing.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }
      
      await storage.deleteListing(listingId);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting listing" });
    }
  });

  // Message and conversation routes
  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { listingId, ownerId } = req.body;
      
      if (!listingId || !ownerId) {
        return res.status(400).json({ message: "Listing ID and owner ID are required" });
      }
      
      // Check if conversation already exists
      let conversation = await storage.getConversationByParticipants(
        user.id,
        Number(ownerId),
        Number(listingId)
      );
      
      // If not, create a new one
      if (!conversation) {
        conversation = await storage.createConversation({
          listingId: Number(listingId),
          renterId: user.id,
          ownerId: Number(ownerId),
        });
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Error creating conversation" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const conversations = await storage.getConversationsByUserId(user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const conversationId = Number(req.params.id);
      
      // Validate message
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        senderId: user.id,
      });
      
      // Check if conversation exists and user is a participant
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.renterId !== user.id && conversation.ownerId !== user.id) {
        return res.status(403).json({ message: "Not authorized to send messages in this conversation" });
      }
      
      // Check if user has access to contact info (if renter)
      if (user.id === conversation.renterId) {
        const access = await storage.getContactAccess(user.id, conversation.listingId);
        if (!access || !access.granted) {
          return res.status(403).json({ message: "Contact access required to send messages" });
        }
      }
      
      const message = await storage.createMessage(validatedData);
      
      // Create notification for recipient
      const recipientId = user.id === conversation.renterId 
        ? conversation.ownerId 
        : conversation.renterId;
      
      await storage.createNotification({
        userId: recipientId,
        type: "message",
        title: "New Message",
        body: `You have a new message from ${user.firstName} ${user.lastName}`,
        data: { conversationId, messageId: message.id }
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const conversationId = Number(req.params.id);
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      
      // Check if conversation exists and user is a participant
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.renterId !== user.id && conversation.ownerId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view messages in this conversation" });
      }
      
      // Check if user has access to contact info (if renter)
      if (user.id === conversation.renterId) {
        const access = await storage.getContactAccess(user.id, conversation.listingId);
        if (!access || !access.granted) {
          return res.status(403).json({ message: "Contact access required to view messages" });
        }
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId, limit, offset);
      
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, user.id);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Payment routes
  app.post("/api/payments/initiate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { type, listingId, amount } = req.body;
      
      if (!type || !amount) {
        return res.status(400).json({ message: "Payment type and amount are required" });
      }
      
      // Generate a unique reference
      const reference = `KR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Create payment record
      const payment = await storage.createPayment({
        userId: user.id,
        listingId: listingId ? Number(listingId) : undefined,
        type,
        amount: Number(amount),
        reference,
        status: "pending",
        paystackResponse: null,
      });
      
      // In a real app, we would call Paystack API here
      // For now, we'll just return the payment info
      
      res.status(201).json({
        payment,
        paystack: {
          reference,
          authorization_url: `https://example.com/pay?ref=${reference}`,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error initiating payment" });
    }
  });

  app.post("/api/payments/verify", isAuthenticated, async (req, res) => {
    try {
      const { reference } = req.body;
      
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }
      
      // Find payment by reference
      const payment = await storage.getPaymentByReference(reference);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // In a real app, we would call Paystack API to verify payment
      // For now, we'll just update the payment status
      
      const updatedPayment = await storage.updatePayment(payment.id, {
        status: "successful",
        paystackResponse: { status: "success", message: "Payment verified" },
      });
      
      // If payment is for contact access, grant access
      if (payment.type === "contact_fee" && payment.listingId) {
        await storage.grantContactAccess(payment.userId, payment.listingId, payment.id);
      }
      
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Error verifying payment" });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const payments = await storage.getPaymentsByUserId(user.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  // Contact access routes
  app.post("/api/contact-access", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { listingId } = req.body;
      
      if (!listingId) {
        return res.status(400).json({ message: "Listing ID is required" });
      }
      
      // Check if user already has access
      const existingAccess = await storage.getContactAccess(user.id, Number(listingId));
      if (existingAccess && existingAccess.granted) {
        return res.json(existingAccess);
      }
      
      // Create a request for access
      const accessRequest = await storage.createContactAccess({
        userId: user.id,
        listingId: Number(listingId),
        granted: false,
      });
      
      res.status(201).json(accessRequest);
    } catch (error) {
      res.status(500).json({ message: "Error requesting contact access" });
    }
  });

  app.get("/api/contact-access/:listingId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const listingId = Number(req.params.listingId);
      
      const access = await storage.getContactAccess(user.id, listingId);
      
      if (!access) {
        return res.json({ hasAccess: false });
      }
      
      res.json({ hasAccess: access.granted, ...access });
    } catch (error) {
      res.status(500).json({ message: "Error checking contact access" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const unreadOnly = req.query.unread === "true";
      
      const notifications = await storage.getNotificationsByUserId(user.id, unreadOnly);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = Number(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  app.put("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking notifications as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
