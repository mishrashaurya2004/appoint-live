import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Filter } from "lucide-react";

interface SearchFiltersProps {
  onSpecializationFilter: (specialization: string) => void;
  onLocationFilter: (location: string) => void;
  onSearch: (query: string) => void;
}

const specializations = [
  "All Specialists",
  "General Physician",
  "Cardiologist", 
  "Dermatologist",
  "Pediatrician",
  "Orthopedist",
  "Neurologist",
  "Gynecologist",
];

const locations = [
  "Near Me",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
];

export const SearchFilters = ({
  onSpecializationFilter,
  onLocationFilter,
  onSearch,
}: SearchFiltersProps) => {
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specialists");
  const [selectedLocation, setSelectedLocation] = useState("Near Me");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSpecializationClick = (specialization: string) => {
    setSelectedSpecialization(specialization);
    onSpecializationFilter(specialization);
  };

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    onLocationFilter(location);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search doctors, specializations, or symptoms..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 bg-card shadow-soft border-0"
        />
      </div>

      {/* Specialization Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-medical-blue" />
          <h3 className="font-medium text-foreground">Specialization</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <Badge
              key={spec}
              variant={selectedSpecialization === spec ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                selectedSpecialization === spec
                  ? "bg-medical-blue text-white shadow-medical"
                  : "hover:bg-accent"
              }`}
              onClick={() => handleSpecializationClick(spec)}
            >
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* Location Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-medical-green" />
          <h3 className="font-medium text-foreground">Location</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <Badge
              key={location}
              variant={selectedLocation === location ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                selectedLocation === location
                  ? "bg-medical-green text-white shadow-soft"
                  : "hover:bg-accent"
              }`}
              onClick={() => handleLocationClick(location)}
            >
              {location}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};