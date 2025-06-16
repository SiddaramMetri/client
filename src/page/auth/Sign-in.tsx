import GoogleOauthButton from "@/components/auth/google-oauth-button";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { toast } from "@/hooks/use-toast";
import { loginMutationFn } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect } from "react";
import { toastError, toastSuccess } from "@/utils/toast";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  // Handle OAuth error messages from URL parameters
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth_status");
    const oauthError = searchParams.get("oauth_error");
    const oauthMessage = searchParams.get("oauth_message");

    if (oauthStatus === "failure" && oauthError) {
      let title = "Authentication Failed";
      let description = "We couldn't sign you in with Google. Please try again.";

      switch (oauthError) {
        case "not_registered":
          title = "Account Not Registered";
          description = "Your account is not registered in our system. Please contact your administrator to create your account before attempting to login with Google.";
          break;
        case "no_workspace":
          title = "No Workspace Found";
          description = "Your account doesn't have access to any workspace. Please contact your administrator to set up your workspace.";
          break;
        case "auth_failed":
        default:
          if (oauthMessage) {
            description = decodeURIComponent(oauthMessage);
          }
      }

      if (oauthError === "not_registered") {
        toastError(title, description);
      } else if (oauthError === "no_workspace") {
        toastError(title, description);
      } else if (oauthError === "auth_failed") {
        toastError(title, description);
      } else {
        toastSuccess(title, description);
      }

      // Clean up URL parameters after showing the error
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("oauth_status");
      newSearchParams.delete("oauth_error");
      newSearchParams.delete("oauth_message");
      
      const newUrl = newSearchParams.toString() 
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  const formSchema = z.object({
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        const user = data.user;
        console.log(user);
        const decodedUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
        navigate(decodedUrl || `/dashboard`);
      },
      onError: (error) => {
        let description = error.message;
        let action = undefined;
        
        // If error suggests user needs to sign up
        if (error.message.includes("sign up") || error.message.includes("No account found")) {
          action = (
            <div className="flex gap-2 mt-2">
              <Link to="/sign-up" className="text-sm underline">
                Sign up here
              </Link>
            </div>
          );
        }
        
        // If error suggests using Google login
        if (error.message.includes("Google")) {
          description = error.message + " Use the 'Login with Google' button above.";
        }
        
        toast({
          title: "Login Failed",
          description,
          variant: "destructive",
          action,
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          CMSync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Login with your Email or Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                      <GoogleOauthButton label="Login" />
                    </div>
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="m@example.com" {...field} />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center">
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                  Password
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>

                              <FormMessage />
                             <div className="flex justify-end">
                             <a
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                              >
                                Forgot your password?
                              </a>
                             </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                      >
                        {isPending && <Loader className="animate-spin" />}
                        Login
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
