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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  GraduationCap, 
  Users, 
  Home, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  FileText,
  Shield,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "../data/schema";
import axios from "axios";

interface ViewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
}

interface StudentDetail {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  className?: string; // This might be populated by the API
  rollNumber: string;
  studentEmail?: string;
  studentMobile: string;
  parentInfo: {
    fatherName: string;
    motherName?: string;
    primaryMobileNo: string;
    secondaryMobileNo?: string;
    email?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country: string;
  };
  admissionDate?: string;
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewStudentDialog({
  open,
  onOpenChange,
  studentId,
}: ViewStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentDetail | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId || !open) return;
      
      setLoading(true);
      try {
        // This would be the actual API call in a production environment
        // const response = await axios.get(`/api/v1/student/${studentId}`);
        // setStudent(response.data.student);
        
        // For now, simulate an API response with mock data
        setTimeout(() => {
          const mockStudent = {
            _id: studentId,
            studentId: `STD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            firstName: "John",
            lastName: "Doe",
            middleName: "Michael",
            dateOfBirth: "2010-05-15",
            gender: "male",
            classId: "class-5",
            className: "5th Grade",
            rollNumber: "0501",
            studentEmail: "john.doe@example.com",
            studentMobile: "9876543210",
            parentInfo: {
              fatherName: "Robert Doe",
              motherName: "Jane Doe",
              primaryMobileNo: "9876543211",
              secondaryMobileNo: "9876543212",
              email: "parent@example.com",
            },
            address: {
              street: "123 Main St",
              city: "Springfield",
              state: "State",
              pinCode: "12345",
              country: "Country",
            },
            admissionDate: "2022-04-10",
            isActive: true,
            profileImage: "",
            createdAt: "2022-04-10T10:30:00Z",
            updatedAt: "2023-03-15T14:20:00Z",
          };
          
          setStudent(mockStudent);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch student details:", error);
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, open]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Complete information about the student
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Student Header with Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                {student.profileImage ? (
                  <AvatarImage src={student.profileImage} alt={`${student.firstName} ${student.lastName}`} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {student.firstName} {student.middleName} {student.lastName}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1" />
                    ID: {student.studentId}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Class: {student.className} (Roll: {student.rollNumber})
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    <span className={`${student.isActive ? "text-green-600" : "text-red-600"}`}>
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(student.dateOfBirth)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Gender</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Mobile</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.studentMobile || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.studentEmail || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Admission Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.admissionDate ? formatDate(student.admissionDate) : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Class</div>
                  <div>{student.className || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Roll Number</div>
                  <div>{student.rollNumber || "N/A"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Father's Name</div>
                  <div>{student.parentInfo?.fatherName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Mother's Name</div>
                  <div>{student.parentInfo?.motherName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Primary Contact</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.parentInfo?.primaryMobileNo || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Secondary Contact</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.parentInfo?.secondaryMobileNo || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {student.parentInfo?.email || "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {student.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        {student.address.street && <div>{student.address.street}</div>}
                        {(student.address.city || student.address.state || student.address.pinCode) && (
                          <div>
                            {student.address.city}
                            {student.address.city && student.address.state ? ", " : ""}
                            {student.address.state} {student.address.pinCode}
                          </div>
                        )}
                        {student.address.country && <div>{student.address.country}</div>}
                      </div>
                    </div>
                  )}
                  {!student.address?.street && !student.address?.city && (
                    <div className="text-muted-foreground">No address information available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Student information could not be loaded
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
