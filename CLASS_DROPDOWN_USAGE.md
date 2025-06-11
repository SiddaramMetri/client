# ClassDropdown Component Usage Guide

## Overview
The `ClassDropdown` component is a reusable dropdown that connects to the backend API to fetch and display classes. It supports filtering by academic year and provides auto-selection functionality.

## Features
- **Backend API Integration**: Automatically fetches classes from `/api/class` endpoint
- **Academic Year Filtering**: Shows only classes for the selected academic year
- **Auto-selection**: Can automatically select when only one option is available
- **Loading States**: Shows skeleton loader while fetching data
- **Error Handling**: Displays error messages with retry functionality
- **Active/Inactive Filtering**: Option to show only active classes
- **Student Count Display**: Shows current enrollment vs capacity
- **Responsive Design**: Adapts to different screen sizes

## Basic Usage

```tsx
import { ClassDropdown } from '@/components/form/class-dropdown';

function MyComponent() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");

  return (
    <ClassDropdown
      value={selectedClass}
      onChange={setSelectedClass}
      academicYearId={academicYearId}
      placeholder="Select a class"
    />
  );
}
```

## Props Interface

```tsx
interface ClassDropdownProps {
  value?: string;                    // Selected class ID
  onChange: (value: string) => void; // Callback when selection changes
  disabled?: boolean;                // Disable the dropdown
  placeholder?: string;              // Placeholder text
  required?: boolean;                // Mark as required field
  academicYearId?: string;          // Filter by academic year
  showActiveOnly?: boolean;         // Show only active classes (default: true)
  className?: string;               // Additional CSS classes
  autoSelectSingle?: boolean;       // Auto-select when only one option (default: true)
}
```

## Advanced Usage Examples

### With Academic Year Filtering
```tsx
<ClassDropdown
  value={selectedClass}
  onChange={setSelectedClass}
  academicYearId={selectedAcademicYear}
  placeholder="Select class for this academic year"
  showActiveOnly={true}
/>
```

### With Form Validation
```tsx
<div className="space-y-2">
  <Label htmlFor="class">Class *</Label>
  <ClassDropdown
    value={formData.classId}
    onChange={(value) => setValue('classId', value)}
    academicYearId={formData.academicYearId}
    required={true}
    className={errors.classId ? "border-red-500" : ""}
  />
  {errors.classId && (
    <p className="text-sm text-red-600">{errors.classId}</p>
  )}
</div>
```

### Without Auto-selection (for selection lists)
```tsx
<ClassDropdown
  value={selectedClass}
  onChange={setSelectedClass}
  academicYearId={academicYearId}
  autoSelectSingle={false}
  placeholder="Choose a class"
/>
```

### Including Inactive Classes
```tsx
<ClassDropdown
  value={selectedClass}
  onChange={setSelectedClass}
  showActiveOnly={false}
  placeholder="Select any class (active or inactive)"
/>
```

## Integration with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { ClassDropdown } from '@/components/form/class-dropdown';

function RegistrationForm() {
  const { watch, setValue, formState: { errors } } = useForm();
  
  return (
    <ClassDropdown
      value={watch('classId')}
      onChange={(value) => setValue('classId', value)}
      academicYearId={watch('academicYearId')}
      required={true}
      className={errors.classId ? "border-red-500" : ""}
    />
  );
}
```

## Backend API Requirements

The component expects the following API endpoints:

### GET /api/class
Returns paginated list of classes with optional filters:
- `academicYearId`: Filter by academic year
- `isActive`: Filter by active status ('true', 'false', 'all')
- `limit`: Number of results (component uses 100 for dropdown)
- `sortBy`: Sort field (component uses 'name')
- `sortOrder`: Sort order ('asc', 'desc')

### Response Format
```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "_id": "class_id",
      "name": "Grade 5",
      "section": "A",
      "academicYearId": {
        "_id": "academic_year_id",
        "name": "2024-25"
      },
      "maxStudents": 30,
      "currentStudentCount": 25,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 10,
    "limit": 100,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Shows retry button
2. **No Classes Found**: Shows appropriate message
3. **Academic Year Required**: Shows warning when no academic year selected
4. **Loading States**: Shows skeleton loader

## Custom Hooks

Use the provided hooks for additional class operations:

```tsx
import { useAllClasses } from '@/hooks/api/use-classes';

function MyComponent() {
  const { data: classResponse, isLoading, error } = useAllClasses(academicYearId, true);
  const classes = classResponse?.data || [];
  
  // Use classes data
}
```

## Component Dependencies

- `@tanstack/react-query` for data fetching
- `@/services/class.service` for API calls
- `@/components/ui/select` for UI components
- `lucide-react` for icons

## Styling

The component uses Tailwind CSS classes and can be customized:

```tsx
<ClassDropdown
  value={selectedClass}
  onChange={setSelectedClass}
  className="border-2 border-blue-500 focus:border-blue-700"
/>
```

## Performance

- Automatic caching with 5-minute stale time
- Memoized class list to prevent unnecessary re-renders
- Efficient re-fetching when academic year changes
- Skeleton loading for better UX

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Real-world Usage Locations

This component is currently used in:

1. **Student Registration Form** (`/components/new-page.tsx`)
   - Academic Details step
   - Filtered by selected academic year
   - Auto-selects when only one class available

2. **Attendance Page** (`/page/dashboard/attendance/index.tsx`)
   - Class selection filter
   - Works with academic year filter
   - No auto-selection to allow manual choice

3. **Class Management Forms** 
   - Create/Edit class dialogs
   - Form validation integration
   - Dynamic filtering

## Best Practices

1. **Always provide academicYearId** when possible for better filtering
2. **Use autoSelectSingle=false** in selection/filter scenarios
3. **Handle loading and error states** in parent components
4. **Validate selected values** in forms
5. **Use with Academic Year dropdown** for complete filtering