import React from 'react';

// Types for keyboard navigation
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end';
export type AttendanceAction = 'present' | 'leave' | 'absent' | 'cycle' | 'save' | 'toggle-view';

// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  navigation: {
    'ArrowUp': 'up',
    'ArrowDown': 'down', 
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Home': 'home',
    'End': 'end',
    'k': 'up',     // Vim-style
    'j': 'down',   // Vim-style
    'h': 'left',   // Vim-style
    'l': 'right',  // Vim-style
  } as Record<string, NavigationDirection>,
  
  // Attendance actions
  actions: {
    'p': 'present',
    'P': 'present',
    'l': 'leave',
    'L': 'leave', 
    'a': 'absent',
    'A': 'absent',
    'Enter': 'cycle',
    ' ': 'cycle',  // Space
    's': 'save',
    'S': 'save',
    'v': 'toggle-view',
    'V': 'toggle-view',
  } as Record<string, AttendanceAction>,
  
  // Quick access
  quickAccess: {
    '1': 'present',
    '2': 'leave', 
    '3': 'absent',
    'Escape': 'clear-focus',
    'Tab': 'next-section',
    'F1': 'help',
  } as Record<string, string>
};

// Accessibility announcements
export const ACCESSIBILITY_ANNOUNCEMENTS = {
  navigation: {
    focused: (studentName: string, position: string) => 
      `Focused on ${studentName}, ${position}`,
    moved: (direction: string, studentName: string) => 
      `Moved ${direction} to ${studentName}`,
  },
  actions: {
    statusChanged: (studentName: string, newStatus: string, oldStatus: string) => 
      `${studentName} attendance changed from ${oldStatus} to ${newStatus}`,
    batchAction: (action: string, count: number) =>
      `Batch action: ${count} students marked as ${action}`,
    saved: (count: number) => 
      `Attendance saved for ${count} students`,
  },
  errors: {
    noStudents: 'No students available for navigation',
    invalidAction: 'Invalid action for current selection',
    saveError: 'Failed to save attendance data',
  }
};

// Screen reader announcement utility
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const focusManagement = {
  // Get all focusable elements
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  },
  
  // Trap focus within container
  trapFocus: (container: HTMLElement) => {
    const focusableElements = focusManagement.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  },
  
  // Restore focus to previous element
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }
};

// Enhanced keyboard navigation hook
export function useEnhancedKeyboardNavigation(
  totalItems: number,
  columnsPerRow: number = 1,
  onSelectItem: (index: number) => void,
  onAction?: (action: AttendanceAction, index: number) => void,
  options: {
    enableVimNavigation?: boolean;
    enableQuickActions?: boolean;
    announceChanges?: boolean;
    gridMode?: boolean;
  } = {}
) {
  const {
    enableVimNavigation = true,
    enableQuickActions = true,
    announceChanges = true,
    gridMode = false
  } = options;
  
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  
  // Store reference to student names for announcements
  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  
  // Navigate to specific index with bounds checking
  const navigateToIndex = React.useCallback((newIndex: number, direction?: string) => {
    if (totalItems === 0) {
      if (announceChanges) {
        announceToScreenReader(ACCESSIBILITY_ANNOUNCEMENTS.errors.noStudents, 'assertive');
      }
      return;
    }
    
    const boundedIndex = Math.max(0, Math.min(newIndex, totalItems - 1));
    if (boundedIndex !== focusedIndex) {
      setFocusedIndex(boundedIndex);
      
      // Scroll element into view
      const element = document.querySelector(`[data-index="${boundedIndex}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
        
        // Announce navigation
        if (announceChanges && direction && studentNames[boundedIndex]) {
          announceToScreenReader(
            ACCESSIBILITY_ANNOUNCEMENTS.navigation.moved(direction, studentNames[boundedIndex])
          );
        }
      }
    }
  }, [focusedIndex, totalItems, announceChanges, studentNames]);
  
  // Handle navigation
  const handleNavigation = React.useCallback((direction: NavigationDirection) => {
    switch (direction) {
      case 'right':
        navigateToIndex(focusedIndex + 1, 'right');
        break;
      case 'left':
        navigateToIndex(focusedIndex - 1, 'left');
        break;
      case 'down':
        if (gridMode) {
          navigateToIndex(focusedIndex + columnsPerRow, 'down');
        } else {
          navigateToIndex(focusedIndex + 1, 'down');
        }
        break;
      case 'up':
        if (gridMode) {
          navigateToIndex(focusedIndex - columnsPerRow, 'up');
        } else {
          navigateToIndex(focusedIndex - 1, 'up');
        }
        break;
      case 'home':
        navigateToIndex(0, 'to beginning');
        break;
      case 'end':
        navigateToIndex(totalItems - 1, 'to end');
        break;
    }
  }, [focusedIndex, totalItems, columnsPerRow, gridMode, navigateToIndex]);
  
  // Handle actions
  const handleAction = React.useCallback((action: AttendanceAction) => {
    if (focusedIndex < 0 || focusedIndex >= totalItems) {
      if (announceChanges) {
        announceToScreenReader(ACCESSIBILITY_ANNOUNCEMENTS.errors.invalidAction, 'assertive');
      }
      return;
    }
    
    switch (action) {
      case 'present':
      case 'leave':
      case 'absent':
      case 'cycle':
        onAction?.(action, focusedIndex);
        break;
      case 'save':
        onAction?.(action, -1);
        break;
      case 'toggle-view':
        onAction?.(action, -1);
        break;
    }
  }, [focusedIndex, totalItems, onAction, announceChanges]);
  
  // Main keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing or modal is open
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.modal')
      ) {
        return;
      }
      
      const key = e.key;
      
      // Handle special keys
      if (key === 'F1') {
        e.preventDefault();
        setIsHelpVisible(!isHelpVisible);
        return;
      }
      
      if (key === 'Escape') {
        e.preventDefault();
        setFocusedIndex(-1);
        setIsHelpVisible(false);
        return;
      }
      
      // Handle navigation
      if (KEYBOARD_SHORTCUTS.navigation[key]) {
        e.preventDefault();
        const direction = KEYBOARD_SHORTCUTS.navigation[key];
        if (enableVimNavigation || !['h', 'j', 'k', 'l'].includes(key)) {
          handleNavigation(direction);
        }
      }
      
      // Handle actions
      else if (KEYBOARD_SHORTCUTS.actions[key] && enableQuickActions) {
        e.preventDefault();
        const action = KEYBOARD_SHORTCUTS.actions[key];
        handleAction(action);
      }
      
      // Handle quick access numbers
      else if (enableQuickActions && ['1', '2', '3'].includes(key)) {
        e.preventDefault();
        const actions: AttendanceAction[] = ['present', 'leave', 'absent'];
        const action = actions[parseInt(key) - 1];
        handleAction(action);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNavigation, 
    handleAction, 
    enableVimNavigation, 
    enableQuickActions, 
    isHelpVisible
  ]);
  
  // Focus management
  const setFocus = React.useCallback((index: number) => {
    setFocusedIndex(index);
    
    if (announceChanges && studentNames[index]) {
      const position = `${index + 1} of ${totalItems}`;
      announceToScreenReader(
        ACCESSIBILITY_ANNOUNCEMENTS.navigation.focused(studentNames[index], position)
      );
    }
  }, [announceChanges, studentNames, totalItems]);
  
  // Update student names for announcements
  const updateStudentNames = React.useCallback((names: string[]) => {
    setStudentNames(names);
  }, []);
  
  return {
    focusedIndex,
    setFocusedIndex: setFocus,
    isHelpVisible,
    setIsHelpVisible,
    updateStudentNames,
    navigateToIndex,
    announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => {
      if (announceChanges) {
        announceToScreenReader(message, priority);
      }
    }
  };
}

// Get responsive grid columns
export function getResponsiveGridColumns(): number {
  if (typeof window === 'undefined') return 4;
  
  const width = window.innerWidth;
  if (width < 640) return 1;        // Mobile: 1 column
  if (width < 768) return 2;        // Small tablet: 2 columns  
  if (width < 1024) return 3;       // Tablet: 3 columns
  if (width < 1280) return 4;       // Small desktop: 4 columns
  if (width < 1536) return 5;       // Desktop: 5 columns
  return 6;                         // Large desktop: 6 columns
}

// Cycle through attendance statuses
export function cycleAttendanceStatus(current: 'present' | 'absent' | 'leave'): 'present' | 'absent' | 'leave' {
  switch (current) {
    case 'present': return 'leave';
    case 'leave': return 'absent';
    case 'absent': return 'present';
  }
}

// Generate help content for keyboard shortcuts
export const generateKeyboardHelp = () => {
  return {
    navigation: [
      { keys: ['↑', '↓', '←', '→'], description: 'Navigate between students' },
      { keys: ['H', 'J', 'K', 'L'], description: 'Vim-style navigation' },
      { keys: ['Home'], description: 'Go to first student' },
      { keys: ['End'], description: 'Go to last student' },
    ],
    actions: [
      { keys: ['P'], description: 'Mark as Present' },
      { keys: ['L'], description: 'Mark as Leave' },
      { keys: ['A'], description: 'Mark as Absent' },
      { keys: ['Space', 'Enter'], description: 'Cycle status' },
      { keys: ['1', '2', '3'], description: 'Quick status (Present, Leave, Absent)' },
    ],
    system: [
      { keys: ['S'], description: 'Save attendance' },
      { keys: ['V'], description: 'Toggle view mode' },
      { keys: ['F1'], description: 'Show/hide this help' },
      { keys: ['Esc'], description: 'Clear focus' },
    ]
  };
};