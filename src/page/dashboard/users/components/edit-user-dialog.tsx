import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserDialog } from "@/hooks/use-user-dialog";
import EditUserForm from "./edit-user-form";

const EditUserDialog = () => {
  const { isEditOpen, onCloseEdit, currentUser } = useUserDialog();

  return (
    <Dialog modal={true} open={isEditOpen} onOpenChange={onCloseEdit}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-0">
        {currentUser && <EditUserForm user={currentUser} onClose={onCloseEdit} />}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;