"use client";

import { useState, useRef, useEffect } from "react";
import type { Course, Step } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, Loader2 } from "lucide-react";
import type { AskStepQuestionOutput } from "@/ai/flows/ask-step-question";

interface AskAiSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  step: Step;
  onAskQuestion: (course: Course, step: Step, question: string) => Promise<AskStepQuestionOutput>;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

export function AskAiSheet({ open, onOpenChange, course, step, onAskQuestion }: AskAiSheetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([
        { id: 'initial', role: 'bot', content: `Hi! I'm your AI assistant. Ask me anything about "${step.title}".` }
      ]);
      setInputValue("");
    }
  }, [open, step.title]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleAsk = async () => {
    if (!inputValue.trim() || isAsking) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsAsking(true);

    try {
      const result = await onAskQuestion(course, step, inputValue);
      const botMessage: Message = {
        id: `msg_${Date.now()}_bot`,
        role: 'bot',
        content: result.answer,
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsAsking(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleAsk();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6">
          <SheetTitle>Ask AI</SheetTitle>
          <SheetDescription>Get help with: {step.title}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <div className="bg-primary rounded-full p-2">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="bg-accent rounded-full p-2">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isAsking && (
                <div className="flex items-start gap-3">
                    <div className="bg-primary rounded-full p-2">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-6 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isAsking}
            />
            <Button onClick={handleAsk} disabled={!inputValue.trim() || isAsking} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
