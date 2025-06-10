import React from 'react';
import { AttendanceSocketProvider } from '@/context/attendance-socket-provider';
import RealTimeAttendance from './real-time-attendance';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  classId: string;
}

interface AttendanceWrapperProps {
  classId: string;
  workspaceId: string;
  students: Student[];
  className: string;
}

const AttendanceWrapper: React.FC<AttendanceWrapperProps> = (props) => {
  return (
    <AttendanceSocketProvider>
      <RealTimeAttendance {...props} />
    </AttendanceSocketProvider>
  );
};

export default AttendanceWrapper;