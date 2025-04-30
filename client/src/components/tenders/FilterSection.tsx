import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface FilterSectionProps {
  filters: {
    status: string;
    clientId: string;
    startDate: string;
    endDate: string;
    search: string;
  };
  onApplyFilters: (filters: FilterSectionProps["filters"]) => void;
  onResetFilters: () => void;
}

export default function FilterSection({
  filters,
  onApplyFilters,
  onResetFilters,
}: FilterSectionProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Fetch clients for dropdown
  const { data: clients } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });
  
  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleChange = (name: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };
  
  const handleResetFilters = () => {
    const resetFilters = {
      status: "all",
      clientId: "all",
      startDate: "",
      endDate: "",
      search: "",
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="block text-sm text-muted-foreground mb-1">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm text-muted-foreground mb-1">Client</Label>
            <Select
              value={localFilters.clientId}
              onValueChange={(value) => handleChange("clientId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-clients">No clients available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm text-muted-foreground mb-1">Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
              <span className="flex items-center">to</span>
              <Input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mr-2"
          >
            Reset
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
