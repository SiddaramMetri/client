import { create } from "zustand";
import { Class } from "@/services/class.service";

interface ClassDialogStore {
  isAddOpen: boolean;
  isEditOpen: boolean;
  isViewOpen: boolean;
  currentClass: Class | null;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  onOpenEdit: (classData: Class) => void;
  onCloseEdit: () => void;
  onOpenView: (classData: Class) => void;
  onCloseView: () => void;
}

export const useClassDialog = create<ClassDialogStore>((set) => ({
  isAddOpen: false,
  isEditOpen: false,
  isViewOpen: false,
  currentClass: null,
  onOpenAdd: () => set({ isAddOpen: true }),
  onCloseAdd: () => set({ isAddOpen: false }),
  onOpenEdit: (classData) => set({ isEditOpen: true, currentClass: classData }),
  onCloseEdit: () => set({ isEditOpen: false, currentClass: null }),
  onOpenView: (classData) => set({ isViewOpen: true, currentClass: classData }),
  onCloseView: () => set({ isViewOpen: false, currentClass: null }),
}));