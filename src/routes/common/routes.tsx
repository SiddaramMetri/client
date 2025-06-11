import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";
import Dashboard from "@/page/workspace/Dashboard";
import UsersPage from "@/page/dashboard/users";
import StudentsPage from "@/page/dashboard/students";
import ClassesPage from "@/page/dashboard/classes";
import EnhancedAttendancePage from "@/page/dashboard/attendance/enhanced-attendance-page";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <Dashboard /> },
  { path: PROTECTED_ROUTES.USERS, element: <UsersPage /> },
  { path: PROTECTED_ROUTES.CLASSES, element: <ClassesPage /> },
  { path: PROTECTED_ROUTES.STUDENTS, element: <StudentsPage /> },
  { path: PROTECTED_ROUTES.ATTENDANCE, element: <EnhancedAttendancePage /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
];
