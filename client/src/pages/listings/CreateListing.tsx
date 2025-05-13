import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PROPERTY_TYPES, PROPERTY_CATEGORIES, AMENITIES, ROUTES } from "@/config/constants";
import MapPicker from "@/components/MapPicker";
import listingService from "@/services/listing-service";
import paymentService from "@/services/payment-service";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Card, CardContent } from "@/components/ui/card";

// Form schema
const createListingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  type: z.string().min(1, { message: "Property type is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  price: z.number().min(1000, { message: "Price must be at least ₦1,000" }),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  squareMeters: z.number().optional(),
  availableFrom: z.date().optional(),
  featured: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
});

type CreateListingFormValues = z.infer<typeof createListingSchema>;

const CreateListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Initialize form
  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      type: "",
      category: "",
      description: "",
      address: "",
      price: 0,
      bedrooms: undefined,
      bathrooms: undefined,
      squareMeters: undefined,
      availableFrom: undefined,
      featured: false,
      amenities: [],
    },
  });

  // Handle form submission
  const onSubmit = async (data: CreateListingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!coordinates) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    if (uploadedPhotos.length === 0) {
      toast({
        title: "Photos Required",
        description: "Please upload at least one photo",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create listing
      const listingData = {
        ...data,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        photos: uploadedPhotos,
        amenities: selectedAmenities,
      };

      const listing = await listingService.createListing(listingData as any);
      
      // Handle payment for listing creation
      try {
        // For paid listings, initiate payment
        const paymentInitiation = await paymentService.initiateListingPayment(
          listing.id,
          data.featured || false
        );
        
        // Process payment and verify
        await paymentService.processPayment(
          paymentInitiation.reference,
          paymentInitiation.paymentId
        );
        
        toast({
          title: "Listing Created!",
          description: "Your property has been listed successfully.",
        });
        
        // Navigate to the new listing
        navigate(`/listings/${listing.id}`);
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        toast({
          title: "Listing Created, Payment Failed",
          description: "Your listing was created but the payment couldn't be processed. It will be pending until payment is completed.",
          variant: "destructive",
        });
        
        // Navigate to user's listings
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (coords: { lat: number; lng: number }, address: string) => {
    setCoordinates(coords);
    form.setValue("address", address);
  };

  // Handle photo upload (simulated)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real app, we would upload these to a storage service
    // For now, we'll use placeholder URLs
    const newPhotos = Array.from(files).map(
      (_, index) => `https://via.placeholder.com/800x600?text=Property+Photo+${uploadedPhotos.length + index + 1}`
    );

    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    
    toast({
      title: "Photos Uploaded",
      description: `${files.length} photo(s) uploaded successfully`,
    });
  };

  // Handle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Create New Property Listing</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Property Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Modern 3 Bedroom Apartment in Lekki" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}

                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of your property" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 12 Freedom Way, Lekki Phase 1, Lagos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-64 bg-neutral-100 rounded-md mb-2">
                  <MapPicker
                    onLocationSelect={handleLocationSelect}
                    height="256px"
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Drag the marker or search for an address to set the exact location
                </p>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Property Details</h2>
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Price (₦)*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 150000"
                          onChange={e => {
                            const v = e.target.value
                            // interpret empty string as zero (or you could choose `undefined`)
                            const num = v === "" ? 0 : parseFloat(v)
                            field.onChange(isNaN(num) ? 0 : num)
                          }}
                          // never feed NaN back into the input
                          value={isNaN(field.value) ? "" : field.value}
                        />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 3" 
                            onChange={e => {
                              const v = e.target.value;
                              // if they clear the box, go back to undefined
                              const asNum = v === "" ? undefined : parseFloat(v);
                              // if parseFloat produced NaN, fall back to undefined
                              field.onChange(isNaN(asNum as number) ? undefined : asNum);
                            }}
                            // if the field is undefined (or somehow NaN), render as empty string
                            value={field.value === undefined || isNaN(field.value) ? "" : field.value}
                          />

                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 2" 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            value={field.value === undefined ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="squareMeters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (m²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 120" 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            value={field.value === undefined ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Listing</FormLabel>
                          <p className="text-sm text-neutral-500">
                            Featured listings appear at the top of search results and on the homepage (additional fee applies)
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Amenities</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Photos</h2>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <i className="fas fa-cloud-upload-alt text-2xl text-neutral-500 mb-2"></i>
                        <p className="mb-2 text-sm text-neutral-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-neutral-500">
                          PNG, JPG or WEBP (MAX. 5MB per file)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        multiple
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Uploaded Photos ({uploadedPhotos.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative h-24 bg-neutral-100 rounded-md overflow-hidden">
                          <img
                            src={photo}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
                            onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                          >
                            <i className="fas fa-times text-white text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Create Listing
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateListing;