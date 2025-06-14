import React from 'react';
import { toast, toastSuccess, toastError, toastInfo, toastWarning } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ToastTest: React.FC = () => {
  const handleSuccessToast = () => {
    toastSuccess('This is a success message! 🎉');
  };

  const handleErrorToast = () => {
    toastError('This is an error message! ❌');
  };

  const handleInfoToast = () => {
    toastInfo('This is an info message! ℹ️');
  };

  const handleWarningToast = () => {
    toastWarning('This is a warning message! ⚠️');
  };

  const handleLegacyToast = () => {
    toast({
      title: 'Legacy Format',
      description: 'This uses the legacy toast format for backward compatibility',
      variant: 'default'
    });
  };

  const handleDestructiveToast = () => {
    toast({
      title: 'Destructive Action',
      description: 'This action cannot be undone',
      variant: 'destructive'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>React-Toastify Test</CardTitle>
        <CardDescription>
          Test the new toast system with different types and positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleSuccessToast} variant="default" className="w-full">
            Success Toast
          </Button>
          
          <Button onClick={handleErrorToast} variant="destructive" className="w-full">
            Error Toast
          </Button>
          
          <Button onClick={handleInfoToast} variant="secondary" className="w-full">
            Info Toast
          </Button>
          
          <Button onClick={handleWarningToast} variant="outline" className="w-full">
            Warning Toast
          </Button>
          
          <Button onClick={handleLegacyToast} variant="ghost" className="w-full">
            Legacy Format
          </Button>
          
          <Button onClick={handleDestructiveToast} variant="destructive" className="w-full">
            Destructive Legacy
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Toast Features:</h3>
          <ul className="text-sm space-y-1">
            <li>✅ Top-right positioning</li>
            <li>✅ 4-second auto-close (5s for errors)</li>
            <li>✅ Click to dismiss</li>
            <li>✅ Hover to pause</li>
            <li>✅ Drag to dismiss</li>
            <li>✅ Progress bar indicator</li>
            <li>✅ Light/Dark theme support</li>
            <li>✅ Custom styling with Tailwind</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToastTest;