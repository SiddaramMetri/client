import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserDialog } from "@/hooks/use-user-dialog";
import AddUserForm from "./add-user-form";

const AddUserDialog = () => {
  const { isAddOpen, onCloseAdd } = useUserDialog();

  return (
    <Dialog modal={true} open={isAddOpen} onOpenChange={onCloseAdd}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-0">
        <AddUserForm onClose={onCloseAdd} />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;