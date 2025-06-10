/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionType } from "@/constant";
import useAuth from "@/hooks/api/use-auth";
import { UserType, WorkspaceType } from "@/types/api.type";
import { createContext, useContext } from "react";

// Define the context shape
type AuthContextType = {
  user?: UserType;
  workspace?: WorkspaceType;
  hasPermission: (permission: PermissionType) => boolean;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  workspaceLoading: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const navigate = useNavigate();

  const {
    data: authData,
    error: authError,
    isLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth();
  const user = authData?.user;


  return (
    <AuthContext.Provider
      value={{
        user,
        workspace: undefined,
        hasPermission: () => true,
        error: authError,
        isLoading,
        isFetching,
        workspaceLoading: false,
        refetchAuth,
        refetchWorkspace: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};
