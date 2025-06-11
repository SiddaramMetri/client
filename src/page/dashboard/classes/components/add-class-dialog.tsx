import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClassDialog } from "@/hooks/use-class-dialog";
import AddClassForm from "./add-class-form";

const AddClassDialog = () => {
  const { isAddOpen, onCloseAdd } = useClassDialog();

  return (
    <Dialog modal={true} open={isAddOpen} onOpenChange={onCloseAdd}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-0">
        <AddClassForm onClose={onCloseAdd} />
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;