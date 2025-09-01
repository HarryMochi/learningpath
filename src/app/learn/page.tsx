"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Course, Step } from '@/lib/types';
import { getCoursesForUser, addCourse, updateCourse, deleteCourse as deleteCourseFromDb } from '@/lib/firestore';
import { generateCourseAction, askQuestionAction } from '../actions';
import { useToast } from "@/hooks/use-toast";
import HistorySidebar from '@/components/history-sidebar';
import TopicSelection from '@/components/topic-selection';
import CourseDisplay from '@/components/course-display';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/main-layout';
import type { AskStepQuestionOutput } from '@/ai/flows/ask-step-question';

export type GenerationState = {
    status: 'idle' | 'generating' | 'done';
};

function LearnPageComponent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Ensure component is mounted before doing anything client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication redirect only after mounting
  useEffect(() => {
    if (mounted && !loading && !user) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router, mounted]);
  
  const fetchCourses = useCallback(async () => {
    if (user && mounted) {
      try {
        const userCourses = await getCoursesForUser(user.uid);
        setCourses(userCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load courses. Please refresh the page."
        });
      }
    }
  }, [user, mounted, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === activeCourseId) || null;
  }, [courses, activeCourseId]);

  const handleGenerateCourse = async (topic: string, depth: 15 | 30) => {
    if (!user || !mounted) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a course." });
        return;
    }
    
    setGenerationState({ status: 'generating' });
    try {
      const result = await generateCourseAction({ topic, depth: depth.toString() as '15' | '30' });
      
      const steps: Step[] = result.course.map(step => {
        const newStep: Step = {
            stepNumber: step.step,
            title: step.title,
            content: step.content,
            completed: false,
        };

        if (step.funFact) {
            newStep.funFact = step.funFact;
        }
        if (step.externalLinks) {
            newStep.externalLinks = step.externalLinks;
        }
        if (step.quiz) {
            newStep.quiz = step.quiz;
        }

        return newStep;
      });

      if (!steps || steps.length === 0) {
        throw new Error("The AI failed to generate a course for this topic. Please try a different topic.");
      }
      
      const newCourseData = {
        topic,
        depth,
        outline: JSON.stringify(result.course.map(s => ({ step: s.step, title: s.title, description: s.description })), null, 2),
        steps: steps,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      const newCourseId = await addCourse(newCourseData);
      const newCourse: Course = { id: newCourseId, ...newCourseData };

      setCourses(prev => [newCourse, ...prev]);
      setActiveCourseId(newCourse.id);
      setGenerationState({ status: 'done' });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Course",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setGenerationState({ status: 'idle' });
    }
  };

  const handleUpdateStep = async (courseId: string, stepNumber: number, newStepData: Partial<Step>) => {
    if (!mounted) return;
    
    const courseToUpdate = courses.find(c => c.id === courseId);
    if (!courseToUpdate) return;
    
    const updatedSteps = courseToUpdate.steps.map(step =>
        step.stepNumber === stepNumber ? { ...step, ...newStepData } : step
    );
    const updatedCourse = { ...courseToUpdate, steps: updatedSteps };
    
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));

    try {
        await updateCourse(courseId, { steps: updatedSteps });
    } catch (error) {
        console.error("Error updating step in DB:", error);
        toast({ variant: "destructive", title: "Sync Error", description: "Failed to save changes."});
        // Revert UI on failure
        setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? courseToUpdate : c));
    }
  };
  
  const handleAskQuestion = async (course: Course, step: Step, question: string): Promise<AskStepQuestionOutput> => {
    if (!mounted) {
      return { answer: "Please wait for the page to fully load." };
    }
    
    try {
        return await askQuestionAction({
            topic: course.topic,
            stepTitle: step.title,
            stepContent: step.content || '',
            question,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Getting Answer",
            description: "Could not get an answer for this question. Please try again.",
        });
        return { answer: "Sorry, I couldn't process your question. Please try again." };
    }
  };

  const handleCreateNew = () => {
    setActiveCourseId(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!mounted) return;
    
    const originalCourses = courses;
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourseId === courseId) {
      setActiveCourseId(null);
    }

    try {
        await deleteCourseFromDb(courseId);
    } catch (error) {
        console.error("Error deleting course from DB:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete course from database."});
        setCourses(originalCourses);
    }
  };

  // Show loading until everything is properly mounted and authenticated
  if (!mounted || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  
  // Show loading if user is not authenticated (will redirect)
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-screen">
        <div className="w-80 border-r flex flex-col">
          <HistorySidebar
            user={user}
            courses={courses}
            activeCourseId={activeCourseId}
            onSelectCourse={setActiveCourseId}
            onCreateNew={handleCreateNew}
            onDeleteCourse={handleDeleteCourse}
            onLogout={logout}
          />
        </div>
        <main className="flex-1 flex flex-col h-screen">
            {activeCourse ? (
            <CourseDisplay
                key={activeCourse.id}
                course={activeCourse}
                onUpdateStep={handleUpdateStep}
                onAskQuestion={handleAskQuestion}
            />
            ) : (
            <div className="h-full flex items-center justify-center p-4 md:p-8">
              <TopicSelection
                  onGenerateCourse={handleGenerateCourse}
                  generationState={generationState}
              />
            </div>
            )}
        </main>
      </div>
    </MainLayout>
  );
}

// Export the component wrapped with dynamic import to disable SSR
const LearnPage = dynamic(() => Promise.resolve(LearnPageComponent), {
  ssr: false,
  loading: () => (
    <MainLayout>
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </MainLayout>
  )
});

export default LearnPage;