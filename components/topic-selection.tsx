
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "./logo";
import type { GenerationState } from "@/app/learn/page";

const formSchema = z.object({
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
  depth: z.enum(["15", "30"]),
});

type TopicFormValues = z.infer<typeof formSchema>;

interface TopicSelectionProps {
  onGenerateCourse: (topic: string, depth: 15 | 30) => Promise<void>;
  generationState: GenerationState;
}

export default function TopicSelection({ onGenerateCourse, generationState }: TopicSelectionProps) {
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      depth: "15",
    },
  });
  
  const isGenerating = generationState.status === 'generating';

  const onSubmit = (values: TopicFormValues) => {
    onGenerateCourse(values.topic, parseInt(values.depth) as 15 | 30);
  };

  return (
    <div className="w-full max-w-lg">
       <div className="flex justify-center mb-8">
         <Logo />
       </div>
      <Card className="shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">What do you want to master today?</CardTitle>
          <CardDescription>Enter a topic and select the depth of your learning path.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-4 pt-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Building your course... This may take a minute.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React, Python, Music Theory" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Depth</FormLabel>
                      <FormControl>
                         <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="15">Overview</TabsTrigger>
                            <TabsTrigger value="30">Deep Dive</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Start Learning
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
