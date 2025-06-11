import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { classService } from '@/services/class.service';
import { useClassDialog } from '@/hooks/use-class-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { AcademicYearDropdown } from '@/components/form/academic-year-dropdown';

// Form validation schema
const updateClassSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required').optional(),
  name: z.string().min(1, 'Class name is required').max(50, 'Class name must be 50 characters or less').optional(),
  section: z.string().max(10, 'Section must be 10 characters or less').optional(),
  classTeacherId: z.string().optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').max(2000, 'Max students cannot exceed 2000').optional(),
  isActive: z.boolean().optional(),
});

type UpdateClassFormData = z.infer<typeof updateClassSchema>;

interface EditClassFormProps {
  onClose: () => void;
}

const EditClassForm: React.FC<EditClassFormProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { currentClass } = useClassDialog();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UpdateClassFormData>({
    resolver: zodResolver(updateClassSchema),
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (currentClass) {
      // Reset form with class data
      reset({
        academicYearId: currentClass.academicYearId?._id || '',
        name: currentClass.name,
        section: currentClass.section || '',
        classTeacherId: currentClass.classTeacherId?._id || 'none',
        maxStudents: currentClass.maxStudents,
        isActive: currentClass.isActive,
      });
    }
  }, [currentClass, reset]);

  if (!currentClass) {
    return null;
  }

  const onSubmit = async (data: UpdateClassFormData) => {
    try {
      setLoading(true);
      
      // Clean up data - remove empty strings
      const cleanData = {
        ...data,
        section: data.section?.trim() || undefined,
        classTeacherId: data.classTeacherId === 'none' ? undefined : data.classTeacherId,
      };

      await classService.updateClass(currentClass._id, cleanData);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-stats'] });

      toast({
        title: "Success",
        description: "Class updated successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update class information for {currentClass.name}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        {/* Academic Year Selection */}
        <div className="space-y-2">
          <Label htmlFor="academicYearId">Academic Year</Label>
          <AcademicYearDropdown
            value={watch('academicYearId')}
            onChange={(value) => setValue('academicYearId', value)}
            placeholder={currentClass.academicYearId ? "Select academic year" : "No academic year assigned - select one"}
            autoSelectSingle={true}
          />
          {errors.academicYearId && (
            <p className="text-sm text-red-600">{errors.academicYearId.message}</p>
          )}
          {!currentClass.academicYearId && (
            <p className="text-sm text-amber-600">
              ⚠️ This class doesn't have an academic year assigned. Please select one.
            </p>
          )}
        </div>

        {/* Class Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            placeholder="e.g., Grade 5, Class 10A, Mathematics"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Section */}
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            placeholder="e.g., A, B, Alpha, Beta"
            {...register('section')}
          />
          {errors.section && (
            <p className="text-sm text-red-600">{errors.section.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Optional. Used to differentiate between multiple sections of the same class.
          </p>
        </div>

        {/* Class Teacher */}
        <div className="space-y-2">
          <Label htmlFor="classTeacherId">Class Teacher</Label>
          <Select
            onValueChange={(value) => setValue('classTeacherId', value)}
            defaultValue={currentClass.classTeacherId?._id || 'none'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class teacher (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No teacher assigned</SelectItem>
              <SelectItem value="teacher1">John Smith</SelectItem>
              <SelectItem value="teacher2">Jane Doe</SelectItem>
              <SelectItem value="teacher3">Mike Johnson</SelectItem>
              <SelectItem value="teacher4">Sarah Wilson</SelectItem>
              <SelectItem value="teacher5">Michael Brown</SelectItem>
            </SelectContent>
          </Select>
          {errors.classTeacherId && (
            <p className="text-sm text-red-600">{errors.classTeacherId.message}</p>
          )}
        </div>

        {/* Max Students */}
        <div className="space-y-2">
          <Label htmlFor="maxStudents">Maximum Students</Label>
          <Input
            id="maxStudents"
            type="number"
            min="1"
            max="2000"
            {...register('maxStudents', { valueAsNumber: true })}
          />
          {errors.maxStudents && (
            <p className="text-sm text-red-600">{errors.maxStudents.message}</p>
          )}
          <p className="text-sm text-gray-500">
            The maximum number of students that can be enrolled in this class.
          </p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Class Status</Label>
              <p className="text-sm text-gray-500">
                {isActive ? 'Class is currently active and accepting students' : 'Class is inactive and not accepting new students'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </div>

        {/* Current Students Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Current Students</p>
              <p className="text-2xl font-bold">{currentClass.currentStudentCount}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Available Slots</p>
              <p className="text-2xl font-bold">
                {Math.max(0, (watch('maxStudents') || currentClass.maxStudents) - currentClass.currentStudentCount)}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditClassForm;