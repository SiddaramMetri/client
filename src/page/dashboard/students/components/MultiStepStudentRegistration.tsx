import React, { useState, createContext, useContext } from "react";
import { useCreateStudent } from "@/hooks/api/use-students";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/page/dashboard/students/data/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  User,
  Users,
  MapPin,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Home,
  FileText,
  Camera,
  X,
  Loader2,
} from "lucide-react";
import { AcademicYearDropdown } from "@/components/form/academic-year-dropdown";
import { ClassDropdown } from "@/components/form/class-dropdown";

// Registration Context Type
interface RegistrationContextType {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: any;
  setErrors: React.Dispatch<React.SetStateAction<any>>;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  completedSteps: Set<number>;
  setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
}

// Registration Context
const RegistrationContext = createContext<RegistrationContextType>({
  currentStep: 1,
  setCurrentStep: () => {},
  formData: {},
  setFormData: () => {},
  errors: {},
  setErrors: () => {},
  setFieldError: () => {},
  clearFieldError: () => {},
  completedSteps: new Set(),
  setCompletedSteps: () => {},
});

const useRegistrationContext = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error(
      "useRegistrationContext must be used within RegistrationProvider"
    );
  }
  return context;
};

// Step Configuration
const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Student's personal details",
    icon: User,
    color: "blue",
    fields: ["firstName", "lastName", "dateOfBirth", "gender", "studentMobile"],
  },
  {
    id: 2,
    title: "Academic Details",
    description: "Class and academic information",
    icon: GraduationCap,
    color: "green",
    fields: ["academicYearId", "rollNumber", "classId"],
  },
  {
    id: 3,
    title: "Parent Information",
    description: "Guardian contact details",
    icon: Users,
    color: "purple",
    fields: ["fatherName", "primaryMobileNo"],
  },
  {
    id: 4,
    title: "Address Details",
    description: "Residential information",
    icon: Home,
    color: "orange",
    fields: [],
  },
  {
    id: 5,
    title: "Final Setup",
    description: "Profile image and confirmation",
    icon: Settings,
    color: "indigo",
    fields: [],
  },
];

// Validation Functions
const validateEmail = (email: string) => {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateMobile = (mobile: string) => {
  return /^\d{10}$/.test(mobile);
};

// Individual Step Components
const BasicInformationStep = () => {
  const { formData, setFormData, errors, setFieldError, clearFieldError } =
    useRegistrationContext();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleEmailBlur = () => {
    if (formData.studentEmail && !validateEmail(formData.studentEmail)) {
      setFieldError("studentEmail", "Please enter a valid email address");
    }
  };

  const handleMobileBlur = () => {
    if (formData.studentMobile && !validateMobile(formData.studentMobile)) {
      setFieldError("studentMobile", "Mobile number must be exactly 10 digits");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                className={`transition-all ${
                  errors.firstName
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors.firstName && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.firstName}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="middleName"
                className="flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                Middle Name
              </Label>
              <Input
                id="middleName"
                value={formData.middleName || ""}
                onChange={(e) =>
                  handleInputChange("middleName", e.target.value)
                }
                placeholder="Enter middle name"
                className="focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                className={`transition-all ${
                  errors.lastName
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors.lastName && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.lastName}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="dateOfBirth"
                className="flex items-center gap-2 font-medium"
              >
                <Calendar className="w-4 h-4" />
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className={`transition-all ${
                  errors.dateOfBirth
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors.dateOfBirth && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.dateOfBirth}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4" />
                Gender *
              </Label>
              <Select
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger
                  className={`transition-all ${
                    errors.gender
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-blue-500"
                  }`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.gender}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="studentEmail"
                className="flex items-center gap-2 font-medium"
              >
                <Mail className="w-4 h-4" />
                Student Email
              </Label>
              <Input
                id="studentEmail"
                type="email"
                value={formData.studentEmail || ""}
                onChange={(e) =>
                  handleInputChange("studentEmail", e.target.value)
                }
                onBlur={handleEmailBlur}
                placeholder="student@example.com"
                className={`transition-all ${
                  errors.studentEmail
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors.studentEmail && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.studentEmail}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="studentMobile"
                className="flex items-center gap-2 font-medium"
              >
                <Phone className="w-4 h-4" />
                Student Mobile *
              </Label>
              <Input
                id="studentMobile"
                value={formData.studentMobile || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("studentMobile", value);
                  }
                }}
                onBlur={handleMobileBlur}
                placeholder="1234567890"
                className={`transition-all ${
                  errors.studentMobile
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors.studentMobile && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.studentMobile}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AcademicDetailsStep = () => {
  const { formData, setFormData, errors, clearFieldError } =
    useRegistrationContext();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Academic Year Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4" />
              Academic Year *
            </Label>
            <AcademicYearDropdown
              value={formData.academicYearId || ""}
              onChange={(value) => handleInputChange("academicYearId", value)}
              placeholder="Select academic year"
              required={true}
              autoSelectSingle={true}
              className={`transition-all ${
                errors.academicYearId
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-green-500"
              }`}
            />
            {errors.academicYearId && (
              <Alert className="py-2">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  {errors.academicYearId}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="rollNumber"
                className="flex items-center gap-2 font-medium"
              >
                <FileText className="w-4 h-4" />
                Roll Number *
              </Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber || ""}
                onChange={(e) =>
                  handleInputChange("rollNumber", e.target.value)
                }
                placeholder="Enter roll number"
                className={`transition-all ${
                  errors.rollNumber
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-green-500"
                }`}
              />
              {errors.rollNumber && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.rollNumber}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <GraduationCap className="w-4 h-4" />
                Class *
              </Label>
              <ClassDropdown
                value={formData.classId || ""}
                onChange={(value) => handleInputChange("classId", value)}
                academicYearId={formData.academicYearId}
                placeholder="Select class"
                required={true}
                autoSelectSingle={true}
                className={`transition-all ${
                  errors.classId
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-green-500"
                }`}
              />
              {errors.classId && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.classId}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="admissionDate"
              className="flex items-center gap-2 font-medium"
            >
              <Calendar className="w-4 h-4" />
              Admission Date
            </Label>
            <Input
              id="admissionDate"
              type="date"
              value={
                formData.admissionDate || new Date().toISOString().split("T")[0]
              }
              onChange={(e) =>
                handleInputChange("admissionDate", e.target.value)
              }
              className="focus:border-green-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ParentInformationStep = () => {
  const { formData, setFormData, errors, setFieldError, clearFieldError } =
    useRegistrationContext();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleMobileBlur = (field: string) => {
    if (formData[field] && !validateMobile(formData[field])) {
      setFieldError(field, "Mobile number must be exactly 10 digits");
    }
  };

  const handleEmailBlur = () => {
    if (formData.parentEmail && !validateEmail(formData.parentEmail)) {
      setFieldError("parentEmail", "Please enter a valid email address");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="fatherName"
                className="flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                Father's Name *
              </Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ""}
                onChange={(e) =>
                  handleInputChange("fatherName", e.target.value)
                }
                placeholder="Enter father's full name"
                className={`transition-all ${
                  errors.fatherName
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-purple-500"
                }`}
              />
              {errors.fatherName && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.fatherName}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="motherName"
                className="flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                Mother's Name
              </Label>
              <Input
                id="motherName"
                value={formData.motherName || ""}
                onChange={(e) =>
                  handleInputChange("motherName", e.target.value)
                }
                placeholder="Enter mother's full name"
                className="focus:border-purple-500"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="primaryMobileNo"
                className="flex items-center gap-2 font-medium"
              >
                <Phone className="w-4 h-4" />
                Primary Mobile *
              </Label>
              <Input
                id="primaryMobileNo"
                value={formData.primaryMobileNo || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("primaryMobileNo", value);
                  }
                }}
                onBlur={() => handleMobileBlur("primaryMobileNo")}
                placeholder="1234567890"
                className={`transition-all ${
                  errors.primaryMobileNo
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-purple-500"
                }`}
              />
              {errors.primaryMobileNo && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.primaryMobileNo}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="secondaryMobileNo"
                className="flex items-center gap-2 font-medium"
              >
                <Phone className="w-4 h-4" />
                Secondary Mobile
              </Label>
              <Input
                id="secondaryMobileNo"
                value={formData.secondaryMobileNo || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("secondaryMobileNo", value);
                  }
                }}
                onBlur={() => handleMobileBlur("secondaryMobileNo")}
                placeholder="1234567890"
                className={`transition-all ${
                  errors.secondaryMobileNo
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-purple-500"
                }`}
              />
              {errors.secondaryMobileNo && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.secondaryMobileNo}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="parentEmail"
                className="flex items-center gap-2 font-medium"
              >
                <Mail className="w-4 h-4" />
                Parent Email
              </Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail || ""}
                onChange={(e) =>
                  handleInputChange("parentEmail", e.target.value)
                }
                onBlur={handleEmailBlur}
                placeholder="parent@example.com"
                className={`transition-all ${
                  errors.parentEmail
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-purple-500"
                }`}
              />
              {errors.parentEmail && (
                <Alert className="py-2">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {errors.parentEmail}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AddressDetailsStep = () => {
  const { formData, setFormData } = useRegistrationContext();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Residential Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="street"
              className="flex items-center gap-2 font-medium"
            >
              <MapPin className="w-4 h-4" />
              Street Address
            </Label>
            <Textarea
              id="street"
              value={formData.street || ""}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="Enter complete street address"
              rows={3}
              className="focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="flex items-center gap-2 font-medium"
              >
                <MapPin className="w-4 h-4" />
                City
              </Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                className="focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="flex items-center gap-2 font-medium"
              >
                <MapPin className="w-4 h-4" />
                State
              </Label>
              <Input
                id="state"
                value={formData.state || ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter state"
                className="focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="pinCode"
                className="flex items-center gap-2 font-medium"
              >
                <MapPin className="w-4 h-4" />
                PIN Code
              </Label>
              <Input
                id="pinCode"
                value={formData.pinCode || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    handleInputChange("pinCode", value);
                  }
                }}
                placeholder="123456"
                className="focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="flex items-center gap-2 font-medium"
              >
                <MapPin className="w-4 h-4" />
                Country
              </Label>
              <Input
                id="country"
                value={formData.country || "India"}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter country"
                className="focus:border-orange-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FinalSetupStep = () => {
  const { setFormData } = useRegistrationContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData((prev) => ({ ...prev, profileImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, profileImage: null }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5" />
            Profile Image
          </CardTitle>
          <CardDescription>
            Upload a profile picture for the student (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Upload Profile Image
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Choose a profile picture for the student
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profileImage"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("profileImage").click()}
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 rounded-full p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Selected: {selectedImage.name}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("profileImage").click()}
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 text-lg">
                Ready to Register
              </h4>
              <p className="text-green-700">
                All required information has been collected successfully.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Props interface for the registration component
interface MultiStepStudentRegistrationProps {
  onSuccess?: () => void;
}

// Main Registration Dialog Component
export default function MultiStepStudentRegistration({ onSuccess }: MultiStepStudentRegistrationProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "India",
    admissionDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const contextValue = {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    completedSteps,
    setCompletedSteps,
  };

  const validateStep = (stepId: number) => {
    const stepConfig = STEPS.find((step) => step.id === stepId);
    if (!stepConfig) return true;
    
    const newErrors: any = {};

    stepConfig.fields.forEach((field) => {
      switch (field) {
        case "firstName":
          if (!formData.firstName?.trim()) {
            newErrors.firstName = "First name is required";
          } else if (formData.firstName.length > 50) {
            newErrors.firstName = "First name must be less than 50 characters";
          }
          break;
        case "lastName":
          if (!formData.lastName?.trim()) {
            newErrors.lastName = "Last name is required";
          } else if (formData.lastName.length > 50) {
            newErrors.lastName = "Last name must be less than 50 characters";
          }
          break;
        case "dateOfBirth":
          if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
          }
          break;
        case "gender":
          if (!formData.gender) {
            newErrors.gender = "Gender is required";
          }
          break;
        case "studentMobile":
          if (!formData.studentMobile?.trim()) {
            newErrors.studentMobile = "Student mobile is required";
          } else if (!validateMobile(formData.studentMobile)) {
            newErrors.studentMobile = "Mobile number must be exactly 10 digits";
          }
          break;
        case "academicYearId":
          if (!formData.academicYearId?.trim()) {
            newErrors.academicYearId = "Academic year is required";
          }
          break;
        case "rollNumber":
          if (!formData.rollNumber?.trim()) {
            newErrors.rollNumber = "Roll number is required";
          }
          break;
        case "classId":
          if (!formData.classId) {
            newErrors.classId = "Class selection is required";
          }
          break;
        case "fatherName":
          if (!formData.fatherName?.trim()) {
            newErrors.fatherName = "Father name is required";
          }
          break;
        case "primaryMobileNo":
          if (!formData.primaryMobileNo?.trim()) {
            newErrors.primaryMobileNo = "Primary mobile is required";
          } else if (!validateMobile(formData.primaryMobileNo)) {
            newErrors.primaryMobileNo =
              "Mobile number must be exactly 10 digits";
          }
          break;
      }
    });

    // Additional validation for optional fields
    if (formData.studentEmail && !validateEmail(formData.studentEmail)) {
      newErrors.studentEmail = "Please enter a valid email address";
    }
    if (formData.parentEmail && !validateEmail(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }
    if (
      formData.secondaryMobileNo &&
      !validateMobile(formData.secondaryMobileNo)
    ) {
      newErrors.secondaryMobileNo = "Mobile number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.has(stepId) || stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const createStudentMutation = useCreateStudent();
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      // Validate all steps before submission
      const allStepsValid = STEPS.every(step => validateStep(step.id));
      
      if (!allStepsValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix all validation errors before submitting",
        });
        return;
      }

      // Transform form data to Task format for the API service
      const taskData: Partial<Task> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        classId: formData.classId,
        rollNumber: formData.rollNumber,
        studentEmail: formData.studentEmail,
        studentMobile: formData.studentMobile,
        fatherName: formData.fatherName,
        parentMobile: formData.primaryMobileNo,
        status: formData.isActive !== false ? 'active' : 'inactive',
      };

      // Submit to API
      await createStudentMutation.mutateAsync(taskData);

      // Success - close dialog and reset form
      setIsOpen(false);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setFormData({
        country: "India",
        admissionDate: new Date().toISOString().split("T")[0],
        isActive: true,
      });
      setErrors({});

      toast({
        title: "Student Registered",
        description: "Student has been successfully registered in the system",
      });

      // Call the success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Failed to register student. Please try again.",
      });
    }
  };

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationStep />;
      case 2:
        return <AcademicDetailsStep />;
      case 3:
        return <ParentInformationStep />;
      case 4:
        return <AddressDetailsStep />;
      case 5:
        return <FinalSetupStep />;
      default:
        return <BasicInformationStep />;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;
  const currentStepConfig = STEPS.find((step) => step.id === currentStep);

  return (
    <RegistrationContext.Provider value={contextValue}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <UserPlus className="w-5 h-5 mr-2" />
            Register New Student
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          <div className="flex h-full min-h-[600px]">
            {/* Enhanced Sidebar */}
            <div className="w-80 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border-r border-gray-200 p-6">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Student Registration
                </h2>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${progressPercentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Step {currentStep} of {STEPS.length}
                    </span>
                    <span className="text-gray-600">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.has(step.id);
                  const isCurrent = currentStep === step.id;
                  const isAccessible =
                    completedSteps.has(step.id) || step.id <= currentStep;

                  return (
                    <div
                      key={step.id}
                      onClick={() => isAccessible && handleStepClick(step.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                        isCurrent
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 shadow-md"
                          : isCompleted
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-md"
                          : isAccessible
                          ? "bg-white border-gray-200 cursor-pointer hover:bg-gray-50 hover:shadow-sm"
                          : "bg-gray-50 border-gray-100 opacity-50"
                      }`}
                    >
                      {/* Connection Line */}
                      {index < STEPS.length - 1 && (
                        <div
                          className={`absolute left-8 top-16 w-0.5 h-6 ${
                            completedSteps.has(step.id)
                              ? "bg-green-400"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`relative p-2 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                              : isCompleted
                              ? "bg-gradient-to-r from-green-500 to-green-600 shadow-md"
                              : "bg-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Icon
                              className={`w-5 h-5 ${
                                isCurrent ? "text-white" : "text-gray-600"
                              }`}
                            />
                          )}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse opacity-50"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-semibold text-sm ${
                              isCurrent
                                ? "text-blue-800"
                                : isCompleted
                                ? "text-green-800"
                                : "text-gray-800"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex-col items-end flex gap-2">
                          {isCompleted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 text-xs"
                            >
                              Done
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1 flex flex-col bg-white">
              <DialogHeader className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-${currentStepConfig?.color || 'blue'}-100`}
                  >
                    {currentStepConfig && (
                      <currentStepConfig.icon
                        className={`w-6 h-6 text-${currentStepConfig.color}-600`}
                      />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      {currentStepConfig?.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      {currentStepConfig?.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white">
                {getStepComponent()}
              </div>

              <div className="p-6 border-t bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className="flex items-center gap-2 hover:bg-gray-50"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-gray-50"
                    >
                      Cancel
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={createStudentMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                      >
                        {createStudentMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Register Student
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RegistrationContext.Provider>
  );
}
