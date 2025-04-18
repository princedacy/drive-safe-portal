
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useExams } from "@/context/ExamContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, ArrowLeft, ArrowRight } from "lucide-react";

export default function CreateExam() {
  const { currentUser } = useAuth();
  const { createExam } = useExams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Array<{
    id: string;
    text: string;
    options: string[];
    correctOption: number;
    image?: string;
  }>>([
    {
      id: `q-${Date.now()}`,
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
    }
  ]);
  
  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };
  
  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctOption = optionIndex;
    setQuestions(newQuestions);
  };
  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
      }
    ]);
  };
  
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    } else {
      toast({
        title: "Cannot remove question",
        description: "An exam must have at least one question.",
        variant: "destructive",
      });
    }
  };
  
  const validateBasicInfo = () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the exam.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!description.trim()) {
      toast({
        title: "Missing description",
        description: "Please provide a description for the exam.",
        variant: "destructive",
      });
      return false;
    }
    
    if (timeLimit <= 0) {
      toast({
        title: "Invalid time limit",
        description: "Time limit must be greater than 0 minutes.",
        variant: "destructive",
      });
      return false;
    }
    
    if (passingScore < 0 || passingScore > 100) {
      toast({
        title: "Invalid passing score",
        description: "Passing score must be between 0 and 100 percent.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.text.trim()) {
        toast({
          title: `Question ${i+1} is empty`,
          description: "Please provide text for all questions.",
          variant: "destructive",
        });
        return false;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          toast({
            title: `Empty option in question ${i+1}`,
            description: `Option ${j+1} is empty. Please provide text for all options.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (currentStep === 0) {
      if (validateBasicInfo()) {
        setCurrentStep(1);
      }
    } else if (currentStep === 1) {
      if (validateQuestions()) {
        setCurrentStep(2);
      }
    }
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = () => {
    if (validateBasicInfo() && validateQuestions()) {
      createExam({
        title,
        description,
        timeLimit,
        passingScore,
        questions,
        createdBy: currentUser?.id || "",
      });
      
      toast({
        title: "Exam created",
        description: "Your exam has been created successfully.",
      });
      
      navigate("/exams");
    }
  };
  
  const steps = [
    { title: "Basic Information", description: "Set up the exam details" },
    { title: "Questions", description: "Add multiple-choice questions" },
    { title: "Review", description: "Review and create your exam" }
  ];
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate("/exams")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Exams
          </Button>
          <h1 className="text-3xl font-bold">Create New Exam</h1>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index < steps.length - 1 
                    ? "border-t-2 border-muted relative" 
                    : ""
                }`}
                style={{
                  borderColor: index <= currentStep ? "hsl(var(--primary))" : "",
                }}
              >
                <div 
                  className={`w-10 h-10 mx-auto -mt-5 rounded-full flex items-center justify-center ${
                    index <= currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Basic Traffic Rules Exam"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this exam will test"
                    className="min-h-[100px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={passingScore}
                      onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <Tabs defaultValue="1" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      {questions.map((_, index) => (
                        <TabsTrigger key={index} value={(index + 1).toString()}>
                          Question {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <Button onClick={addQuestion} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  
                  {questions.map((question, qIndex) => (
                    <TabsContent key={qIndex} value={(qIndex + 1).toString()} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`q-${qIndex}-text`}>Question Text</Label>
                        <Textarea
                          id={`q-${qIndex}-text`}
                          placeholder="Enter your question here"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Options</h4>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`q-${qIndex}-o-${oIndex}`}
                              name={`q-${qIndex}-correct`}
                              className="w-4 h-4 border-primary text-primary focus:ring-primary"
                              checked={question.correctOption === oIndex}
                              onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                            />
                            <Input
                              id={`q-${qIndex}-o-${oIndex}-text`}
                              placeholder={`Option ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <p className="text-sm text-muted-foreground">
                          Select the radio button next to the correct answer.
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Exam Summary</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Time Limit:</strong> {timeLimit} minutes</p>
                    <p><strong>Passing Score:</strong> {passingScore}%</p>
                    <p><strong>Number of Questions:</strong> {questions.length}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Questions Preview</h3>
                  <div className="space-y-4">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-muted p-4 rounded-md">
                        <p className="font-medium">Question {qIndex + 1}: {q.text}</p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((option, oIndex) => (
                            <p key={oIndex} className={q.correctOption === oIndex ? "text-success font-medium" : ""}>
                              {String.fromCharCode(65 + oIndex)}. {option} 
                              {q.correctOption === oIndex && " (Correct)"}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep < 2 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Create Exam
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
