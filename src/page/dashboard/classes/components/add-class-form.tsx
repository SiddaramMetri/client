import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { classService } from '@/services/class.service';
import { useQueryClient } from '@tanstack/react-query';
import { AcademicYearDropdown } from '@/components/form/academic-year-dropdown';

// Form validation schema
const createClassSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  name: z.string().min(1, 'Class name is required').max(50, 'Class name must be 50 characters or less'),
  section: z.string().max(10, 'Section must be 10 characters or less').optional(),
  classTeacherId: z.string().optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').max(2000, 'Max students cannot exceed 2000'),
});

type CreateClassFormData = z.infer<typeof createClassSchema>;

interface AddClassFormProps {
  onClose: () => void;
}

const AddClassForm: React.FC<AddClassFormProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      academicYearId: '',
      name: '',
      section: '',
      classTeacherId: '',
      maxStudents: 30,
    },
  });

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      setLoading(true);
      
      // Clean up data - remove empty strings
      const cleanData = {
        ...data,
        section: data.section?.trim() || undefined,
        classTeacherId: data.classTeacherId === 'none' ? undefined : data.classTeacherId,
      };

      await classService.createClass(cleanData);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-stats'] });

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create class",
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
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Add a new class to your system
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
          <Label htmlFor="academicYearId">Academic Year *</Label>
          <AcademicYearDropdown
            value={watch('academicYearId')}
            onChange={(value) => setValue('academicYearId', value)}
            placeholder="Select academic year"
            required={true}
            autoSelectSingle={true}
          />
          {errors.academicYearId && (
            <p className="text-sm text-red-600">{errors.academicYearId.message}</p>
          )}
        </div>

        {/* Class Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Class Name *</Label>
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
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class teacher (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No teacher assigned</SelectItem>
              <SelectItem value="68453f2caff91a8790ed8d04">John Smith</SelectItem>
              <SelectItem value="68453f2caff91a8790ed8d06">Jane Doe</SelectItem>
              <SelectItem value="68453f2caff91a8790ed8d07">Mike Johnson</SelectItem>
              <SelectItem value="68453f2caff91a8790ed8d08">Sarah Wilson</SelectItem>
              <SelectItem value="68453f2caff91a8790ed8d05">Michael Brown</SelectItem>
            </SelectContent>
          </Select>
          {errors.classTeacherId && (
            <p className="text-sm text-red-600">{errors.classTeacherId.message}</p>
          )}
        </div>

        {/* Max Students */}
        <div className="space-y-2">
          <Label htmlFor="maxStudents">Maximum Students *</Label>
          <Input
            id="maxStudents"
            type="number"
            min="1"
            max="2000"
            placeholder="30"
            {...register('maxStudents', { valueAsNumber: true })}
          />
          {errors.maxStudents && (
            <p className="text-sm text-red-600">{errors.maxStudents.message}</p>
          )}
          <p className="text-sm text-gray-500">
            The maximum number of students that can be enrolled in this class.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddClassForm;