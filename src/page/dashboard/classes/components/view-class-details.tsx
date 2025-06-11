import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  X, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar,
  User,
  Hash,
  Target
} from 'lucide-react';
import { useClassDialog } from '@/hooks/use-class-dialog';

interface ViewClassDetailsProps {
  onClose: () => void;
}

const ViewClassDetails: React.FC<ViewClassDetailsProps> = ({ onClose }) => {
  const { currentClass } = useClassDialog();

  if (!currentClass) {
    return null;
  }

  const utilizationPercentage = Math.round((currentClass.currentStudentCount / currentClass.maxStudents) * 100);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl">{currentClass.name}</DialogTitle>
            <DialogDescription>
              {currentClass.section && `Section ${currentClass.section} • `}
              Class Details and Information
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {/* Status and Basic Info */}
        <div className="flex items-center gap-4">
          <Badge variant={currentClass.isActive ? "default" : "secondary"} className="text-sm px-3 py-1">
            {currentClass.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <div className="text-sm text-gray-600">
            Created {new Date(currentClass.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentClass.currentStudentCount}</div>
              <p className="text-xs text-muted-foreground">
                out of {currentClass.maxStudents} maximum
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                capacity utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4" />
                  Academic Year
                </div>
                <p className="text-sm">{currentClass.academicYearId.year || currentClass.academicYearId._id}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Hash className="h-4 w-4" />
                  Section
                </div>
                <p className="text-sm">{currentClass.section || 'No section assigned'}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4" />
                  Class Teacher
                </div>
                <p className="text-sm">
                  {currentClass.classTeacherId?.name || 'No teacher assigned'}
                  {currentClass.classTeacherId?.email && (
                    <span className="text-gray-500 block text-xs">
                      {currentClass.classTeacherId.email}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <GraduationCap className="h-4 w-4" />
                  Maximum Capacity
                </div>
                <p className="text-sm">{currentClass.maxStudents} students</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Student Enrollment</span>
                <span>{currentClass.currentStudentCount}/{currentClass.maxStudents}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div 
                  className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(utilizationPercentage, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Available Slots */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(0, currentClass.maxStudents - currentClass.currentStudentCount)}
                </div>
                <p className="text-sm text-gray-600">Available slots remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Class ID:</span>
              <span className="font-mono">{currentClass._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{new Date(currentClass.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span>{new Date(currentClass.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewClassDetails;