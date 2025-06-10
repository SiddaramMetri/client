import { create } from "zustand";
import { User } from "@/page/dashboard/users/data/schema";

interface UserDialogStore {
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  currentUser: User | null;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  onOpenEdit: (user: User) => void;
  onCloseEdit: () => void;
  onOpenDelete: (user: User) => void;
  onCloseDelete: () => void;
}

export const useUserDialog = create<UserDialogStore>((set) => ({
  isAddOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  currentUser: null,
  onOpenAdd: () => set({ isAddOpen: true }),
  onCloseAdd: () => set({ isAddOpen: false }),
  onOpenEdit: (user) => set({ isEditOpen: true, currentUser: user }),
  onCloseEdit: () => set({ isEditOpen: false, currentUser: null }),
  onOpenDelete: (user) => set({ isDeleteOpen: true, currentUser: user }),
  onCloseDelete: () => set({ isDeleteOpen: false, currentUser: null }),
}));
