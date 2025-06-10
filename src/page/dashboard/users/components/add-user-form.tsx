import React from 'react';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User } from "lucide-react";
import { createUserFormSchema, CreateUserFormData } from "../data/schema";
import { createUser } from "@/services/user.service";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AddUserFormProps {
  onClose: () => void;
}

export default function AddUserForm({ onClose }: AddUserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profilePicture: "",
      isActive: true,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      onClose();
      form.reset();
      toast({
        title: "User Created",
        description: `${data.name} has been successfully created.`,
      });
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.message || "Failed to create user";
      const errorCode = error.response?.data?.errorCode;
      
      // Handle specific error cases
      let title = "Error";
      let description = errorMessage;
      
      if (errorCode === "AUTH_EMAIL_ALREADY_EXISTS" || 
          (errorCode === "VALIDATION_ERROR" && errorMessage.includes("email already exists"))) {
        title = "Email Already Exists";
        description = "A user with this email address already exists. Please use a different email.";
        // Highlight the email field
        form.setError("email", {
          type: "manual",
          message: "This email is already registered"
        });
      }
      
      toast({
        variant: "destructive",
        title,
        description,
      });
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    // Remove empty fields
    const cleanData = {
      ...data,
      profilePicture: data.profilePicture || undefined,
      password: data.password || undefined,
    };
    createUserMutation.mutate(cleanData);
  };

  const handleClose = () => {
    if (!createUserMutation.isPending) {
      onClose();
      form.reset();
    }
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1 text-center sm:text-left">
            Add New User
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Create a new user account with email and profile information
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      className="!h-[48px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      className="!h-[48px]"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear email error when user starts typing
                        if (form.formState.errors.email) {
                          form.clearErrors("email");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter password (optional)" 
                      className="!h-[48px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to generate a random password
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://example.com/avatar.jpg" 
                      className="!h-[48px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional URL to the user's profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">Active Status</FormLabel>
                    <FormDescription>
                      Whether the user account should be active immediately
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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createUserMutation.isPending}
                className="!h-[48px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
                className="min-w-[100px] !h-[48px]"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}