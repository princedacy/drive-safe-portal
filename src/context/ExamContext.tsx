import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://dev.backend.ikizamini.hillygeeks.com/api/v1";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Question {
  id: string;
  title: string;
  description: string;
  type: "MULTIPLE_CHOICE" | "OPEN_ENDED";
  choices?: string[];
  correctOption?: number;
  image?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage required to pass
  createdBy?: string; // admin ID
  createdAt?: string;
}

export interface UserExamResult {
  userId: string;
  examId: string;
  score: number;
  answers: number[];
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

interface ExamContextType {
  exams: Exam[];
  userExamResults: UserExamResult[];
  createExam: (examData: Omit<Exam, "id" | "createdAt">) => Promise<void>;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  assignExamToUser: (examId: string, userId: string) => void;
  saveExamResult: (result: Omit<UserExamResult, "completedAt">, complete?: boolean) => void;
  fetchExams: () => Promise<void>;
  fetchExamById: (examId: string) => Promise<Exam | undefined>;
  addQuestionToExam: (examId: string, question: Omit<Question, "id">) => Promise<void>;
  updateExamQuestion: (examId: string, questionId: string, question: Omit<Question, "id">) => Promise<void>;
  deleteExamQuestion: (examId: string, questionId: string) => Promise<void>;
  isLoading: boolean;
}

// Sample data
const MOCK_EXAMS: Exam[] = [
  {
    id: "exam1",
    title: "Basic Traffic Rules",
    description: "Test your knowledge of essential traffic rules and road signs.",
    questions: [
      {
        id: "q1",
        title: "What does a red traffic light mean?",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: ["Go", "Slow down", "Stop", "Proceed with caution"],
        correctOption: 2,
      },
      {
        id: "q2",
        title: "When must you stop at a STOP sign?",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: [
          "Only when other vehicles are present",
          "Only during daytime",
          "Only at busy intersections",
          "Always, completely"
        ],
        correctOption: 3,
      },
      {
        id: "q3",
        title: "What is the meaning of a yellow traffic light?",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: [
          "Go faster to clear the intersection",
          "Prepare to stop",
          "Pedestrians can cross",
          "Vehicles can turn right only"
        ],
        correctOption: 1,
      },
    ],
    timeLimit: 30,
    passingScore: 70,
    createdBy: "2", // Admin user ID
    createdAt: new Date().toISOString(),
  },
  {
    id: "exam2",
    title: "Highway Driving Skills",
    description: "Test your knowledge about safe highway driving practices.",
    questions: [
      {
        id: "q1",
        title: "What is the proper following distance on a highway in good conditions?",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: [
          "1 car length",
          "2 seconds",
          "3-4 seconds",
          "10 car lengths"
        ],
        correctOption: 2,
      },
      {
        id: "q2",
        title: "When entering a highway, you should:",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: [
          "Stop and wait for a large gap",
          "Enter slowly to be cautious",
          "Accelerate to match the flow of traffic",
          "Use your horn to alert other drivers"
        ],
        correctOption: 2,
      },
      {
        id: "q3",
        title: "When is it legal to pass on the right on a multi-lane highway?",
        description: "Choose the correct answer",
        type: "MULTIPLE_CHOICE",
        choices: [
          "Never",
          "When the vehicle ahead is turning left",
          "When in the rightmost lane and traffic is flowing freely",
          "Only when emergency vehicles need to pass"
        ],
        correctOption: 2,
      },
    ],
    timeLimit: 15,
    passingScore: 80,
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
];

// Mock exam results
const MOCK_RESULTS: UserExamResult[] = [
  {
    userId: "3", // Test user
    examId: "exam1",
    score: 66, // 2/3 correct
    answers: [2, 3, 0],
    completed: true,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3400000).toISOString(),
  },
];

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [userExamResults, setUserExamResults] = useState<UserExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load mock data on init
    setExams(MOCK_EXAMS);
    setUserExamResults(MOCK_RESULTS);
    
    // Load real exams
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        return;
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch exams from API
      const response = await api.get('/admin/exams', {
        params: {
          page: 0,
          limit: 100,
        }
      });
      
      console.log('Exams response:', response.data);
      
      // Transform response data to match our Exam interface
      if (response.data && response.data.data) {
        const fetchedExams: Exam[] = response.data.data.map((exam: any) => ({
          id: exam.id || exam._id,
          title: exam.title,
          description: exam.description,
          questions: exam.questions.map((question: any) => ({
            id: question.id || question._id,
            title: question.title,
            description: question.description,
            type: question.type,
            choices: question.choices || [],
            correctOption: question.correctOption,
          })),
          createdAt: exam.createdAt,
        }));
        
        setExams([...MOCK_EXAMS, ...fetchedExams]);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExamById = async (examId: string): Promise<Exam | undefined> => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        return;
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch exam by id
      const response = await api.get(`/admin/exams/${examId}`);
      console.log('Exam detail response:', response.data);
      
      if (response.data) {
        const exam = response.data;
        return {
          id: exam.id || exam._id,
          title: exam.title,
          description: exam.description,
          questions: exam.questions.map((question: any) => ({
            id: question.id || question._id,
            title: question.title,
            description: question.description,
            type: question.type,
            choices: question.choices || [],
            correctOption: question.correctOption,
          })),
          createdAt: exam.createdAt,
        };
      }
    } catch (error) {
      console.error(`Error fetching exam ${examId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const createExam = async (examData: Omit<Exam, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create exam via API
      const response = await api.post('/admin/exams', {
        title: examData.title,
        description: examData.description,
        questions: examData.questions.map(q => ({
          title: q.title,
          description: q.description,
          type: q.type,
          choices: q.choices || [],
        })),
      });
      
      console.log('Create exam response:', response.data);
      
      // Reload the exams to get the newly created exam
      await fetchExams();
      
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = (updatedExam: Exam) => {
    setExams((prevExams) =>
      prevExams.map((exam) => 
        exam.id === updatedExam.id ? updatedExam : exam
      )
    );
  };

  const deleteExam = (examId: string) => {
    setExams((prevExams) => prevExams.filter((exam) => exam.id !== examId));
  };

  const addQuestionToExam = async (examId: string, question: Omit<Question, "id">) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Add question to exam via API
      const response = await api.post(`/admin/exams/${examId}/add-question`, {
        title: question.title,
        description: question.description,
        type: question.type,
        choices: question.choices || [],
      });
      
      console.log('Add question response:', response.data);
      
      // Update the exam in our state
      const updatedExam = await fetchExamById(examId);
      if (updatedExam) {
        updateExam(updatedExam);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding question to exam:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExamQuestion = async (examId: string, questionId: string, question: Omit<Question, "id">) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update question via API
      const response = await api.put(`/admin/exams/${examId}/question/${questionId}`, {
        title: question.title,
        description: question.description,
        type: question.type,
        choices: question.choices || [],
      });
      
      console.log('Update question response:', response.data);
      
      // Update the exam in our state
      const updatedExam = await fetchExamById(examId);
      if (updatedExam) {
        updateExam(updatedExam);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating exam question:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExamQuestion = async (examId: string, questionId: string) => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Delete question via API
      const response = await api.delete(`/admin/exams/${examId}/question/${questionId}`);
      
      console.log('Delete question response:', response.data);
      
      // Update the exam in our state
      const updatedExam = await fetchExamById(examId);
      if (updatedExam) {
        updateExam(updatedExam);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error deleting exam question:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const assignExamToUser = (examId: string, userId: string) => {
    // In a real app, this would make an API call to associate a user with an exam
    // For our demo, we'll just log it
    console.log(`Assigned exam ${examId} to user ${userId}`);
  };

  const saveExamResult = (
    result: Omit<UserExamResult, "completedAt">,
    complete: boolean = false
  ) => {
    const updatedResult: UserExamResult = {
      ...result,
      ...(complete ? { completedAt: new Date().toISOString() } : {}),
    };

    setUserExamResults((prevResults) => {
      // If the result already exists, update it
      const existingResultIndex = prevResults.findIndex(
        (r) => r.userId === result.userId && r.examId === result.examId
      );

      if (existingResultIndex !== -1) {
        const newResults = [...prevResults];
        newResults[existingResultIndex] = updatedResult;
        return newResults;
      }

      // Otherwise add a new result
      return [...prevResults, updatedResult];
    });
  };

  return (
    <ExamContext.Provider
      value={{
        exams,
        userExamResults,
        createExam,
        updateExam,
        deleteExam,
        assignExamToUser,
        saveExamResult,
        fetchExams,
        fetchExamById,
        addQuestionToExam,
        updateExamQuestion,
        deleteExamQuestion,
        isLoading,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExams() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExams must be used within an ExamProvider");
  }
  return context;
}
