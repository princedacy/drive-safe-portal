
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useRoleNavigation } from "@/hooks/use-role-navigation";

export default function MagicLinkLogin() {
  const [searchParams] = useSearchParams();
  const { magicLinkLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { navigateByRole } = useRoleNavigation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setError("Invalid login link. Please request a new one.");
      return;
    }

    const loginWithToken = async () => {
      try {
        await magicLinkLogin(token);
        toast({
          title: "Login successful",
          description: "You have been successfully logged in.",
        });
        navigateByRole();
      } catch (err) {
        setError("Login failed. The link may have expired or is invalid.");
        toast({
          title: "Login failed",
          description: "The login link may have expired or is invalid.",
          variant: "destructive",
        });
      }
    };

    loginWithToken();
  }, [searchParams, magicLinkLogin, navigateByRole, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Ikizamini Portal</CardTitle>
            <CardDescription className="text-center">
              Magic Link Login
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p>Logging you in...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-success">Login successful! Redirecting...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/login")} variant="outline">
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
