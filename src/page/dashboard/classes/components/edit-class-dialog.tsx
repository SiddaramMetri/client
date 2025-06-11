import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClassDialog } from "@/hooks/use-class-dialog";
import EditClassForm from "./edit-class-form";

const EditClassDialog = () => {
  const { isEditOpen, onCloseEdit } = useClassDialog();

  return (
    <Dialog modal={true} open={isEditOpen} onOpenChange={onCloseEdit}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-0">
        <EditClassForm onClose={onCloseEdit} />
      </DialogContent>
    </Dialog>
  );
};

export default EditClassDialog;