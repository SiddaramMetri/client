import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  className: string;
  attendanceStatus: 'present' | 'absent' | 'leave';
  profileImage: string | null;
  gender: 'male' | 'female' | 'other';
  lastSeen?: string; 
  isOnline?: boolean;
}

/**
 * Generate a PDF report for the attendance data
 */
export const generateAttendancePDF = (
  students: Student[], 
  className: string, 
  date: Date
) => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add title and date
  const title = `Attendance Report: ${className}`;
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(dateStr, pageWidth / 2, 22, { align: 'center' });
  
  // Add attendance summary
  const present = students.filter(s => s.attendanceStatus === 'present').length;
  const absent = students.filter(s => s.attendanceStatus === 'absent').length;
  const leave = students.filter(s => s.attendanceStatus === 'leave').length;
  const total = students.length;
  
  doc.text(`Summary: ${present} Present (${Math.round((present/total)*100)}%), ${absent} Absent (${Math.round((absent/total)*100)}%), ${leave} Leave (${Math.round((leave/total)*100)}%)`, pageWidth / 2, 30, { align: 'center' });
  
  // Add attendance table
  autoTable(doc, {
    startY: 40,
    head: [['Roll No.', 'Student ID', 'Name', 'Status']],
    body: students.map(student => [
      student.rollNumber,
      student.studentId,
      `${student.firstName} ${student.lastName}`,
      student.attendanceStatus.charAt(0).toUpperCase() + student.attendanceStatus.slice(1)
    ]),
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255
    },
    bodyStyles: {
      textColor: 0
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    columnStyles: {
      3: { 
        fontStyle: 'bold',
        fillColor: (cell) => {
          const status = cell.raw?.toString().toLowerCase();
          if (status === 'present') return [200, 230, 201]; // Light green
          if (status === 'absent') return [250, 200, 200];  // Light red
          if (status === 'leave') return [255, 236, 179];   // Light amber
          return [255, 255, 255];
        }
      }
    }
  });
  
  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`attendance-${className}-${date.toISOString().split('T')[0]}.pdf`);
};

/**
 * Export attendance data to Excel
 */
export const exportAttendanceToExcel = (
  students: Student[], 
  className: string, 
  date: Date
) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet format
  const wsData = [
    [`Attendance Report: ${className}`],
    [`Date: ${date.toLocaleDateString()}`],
    [''],
    ['Roll No.', 'Student ID', 'Name', 'Status']
  ];
  
  // Add student data
  students.forEach(student => {
    wsData.push([
      student.rollNumber,
      student.studentId,
      `${student.firstName} ${student.lastName}`,
      student.attendanceStatus.charAt(0).toUpperCase() + student.attendanceStatus.slice(1)
    ]);
  });
  
  // Add summary at the bottom
  const present = students.filter(s => s.attendanceStatus === 'present').length;
  const absent = students.filter(s => s.attendanceStatus === 'absent').length;
  const leave = students.filter(s => s.attendanceStatus === 'leave').length;
  
  wsData.push(['']);
  wsData.push(['Summary']);
  wsData.push(['Present', present]);
  wsData.push(['Absent', absent]);
  wsData.push(['Leave', leave]);
  wsData.push(['Total', students.length]);
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // Roll No.
    { wch: 15 }, // Student ID
    { wch: 30 }, // Name
    { wch: 15 }  // Status
  ];
  
  // Style headers (not supported by xlsx - would need a more complex library)
  
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  
  // Save the file
  XLSX.writeFile(wb, `attendance-${className}-${date.toISOString().split('T')[0]}.xlsx`);
};

/**
 * Sync attendance data with server
 */
export const syncAttendanceData = async (
  classId: string,
  date: Date,
  students: Student[]
) => {
  // In a real implementation, this would make an API call
  // Here we'll just simulate the network request
  
  return new Promise<{ success: boolean, message: string }>((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate
      const isSuccess = Math.random() < 0.95;
      
      if (isSuccess) {
        resolve({ 
          success: true, 
          message: `Successfully synced attendance data for ${students.length} students.` 
        });
      } else {
        resolve({ 
          success: false, 
          message: "Network error occurred while syncing. Please try again." 
        });
      }
    }, 1500);
  });
};

/**
 * Get status color classes based on attendance status
 */
export const getStatusColors = (status: string) => {
  switch (status) {
    case 'present': 
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-500 dark:border-green-700',
        text: 'text-green-800 dark:text-green-300'
      };
    case 'leave': 
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        border: 'border-amber-500 dark:border-amber-700',
        text: 'text-amber-800 dark:text-amber-300'
      };
    case 'absent': 
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-500 dark:border-red-700',
        text: 'text-red-800 dark:text-red-300'
      };
    default: 
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-700',
        text: 'text-gray-800 dark:text-gray-300'
      };
  }
};
