// Keyboard navigation utility for attendance system
import React from 'react';

/**
 * Hook for managing keyboard navigation in attendance grid or table
 * @param totalItems Total number of items to navigate through
 * @param columnsPerRow Number of columns in each row (for grid view)
 * @param onSelectItem Callback when an item is selected
 * @returns Object containing navigation state and handlers
 */
export function useKeyboardNavigation(
  totalItems: number,
  columnsPerRow: number = 1,
  onSelectItem: (index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if modal is open or user is typing in an input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex < totalItems - 1 ? prevIndex + 1 : prevIndex;
            const element = document.querySelector(`[data-index="${nextIndex}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return nextIndex;
          });
          break;
        
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
            const element = document.querySelector(`[data-index="${nextIndex}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return nextIndex;
          });
          break;
        
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex + columnsPerRow < totalItems 
              ? prevIndex + columnsPerRow 
              : prevIndex;
            const element = document.querySelector(`[data-index="${nextIndex}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return nextIndex;
          });
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prevIndex) => {
            const nextIndex = prevIndex - columnsPerRow >= 0 
              ? prevIndex - columnsPerRow 
              : prevIndex;
            const element = document.querySelector(`[data-index="${nextIndex}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return nextIndex;
          });
          break;
        
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          const firstElement = document.querySelector('[data-index="0"]');
          if (firstElement) {
            firstElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          break;
        
        case 'End':
          e.preventDefault();
          setFocusedIndex(totalItems - 1);
          const lastElement = document.querySelector(`[data-index="${totalItems - 1}"]`);
          if (lastElement) {
            lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onSelectItem(focusedIndex);
          }
          break;
          
        // Quick status change keys
        case 'p':
        case 'P':
          if (focusedIndex >= 0) {
            // For marking present
            document.querySelector(`[data-index="${focusedIndex}"] [data-action="present"]`)?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
          break;
          
        case 'l':
        case 'L':
          if (focusedIndex >= 0) {
            // For marking leave
            document.querySelector(`[data-index="${focusedIndex}"] [data-action="leave"]`)?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
          break;
          
        case 'a':
        case 'A':
          if (focusedIndex >= 0) {
            // For marking absent
            document.querySelector(`[data-index="${focusedIndex}"] [data-action="absent"]`)?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalItems, columnsPerRow, focusedIndex, onSelectItem]);

  return {
    focusedIndex,
    setFocusedIndex
  };
}

/**
 * Function to determine the number of columns in the grid based on screen width
 */
export function getGridColumns(): number {
  const width = window.innerWidth;
  if (width < 640) return 1;        // Mobile: 1 column
  if (width < 768) return 2;        // Small tablet: 2 columns
  if (width < 1024) return 3;       // Tablet: 3 columns
  if (width < 1280) return 4;       // Small desktop: 4 columns
  return 5;                         // Desktop: 5 columns
}

/**
 * Skip to the next status for a student
 * @param currentStatus Current attendance status
 * @returns Next status in the cycle
 */
export function cycleStatus(currentStatus: 'present' | 'absent' | 'leave'): 'present' | 'absent' | 'leave' {
  switch (currentStatus) {
    case 'present': return 'leave';
    case 'leave': return 'absent';
    case 'absent': return 'present';
  }
}
