import { marked } from 'marked';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface StepContentProps {
  content?: string;
}

export function StepContent({ content }: StepContentProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (content) {
      const parsedHtml = marked.parse(content);
      setHtmlContent(parsedHtml as string);
    } else {
      setHtmlContent('');
    }
  }, [content]);

  if (content === undefined) {
    return (
      <div className="flex items-center justify-center space-x-2 py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center text-muted-foreground py-8">
        This step has no content.
      </div>
    );
  }

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed p-2"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
