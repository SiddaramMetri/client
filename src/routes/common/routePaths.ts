export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/dashboard",
  USERS: "/dashboard/users",
  STUDENTS: "/dashboard/students",
  TASKS: "/dashboard/tasks",
  MEMBERS: "/dashboard/members",
  SETTINGS: "/dashboard/settings",
  PROJECT_DETAILS: "/dashboard/project/:projectId",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/dashboard/:inviteCode/join",
};
