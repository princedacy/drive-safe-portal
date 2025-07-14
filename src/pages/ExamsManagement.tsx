
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useExams } from "@/context/ExamContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PlusCircle, Search, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExamsManagement() {
  const { exams, deleteExam } = useExams();
  const [searchQuery, setSearchQuery] = useState("");
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const EXAMS_PER_PAGE = 6;

  const handleDeleteExam = () => {
    if (examToDelete) {
      deleteExam(examToDelete);
      setExamToDelete(null);
      toast({
        title: "Exam deleted",
        description: "The exam has been successfully deleted.",
      });
    }
  };

  const filteredExams = exams.filter((exam) =>
    (exam.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (exam.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredExams.length / EXAMS_PER_PAGE);
  const startIndex = (currentPage - 1) * EXAMS_PER_PAGE;
  const endIndex = startIndex + EXAMS_PER_PAGE;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Exams Management</h1>
          <Button onClick={() => navigate("/exams/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search exams..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {filteredExams.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{exam.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-muted text-xs px-2 py-1 rounded-md">
                      {exam.timeLimit} Minutes
                    </div>
                    <div className="bg-muted text-xs px-2 py-1 rounded-md">
                      Passing: {exam.passingScore}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/exams/edit/${exam.id}`)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/exams/assign/${exam.id}`)}
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Assign
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => setExamToDelete(exam.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Exam</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this exam? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex space-x-2 justify-end">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteExam}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No exams found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "No exams match your search criteria" 
                : "You haven't created any exams yet"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/exams/create")}>
                Create Your First Exam
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
