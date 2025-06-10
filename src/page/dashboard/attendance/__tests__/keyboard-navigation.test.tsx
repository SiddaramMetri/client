import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttendanceView from '../components/attendance-view-with-keyboard';

// Mock the useMediaQuery hook
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: () => false
}));

const mockStudents = Array.from({ length: 10 }, (_, i) => ({
  id: `student-${i + 1}`,
  studentId: `STD${10001 + i}`,
  firstName: `Student`,
  lastName: `${i + 1}`,
  rollNumber: `${1001 + i}`,
  className: 'Test Class',
  attendanceStatus: i % 3 === 0 ? 'present' : i % 3 === 1 ? 'absent' : 'leave',
  profileImage: null,
  gender: i % 2 === 0 ? 'male' : 'female',
  isOnline: i % 5 === 0,
  lastSeen: i % 5 === 0 ? undefined : new Date().toLocaleString()
}));

describe('AttendanceView with Keyboard Navigation', () => {
  const onStatusChange = vi.fn();
  
  beforeEach(() => {
    onStatusChange.mockClear();
    render(
      <AttendanceView 
        students={mockStudents}
        onStatusChange={onStatusChange} 
        viewType="grid"
      />
    );
  });

  it('should navigate through students with arrow keys', async () => {
    const user = userEvent.setup();
    
    // First student should be focusable
    const firstStudent = screen.getByTestId('student-card-0');
    await user.tab();
    expect(firstStudent).toHaveFocus();
    
    // Arrow right should move to next student
    await user.keyboard('{ArrowRight}');
    const secondStudent = screen.getByTestId('student-card-1');
    expect(secondStudent).toHaveFocus();
    
    // Arrow down should move down a row
    await user.keyboard('{ArrowDown}');
    const studentBelow = screen.getByTestId('student-card-4'); // Assuming 4 columns in grid
    expect(studentBelow).toHaveFocus();
    
    // Arrow left should move back
    await user.keyboard('{ArrowLeft}');
    const previousStudent = screen.getByTestId('student-card-3');
    expect(previousStudent).toHaveFocus();
    
    // Arrow up should move up a row
    await user.keyboard('{ArrowUp}');
    expect(firstStudent).toHaveFocus();
  });

  it('should change student status with keyboard shortcuts', async () => {
    const user = userEvent.setup();
    
    // Focus first student
    const firstStudent = screen.getByTestId('student-card-0');
    await user.tab();
    expect(firstStudent).toHaveFocus();
    
    // Press P to mark as present
    await user.keyboard('p');
    expect(onStatusChange).toHaveBeenCalledWith('student-1', 'present');
    
    // Press L to mark as leave
    await user.keyboard('l');
    expect(onStatusChange).toHaveBeenCalledWith('student-1', 'leave');
    
    // Press A to mark as absent
    await user.keyboard('a');
    expect(onStatusChange).toHaveBeenCalledWith('student-1', 'absent');
    
    // Press space to cycle status
    await user.keyboard(' ');
    expect(onStatusChange).toHaveBeenCalledTimes(4);
  });

  it('should jump to first and last students with Home and End keys', async () => {
    const user = userEvent.setup();
    
    // Focus first student
    await user.tab();
    
    // Press End to jump to last student
    await user.keyboard('{End}');
    const lastStudent = screen.getByTestId('student-card-9');
    expect(lastStudent).toHaveFocus();
    
    // Press Home to jump to first student
    await user.keyboard('{Home}');
    const firstStudent = screen.getByTestId('student-card-0');
    expect(firstStudent).toHaveFocus();
  });

  it('should show keyboard help when clicking the Keys button', async () => {
    const user = userEvent.setup();
    
    // Find and click the keyboard help button
    const keysButton = screen.getByRole('button', { name: /keys/i });
    await user.click(keysButton);
    
    // Check that the keyboard shortcuts info is displayed
    expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    expect(screen.getByText('Arrow keys')).toBeInTheDocument();
    expect(screen.getByText('P key')).toBeInTheDocument();
  });

  it('should apply focus styles to the selected student', async () => {
    const user = userEvent.setup();
    
    // Focus first student
    const firstStudent = screen.getByTestId('student-card-0');
    await user.tab();
    
    // Check that it has the focus ring style
    expect(firstStudent).toHaveClass('ring-2');
    expect(firstStudent).toHaveClass('ring-primary');
    
    // Move to next student
    await user.keyboard('{ArrowRight}');
    
    // Check that focus moved and styles updated
    const secondStudent = screen.getByTestId('student-card-1');
    expect(secondStudent).toHaveClass('ring-2');
    expect(firstStudent).not.toHaveClass('ring-2');
  });
});
