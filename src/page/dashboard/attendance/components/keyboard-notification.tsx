import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KeyboardActionType = 'navigate' | 'present' | 'leave' | 'absent' | 'cycle';

interface KeyboardNotificationProps {
  action?: KeyboardActionType;
  message?: string;
}

const KeyboardNotification = ({ action, message }: KeyboardNotificationProps) => {
  const [visible, setVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<KeyboardActionType | undefined>(undefined);
  const [activeMessage, setActiveMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (action) {
      setActiveAction(action);
      setActiveMessage(message);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [action, message]);

  const getColorClass = () => {
    switch (activeAction) {
      case 'present':
        return 'bg-green-500 border-green-600';
      case 'leave':
        return 'bg-amber-500 border-amber-600';
      case 'absent':
        return 'bg-red-500 border-red-600';
      case 'navigate':
        return 'bg-blue-500 border-blue-600';
      case 'cycle':
        return 'bg-violet-500 border-violet-600';
      default:
        return 'bg-gray-600 border-gray-700';
    }
  };
  
  const getMessage = () => {
    if (activeMessage) return activeMessage;
    
    switch (activeAction) {
      case 'present':
        return 'Marked as Present (P)';
      case 'leave':
        return 'Marked as on Leave (L)';
      case 'absent':
        return 'Marked as Absent (A)';
      case 'navigate':
        return 'Navigation active';
      case 'cycle':
        return 'Status changed';
      default:
        return 'Keyboard shortcut used';
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 right-4 z-50"
          transition={{ duration: 0.2 }}
        >
          <div className={cn(
            'py-2 px-4 rounded-md shadow-lg text-white border flex items-center gap-2',
            getColorClass()
          )}>
            <Keyboard className="h-4 w-4" />
            <span>{getMessage()}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default KeyboardNotification;
