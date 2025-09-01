

export interface Quiz {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExternalLink {
    title: string;
    url: string;
}

export interface Step {
  stepNumber: number;
  title: string;
  content?: string;
  quiz?: Quiz;
  funFact?: string;
  externalLinks?: ExternalLink[];
  completed: boolean;
}

export interface Course {
  id: string;
  userId: string;
  topic: string;
  depth: 15 | 30;
  outline: string;
  steps: Step[];
  createdAt: string;
}

export type CourseData = Omit<Course, 'id'>;
