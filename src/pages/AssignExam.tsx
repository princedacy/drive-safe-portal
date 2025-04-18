
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useExams } from "@/context/ExamContext";
import { useUsers } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle, ArrowLeft } from "lucide-react";

export default function AssignExam() {
  const { examId } = useParams<{ examId: string }>();
  const { exams, assignExamToUser } = useExams();
  const { users } = useUsers();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const exam = exams.find(e => e.id === examId);
  
  // Get users with role "user"
  const testUsers = users.filter(user => user.role === "user");
  
  // Filter users based on search
  const filteredUsers = testUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    if (!exam) {
      toast({
        title: "Exam not found",
        description: "The requested exam could not be found.",
        variant: "destructive",
      });
      navigate("/exams");
    }
  }, [exam, navigate, toast]);
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(user => user.id));
  };
  
  const unselectAll = () => {
    setSelectedUsers([]);
  };
  
  const handleAssignExam = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to assign this exam to.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAssigning(true);
    
    try {
      // In a real app, this would be an API call
      await Promise.all(
        selectedUsers.map(userId => assignExamToUser(examId || "", userId))
      );
      
      toast({
        title: "Exam assigned",
        description: `The exam has been assigned to ${selectedUsers.length} user(s).`,
      });
      
      navigate("/exams");
    } catch (error) {
      toast({
        title: "Error assigning exam",
        description: "There was an error assigning the exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  if (!exam) {
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate("/exams")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Exams
          </Button>
          <h1 className="text-3xl font-bold">Assign Exam</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p><strong>Questions:</strong> {exam.questions.length}</p>
              <p><strong>Time Limit:</strong> {exam.timeLimit} minutes</p>
              <p><strong>Passing Score:</strong> {exam.passingScore}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Users</CardTitle>
            <CardDescription>
              Choose which users should take this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search users by name or email..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={unselectAll}>
                  Clear Selection
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted p-3 flex items-center">
                <div className="w-8"></div>
                <div className="flex-1 font-medium">Name</div>
                <div className="flex-1 font-medium">Email</div>
              </div>
              
              {filteredUsers.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className={`p-3 flex items-center border-t ${
                        selectedUsers.includes(user.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="w-8">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          id={`user-${user.id}`}
                        />
                      </div>
                      <label 
                        htmlFor={`user-${user.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {user.name}
                      </label>
                      <div className="flex-1">{user.email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No users match your search criteria"
                      : "No users found"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/exams")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignExam}
              disabled={selectedUsers.length === 0 || isAssigning}
            >
              {isAssigning ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
