import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, UserX, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

const GoogleOAuthFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    title: "Authentication Failed",
    message: "We couldn't sign you in with Google. Please try again.",
    icon: AlertCircle,
    variant: "destructive" as const,
    showContact: false
  });

  useEffect(() => {
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (status === 'failure' && error) {
      switch (error) {
        case 'not_registered':
          setErrorDetails({
            title: "Account Not Registered",
            message: "Your account is not registered in our system. Please contact your administrator to create your account before attempting to login with Google.",
            icon: UserX,
            variant: "destructive",
            showContact: true
          });
          break;
        case 'no_workspace':
          setErrorDetails({
            title: "No Workspace Found",
            message: "Your account doesn't have access to any workspace. Please contact your administrator to set up your workspace.",
            icon: ShieldAlert,
            variant: "destructive",
            showContact: true
          });
          break;
        case 'auth_failed':
        default:
          setErrorDetails({
            title: "Authentication Failed",
            message: message ? decodeURIComponent(message) : "We couldn't sign you in with Google. Please try again.",
            icon: AlertCircle,
            variant: "destructive",
            showContact: false
          });
      }
    }
  }, [searchParams]);

  const IconComponent = errorDetails.icon;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          Team Sync.
        </Link>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <IconComponent className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">{errorDetails.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={errorDetails.variant}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {errorDetails.message}
              </AlertDescription>
            </Alert>
            
            {errorDetails.showContact && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Need help?</strong> Contact your system administrator or IT support team to:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Create your account in the system</li>
                    <li>Assign you to the appropriate workspace</li>
                    <li>Set up your access permissions</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => navigate("/")} className="w-full">
                Back to Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "mailto:support@teamsync.com?subject=Account Access Request"}
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleOAuthFailure;
