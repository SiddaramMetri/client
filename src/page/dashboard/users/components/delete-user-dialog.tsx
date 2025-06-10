import { useState } from "react";
import { Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserDialog } from "@/hooks/use-user-dialog";
import { Button } from "@/components/ui/button";

const DeleteUserDialog = () => {
  const { isDeleteOpen, onCloseDelete, currentUser } = useUserDialog();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    
    // Here you would add the actual delete API call
    // Example:
    // deleteUserMutation.mutate(currentUser.id, {
    //   onSuccess: () => {
    //     toast({
    //       title: "Success",
    //       description: "User deleted successfully",
    //       variant: "success",
    //     });
    //     onCloseDelete();
    //   },
    //   onError: (error) => {
    //     toast({
    //       title: "Error",
    //       description: error.message,
    //       variant: "destructive",
    //     });
    //   },
    //   onSettled: () => {
    //     setIsDeleting(false);
    //   }
    // });

    // For now just simulate a delete operation
    setTimeout(() => {
      setIsDeleting(false);
      onCloseDelete();
    }, 1000);
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={onCloseDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account for{" "}
            <span className="font-medium">{currentUser?.name}</span> and remove their
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;