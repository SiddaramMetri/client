import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Copy, School } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// For demo purpose, we'll use mock data - in production this would come from an API
const mockClasses = [
  { id: '60a1b5b9e6d2f83e4c9b3a1d', name: 'Grade 10A', section: 'A', academicYear: '2025-2026' },
  { id: '60a1b5b9e6d2f83e4c9b3a1e', name: 'Grade 10B', section: 'B', academicYear: '2025-2026' },
  { id: '60a1b5b9e6d2f83e4c9b3a1f', name: 'Grade 11A', section: 'A', academicYear: '2025-2026' },
  { id: '60a1b5b9e6d2f83e4c9b3a20', name: 'Grade 11B', section: 'B', academicYear: '2025-2026' },
  { id: '60a1b5b9e6d2f83e4c9b3a21', name: 'Grade 12A', section: 'A', academicYear: '2025-2026' },
  { id: '60a1b5b9e6d2f83e4c9b3a22', name: 'Grade 12B', section: 'B', academicYear: '2025-2026' },
];

interface ClassLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClassLookupDialog({ open, onOpenChange }: ClassLookupDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState(mockClasses);
  const { toast } = useToast();

  // Filter classes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setClasses(mockClasses);
      return;
    }

    const filtered = mockClasses.filter(
      classItem =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.section.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setClasses(filtered);
  }, [searchTerm]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "ID Copied",
      description: "Class ID copied to clipboard",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Class ID Lookup
          </DialogTitle>
          <DialogDescription>
            Find and copy class IDs to use in the student upload spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{classItem.section}</TableCell>
                    <TableCell>{classItem.academicYear}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[150px]">
                      {classItem.id}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopyId(classItem.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No classes found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
