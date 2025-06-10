import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Keyboard, 
  Navigation, 
  Zap, 
  Settings,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  Space,
  Home,
  End
} from "lucide-react";
import { motion } from "framer-motion";
import { generateKeyboardHelp } from "../utils/enhanced-keyboard-navigation";

interface KeyboardHelpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const KeyIcon = ({ keyName }: { keyName: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    '↑': <ArrowUp className="h-3 w-3" />,
    '↓': <ArrowDown className="h-3 w-3" />,
    '←': <ArrowLeft className="h-3 w-3" />,
    '→': <ArrowRight className="h-3 w-3" />,
    'Enter': <CornerDownLeft className="h-3 w-3" />,
    'Space': <Space className="h-3 w-3" />,
    'Home': <Home className="h-3 w-3" />,
    'End': <End className="h-3 w-3" />,
  };

  return (
    <Badge 
      variant="outline" 
      className="font-mono text-xs px-2 py-1 bg-muted/50 border-border/50 min-w-[2rem] justify-center"
    >
      {iconMap[keyName] || keyName}
    </Badge>
  );
};

const ShortcutRow = ({ 
  keys, 
  description, 
  category 
}: { 
  keys: string[]; 
  description: string; 
  category?: string;
}) => {
  const categoryColors = {
    navigation: 'border-l-blue-500',
    action: 'border-l-emerald-500', 
    system: 'border-l-amber-500',
    quick: 'border-l-purple-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between py-2 px-3 rounded-lg border-l-2 bg-muted/20 ${
        category ? categoryColors[category as keyof typeof categoryColors] : 'border-l-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          {keys.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span className="text-muted-foreground text-xs">or</span>}
              <KeyIcon keyName={key} />
            </React.Fragment>
          ))}
        </div>
        <span className="text-sm text-foreground">{description}</span>
      </div>
    </motion.div>
  );
};

export default function KeyboardHelpDialog({ 
  open, 
  onOpenChange, 
  trigger 
}: KeyboardHelpDialogProps) {
  const helpContent = generateKeyboardHelp();

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Keyboard className="h-4 w-4" />
      <span className="hidden sm:inline">Keyboard Shortcuts</span>
      <Badge variant="secondary" className="text-xs">F1</Badge>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts & Navigation
          </DialogTitle>
          <DialogDescription>
            Master these shortcuts to navigate and manage attendance efficiently. 
            Press <Badge variant="outline" className="mx-1 font-mono">F1</Badge> anytime to toggle this help.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Navigation Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-blue-500" />
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {helpContent.navigation.map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  keys={shortcut.keys}
                  description={shortcut.description}
                  category="navigation"
                />
              ))}
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-emerald-500" />
                Attendance Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {helpContent.actions.map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  keys={shortcut.keys}
                  description={shortcut.description}
                  category="action"
                />
              ))}
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-amber-500" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {helpContent.system.map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  keys={shortcut.keys}
                  description={shortcut.description}
                  category="system"
                />
              ))}
            </CardContent>
          </Card>

          {/* Tips & Tricks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                💡 Tips & Tricks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">💾</Badge>
                  <div>
                    <p className="font-medium">Auto-save is available</p>
                    <p className="text-muted-foreground text-xs">
                      Press <Badge variant="outline" className="mx-1 font-mono text-xs">Ctrl+S</Badge> 
                      or use the save button to persist changes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">⚡</Badge>
                  <div>
                    <p className="font-medium">Batch operations</p>
                    <p className="text-muted-foreground text-xs">
                      Use the quick action buttons to mark all students at once
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">🔍</Badge>
                  <div>
                    <p className="font-medium">Search & filter</p>
                    <p className="text-muted-foreground text-xs">
                      Use the search bar and filters to quickly find specific students
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">📱</Badge>
                  <div>
                    <p className="font-medium">Mobile optimized</p>
                    <p className="text-muted-foreground text-xs">
                      Interface automatically adapts to smaller screens with touch-friendly controls
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />
        
        {/* Accessibility Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            🌐 Accessibility Features
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>• Screen reader announcements for all navigation and status changes</p>
            <p>• High contrast mode support with focus indicators</p>
            <p>• Full keyboard navigation without mouse dependency</p>
            <p>• ARIA labels and landmarks for assistive technologies</p>
            <p>• Customizable text size and spacing (browser zoom supported)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            💡 Tip: Most shortcuts work from anywhere in the attendance interface
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenChange?.(false)}
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}