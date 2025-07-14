
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useExams } from "@/context/ExamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Mail, Loader2 } from "lucide-react";

interface Candidate {
  _id: string;
  email: string;
  name?: string;
  status?: string;
}

export default function AssignExam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exams, addExamCandidate, fetchExamCandidates, isLoading } = useExams();
  
  const [email, setEmail] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  
  // Get the specific exam
  const exam = exams.find((e) => e.id === examId);
  
  // Load existing candidates
  useEffect(() => {
    const loadCandidates = async () => {
      if (!examId) return;
      
      setIsLoadingCandidates(true);
      try {
        const response = await fetchExamCandidates(examId);
        setCandidates(response || []);
      } catch (error) {
        console.error('Error loading candidates:', error);
        toast({
          title: "Error",
          description: "Failed to load exam candidates",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    loadCandidates();
  }, [examId, fetchExamCandidates, toast]);
  
  // Handle adding candidate by email
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examId || !email.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingCandidate(true);
    try {
      await addExamCandidate(examId, email.trim());
      
      toast({
        title: "Candidate Added",
        description: `Successfully added ${email} to the exam`,
      });
      
      // Clear the email input
      setEmail("");
      
      // Reload candidates list
      const response = await fetchExamCandidates(examId);
      setCandidates(response || []);
      
    } catch (error: any) {
      console.error('Error adding candidate:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add candidate",
        variant: "destructive",
      });
    } finally {
      setIsAddingCandidate(false);
    }
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
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assign Candidates to: {exam.title}</CardTitle>
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
        
        {/* Add Candidate Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Add Candidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCandidate} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter candidate's email address"
                  disabled={isAddingCandidate}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isAddingCandidate || !email.trim()}
              >
                {isAddingCandidate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Candidates ({candidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCandidates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading candidates...</span>
              </div>
            ) : candidates.length > 0 ? (
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div 
                    key={candidate._id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-muted-foreground mr-3" />
                      <div>
                        <p className="font-medium">{candidate.email}</p>
                        {candidate.name && (
                          <p className="text-sm text-muted-foreground">{candidate.name}</p>
                        )}
                        {candidate.status && (
                          <span className="inline-block bg-muted text-xs px-2 py-1 rounded-md mt-1">
                            {candidate.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No candidates assigned</h3>
                <p className="text-muted-foreground">
                  Add candidates by entering their email addresses above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
