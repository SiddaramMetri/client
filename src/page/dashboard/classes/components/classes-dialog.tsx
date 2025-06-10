import {  useEffect } from "react";
// import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { classSchema, ClassData } from "../data/schema";
import { academicYearOptions, teacherOptions } from "../data/mock";

interface ClassesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ClassData | null;
  onSave: (data: ClassData) => void;
}

export function ClassesDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: ClassesDialogProps) {
  // Form definition
  const form = useForm<ClassData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      section: "",
      maxStudents: 40,
      currentStudentCount: 0,
      isActive: true,
    },
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      // Set default values, automatically selecting the only option if applicable
      const defaultValues = {
        name: "",
        section: "",
        academicYearId: academicYearOptions.length === 1 ? academicYearOptions[0].value : "",
        classTeacherId: teacherOptions.length === 1 ? teacherOptions[0].value : undefined,
        maxStudents: 40,
        currentStudentCount: 0,
        isActive: true,
      };
      
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  // Get the teacher name based on selected teacher ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teacherOptions.find(t => t.value === teacherId);
    return teacher ? teacher.label : "";
  };

  // Get the academic year name based on selected year ID
  const getAcademicYearName = (yearId: string) => {
    const year = academicYearOptions.find(y => y.value === yearId);
    return year ? year.label : "";
  };

  // Form submission handler
  const handleSubmit = (data: ClassData) => {
    // Add display names for selected IDs
    if (data.classTeacherId) {
      data.classTeacherName = getTeacherName(data.classTeacherId);
    }
    
    if (data.academicYearId) {
      data.academicYearName = getAcademicYearName(data.academicYearId);
    }
    
    onSave(data);
    form.reset();
  };

  const title = initialData ? "Edit Class" : "Add New Class";
  const description = initialData ? "Edit class details" : "Add a new class to the system";
  const submitButtonText = initialData ? "Update" : "Create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Academic Year */}
              <FormField
                control={form.control}
                name="academicYearId"
                render={({ field }) => {
                  const isSingleOption = academicYearOptions.length === 1;
                  // When there's only one option, use it as default
                  if (isSingleOption && !field.value) {
                    field.onChange(academicYearOptions[0].value);
                  }
                  
                  return (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || (isSingleOption ? academicYearOptions[0].value : undefined)}
                        value={field.value}
                        disabled={isSingleOption}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Academic Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYearOptions.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isSingleOption 
                          ? `Using academic year: ${academicYearOptions[0].label}`
                          : "The academic year this class belongs to"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Class Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grade 5, Class 10A" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the class (max 50 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section */}
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A, B, Science" {...field} />
                    </FormControl>
                    <FormDescription>
                      Section identifier (max 10 characters, optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Teacher */}
                <FormField
                  control={form.control}
                  name="classTeacherId"
                  render={({ field }) => {
                    const isSingleOption = teacherOptions.length === 1;
                    // When there's only one option, use it as default
                    if (isSingleOption && !field.value) {
                      field.onChange(teacherOptions[0].value);
                    }
                    
                    return (
                      <FormItem>
                        <FormLabel>Class Teacher</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || (isSingleOption ? teacherOptions[0].value : undefined)}
                          value={field.value}
                          disabled={isSingleOption}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teacherOptions.map((teacher) => (
                              <SelectItem key={teacher.value} value={teacher.value}>
                                {teacher.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isSingleOption 
                            ? `Assigned to: ${teacherOptions[0].label}`
                            : "Teacher in charge of this class"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Max Students */}
                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of students allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Active Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Mark class as active or inactive
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{submitButtonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}