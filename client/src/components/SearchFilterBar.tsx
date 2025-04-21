import { useState, useRef, useEffect } from "react";
import { PROPERTY_TYPES, PROPERTY_CATEGORIES } from "@/config/constants";
import { cn } from "@/lib/utils";

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

const SearchFilterBar = ({
  onSearch,
  onFilter,
  initialQuery = "",
  initialFilters = {}
}: SearchFilterBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filter>(initialFilters);
  const [activeChips, setActiveChips] = useState<string[]>(
    Object.entries(initialFilters)
      .filter(([_, value]) => value !== undefined && value !== false)
      .map(([key]) => key)
  );
  
  const filtersRef = useRef<HTMLDivElement>(null);
  
  // Close filters dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const toggleFilter = (filterKey: string, value: any) => {
    // For boolean toggles like nearMe
    if (typeof value === 'boolean') {
      setFilters(prev => ({
        ...prev,
        [filterKey]: !prev[filterKey as keyof Filter]
      }));
      
      // Toggle active chip
      if (filters[filterKey as keyof Filter]) {
        setActiveChips(prev => prev.filter(chip => chip !== filterKey));
      } else {
        setActiveChips(prev => [...prev, filterKey]);
      }
    } 
    // For value filters like type, category
    else {
      setFilters(prev => ({
        ...prev,
        [filterKey]: value
      }));
      
      if (value) {
        setActiveChips(prev => {
          if (!prev.includes(filterKey)) {
            return [...prev, filterKey];
          }
          return prev;
        });
      } else {
        setActiveChips(prev => prev.filter(chip => chip !== filterKey));
      }
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      toggleFilter(name, isChecked);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value === "" ? undefined : type === 'number' ? Number(value) : value
      }));
      
      if (value) {
        setActiveChips(prev => {
          if (!prev.includes(name)) {
            return [...prev, name];
          }
          return prev;
        });
      } else {
        setActiveChips(prev => prev.filter(chip => chip !== name));
      }
    }
  };
  
  const applyFilters = () => {
    onFilter(filters);
    setShowFilters(false);
  };
  
  const resetFilters = () => {
    setFilters({});
    setActiveChips([]);
    onFilter({});
    setShowFilters(false);
  };
  
  const toggleNearMe = () => {
    toggleFilter('nearMe', true);
    setFilters(prev => ({
      ...prev,
      nearMe: !prev.nearMe
    }));
    
    if (!filters.nearMe) {
      onFilter({
        ...filters,
        nearMe: true
      });
    } else {
      // Remove nearMe filter
      const { nearMe, ...restFilters } = filters;
      onFilter(restFilters);
    }
  };
  
  return (
    <div className="px-4 py-3 bg-white mb-3 relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for location, property type..." 
            className="w-full bg-neutral-100 text-neutral-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            value={query}
            onChange={handleSearchInput}
          />
          <i className="fas fa-search text-neutral-400 absolute left-3 top-3"></i>
        </div>
      </form>
      
      <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1">
        <button 
          className="filter-chip whitespace-nowrap bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter mr-1 text-xs"></i> Filters
        </button>
        
        <button 
          className={cn(
            "filter-chip whitespace-nowrap px-3 py-1 rounded-full text-sm",
            filters.nearMe ? "bg-primary text-white" : "bg-neutral-100 text-neutral-700"
          )}
          onClick={toggleNearMe}
        >
          Near Me
        </button>
        
        {activeChips.includes('type') && (
          <button 
            className="filter-chip whitespace-nowrap bg-primary text-white px-3 py-1 rounded-full text-sm"
            onClick={() => toggleFilter('type', undefined)}
          >
            {filters.type}
          </button>
        )}
        
        {activeChips.includes('bedrooms') && (
          <button 
            className="filter-chip whitespace-nowrap bg-primary text-white px-3 py-1 rounded-full text-sm"
            onClick={() => toggleFilter('bedrooms', undefined)}
          >
            {filters.bedrooms}+ Bedroom
          </button>
        )}
        
        {activeChips.includes('category') && (
          <button 
            className="filter-chip whitespace-nowrap bg-primary text-white px-3 py-1 rounded-full text-sm"
            onClick={() => toggleFilter('category', undefined)}
          >
            {filters.category}
          </button>
        )}
        
        {(activeChips.includes('minPrice') || activeChips.includes('maxPrice')) && (
          <button 
            className="filter-chip whitespace-nowrap bg-primary text-white px-3 py-1 rounded-full text-sm"
            onClick={() => {
              toggleFilter('minPrice', undefined);
              toggleFilter('maxPrice', undefined);
            }}
          >
            Price: {filters.minPrice ? `₦${filters.minPrice.toLocaleString()}` : 'Any'} - 
            {filters.maxPrice ? `₦${filters.maxPrice.toLocaleString()}` : 'Any'}
          </button>
        )}
      </div>
      
      {/* Filter dropdown */}
      {showFilters && (
        <div 
          ref={filtersRef}
          className="absolute left-0 right-0 top-full bg-white shadow-lg rounded-b-lg z-20 p-4 border-t border-neutral-200"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
              <select 
                name="type"
                value={filters.type || ""}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select 
                name="category"
                value={filters.category || ""}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Category</option>
                {PROPERTY_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input 
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice || ""}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice || ""}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bedrooms</label>
              <select 
                name="bedrooms"
                value={filters.bedrooms || ""}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Bedrooms</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}+ Bedrooms</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="nearMe"
                name="nearMe"
                checked={!!filters.nearMe}
                onChange={handleFilterChange}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <label htmlFor="nearMe" className="ml-2 text-sm text-neutral-700">
                Near me
              </label>
            </div>
            
            <div className="flex justify-between pt-2">
              <button 
                type="button"
                onClick={resetFilters}
                className="text-neutral-600 text-sm font-medium"
              >
                Reset
              </button>
              <button 
                type="button"
                onClick={applyFilters}
                className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
