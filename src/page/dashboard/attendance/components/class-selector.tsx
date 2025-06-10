import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ClassSelectorProps {
  onClassChange: (classId: string) => void;
}

export default function ClassSelector({ onClassChange }: ClassSelectorProps) {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await apiClient.get('/api/classes');
        // setClasses(response.data);
        
        // For demo purposes, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock classes data
        const mockClasses = [
          { id: '1A', name: 'Class 1A' },
          { id: '1B', name: 'Class 1B' },
          { id: '2A', name: 'Class 2A' },
          { id: '2B', name: 'Class 2B' },
          { id: '3A', name: 'Class 3A' },
          { id: '3B', name: 'Class 3B' },
          { id: '4A', name: 'Class 4A' },
          { id: '4B', name: 'Class 4B' },
          { id: '5A', name: 'Class 5A' }
        ];
        
        setClasses(mockClasses);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="class-select" className="text-sm font-medium">
        Select Class
      </label>
      <Select onValueChange={onClassChange}>
        <SelectTrigger id="class-select" className="w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a class" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available Classes</SelectLabel>
            {classes.map(classItem => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
