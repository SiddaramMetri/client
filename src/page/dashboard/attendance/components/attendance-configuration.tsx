import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Phone, MessageSquare, Smartphone, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAttendanceConfig, useCreateAttendanceConfig } from "@/hooks/api/use-attendance";
import { toast } from "@/hooks/use-toast";

const configSchema = z.object({
  voiceCallConfig: z.object({
    enabled: z.boolean(),
    maxAttempts: z.number().min(1).max(10),
    retryDelayMinutes: z.number().min(5),
    callWindowStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    callWindowEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    messageTemplate: z.string().min(1, "Message template is required"),
  }),
  smsConfig: z.object({
    enabled: z.boolean(),
    maxAttempts: z.number().min(1).max(5),
    retryDelayMinutes: z.number().min(5),
    messageTemplate: z.string().min(1, "Message template is required"),
  }),
  whatsappConfig: z.object({
    enabled: z.boolean(),
    maxAttempts: z.number().min(1).max(3),
    retryDelayMinutes: z.number().min(5),
    messageTemplate: z.string().min(1, "Message template is required"),
    useBusinessAPI: z.boolean(),
  }),
  generalConfig: z.object({
    autoTriggerEnabled: z.boolean(),
    triggerDelayMinutes: z.number().min(0),
    workingDaysOnly: z.boolean(),
    communicationOrder: z.array(z.string()),
  }),
});

type ConfigFormData = z.infer<typeof configSchema>;

const defaultConfig: ConfigFormData = {
  voiceCallConfig: {
    enabled: true,
    maxAttempts: 3,
    retryDelayMinutes: 30,
    callWindowStart: "09:00",
    callWindowEnd: "18:00",
    messageTemplate: "Hello, your child {{studentName}} was absent today. Please contact us if needed.",
  },
  smsConfig: {
    enabled: true,
    maxAttempts: 2,
    retryDelayMinutes: 15,
    messageTemplate: "{{studentName}} was absent today. Contact us for details.",
  },
  whatsappConfig: {
    enabled: true,
    maxAttempts: 1,
    retryDelayMinutes: 10,
    messageTemplate: "Dear Parent, {{studentName}} was absent today. Please ensure regular attendance.",
    useBusinessAPI: true,
  },
  generalConfig: {
    autoTriggerEnabled: true,
    triggerDelayMinutes: 5,
    workingDaysOnly: true,
    communicationOrder: ["voice_call", "sms", "whatsapp"],
  },
};

const AttendanceConfiguration = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  const { data: config, isLoading } = useGetAttendanceConfig();
  const createConfigMutation = useCreateAttendanceConfig();

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: defaultConfig,
  });

  useEffect(() => {
    if (config) {
      form.reset({
        voiceCallConfig: config.voiceCallConfig,
        smsConfig: config.smsConfig,
        whatsappConfig: config.whatsappConfig,
        generalConfig: config.generalConfig,
      });
    }
  }, [config, form]);

  const onSubmit = async (data: ConfigFormData) => {
    try {
      await createConfigMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleReset = () => {
    if (config) {
      form.reset({
        voiceCallConfig: config.voiceCallConfig,
        smsConfig: config.smsConfig,
        whatsappConfig: config.whatsappConfig,
        generalConfig: config.generalConfig,
      });
    } else {
      form.reset(defaultConfig);
    }
    toast({
      title: "Configuration Reset",
      description: "All changes have been reverted to the last saved state.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Attendance Configuration
          </CardTitle>
          <CardDescription>
            Configure communication settings and behavior for attendance management system.
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="voice">Voice Calls</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic configuration and automation settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Automation Settings</h4>
                    
                    <FormField
                      control={form.control}
                      name="generalConfig.autoTriggerEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Auto-trigger Communications</FormLabel>
                            <FormDescription>
                              Automatically send communications when students are marked absent
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalConfig.triggerDelayMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Delay (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Delay before sending communications after marking attendance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalConfig.workingDaysOnly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Working Days Only</FormLabel>
                            <FormDescription>
                              Only send communications on working days
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Voice Call Configuration
                  </CardTitle>
                  <CardDescription>Settings for automated voice call notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="voiceCallConfig.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Voice Calls</FormLabel>
                          <FormDescription>
                            Send automated voice calls to parents
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="voiceCallConfig.maxAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of call attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voiceCallConfig.retryDelayMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Delay (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Time between retry attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voiceCallConfig.callWindowStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Call Window Start</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>
                            Earliest time to make calls
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voiceCallConfig.callWindowEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Call Window End</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>
                            Latest time to make calls
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="voiceCallConfig.messageTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Message Template</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the voice message template"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{studentName}"} as placeholder for student name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                  <CardDescription>Settings for SMS notifications to parents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="smsConfig.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable SMS</FormLabel>
                          <FormDescription>
                            Send SMS notifications to parents
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smsConfig.maxAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of SMS attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smsConfig.retryDelayMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Delay (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Time between retry attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="smsConfig.messageTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS Message Template</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the SMS message template"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{studentName}"} as placeholder for student name. Keep it concise for SMS.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    WhatsApp Configuration
                  </CardTitle>
                  <CardDescription>Settings for WhatsApp notifications to parents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="whatsappConfig.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable WhatsApp</FormLabel>
                          <FormDescription>
                            Send WhatsApp messages to parents
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="whatsappConfig.maxAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Attempts</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="3"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of WhatsApp attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsappConfig.retryDelayMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Delay (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormDescription>
                            Time between retry attempts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="whatsappConfig.useBusinessAPI"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Use WhatsApp Business API</FormLabel>
                          <FormDescription>
                            Use official WhatsApp Business API for messaging
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappConfig.messageTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Message Template</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the WhatsApp message template"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{studentName}"} as placeholder for student name. Can be longer than SMS.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button type="submit" disabled={createConfigMutation.isPending}>
              {createConfigMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AttendanceConfiguration;