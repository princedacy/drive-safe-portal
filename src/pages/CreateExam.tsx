
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useExams, Question } from "@/context/ExamContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Loader2, Check } from "lucide-react";

// Schema validation for the question form
const questionSchema = z.object({
  title: z.string().min(3, "Question title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["MULTIPLE_CHOICE", "OPEN_ENDED"]),
  choices: z.array(z.string()).optional(),
  correctOption: z.number().min(0).optional(),
  correctAnswer: z.string().optional(),
});

// Schema validation for the exam form
const examSchema = z.object({
  title: z.string().min(3, "Exam title must be at least 3 characters"),
  description: z.string().min(10, "Please provide a description of at least 10 characters"),
  timeLimit: z.coerce.number().int().positive().optional(),
  passingScore: z.coerce.number().int().min(1).max(100).optional(),
  questions: z.array(questionSchema).min(1, "Please add at least one question"),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function CreateExam() {
  const { examId } = useParams<{ examId: string }>();
  const isEditing = Boolean(examId);
  const { exams, createExam, fetchExamById, updateExam } = useExams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  
  // Fetch exam details when editing
  useEffect(() => {
    const loadExamDetails = async () => {
      if (isEditing && examId) {
        setIsLoading(true);
        try {
          const examDetails = await fetchExamById(examId);
          setCurrentExam(examDetails);
          
          // Reset form with fetched data
          if (examDetails) {
            form.reset({
              title: examDetails.title,
              description: examDetails.description,
              timeLimit: examDetails.timeLimit,
              passingScore: examDetails.passingScore,
              questions: examDetails.questions?.map((q: any) => ({
                title: q.title,
                description: q.description || "",
                type: q.type,
                choices: q.choices || ["", "", "", ""],
                correctOption: q.answer ? q.answer - 1 : 0,
                correctAnswer: q.correctAnswer || "",
              })) || [],
            });
          }
        } catch (error) {
          console.error("Error fetching exam details:", error);
          toast({
            title: "Error",
            description: "Failed to load exam details.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExamDetails();
  }, [examId, isEditing, fetchExamById, toast]);
  
  // Initialize the form with default values
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      questions: [
        {
          title: "",
          description: "",
          type: "MULTIPLE_CHOICE",
          choices: ["", "", "", ""],
          correctOption: 0,
          correctAnswer: "",
        },
      ],
    },
  });
  
  // Use field array for dynamic questions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  
  // Watch for question type changes
  const watchQuestionTypes = form.watch("questions");
  
  // Handle form submission
  const onSubmit = async (data: ExamFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the questions properly
      const formattedQuestions: Question[] = data.questions.map((q, index) => {
        const baseQuestion = {
          id: currentExam?.questions[index]?.id || `q${index + 1}`,
          title: q.title,
          description: q.description || "",
          type: q.type,
        };
        
        if (q.type === "MULTIPLE_CHOICE") {
          return {
            ...baseQuestion,
            choices: q.choices || [],
            correctOption: q.correctOption || 0,
          };
        } else {
          return {
            ...baseQuestion,
            correctAnswer: q.correctAnswer || "",
          };
        }
      });
      
      if (isEditing && currentExam) {
        // Update existing exam
        await updateExam({
          ...currentExam,
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          questions: formattedQuestions,
        });
        
        toast({
          title: "Exam updated",
          description: `${data.title} has been updated successfully.`,
        });
      } else {
        // Create new exam
        await createExam({
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          questions: formattedQuestions,
        });
        
        toast({
          title: "Exam created",
          description: `${data.title} has been created successfully.`,
        });
      }
      
      navigate("/exams");
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} exam. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add a new question
  const addQuestion = () => {
    append({
      title: "",
      description: "",
      type: "MULTIPLE_CHOICE",
      choices: ["", "", "", ""],
      correctOption: 0,
      correctAnswer: "",
    });
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate("/exams")} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams
              </Button>
              <h1 className="text-3xl font-bold">Loading Exam...</h1>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading exam details and questions...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate("/exams")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
            <h1 className="text-3xl font-bold">{isEditing ? "Edit Exam" : "Create Exam"}</h1>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter exam title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear title for your exam.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter exam description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what this exam covers and its purpose.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for no time limit.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Score (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage required to pass this exam.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Questions</h2>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addQuestion}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`questions.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter question text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`questions.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Additional details or context" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`questions.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                              <SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {watchQuestionTypes[index]?.type === "MULTIPLE_CHOICE" && (
                      <FormField
                        control={form.control}
                        name={`questions.${index}.correctOption`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer Options</FormLabel>
                            <FormDescription className="mb-3">
                              Click the radio button to select the correct answer
                            </FormDescription>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                                className="space-y-3"
                              >
                                {(watchQuestionTypes[index]?.choices || []).map((_, choiceIndex) => (
                                  <div key={choiceIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem 
                                      value={choiceIndex.toString()} 
                                      id={`q${index}-option-${choiceIndex}`}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1 flex items-center space-x-2">
                                      <FormField
                                        control={form.control}
                                        name={`questions.${index}.choices.${choiceIndex}`}
                                        render={({ field: choiceField }) => (
                                          <FormControl>
                                            <Input 
                                              placeholder={`Option ${choiceIndex + 1}`} 
                                              {...choiceField}
                                              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                            />
                                          </FormControl>
                                        )}
                                      />
                                    </div>
                                    {choiceIndex > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newChoices = [...(form.getValues(`questions.${index}.choices`) || [])];
                                          newChoices.splice(choiceIndex, 1);
                                          form.setValue(`questions.${index}.choices`, newChoices);
                                          
                                          // Adjust correct option if needed
                                          const currentCorrect = form.getValues(`questions.${index}.correctOption`);
                                          if (currentCorrect === choiceIndex) {
                                            form.setValue(`questions.${index}.correctOption`, 0);
                                          } else if (currentCorrect > choiceIndex) {
                                            form.setValue(`questions.${index}.correctOption`, currentCorrect - 1);
                                          }
                                        }}
                                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentChoices = form.getValues(`questions.${index}.choices`) || [];
                                form.setValue(`questions.${index}.choices`, [...currentChoices, ""]);
                              }}
                              className="mt-3"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Correct answer field for open-ended questions */}
                    {watchQuestionTypes[index]?.type === "OPEN_ENDED" && (
                      <FormField
                        control={form.control}
                        name={`questions.${index}.correctAnswer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter the correct answer for this open-ended question"
                                {...field}
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <FormDescription>
                              This will be used to auto-grade the question
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="min-w-[120px]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Exam" : "Create Exam"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
