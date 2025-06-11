import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClassDialog } from "@/hooks/use-class-dialog";
import ViewClassDetails from "./view-class-details";

const ViewClassDialog = () => {
  const { isViewOpen, onCloseView } = useClassDialog();

  return (
    <Dialog modal={true} open={isViewOpen} onOpenChange={onCloseView}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-0">
        <ViewClassDetails onClose={onCloseView} />
      </DialogContent>
    </Dialog>
  );
};

export default ViewClassDialog;