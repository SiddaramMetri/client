import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROLES, new_statuses } from "../data/data";

export default function AddUserForm({ onClose }: { onClose: () => void }) {
  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    mobile: z.string().trim().min(1, {
      message: "Mobile number is required",
    }),
    role: z.string().trim().min(1, {
      message: "Role is required",
    }),
    status: z.string().trim().min(1, {
      message: "Status is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      role: "",
      status: "active",
    },
  });

  const isPending = false; // Replace with actual mutation loading state

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    // Here you would add your API call to create a new user
    // Add a mutation function to handle the API call
    
    // Example:
    // mutate(values, {
    //   onSuccess: () => {
    //     toast({
    //       title: "Success",
    //       description: "User created successfully",
    //       variant: "success",
    //     });
    //     onClose();
    //   },
    //   onError: (error) => {
    //     toast({
    //       title: "Error",
    //       description: error.message,
    //       variant: "destructive",
    //     });
    //   },
    // });
    
    // For now just close the modal
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1
            className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1
           text-center sm:text-left"
          >
            Add New User
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Create a new user account and assign roles and permissions
          </p>
        </div>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Name */}
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mobile */}
            <div>
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123-456-7890"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role */}
            <div>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="!h-[48px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="w-full max-h-[200px] overflow-y-auto">
                          {ROLES.map((role) => (
                            <SelectItem
                              key={role.value}
                              className="!capitalize cursor-pointer"
                              value={role.value}
                            >
                              <div className="flex items-center gap-2">
                                {role.icon && (
                                  <role.icon className="text-muted-foreground size-4" />
                                )}
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="!h-[48px]">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="w-full max-h-[200px] overflow-y-auto">
                          {new_statuses.map((status) => (
                            <SelectItem
                              key={status.value}
                              className="!capitalize cursor-pointer"
                              value={status.value}
                            >
                              <div className="flex items-center gap-2">
                                {status.icon && (
                                  <status.icon className={`size-4 ${status.color}`} />
                                )}
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="!h-[48px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="!h-[48px]"
              >
                {isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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