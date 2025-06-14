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
import AuditLogsPage from "@/page/dashboard/audit-logs";
import UserRoleAssignmentPage from "@/page/dashboard/user-roles";
import PermissionsManagementPage from "@/page/dashboard/permissions";
import RedisTestPage from "@/page/dashboard/redis-test";
import AttendancePage from "@/page/dashboard/attendance";
import DailyAttendancePage from "@/page/dashboard/attendance/daily";
import AttendanceReportsPage from "@/page/dashboard/attendance/reports";
import AttendanceConfigPage from "@/page/dashboard/attendance/config";

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
  { path: PROTECTED_ROUTES.ATTENDANCE, element: <AttendancePage /> },
  { path: PROTECTED_ROUTES.ATTENDANCE_DAILY, element: <DailyAttendancePage /> },
  { path: PROTECTED_ROUTES.ATTENDANCE_REPORTS, element: <AttendanceReportsPage /> },
  { path: PROTECTED_ROUTES.ATTENDANCE_CONFIG, element: <AttendanceConfigPage /> },
  { path: PROTECTED_ROUTES.AUDIT_LOGS, element: <AuditLogsPage /> },
  { path: PROTECTED_ROUTES.USER_ROLES, element: <UserRoleAssignmentPage /> },
  { path: PROTECTED_ROUTES.PERMISSIONS, element: <PermissionsManagementPage /> },
  { path: PROTECTED_ROUTES.REDIS_TEST, element: <RedisTestPage /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
];
