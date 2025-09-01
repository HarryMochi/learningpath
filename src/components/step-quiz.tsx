
"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface StepQuizProps {
  quiz: Quiz;
}

export function StepQuiz({ quiz }: StepQuizProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  const handleReset = () => {
    setSelectedValue(null);
    setSubmitted(false);
  }

  const isCorrect = selectedValue !== null && parseInt(selectedValue) === quiz.correctAnswerIndex;

  return (
    <div className="p-2">
      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Test Your Knowledge</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <p className="font-medium">{quiz.question}</p>
            <RadioGroup
              value={selectedValue ?? undefined}
              onValueChange={setSelectedValue}
              disabled={submitted}
            >
              {quiz.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`q-option-${index}`} />
                  <Label htmlFor={`q-option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
                <Button type="submit" disabled={!selectedValue || submitted}>
                Check Answer
                </Button>
                {submitted && (
                    <Button type="button" variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                )}
            </div>
            {submitted && (
              <div className={`flex items-start gap-3 p-3 rounded-md w-full ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                {isCorrect ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <XCircle className="h-5 w-5 mt-0.5" />}
                <div className="flex flex-col">
                    <span className="font-semibold">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
                    <p className="text-sm">{quiz.explanation}</p>
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
