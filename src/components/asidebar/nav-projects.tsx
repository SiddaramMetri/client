import {
  SidebarGroup,
} from "@/components/ui/sidebar";
import useLegacyConfirmDialog from "@/hooks/use-confirm-dialog";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteProjectMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../resuable/confirm-dialog";

export function NavProjects() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { context, open,  onCloseDialog } = useLegacyConfirmDialog();


  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  });




  const handleConfirm = () => {
    if (!context) return;
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });

          navigate(`/dashboard`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
          });
        },
      }
    );
  };
  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        
      </SidebarGroup>

      <ConfirmDialog
        isOpen={open}
        isLoading={isLoading}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete ${
          context?.name || "this item"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
