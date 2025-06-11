import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  GraduationCap, 
  Users, 
  Home,
  Loader2 
} from "lucide-react";
import { Task } from "../data/schema";
import { useUpdateStudent } from "@/hooks/api/use-students";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Task | null;
  onSuccess?: () => void;
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditStudentDialogProps) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [activeTab, setActiveTab] = useState("personal");
  const updateStudentMutation = useUpdateStudent();

  // Initialize form data when student prop changes
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender || "",
        studentEmail: student.studentEmail || "",
        studentMobile: student.studentMobile || "",
        classId: student.classId || "",
        rollNumber: student.rollNumber || "",
        fatherName: student.fatherName || "",
        parentMobile: student.parentMobile || "",
        address: student.address || "",
        status: student.status || "active",
      });
    }
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id) return;

    try {
      await updateStudentMutation.mutateAsync({
        studentId: student.id,
        data: formData,
      });

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Failed to update student:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Academic</span>
              </TabsTrigger>
              <TabsTrigger value="parent" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Parent</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Address</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Email</Label>
                  <Input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentMobile">Mobile Number</Label>
                  <Input
                    id="studentMobile"
                    name="studentMobile"
                    value={formData.studentMobile}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Academic Information Tab */}
            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
                  <Select 
                    value={formData.classId} 
                    onValueChange={(value) => handleSelectChange("classId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-1">Class 1</SelectItem>
                      <SelectItem value="class-2">Class 2</SelectItem>
                      <SelectItem value="class-3">Class 3</SelectItem>
                      {/* Add more classes as needed */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Parent Information Tab */}
            <TabsContent value="parent" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentMobile">Parent's Mobile</Label>
                  <Input
                    id="parentMobile"
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateStudentMutation.isPending}>
              {updateStudentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
