
"use client";

import { useState, useMemo } from 'react';
import type { Course, Step } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { StepContent } from './step-content';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import { AskAiSheet } from './ask-ai-sheet';
import type { AskStepQuestionOutput } from '@/ai/flows/ask-step-question';
import { StepQuiz } from './step-quiz';
import { StepExtras } from './step-extras';

interface CourseDisplayProps {
  course: Course;
  onUpdateStep: (courseId: string, stepNumber: number, newStepData: Partial<Step>) => void;
  onAskQuestion: (course: Course, step: Step, question: string) => Promise<AskStepQuestionOutput>;
}

export default function CourseDisplay({ course, onUpdateStep, onAskQuestion }: CourseDisplayProps) {
  const [activeStepValue, setActiveStepValue] = useState<string | undefined>(undefined);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [stepForSheet, setStepForSheet] = useState<Step | null>(null);

  const completedSteps = useMemo(() => course.steps.filter(step => step.completed).length, [course.steps]);
  const progressPercentage = (completedSteps / course.steps.length) * 100;

  const handleCheckedChange = (stepNumber: number, checked: boolean) => {
    onUpdateStep(course.id, stepNumber, { completed: checked });
  };

  const handleAskAiClick = (e: React.MouseEvent, step: Step) => {
    e.stopPropagation();
    setStepForSheet(step);
    setSheetOpen(true);
  };
  
  return (
    <>
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col p-4 md:p-8">
        <header className="mb-6">
          <h1 className="font-headline text-4xl font-bold mb-2">{course.topic}</h1>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="w-full h-3" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {completedSteps} / {course.steps.length} steps
            </span>
          </div>
        </header>
        
        <div className="flex-1 min-h-0">
           <ScrollArea className="h-full pr-4">
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={activeStepValue}
              onValueChange={setActiveStepValue}
            >
              {course.steps.map(step => (
                <AccordionItem value={step.stepNumber.toString()} key={step.stepNumber} className="group border-b">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center gap-4 py-4">
                      <Checkbox
                        id={`step-${step.stepNumber}`}
                        checked={step.completed}
                        onCheckedChange={(checked) => handleCheckedChange(step.stepNumber, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-4"
                      />
                    </div>
                    <AccordionTrigger className="flex-1 py-4 pr-4 text-left">
                      Step {step.stepNumber}: {step.title}
                    </AccordionTrigger>
                    <div className="pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => handleAskAiClick(e, step)}
                        disabled={!step.content}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="pl-8 pr-4 pb-4 space-y-6">
                      <StepContent
                        content={step.content}
                      />
                      
                      <StepExtras 
                        step={step} 
                        onAskAiClick={(e) => handleAskAiClick(e, step)} 
                      />

                      {step.quiz && (
                        <StepQuiz quiz={step.quiz} key={step.stepNumber}/>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
      {stepForSheet && (
        <AskAiSheet
          open={isSheetOpen}
          onOpenChange={setSheetOpen}
          course={course}
          step={stepForSheet}
          onAskQuestion={onAskQuestion}
        />
      )}
    </>
  );
}
