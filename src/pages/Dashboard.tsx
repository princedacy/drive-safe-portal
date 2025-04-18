
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useExams } from "@/context/ExamContext";
import { useUsers } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Users, UserCheck } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { exams, userExamResults } = useExams();
  const { users } = useUsers();
  const navigate = useNavigate();

  // Stats based on role
  const isAdminOrAbove = currentUser?.role === "admin" || currentUser?.role === "superadmin";
  const totalExams = exams.length;
  const totalUsers = users.filter(user => user.role === "user").length;
  const totalAdmins = users.filter(user => user.role === "admin").length;
  
  // For users
  const assignedExams = currentUser?.assignedExams || [];
  const completedExams = userExamResults
    .filter(result => result.userId === currentUser?.id && result.completed)
    .length;
  const pendingExams = assignedExams.length - completedExams;

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isAdminOrAbove ? (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Exams created in the system
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Users taking exams
                  </p>
                </CardContent>
              </Card>
              
              {currentUser?.role === "superadmin" && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalAdmins}</div>
                    <p className="text-xs text-muted-foreground">
                      Administrators
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Exams</CardTitle>
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignedExams.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total exams assigned to you
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Exams you have completed
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Exams</CardTitle>
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Exams waiting to be completed
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        <div className="flex flex-col space-y-4">
          {isAdminOrAbove ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your exams and users</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => navigate("/exams/create")} className="flex-1">
                    Create New Exam
                  </Button>
                  <Button onClick={() => navigate("/users")} className="flex-1" variant="outline">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest exams and results</CardDescription>
                </CardHeader>
                <CardContent>
                  {exams.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Recent Exams</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3">Exam Name</th>
                              <th className="text-left p-3">Questions</th>
                              <th className="text-left p-3">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exams.slice(0, 3).map((exam) => (
                              <tr key={exam.id} className="border-t">
                                <td className="p-3">{exam.title}</td>
                                <td className="p-3">{exam.questions.length}</td>
                                <td className="p-3">{new Date(exam.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" onClick={() => navigate("/exams")}>
                          View All Exams
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">No exams created yet</p>
                      <Button onClick={() => navigate("/exams/create")}>
                        Create Your First Exam
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Exams</CardTitle>
                <CardDescription>Exams assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedExams.length > 0 ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3">Exam Name</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Result</th>
                            <th className="text-right p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedExams.map((examId) => {
                            const exam = exams.find((e) => e.id === examId);
                            const result = userExamResults.find(
                              (r) => r.examId === examId && r.userId === currentUser?.id
                            );
                            
                            return exam ? (
                              <tr key={examId} className="border-t">
                                <td className="p-3">{exam.title}</td>
                                <td className="p-3">
                                  {result?.completed ? (
                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-success/20 text-success">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-warning/20 text-warning">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {result?.completed ? (
                                    <span className={result.score >= exam.passingScore ? "text-success" : "text-destructive"}>
                                      {result.score}%
                                    </span>
                                  ) : "-"}
                                </td>
                                <td className="p-3 text-right">
                                  <Button
                                    size="sm"
                                    variant={result?.completed ? "outline" : "default"}
                                    onClick={() => navigate(`/take-exam/${exam.id}`)}
                                  >
                                    {result?.completed ? "Review" : "Take Exam"}
                                  </Button>
                                </td>
                              </tr>
                            ) : null;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No exams have been assigned to you yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
