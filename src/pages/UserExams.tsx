
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useExams } from "@/context/ExamContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Clock, FileCheck, FileX } from "lucide-react";

export default function UserExams() {
  const { currentUser } = useAuth();
  const { exams, userExamResults } = useExams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get assigned exams
  const assignedExamIds = currentUser?.assignedExams || [];
  const assignedExams = exams.filter(exam => assignedExamIds.includes(exam.id));

  // Filter exams based on search
  const filteredExams = assignedExams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">My Exams</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search exams..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const result = userExamResults.find(
                r => r.examId === exam.id && r.userId === currentUser?.id
              );
              
              const isCompleted = result?.completed;
              const hasPassed = result?.score >= exam.passingScore;
              
              return (
                <Card key={exam.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <CardTitle>{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-muted text-xs px-2 py-1 rounded-md">
                        {exam.questions.length} Questions
                      </div>
                      <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {exam.timeLimit} Minutes
                      </div>
                      <div className="bg-muted text-xs px-2 py-1 rounded-md">
                        Pass: {exam.passingScore}%
                      </div>
                    </div>
                    
                    {isCompleted && (
                      <div className="mb-4 flex items-center">
                        <div className={`text-sm px-3 py-2 rounded-md flex items-center ${
                          hasPassed 
                            ? "bg-success/20 text-success" 
                            : "bg-destructive/20 text-destructive"
                        }`}>
                          {hasPassed ? (
                            <>
                              <FileCheck className="h-4 w-4 mr-2" />
                              Passed with {result.score}%
                            </>
                          ) : (
                            <>
                              <FileX className="h-4 w-4 mr-2" />
                              Failed with {result.score}%
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4">
                      <Button
                        className="w-full"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => navigate(`/take-exam/${exam.id}`)}
                      >
                        {isCompleted ? "Review Exam" : "Take Exam"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No exams found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No exams match your search criteria" 
                : "You haven't been assigned any exams yet"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
