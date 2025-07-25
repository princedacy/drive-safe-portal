import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

import { API_URL } from "@/config";
import { useAuth } from "@/context/AuthContext";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
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
  answer?: number; // The correct answer index (1-based for API)
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
  updateExam: (exam: Exam) => Promise<void>;
  deleteExam: (examId: string) => void;
  addExamCandidate: (examId: string, email: string) => Promise<void>;
  fetchExamCandidates: (examId: string) => Promise<any[]>;
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
        answer: 3,
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
        answer: 4,
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
        answer: 2,
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
        answer: 3,
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
        answer: 3,
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
        answer: 3,
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
  const { currentUser, isAuthenticated } = useAuth();

  // Effect to fetch exams when authentication state changes
  useEffect(() => {
    console.log('ExamProvider: Auth state changed', { 
      isAuthenticated, 
      userId: currentUser?.id, 
      userRole: currentUser?.role 
    });
    
    // Clear exams first
    setExams([]);
    
    if (isAuthenticated && currentUser) {
      // Add a small delay to ensure token is properly set
      const timer = setTimeout(() => {
        fetchExams();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser?.id]); // Re-run when auth state or user changes

  const fetchExams = async () => {
    setIsLoading(true);
    console.log('Starting to fetch exams...');
    
    // Clear exams at start to show loading state properly
    setExams([]);
    
    try {
      // Get fresh token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        setExams([]);
        return;
      }
      
      console.log('Token found, length:', token.length);
      
      // Decode token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      const userId = payload.id;
      
      console.log('User role for exams fetch:', userRole);
      console.log('User ID for exams fetch:', userId);
      
      // Use appropriate endpoint based on user role
      const endpoint = userRole === 'SUPER_ADMIN' ? '/super/exams' : '/admin/exams';
      
      console.log('Fetching exams from endpoint:', endpoint);
      
      // Create fresh headers for this request (don't rely on global defaults)
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch exams from API
      const response = await api.get(endpoint, {
        headers,
        params: {
          page: 0,
          limit: 50  // Increased limit to get more exams
        }
      });
      
      console.log('Exams response:', response.data);
      
      // Transform response data to match our Exam interface
      if (response.data && response.data.data) {
        const fetchedExams: Exam[] = response.data.data.map((exam: any) => ({
          id: exam._id,
          title: exam.title,
          description: exam.description,
          questions: (exam.questions || []).map((question: any) => ({
            id: question._id,
            title: question.title,
            description: question.description || "",
            type: question.type,
            choices: question.choices || [],
            answer: question.answer,
          })),
          timeLimit: exam.timeLimit || 30,
          passingScore: exam.passingScore || 70,
          createdAt: exam.createdAt,
        }));
        
        // Set exams to fetched data only
        setExams(fetchedExams);
      } else {
        // No data received, set empty array
        setExams([]);
      }
    } catch (error: any) {
      console.error('Error loading exams:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Clear exams on error to avoid showing stale data
      setExams([]);
      if (error.response?.status === 403) {
        console.log("Access denied - user may not have required permissions");
      }
    } finally {
      console.log('Finished fetching exams');
      setIsLoading(false);
    }
  };

  const fetchExamById = async (examId: string): Promise<Exam | undefined> => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        console.error("No auth token available");
        throw new Error("Authentication required");
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch exam by id
      const response = await api.get(`/admin/exams/${examId}`);
      console.log('Exam detail response:', response.data);
      
      if (response.data && response.data.data) {
        const exam = response.data.data;
        return {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          timeLimit: exam.timeLimit,
          passingScore: exam.passingScore,
          questions: (exam.questions || []).map((question: any) => ({
            id: question._id,
            title: question.title,
            description: question.description || "",
            type: question.type,
            choices: question.choices || [],
            answer: question.answer,
          })),
          createdAt: exam.createdAt,
        };
      }
    } catch (error) {
      console.error(`Error fetching exam ${examId}:`, error);
      throw error;
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
      
      // Format questions correctly according to API spec
      const formattedQuestions = examData.questions.map(q => ({
        title: q.title,
        description: q.description || "",
        type: q.type,
        choices: q.type === "MULTIPLE_CHOICE" ? (q.choices || []) : [],
      }));
      
      // Create exam via API
      const response = await api.post('/admin/exams', {
        title: examData.title,
        description: examData.description,
        questions: formattedQuestions,
      });
      
      console.log('Create exam response:', response.data);
      
      // Handle the response properly - could be nested in data property
      const examResponse = response.data.data || response.data;
      
      // Create a properly formatted exam object from the response
      const newExam: Exam = {
        id: examResponse._id || examResponse.id,
        title: examResponse.title || examData.title,
        description: examResponse.description || examData.description,
        questions: (examResponse.questions || []).map((question: any) => ({
          id: question._id || question.id,
          title: question.title,
          description: question.description || "",
          type: question.type,
          choices: question.choices || [],
          answer: question.answer,
        })),
        timeLimit: examResponse.timeLimit || examData.timeLimit || 30,
        passingScore: examResponse.passingScore || examData.passingScore || 70,
        createdAt: examResponse.createdAt || new Date().toISOString(),
      };
      
      console.log('Adding new exam to state:', newExam);
      
      // Add the newly created exam to our local state immediately
      setExams(prevExams => {
        const updatedExams = [...prevExams, newExam];
        console.log('Updated exams state:', updatedExams);
        return updatedExams;
      });
      
      return examResponse;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (updatedExam: Exam) => {
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
      
      // Send only title and description for exam updates (no questions)
      const response = await api.put(`/admin/exams/${updatedExam.id}`, {
        title: updatedExam.title,
        description: updatedExam.description,
      });
      
      console.log('Update exam response:', response.data);
      
      // Update the exam in our state
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.id === updatedExam.id ? updatedExam : exam
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
      
      // Add question to exam via API with correct structure
      const response = await api.post(`/admin/exams/${examId}/questions`, {
        title: question.title,
        description: question.description || "",
        type: question.type,
        choices: question.type === "MULTIPLE_CHOICE" ? (question.choices || []) : [],
        answer: question.type === "MULTIPLE_CHOICE" ? (question.answer || 1) : undefined,
      });
      
      console.log('Add question response:', response.data);
      
      // Update the exam in our state
      const updatedExam = await fetchExamById(examId);
      if (updatedExam) {
        setExams(prevExams => 
          prevExams.map(exam => 
            exam.id === examId ? updatedExam : exam
          )
        );
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
      
      // Prepare update payload with only changed/relevant fields
      const updatePayload: any = {
        title: question.title,
        description: question.description || "",
        type: question.type,
      };

      // Only include choices and answer for MULTIPLE_CHOICE questions
      if (question.type === "MULTIPLE_CHOICE") {
        updatePayload.choices = question.choices || [];
        updatePayload.answer = question.answer || 1;
      }

      // Update question via API
      const response = await api.put(`/admin/exams/${examId}/question/${questionId}`, updatePayload);
      
      console.log('Update question response:', response.data);
      
      // Update the exam in our state
      const updatedExam = await fetchExamById(examId);
      if (updatedExam) {
        setExams(prevExams => 
          prevExams.map(exam => 
            exam.id === examId ? updatedExam : exam
          )
        );
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
        setExams(prevExams => 
          prevExams.map(exam => 
            exam.id === examId ? updatedExam : exam
          )
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Error deleting exam question:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addExamCandidate = async (examId: string, email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await api.post(`/admin/exams/${examId}/add-candidate`, {
        email: email
      });
      
    } catch (error) {
      console.error('Error adding exam candidate:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExamCandidates = async (examId: string): Promise<any[]> => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Fetching candidates for exam:', examId);
      const response = await api.get(`/admin/exams/${examId}/candidates`);
      console.log('Candidates response:', response.data);
      
      // Handle different response formats
      if (response.data?.data) {
        return response.data.data;
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching exam candidates:', error);
      throw error;
    }
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
        addExamCandidate,
        fetchExamCandidates,
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
