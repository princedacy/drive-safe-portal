import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useExams } from "@/context/ExamContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@/context/ExamContext";

type QuestionType = "MULTIPLE_CHOICE" | "OPEN_ENDED";

export default function EditExam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { fetchExamById, updateExam, isLoading } = useExams();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);

  // Question form states
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [choices, setChoices] = useState<string[]>(["", ""]);

  const loadExam = useCallback(async () => {
    if (!examId) return;
    
    setIsLoadingExam(true);
    try {
      const exam = await fetchExamById(examId);
      if (exam) {
        setTitle(exam.title);
        setDescription(exam.description);
        setTimeLimit(exam.timeLimit || 30);
        setPassingScore(exam.passingScore || 70);
        setQuestions(exam.questions || []);
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      toast({
        title: "Error",
        description: "Failed to load exam details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExam(false);
    }
  }, [examId, fetchExamById, toast]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examId) return;

    try {
      await updateExam({
        id: examId,
        title,
        description,
        timeLimit,
        passingScore,
        questions,
      });
      
      toast({
        title: "Success",
        description: "Exam updated successfully!",
      });
      
      navigate("/exams");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addChoice = () => {
    setChoices([...choices, ""]);
  };

  const updateChoice = (index: number, value: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const resetQuestionForm = () => {
    setQuestionTitle("");
    setQuestionDescription("");
    setQuestionType("MULTIPLE_CHOICE");
    setChoices(["", ""]);
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const handleAddQuestion = () => {
    if (!questionTitle.trim()) return;

    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      title: questionTitle,
      description: questionDescription,
      type: questionType,
      choices: questionType === "MULTIPLE_CHOICE" ? choices.filter(c => c.trim()) : [],
    };

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();
    
    toast({
      title: "Question added",
      description: "Question has been added to the exam.",
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionTitle(question.title);
    setQuestionDescription(question.description || "");
    setQuestionType(question.type);
    setChoices(question.choices && question.choices.length > 0 ? question.choices : ["", ""]);
    setIsAddingQuestion(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !questionTitle.trim()) return;

    const updatedQuestion: Question = {
      ...editingQuestion,
      title: questionTitle,
      description: questionDescription,
      type: questionType,
      choices: questionType === "MULTIPLE_CHOICE" ? choices.filter(c => c.trim()) : [],
    };

    setQuestions(questions.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
    resetQuestionForm();
    
    toast({
      title: "Question updated",
      description: "Question has been updated successfully.",
    });
  };

  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      setQuestions(questions.filter(q => q.id !== questionToDelete));
      setQuestionToDelete(null);
      toast({
        title: "Question deleted",
        description: "Question has been removed from the exam.",
      });
    }
  };

  if (isLoadingExam) {
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
            <h1 className="text-3xl font-bold">Edit Exam</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Exam Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter exam title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter exam description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium mb-2">
                    Time Limit (minutes)
                  </label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="passingScore" className="block text-sm font-medium mb-2">
                    Passing Score (%)
                  </label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Questions ({questions.length})</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingQuestion(true)}
                  disabled={isAddingQuestion}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingQuestion && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingQuestion ? "Edit Question" : "Add New Question"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Question Title</label>
                      <Input
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        placeholder="Enter question title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={questionDescription}
                        onChange={(e) => setQuestionDescription(e.target.value)}
                        placeholder="Enter question description (optional)"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Question Type</label>
                      <Select
                        value={questionType}
                        onValueChange={(value: QuestionType) => setQuestionType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {questionType === "MULTIPLE_CHOICE" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Answer Choices</label>
                        <div className="space-y-2">
                          {choices.map((choice, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={choice}
                                onChange={(e) => updateChoice(index, e.target.value)}
                                placeholder={`Choice ${index + 1}`}
                              />
                              {choices.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeChoice(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addChoice}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Choice
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetQuestionForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                      >
                        {editingQuestion ? "Update Question" : "Add Question"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Q{index + 1}</span>
                              <Badge variant="secondary">{question.type}</Badge>
                            </div>
                            <h4 className="font-medium">{question.title}</h4>
                            {question.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {question.description}
                              </p>
                            )}
                            {question.type === "MULTIPLE_CHOICE" && question.choices && (
                              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                                {question.choices.map((choice, choiceIndex) => (
                                  <li key={choiceIndex}>{choice}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                  onClick={() => setQuestionToDelete(question.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Question</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete this question?</p>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={handleDeleteQuestion}>
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate("/exams")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Exam"
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}