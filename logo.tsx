
import { Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline text-foreground">
        Lightly
      </h1>
    </div>
  );
}
