import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useDeleteStudent } from "@/hooks/api/use-students";

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName: string | null;
  onSuccess?: () => void;
}

export default function DeleteStudentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  onSuccess,
}: DeleteStudentDialogProps) {
  const deleteStudentMutation = useDeleteStudent();

  const handleDelete = async () => {
    if (!studentId) return;

    try {
      await deleteStudentMutation.mutateAsync(studentId);
      
      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Failed to delete student:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <strong>{studentName}</strong> and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteStudentMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteStudentMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteStudentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Student"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
