/**
 * Mock data for development
 * This file provides temporary data while we set up the backend services
 */

export const mockListings = [
  {
    id: 1,
    title: "Modern 3 Bedroom Apartment in Lekki",
    type: "Apartment",
    category: "For Rent",
    address: "12 Freedom Way, Lekki Phase 1, Lagos",
    price: 1500000,
    description: "This beautiful 3 bedroom apartment is located in the heart of Lekki Phase 1. It features modern amenities including 24/7 power supply, security, and a communal swimming pool. Perfect for young professionals or small families.",
    bedrooms: 3,
    bathrooms: 3,
    squareMeters: 120,
    latitude: 6.4281,
    longitude: 3.4219,
    featured: true,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-12-01",
    createdAt: "2023-11-15T10:30:00Z",
    updatedAt: "2023-11-15T10:30:00Z",
    userId: 2,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 1, listingId: 1, name: "Swimming Pool" },
      { id: 2, listingId: 1, name: "24/7 Electricity" },
      { id: 3, listingId: 1, name: "Security" },
      { id: 4, listingId: 1, name: "Air Conditioning" },
      { id: 5, listingId: 1, name: "Parking Space" }
    ]
  },
  {
    id: 2,
    title: "Luxury 5 Bedroom Villa in Banana Island",
    type: "House",
    category: "For Sale",
    address: "7 Ocean View Drive, Banana Island, Ikoyi, Lagos",
    price: 350000000,
    description: "Luxurious 5 bedroom villa on Banana Island with breathtaking ocean views. This property features premium finishes, smart home technology, a private pool, home gym, and cinema room. Gated community with 24/7 security.",
    bedrooms: 5,
    bathrooms: 6,
    squareMeters: 450,
    latitude: 6.4236,
    longitude: 3.4240,
    featured: true,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-11-20",
    createdAt: "2023-11-01T15:45:00Z",
    updatedAt: "2023-11-10T11:20:00Z",
    userId: 3,
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 6, listingId: 2, name: "Private Pool" },
      { id: 7, listingId: 2, name: "Home Gym" },
      { id: 8, listingId: 2, name: "Cinema Room" },
      { id: 9, listingId: 2, name: "Smart Home System" },
      { id: 10, listingId: 2, name: "Ocean View" },
      { id: 11, listingId: 2, name: "Elevator" }
    ]
  },
  {
    id: 3,
    title: "Cozy 2 Bedroom Flat in Surulere",
    type: "Apartment",
    category: "For Rent",
    address: "45 Adeniran Ogunsanya St, Surulere, Lagos",
    price: 800000,
    description: "Cozy and affordable 2 bedroom flat in the heart of Surulere. Recently renovated with new kitchen appliances and bathroom fixtures. Located close to shopping centers, restaurants, and public transportation.",
    bedrooms: 2,
    bathrooms: 2,
    squareMeters: 85,
    latitude: 6.5059,
    longitude: 3.3551,
    featured: false,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-11-15",
    createdAt: "2023-11-05T09:15:00Z",
    updatedAt: "2023-11-05T09:15:00Z",
    userId: 4,
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1630699144867-37acec97df5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 12, listingId: 3, name: "Newly Renovated" },
      { id: 13, listingId: 3, name: "24/7 Security" },
      { id: 14, listingId: 3, name: "Parking Space" }
    ]
  },
  {
    id: 4,
    title: "Contemporary 4 Bedroom Townhouse in Victoria Island",
    type: "Townhouse",
    category: "For Rent",
    address: "17 Adeola Hopewell St, Victoria Island, Lagos",
    price: 5000000,
    description: "Contemporary townhouse in Victoria Island's prime location. This 4 bedroom property offers spacious living areas, premium finishes, and a private garden. Walking distance to major corporate offices and upscale restaurants.",
    bedrooms: 4,
    bathrooms: 4.5,
    squareMeters: 250,
    latitude: 6.4286,
    longitude: 3.4231,
    featured: true,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-12-15",
    createdAt: "2023-11-10T14:20:00Z",
    updatedAt: "2023-11-14T11:35:00Z",
    userId: 2,
    photos: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHRvd25ob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdXNlJTIwaW50ZXJpb3J8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 15, listingId: 4, name: "Private Garden" },
      { id: 16, listingId: 4, name: "24/7 Electricity" },
      { id: 17, listingId: 4, name: "Security" },
      { id: 18, listingId: 4, name: "Air Conditioning" },
      { id: 19, listingId: 4, name: "Imported Finishes" }
    ]
  },
  {
    id: 5,
    title: "Studio Apartment near University of Lagos",
    type: "Studio",
    category: "For Rent",
    address: "28 University Road, Akoka, Yaba, Lagos",
    price: 450000,
    description: "Compact studio apartment perfect for students or young professionals. Located minutes from University of Lagos campus with easy access to public transportation. All utilities included in rent.",
    bedrooms: 0,
    bathrooms: 1,
    squareMeters: 35,
    latitude: 6.5186,
    longitude: 3.3855,
    featured: false,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-11-10",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
    userId: 5,
    photos: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3R1ZGlvJTIwYXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1585129777188-a188e1e26ed5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN0dWRpbyUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 20, listingId: 5, name: "Utilities Included" },
      { id: 21, listingId: 5, name: "Security" },
      { id: 22, listingId: 5, name: "Close to Campus" }
    ]
  },
  {
    id: 6,
    title: "Commercial Space in Victoria Island Business District",
    type: "Commercial",
    category: "For Rent",
    address: "15 Idowu Taylor St, Victoria Island, Lagos",
    price: 8000000,
    description: "Prime commercial space in Victoria Island's business district. Perfect for corporate offices, retail, or service businesses. Open floor plan with options for customization. Building features 24/7 power, security, and parking.",
    squareMeters: 300,
    latitude: 6.4309,
    longitude: 3.4258,
    featured: false,
    verified: true,
    approved: true,
    available: true,
    availableFrom: "2023-12-01",
    createdAt: "2023-11-10T11:30:00Z",
    updatedAt: "2023-11-10T11:30:00Z",
    userId: 3,
    photos: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2ZmaWNlJTIwc3BhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2ZmaWNlJTIwc3BhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
    ],
    amenities: [
      { id: 23, listingId: 6, name: "24/7 Electricity" },
      { id: 24, listingId: 6, name: "Security" },
      { id: 25, listingId: 6, name: "Parking Space" },
      { id: 26, listingId: 6, name: "High-speed Internet" },
      { id: 27, listingId: 6, name: "Central Air Conditioning" }
    ]
  }
];

export const mockUsers = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+2348012345678",
    role: "renter",
    isVerified: true,
    verificationMethod: "NIN",
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-01T10:00:00Z"
  },
  {
    id: 2,
    username: "landlord1",
    email: "landlord1@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+2348023456789",
    role: "landlord",
    companyName: "Johnson Properties",
    isVerified: true,
    verificationMethod: "BVN",
    createdAt: "2023-10-02T11:30:00Z",
    updatedAt: "2023-10-02T11:30:00Z"
  },
  {
    id: 3,
    username: "agent1",
    email: "agent1@example.com",
    firstName: "Michael",
    lastName: "Chen",
    phone: "+2348034567890",
    role: "manager",
    companyName: "Luxury Real Estate Ltd",
    licenseNumber: "REA-12345",
    isVerified: true,
    verificationMethod: "BVN",
    createdAt: "2023-10-03T09:15:00Z",
    updatedAt: "2023-10-03T09:15:00Z"
  },
  {
    id: 4,
    username: "landlord2",
    email: "landlord2@example.com",
    firstName: "Oluwaseun",
    lastName: "Adebayo",
    phone: "+2348045678901",
    role: "landlord",
    isVerified: false,
    createdAt: "2023-10-05T14:20:00Z",
    updatedAt: "2023-10-05T14:20:00Z"
  },
  {
    id: 5,
    username: "agent2",
    email: "agent2@example.com",
    firstName: "Chioma",
    lastName: "Okafor",
    phone: "+2348056789012",
    role: "manager",
    companyName: "Okafor Properties",
    licenseNumber: "REA-67890",
    isVerified: true,
    verificationMethod: "NIN",
    createdAt: "2023-10-10T08:45:00Z",
    updatedAt: "2023-10-10T08:45:00Z"
  }
];

export const mockConversations = [
  {
    id: 1,
    listingId: 1,
    renterId: 1,
    ownerId: 2,
    createdAt: "2023-11-10T09:30:00Z",
    lastMessageAt: "2023-11-15T14:20:00Z"
  },
  {
    id: 2,
    listingId: 3,
    renterId: 1,
    ownerId: 4,
    createdAt: "2023-11-12T10:15:00Z",
    lastMessageAt: "2023-11-14T11:45:00Z"
  }
];

export const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 1,
    text: "Hello, I'm interested in your apartment in Lekki. Is it still available?",
    read: true,
    createdAt: "2023-11-10T09:30:00Z"
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 2,
    text: "Yes, it's still available. Would you like to schedule a viewing?",
    read: true,
    createdAt: "2023-11-10T10:05:00Z"
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 1,
    text: "That would be great. I'm available this weekend, either Saturday or Sunday afternoon.",
    read: true,
    createdAt: "2023-11-10T10:30:00Z"
  },
  {
    id: 4,
    conversationId: 1,
    senderId: 2,
    text: "Perfect! Let's do Saturday at 2 PM. I'll send you the exact location details.",
    read: true,
    createdAt: "2023-11-10T11:15:00Z"
  },
  {
    id: 5,
    conversationId: 1,
    senderId: 1,
    text: "That works for me. Looking forward to it!",
    read: true,
    createdAt: "2023-11-10T11:30:00Z"
  },
  {
    id: 6,
    conversationId: 1,
    senderId: 2,
    text: "By the way, do you have any specific questions about the property before our meeting?",
    read: true,
    createdAt: "2023-11-15T14:20:00Z"
  },
  {
    id: 7,
    conversationId: 2,
    senderId: 1,
    text: "Hi, I saw your listing for the 2-bedroom flat in Surulere. What's the parking situation like?",
    read: true,
    createdAt: "2023-11-12T10:15:00Z"
  },
  {
    id: 8,
    conversationId: 2,
    senderId: 4,
    text: "Hello! There's a dedicated parking spot for the flat, plus additional visitor parking in the complex.",
    read: true,
    createdAt: "2023-11-12T13:45:00Z"
  },
  {
    id: 9,
    conversationId: 2,
    senderId: 1,
    text: "That's great. Is the apartment on the ground floor or upstairs?",
    read: true,
    createdAt: "2023-11-13T09:20:00Z"
  },
  {
    id: 10,
    conversationId: 2,
    senderId: 4,
    text: "It's on the first floor. There's a small shared garden area as well.",
    read: true,
    createdAt: "2023-11-14T11:45:00Z"
  }
];

export default {
  listings: mockListings,
  users: mockUsers,
  conversations: mockConversations,
  messages: mockMessages
};