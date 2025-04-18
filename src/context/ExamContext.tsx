import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Types
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  image?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage required to pass
  createdBy: string; // admin ID
  createdAt: string;
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
  createExam: (exam: Omit<Exam, "id" | "createdAt">) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  assignExamToUser: (examId: string, userId: string) => void;
  saveExamResult: (result: Omit<UserExamResult, "completedAt">, complete?: boolean) => void;
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
        text: "What does a red traffic light mean?",
        options: ["Go", "Slow down", "Stop", "Proceed with caution"],
        correctOption: 2,
      },
      {
        id: "q2",
        text: "When must you stop at a STOP sign?",
        options: [
          "Only when other vehicles are present",
          "Only during daytime",
          "Only at busy intersections",
          "Always, completely"
        ],
        correctOption: 3,
      },
      {
        id: "q3",
        text: "What is the meaning of a yellow traffic light?",
        options: [
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
        text: "What is the proper following distance on a highway in good conditions?",
        options: [
          "1 car length",
          "2 seconds",
          "3-4 seconds",
          "10 car lengths"
        ],
        correctOption: 2,
      },
      {
        id: "q2",
        text: "When entering a highway, you should:",
        options: [
          "Stop and wait for a large gap",
          "Enter slowly to be cautious",
          "Accelerate to match the flow of traffic",
          "Use your horn to alert other drivers"
        ],
        correctOption: 2,
      },
      {
        id: "q3",
        text: "When is it legal to pass on the right on a multi-lane highway?",
        options: [
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

  useEffect(() => {
    // Load mock data on init
    setExams(MOCK_EXAMS);
    setUserExamResults(MOCK_RESULTS);
  }, []);

  const createExam = (examData: Omit<Exam, "id" | "createdAt">) => {
    const newExam: Exam = {
      ...examData,
      id: `exam${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setExams((prevExams) => [...prevExams, newExam]);
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
