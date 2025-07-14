
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExams, Question, Exam } from "@/context/ExamContext";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TakeExam() {
  const { examId } = useParams<{ examId: string }>();
  const { exams, userExamResults, saveExamResult, fetchExamById } = useExams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;
      
      setIsLoading(true);
      
      try {
        // Check if there's a saved exam result
        const savedResult = userExamResults.find(
          (result) => result.examId === examId && result.userId === currentUser?.id
        );
        
        // Load exam from API
        const fetchedExam = await fetchExamById(examId);
        
        if (fetchedExam) {
          setExam(fetchedExam);
          
          // If there's a saved result and it's not completed, resume it
          if (savedResult && !savedResult.completed) {
            setSelectedAnswers(savedResult.answers);
            setExamStarted(true);
            
            // Calculate time left if time limit exists
            if (fetchedExam.timeLimit) {
              const startTime = new Date(savedResult.startedAt).getTime();
              const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
              const remainingTime = Math.max(0, (fetchedExam.timeLimit || 0) - timeElapsed);
              setTimeLeft(Math.round(remainingTime));
            }
          } else if (savedResult && savedResult.completed) {
            // If exam is already completed, show the results
            setSelectedAnswers(savedResult.answers);
            setExamCompleted(true);
            setScore(savedResult.score);
            setExamStarted(true);
          }
        } else {
          toast({
            title: "Exam not found",
            description: "The exam you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          });
          navigate("/my-exams");
        }
      } catch (error) {
        console.error("Error loading exam:", error);
        toast({
          title: "Error loading exam",
          description: "There was a problem loading the exam. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExam();
  }, [examId, userExamResults, currentUser]);
  
  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted || !timeLeft) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleExamSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [examStarted, examCompleted, timeLeft]);
  
  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft === null) return "";
    
    const hours = Math.floor(timeLeft / 60);
    const minutes = Math.floor(timeLeft % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes} minutes left`;
  };
  
  // Start the exam
  const handleStartExam = () => {
    if (!exam || !currentUser) return;
    
    setExamStarted(true);
    
    if (exam.timeLimit) {
      setTimeLeft(exam.timeLimit);
    }
    
    // Initialize selected answers array
    const initialAnswers = new Array(exam.questions.length).fill(-1);
    setSelectedAnswers(initialAnswers);
    
    // Save the initial state to record that exam has started
    saveExamResult({
      userId: currentUser.id,
      examId: exam.id,
      answers: initialAnswers,
      score: 0,
      completed: false,
      startedAt: new Date().toISOString(),
    });
    
    toast({
      title: "Exam started",
      description: "Good luck! Take your time and answer all questions.",
    });
  };
  
  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (examCompleted) return;
    
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (!exam || currentQuestionIndex >= exam.questions.length - 1) return;
    
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };
  
  // Submit exam
  const handleExamSubmit = (isTimeUp = false) => {
    if (!exam || !currentUser) return;
    
    // Calculate score
    let correctAnswers = 0;
    
    exam.questions.forEach((question, index) => {
      if (question.type === "MULTIPLE_CHOICE" && 
          question.answer !== undefined && 
          selectedAnswers[index] === (question.answer - 1)) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / exam.questions.length) * 100);
    setScore(calculatedScore);
    
    // Save the result
    saveExamResult({
      userId: currentUser.id,
      examId: exam.id,
      answers: selectedAnswers,
      score: calculatedScore,
      completed: true,
      startedAt: new Date().toISOString(),
    }, true);
    
    setExamCompleted(true);
    
    toast({
      title: isTimeUp ? "Time's up!" : "Exam Submitted",
      description: `You scored ${calculatedScore}% on this exam.`,
      variant: calculatedScore >= (exam.passingScore || 70) ? "default" : "destructive",
    });
  };
  
  // Current question
  const currentQuestion = exam?.questions[currentQuestionIndex];
  
  // Progress calculation
  const answeredQuestionsCount = selectedAnswers.filter((answer) => answer !== -1).length;
  const progressPercentage = exam ? (answeredQuestionsCount / exam.questions.length) * 100 : 0;
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!exam) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
            <p className="mb-6 text-muted-foreground">
              The exam you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/my-exams")}>
              Return to My Exams
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        
        {!examStarted && !examCompleted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Start Exam</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="mr-3 bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{exam.questions.length}</span>
                  </div>
                  <span>Questions</span>
                </div>
                
                {exam.timeLimit && (
                  <div className="flex items-center">
                    <div className="mr-3 bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span>{exam.timeLimit} minutes time limit</span>
                  </div>
                )}
                
                {exam.passingScore && (
                  <div className="flex items-center">
                    <div className="mr-3 bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>{exam.passingScore}% passing score required</span>
                  </div>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Read each question carefully before answering</li>
                  <li>You can move between questions using the navigation buttons</li>
                  <li>Click "Submit Exam" when you've finished all questions</li>
                  {exam.timeLimit && (
                    <li>The exam will automatically submit when time runs out</li>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartExam} className="w-full">
                Start Exam
              </Button>
            </CardFooter>
          </Card>
        ) : examCompleted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-4">{score}%</div>
                <div className={`text-lg font-medium ${
                  score !== null && score >= (exam.passingScore || 70)
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {score !== null && score >= (exam.passingScore || 70)
                    ? "Passed!"
                    : "Failed"}
                </div>
              </div>
              
              {exam.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">
                    {index + 1}. {question.title}
                  </h3>
                  {question.description && <p className="text-sm text-muted-foreground mb-3">{question.description}</p>}
                  
                  {question.type === "MULTIPLE_CHOICE" && question.choices && (
                    <div className="space-y-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div 
                          key={choiceIndex}
                          className={`p-3 rounded-md border ${
                            choiceIndex === selectedAnswers[index] 
                              ? choiceIndex === (question.answer ? question.answer - 1 : 0)
                                ? "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800"
                                : "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800" 
                              : choiceIndex === (question.answer ? question.answer - 1 : 0)
                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                                : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-3">
                              {choiceIndex === selectedAnswers[index] ? (
                                choiceIndex === (question.answer ? question.answer - 1 : 0) ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-600" />
                                )
                              ) : choiceIndex === (question.answer ? question.answer - 1 : 0) ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : null}
                            </div>
                            <div>{choice}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "OPEN_ENDED" && (
                    <div className="italic text-muted-foreground p-3 border rounded-md">
                      Open-ended questions are not automatically graded
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/my-exams")} className="w-full">
                Return to My Exams
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </span>
                <Progress value={progressPercentage} className="w-40 h-2" />
                <span className="text-sm text-muted-foreground ml-2">
                  {answeredQuestionsCount}/{exam.questions.length} answered
                </span>
              </div>
              
              {exam.timeLimit && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className={timeLeft !== null && timeLeft < 5 ? "text-red-500 font-bold" : ""}>
                    {formatTimeLeft()}
                  </span>
                </div>
              )}
            </div>
            
            <Card className="mb-6">
              <CardContent className="pt-6">
                {currentQuestion && (
                  <>
                    <h2 className="text-xl font-bold mb-4">{currentQuestion.title}</h2>
                    {currentQuestion.description && (
                      <p className="mb-6 text-muted-foreground">{currentQuestion.description}</p>
                    )}
                    
                    {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.choices && (
                      <div className="space-y-3">
                        {currentQuestion.choices.map((choice, index) => (
                          <div 
                            key={index}
                            className={`p-4 border rounded-md cursor-pointer transition-colors ${
                              selectedAnswers[currentQuestionIndex] === index 
                                ? "bg-primary/10 border-primary" 
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleAnswerSelect(index)}
                          >
                            {choice}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {currentQuestion.type === "OPEN_ENDED" && (
                      <div className="p-6 border rounded-md">
                        <h3 className="font-medium mb-2">Open-Ended Question</h3>
                        <p className="text-muted-foreground">
                          Please write your answer on paper. This question will be manually graded.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex <= 0}
              >
                Previous Question
              </Button>
              
              {currentQuestionIndex < exam.questions.length - 1 ? (
                <Button 
                  onClick={handleNextQuestion}
                >
                  Next Question
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowConfirmDialog(true)}
                  variant="default"
                >
                  Submit Exam
                </Button>
              )}
            </div>
            
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Exam</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to submit your exam? 
                    {answeredQuestionsCount < exam.questions.length && (
                      <span className="text-amber-600 font-medium block mt-2">
                        Warning: You have only answered {answeredQuestionsCount} out of {exam.questions.length} questions.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowConfirmDialog(false);
                      handleExamSubmit();
                    }}
                  >
                    Submit Exam
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </MainLayout>
  );
}
