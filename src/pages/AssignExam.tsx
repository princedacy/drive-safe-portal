
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useExams } from "@/context/ExamContext";
import { useUsers } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowLeft, Check } from "lucide-react";
import { USER_ROLE } from "@/types/UserRole";

export default function AssignExam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exams, assignExamToUser } = useExams();
  const { users } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Get the specific exam
  const exam = exams.find((e) => e.id === examId);
  
  // Filter for regular users only and apply search
  const filteredUsers = users.filter((user) => 
    user.role === USER_ROLE &&
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle select/deselect all
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };
  
  // Handle individual select/deselect
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Handle assign exams to selected users
  const handleAssignExam = () => {
    if (!examId || selectedUsers.length === 0) return;
    
    // Assign exam to each selected user
    selectedUsers.forEach(userId => {
      assignExamToUser(examId, userId);
    });
    
    toast({
      title: "Exam assigned",
      description: `Assigned to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`,
    });
    
    // Clear selection
    setSelectedUsers([]);
  };
  
  if (!exam) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Button variant="ghost" onClick={() => navigate("/exams")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
          
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground">The exam you're trying to assign doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
          
          <Button 
            onClick={handleAssignExam}
            disabled={selectedUsers.length === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assign {exam.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{exam.description}</p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-muted text-sm px-2 py-1 rounded-md">
                {exam.questions.length} Questions
              </div>
              {exam.timeLimit && (
                <div className="bg-muted text-sm px-2 py-1 rounded-md">
                  {exam.timeLimit} Minutes
                </div>
              )}
              {exam.passingScore && (
                <div className="bg-muted text-sm px-2 py-1 rounded-md">
                  Passing: {exam.passingScore}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Users</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search users..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border border-input">
                <div className="flex items-center p-4 bg-muted border-b">
                  <div className="flex items-center flex-1">
                    <Checkbox 
                      id="select-all"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="mr-3"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All Users
                    </label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUsers.length} of {filteredUsers.length} selected
                  </div>
                </div>
                
                {filteredUsers.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center p-4 border-b">
                        <Checkbox 
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                          className="mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <label 
                            htmlFor={`user-${user.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}
                          </label>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No users match your search' : 'No users found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
