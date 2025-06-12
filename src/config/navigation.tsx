import {
    IconBell,
    IconBook,
    IconCalendar,
    IconChartBar,
    IconDatabase,
    IconFileDescription,
    IconHelp,
    IconLibrary,
    IconMessage,
    IconReport,
    IconSchool,
    IconSettings
} from "@tabler/icons-react";

import { LayoutDashboard, Users, Shield, Crown } from "lucide-react";
import { Permission } from "@/hooks/usePermissions";

export interface NavigationItem {
    title: string;
    url: string;
    icon: any;
    items?: NavigationItem[];
    permissions?: Permission[];
    isActive?: boolean;
    name?: string;
}

interface NavigationConfig {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    navMain: NavigationItem[];
    navClouds: NavigationItem[];
    navSecondary: NavigationItem[];
    documents: NavigationItem[];
}

export const data: NavigationConfig = {
    user: {
        name: "Admin",
        email: "admin@example.com",
        avatar: "/avatars/admin.png",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
            items: [],
            permissions: ['users.view']
        },
        {
            title: "Library",
            url: "/dashboard/books",
            icon: IconLibrary,
            items: [],
            permissions: ['books.view']
        },
        {
            title: "Students",
            url: "/dashboard/students",
            icon: IconSchool,
            items: [],
            permissions: ['students.view']
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: Users,
            items: [],
            permissions: ['users.view']
        },
        {
            title: "Classes",
            url: "/dashboard/classes",
            icon: IconChartBar,
            items: [],
            permissions: ['students.view']
        },
        {
            title: "Attendance",
            url: "/dashboard/attendance",
            icon: IconDatabase,
            items: [],
            permissions: ['students.view']
        },
        {
            title: "Calendar",
            url: "/dashboard/calendar",
            icon: IconCalendar,
            items: [],
            permissions: ['students.view']
        },
        {
            title: "Audit Logs",
            url: "/dashboard/audit-logs",
            icon: Shield,
            items: [],
            permissions: ['users.view']
        },
        {
            title: "User Roles",
            url: "/dashboard/user-roles",
            icon: Crown,
            items: [],
            permissions: ['users.view']
        },
        {
            title: "Permissions",
            url: "/dashboard/permissions",
            icon: Shield,
            items: [],
            permissions: ['users.view']
        },
        {
            title: "Reports",
            icon: IconReport,
            url: "/dashboard/reports",
            permissions: ['reports.view'],
            items: [
                {
                    title: "Library Reports",
                    url: "/dashboard/reports/library",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
                {
                    title: "Student Reports",
                    url: "/dashboard/reports/students",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
                {
                    title: "Analytics",
                    url: "/dashboard/reports/analytics",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
            ],
        },
    ],
    navClouds: [
        {
            title: "Library Management",
            icon: IconBook,
            isActive: true,
            url: "/dashboard/library",
            permissions: ['books.view'],
            items: [
                {
                    title: "All Books",
                    url: "/dashboard/books",
                    icon: IconBook,
                    permissions: ['books.view']
                },
                {
                    title: "Add New Book",
                    url: "/dashboard/books/create",
                    icon: IconBook,
                    permissions: ['books.create']
                },
                {
                    title: "Categories",
                    url: "/dashboard/books/categories",
                    icon: IconBook,
                    permissions: ['books.view']
                },
            ],
        },
        {
            title: "Student Portal",
            icon: IconSchool,
            url: "/dashboard/students",
            permissions: ['students.view'],
            items: [],
        },
        {
            title: "Reports",
            icon: IconReport,
            url: "/dashboard/reports",
            permissions: ['reports.view'],
            items: [
                {
                    title: "Library Reports",
                    url: "/dashboard/reports/library",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
                {
                    title: "Student Reports",
                    url: "/dashboard/reports/students",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
                {
                    title: "Analytics",
                    url: "/dashboard/reports/analytics",
                    icon: IconReport,
                    permissions: ['reports.view']
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Notifications",
            url: "/dashboard/notifications",
            icon: IconBell,
            permissions: ['users.view']
        },
        {
            title: "Messages",
            url: "/dashboard/messages",
            icon: IconMessage,
            permissions: ['users.view']
        },
        {
            title: "Settings",
            url: "/dashboard/account",
            icon: IconSettings,
            permissions: ['users.view']
        },
        {
            title: "Help Center",
            url: "/dashboard/help",
            icon: IconHelp,
            permissions: ['users.view']
        },
    ],
    documents: [
        {
            title: "Library Catalog",
            url: "/dashboard/library/catalog",
            icon: IconBook,
            permissions: ['books.view']
        },
        {
            title: "Student Records",
            url: "/dashboard/students/records",
            icon: IconFileDescription,
            permissions: ['students.view']
        },
        {
            title: "Reports",
            url: "/dashboard/reports",
            icon: IconReport,
            permissions: ['reports.view']
        },
        {
            title: "Data Analytics",
            url: "/dashboard/analytics",
            icon: IconDatabase,
            permissions: ['reports.view']
        },
    ],
};