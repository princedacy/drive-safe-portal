
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/types/UserRole";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "You have successfully logged in.",
      });
      
      // Get the user role from the auth context
      const { currentUser } = useAuth();
      
      // Redirect based on user role
      if (currentUser?.role === USER_ROLE) {
        navigate("/my-exams", { replace: true });
      } else if (currentUser?.role === ADMIN_ROLE || currentUser?.role === SUPER_ADMIN_ROLE) {
        navigate("/dashboard", { replace: true });
      } else {
        // Default redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Ikizamini Portal</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                For testing use: <br />
                <code className="text-xs bg-muted p-1 rounded">admin@hillygeeks.com</code> / <code className="text-xs bg-muted p-1 rounded">test12345</code>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
