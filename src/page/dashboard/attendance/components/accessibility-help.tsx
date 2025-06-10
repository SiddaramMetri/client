import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accessibility, Keyboard, MousePointer, Smartphone, Users } from "lucide-react";

export default function AccessibilityHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Accessibility className="h-4 w-4 mr-2" />
          <span>Accessibility</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Accessibility Features</DialogTitle>
          <DialogDescription>
            This attendance system includes various accessibility features to make it usable for everyone.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="keyboard">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="keyboard" className="flex flex-col items-center gap-1 py-2">
              <Keyboard className="h-4 w-4" />
              <span className="text-xs">Keyboard</span>
            </TabsTrigger>
            <TabsTrigger value="screen-readers" className="flex flex-col items-center gap-1 py-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Screen Readers</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex flex-col items-center gap-1 py-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs">Touch</span>
            </TabsTrigger>
            <TabsTrigger value="mouse" className="flex flex-col items-center gap-1 py-2">
              <MousePointer className="h-4 w-4" />
              <span className="text-xs">Mouse</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex flex-col items-center gap-1 py-2">
              <Accessibility className="h-4 w-4" />
              <span className="text-xs">General</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="keyboard" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Keyboard Navigation</h3>
              <p className="mb-4">The attendance system supports full keyboard navigation for users who cannot or prefer not to use a mouse.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Navigation Keys</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">Tab</kbd>
                      <span>Move between interactive elements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">↑</kbd>
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">↓</kbd>
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">←</kbd>
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">→</kbd>
                      <span>Navigate between students in grid or table</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">Home</kbd>
                      <span>Go to first student</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">End</kbd>
                      <span>Go to last student</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Attendance Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">Space</kbd>
                      <span>Cycle status (Present → Leave → Absent → Present)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">P</kbd>
                      <span>Mark selected student as Present</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">L</kbd>
                      <span>Mark selected student as on Leave</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-muted border rounded text-xs">A</kbd>
                      <span>Mark selected student as Absent</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tips for Keyboard Users</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Press <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Esc</kbd> to close dialogs or dismiss dropdowns</li>
                    <li>Use <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Tab</kbd> and <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Shift+Tab</kbd> to navigate through buttons and form controls</li>
                    <li>Arrow keys work in both table and grid layouts</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="screen-readers" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Screen Reader Support</h3>
              <p className="mb-4">This attendance system has been optimized for compatibility with screen readers.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">ARIA Attributes</h4>
                  <p>All interactive elements include proper ARIA labels and roles:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Student cards announce their name and current attendance status</li>
                    <li>Status buttons announce their purpose and current state</li>
                    <li>Filter controls announce the current selection state</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Keyboard Focus Indicators</h4>
                  <p>Visual focus indicators remain visible for keyboard navigation, helping screen reader users understand their current location.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Status Updates</h4>
                  <p>When attendance status changes, screen readers announce the change.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mobile" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Mobile and Touch Support</h3>
              <p className="mb-4">The attendance system is fully optimized for touch devices.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Adaptive Layout</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Automatically switches to grid view on smaller screens</li>
                    <li>Touch targets are properly sized (at least 44×44 pixels)</li>
                    <li>Adequate spacing between interactive elements prevents accidental taps</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Touch Gestures</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Swipe to scroll through student lists</li>
                    <li>Tap to mark attendance status</li>
                    <li>Pull to refresh (in supported browsers)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mouse" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Mouse Interaction</h3>
              <p className="mb-4">The attendance system offers intuitive mouse interactions.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Hover Effects</h4>
                  <p>Interactive elements show hover states to indicate they can be clicked.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Click Actions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Click on P, L, or A buttons to change attendance status</li>
                    <li>Click on filter buttons to show specific attendance categories</li>
                    <li>Click and drag to select multiple rows in table view (when supported)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="general" className="mt-0">
              <h3 className="text-lg font-medium mb-3">General Accessibility Features</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Visual Design</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>High contrast colors for status indicators</li>
                    <li>Respects system dark/light mode preferences</li>
                    <li>Icons are accompanied by text labels where possible</li>
                    <li>Text has adequate contrast ratios (minimum 4.5:1 for normal text)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Data Entry</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Multiple ways to mark attendance (buttons, keyboard, radio buttons)</li>
                    <li>Batch actions to mark all students at once</li>
                    <li>Clear visual confirmation of current status</li>
                    <li>Undo functionality for accidental changes (when available)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Error Handling</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Error messages are clearly displayed with instructions</li>
                    <li>Offline mode preserves changes when connectivity is lost</li>
                    <li>Validation errors provide specific guidance</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" className="w-full">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
