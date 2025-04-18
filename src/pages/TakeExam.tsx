
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useExams } from "@/context/ExamContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TakeExam() {
  const { examId } = useParams<{ examId: string }>();
  const { currentUser } = useAuth();
  const { exams, userExamResults, saveExamResult } = useExams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Get the exam
  const exam = exams.find(e => e.id === examId);
  
  // Check if user has already completed this exam
  const userResult = userExamResults.find(
    r => r.examId === examId && r.userId === currentUser?.id && r.completed
  );
  
  const isReview = !!userResult?.completed;
  
  useEffect(() => {
    if (!exam) {
      toast({
        title: "Exam not found",
        description: "The requested exam could not be found.",
        variant: "destructive",
      });
      navigate("/my-exams");
      return;
    }
    
    if (isReview) {
      // For review mode, load the user's previous answers
      setSelectedAnswers(userResult.answers);
      setExamCompleted(true);
    } else {
      // Initialize empty answers for each question
      setSelectedAnswers(new Array(exam.questions.length).fill(-1));
      setTimeRemaining(exam.timeLimit * 60);
    }
  }, [exam, isReview, navigate, toast, userResult]);
  
  useEffect(() => {
    if (!examStarted || examCompleted || isReview) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        
        // Show warning when 1 minute remains
        if (prev === 60) {
          setShowTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [examStarted, examCompleted, isReview]);
  
  const startExam = () => {
    setExamStarted(true);
    // Save the started exam to track time
    saveExamResult({
      userId: currentUser?.id || "",
      examId: examId || "",
      score: 0,
      answers: selectedAnswers,
      completed: false,
      startedAt: new Date().toISOString(),
    });
  };
  
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const handleAnswerSelect = (optionIndex: number) => {
    if (examCompleted || isReview) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };
  
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const nextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const calculateScore = () => {
    if (!exam) return 0;
    
    let correctAnswers = 0;
    
    exam.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctOption) {
        correctAnswers++;
      }
    });
    
    return Math.round((correctAnswers / exam.questions.length) * 100);
  };
  
  const submitExam = () => {
    if (!exam || !currentUser) return;
    
    const score = calculateScore();
    const passed = score >= exam.passingScore;
    
    saveExamResult({
      userId: currentUser.id,
      examId: exam.id,
      score,
      answers: selectedAnswers,
      completed: true,
      startedAt: new Date().toISOString(),
    }, true);
    
    setExamCompleted(true);
    setShowSubmitDialog(false);
    
    toast({
      title: passed ? "Exam Passed!" : "Exam Failed",
      description: `Your score: ${score}%. ${passed ? "Congratulations!" : "Please review and try again."}`,
      variant: passed ? "default" : "destructive",
    });
  };
  
  if (!exam) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Exam Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested exam could not be found.</p>
          <Button onClick={() => navigate("/my-exams")}>Back to My Exams</Button>
        </div>
      </MainLayout>
    );
  }
  
  const question = exam.questions[currentQuestionIndex];
  
  const renderWelcomePage = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{exam.description}</p>
          
          <div className="bg-muted p-4 rounded-md space-y-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Time Limit: {exam.timeLimit} minutes</span>
            </div>
            <div>Questions: {exam.questions.length}</div>
            <div>Passing Score: {exam.passingScore}%</div>
          </div>
          
          <div className="bg-accent/30 p-4 rounded-md">
            <h3 className="font-medium mb-2">Instructions:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You have {exam.timeLimit} minutes to complete this exam.</li>
              <li>Each question has one correct answer.</li>
              <li>You can navigate between questions using the buttons at the bottom.</li>
              <li>Once you submit the exam, you cannot change your answers.</li>
              <li>You must score at least {exam.passingScore}% to pass.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startExam} className="w-full">
            Start Exam
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
  
  const renderExamQuestion = () => (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </p>
        </div>
        
        {!isReview && (
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className={`font-mono text-lg ${timeRemaining < 60 ? "text-destructive" : ""}`}>
              {formatTimeRemaining()}
            </span>
          </div>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border rounded-md cursor-pointer transition-colors ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                } ${
                  isReview && index === question.correctOption
                    ? "border-success bg-success/10"
                    : ""
                } ${
                  isReview && 
                  selectedAnswers[currentQuestionIndex] === index && 
                  index !== question.correctOption
                    ? "border-destructive bg-destructive/10"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1">{option}</div>
                  
                  {isReview && index === question.correctOption && (
                    <CheckCircle2 className="h-5 w-5 text-success ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            {isReview ? (
              <Button onClick={() => navigate("/my-exams")}>
                Back to My Exams
              </Button>
            ) : (
              examCompleted ? (
                <Button onClick={() => navigate("/my-exams")}>
                  Finish
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  variant="default"
                >
                  Submit Exam
                </Button>
              )
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={nextQuestion}
            disabled={currentQuestionIndex === exam.questions.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {exam.questions.map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={`w-10 h-10 ${
              index === currentQuestionIndex
                ? "bg-primary text-primary-foreground"
                : ""
            } ${
              selectedAnswers[index] !== -1 && index !== currentQuestionIndex
                ? "bg-muted"
                : ""
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
  
  const renderResults = () => {
    const score = calculateScore();
    const passed = score >= exam.passingScore;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Exam Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${passed ? "text-success" : "text-destructive"}`}>
                {score}%
              </div>
              <p className="text-lg mb-4">
                {passed ? "Congratulations! You passed the exam." : "Sorry, you did not pass the exam."}
              </p>
              <div className="bg-muted p-4 rounded-md inline-block">
                <p>Passing score: {exam.passingScore}%</p>
                <p>Correct answers: {selectedAnswers.filter((answer, index) => 
                  answer === exam.questions[index].correctOption).length} 
                  out of {exam.questions.length}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Question Summary:</h3>
              <div className="space-y-2">
                {exam.questions.map((q, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md ${
                      selectedAnswers[index] === q.correctOption
                        ? "bg-success/10 border border-success/20"
                        : "bg-destructive/10 border border-destructive/20"
                    }`}
                  >
                    <p className="font-medium">{index + 1}. {q.text}</p>
                    <p className="text-sm">
                      Your answer: {q.options[selectedAnswers[index]]}
                      {selectedAnswers[index] !== q.correctOption && (
                        <span className="block text-sm mt-1">
                          Correct answer: {q.options[q.correctOption]}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/my-exams")}>
              Return to My Exams
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        {!examStarted && !isReview ? renderWelcomePage() : (
          examCompleted ? renderResults() : renderExamQuestion()
        )}
        
        <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Time is running out!</AlertDialogTitle>
              <AlertDialogDescription>
                You have less than 1 minute remaining to complete the exam.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your exam? You won't be able to change your answers once submitted.
                
                {selectedAnswers.some(answer => answer === -1) && (
                  <div className="mt-2 flex items-center text-destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    You have unanswered questions!
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submitExam}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
