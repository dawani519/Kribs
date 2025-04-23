import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from './ui/sheet';
import { Switch } from './ui/switch';
import { PROPERTY_TYPES, PROPERTY_CATEGORIES } from '../config/constants';
import { formatPrice } from '../lib/utils';

interface Filter {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  nearMe?: boolean;
}

interface SearchFilterBarProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Filter) => void;
  initialQuery?: string;
  initialFilters?: Filter;
}

/**
 * SearchFilterBar component - provides filtering and search for listings
 */
const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  onSearch,
  onFilter,
  initialQuery = '',
  initialFilters = {},
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Filter states
  const [filters, setFilters] = useState<Filter>(initialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000000
  ]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsSearchFocused(false);
  };
  
  // Update filter state
  const updateFilter = (key: keyof Filter, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    // Update min/max price from slider
    const updatedFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    
    onFilter(updatedFilters);
    setShowFilterSheet(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setPriceRange([0, 1000000]);
  };
  
  // Format price for display
  const formatPriceLabel = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`;
    }
    return `₦${value}`;
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(val => val !== undefined && val !== '').length;
  
  return (
    <div className="w-full mb-6">
      <div className="flex items-center space-x-2">
        {/* Search Bar */}
        <div className="relative flex-1" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              placeholder="Search locations, properties..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </form>
          
          {/* Search suggestions dropdown */}
          {isSearchFocused && query.length > 2 && (
            <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border overflow-hidden">
              <div className="p-2 text-sm text-neutral-500">
                Type Enter to search...
              </div>
            </div>
          )}
        </div>
        
        {/* Filter Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilterSheet(true)}
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
      
      {/* Filter Sheet */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Properties</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-6">
            {/* Property Type */}
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => updateFilter('type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any type</SelectItem>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Property Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilter('category', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any category</SelectItem>
                  {PROPERTY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Price Range</Label>
                <div className="text-sm text-neutral-600">
                  {formatPriceLabel(priceRange[0])} - {formatPriceLabel(priceRange[1])}
                </div>
              </div>
              
              <Slider
                defaultValue={[0, 1000000]}
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={10000000}
                step={100000}
                className="my-6"
              />
              
              <div className="flex justify-between text-xs text-neutral-500">
                <span>₦0</span>
                <span>₦10M+</span>
              </div>
            </div>
            
            {/* Bedrooms */}
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <Select
                value={filters.bedrooms?.toString() || ''}
                onValueChange={(value) => updateFilter('bedrooms', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any number</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Near Me Switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Near Me</Label>
                <p className="text-sm text-neutral-500">
                  Show properties close to your location
                </p>
              </div>
              <Switch
                checked={filters.nearMe || false}
                onCheckedChange={(checked) => updateFilter('nearMe', checked)}
              />
            </div>
          </div>
          
          <SheetFooter className="sm:justify-between pt-2 border-t flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SearchFilterBar;