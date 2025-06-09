import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/http/api";
import useTokenStore from "@/store";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useTokenStore((state) => state.setToken);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      navigate("/dashboard");
    },
  });

  const handleLoginSubmit = () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    console.log("data", { email, password });

    if (!email || !password) {
      return alert("Please enter email and password");
    }

    mutation.mutate({ email, password });
  };

  // const handleGoogleLogin = () => {
  // Implement Google login logic here
  //   console.log("Google login clicked");
  //   window.location.href = "/dashboard";
  // };

  let loading = false;

  const handleOAuth = (provider: string) => {
    
    window.location.href = `${
      import.meta.env.VITE_BACKEND_BASE_URL
    }/api/auth/${provider}`;
  };

  return (
    <section className="flex justify-center items-center h-screen">
      {/* <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account. <br />
                        {mutation.isError && (
                            <span className="text-red-500 text-sm">{'Something went wrong'}</span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            ref={emailRef}
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input ref={passwordRef} id="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full">
                        <Button
                            onClick={handleLoginSubmit}
                            className="w-full"
                            disabled={mutation.isPending}>
                            {mutation.isPending && <LoaderCircle className="animate-spin" />}

                            <span className="ml-2">Sign in</span>
                        </Button>

                        <div className="mt-4 text-center text-sm">
                            Don't have an account?{' '}
                            <Link to={'/auth/register'} className="underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </CardFooter>
          </Card> */}

      <Card className="w-full max-w-md shadow-material-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              CMSys
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              College Management System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          {/* {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                Authenticating...
              </AlertDescription>
            </Alert>
          )} */}

          {/* Google Login Button */}
          <Button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Sign in with Google
          </Button>

          {/* Information Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Only pre-approved institutional email addresses are authorized to
              access this system.
            </AlertDescription>
          </Alert>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Protected by advanced security measures</p>
            <p>Your data is encrypted and secure</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LoginPage;
