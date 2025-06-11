import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MultiStepStudentRegistration from "@/page/dashboard/students/components/MultiStepStudentRegistration";
import { useToast } from "@/components/ui/use-toast";

interface StudentRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function StudentRegistrationDialog({
  open,
  onOpenChange,
  onSuccess,
}: StudentRegistrationDialogProps) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Student Added",
      description: "Student has been successfully added to the system",
    });
    
    if (onSuccess) {
      onSuccess();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the student details in this multi-step form
          </DialogDescription>
        </DialogHeader>
        
        <MultiStepStudentRegistration onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
