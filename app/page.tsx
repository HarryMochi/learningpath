
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { BookOpenCheck, Zap, Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/main-layout';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-in-down">
          <Logo />
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <Button asChild>
                    <Link href="/learn">Go to App</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </header>

        <main className="flex-1">
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
            <div className="animate-fade-in-up">
              <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4">
                Master Any Subject, Step-by-Step
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
                Lightly uses AI to create personalized learning courses on any topic. Go from beginner to expert with a structured, easy-to-follow plan.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 group">
                  <Link href="/learn">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </section>

          <section id="features" className="bg-muted py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl">
                  <div className="p-4 bg-primary rounded-full mb-4">
                    <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Choose Your Topic</h3>
                  <p className="text-muted-foreground">
                    Tell us what you want to learn. From coding to cooking, anything is possible.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl">
                  <div className="p-4 bg-primary rounded-full mb-4">
                    <Zap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Generate Your Path</h3>
                  <p className="text-muted-foreground">
                    Our AI instantly creates a comprehensive, step-by-step course tailored to your chosen depth.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl">
                  <div className="p-4 bg-primary rounded-full mb-4">
                    <Bot className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Learn & Master</h3>
                  <p className="text-muted-foreground">
                    Follow the steps, track your progress, and ask our AI assistant for help whenever you get stuck.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-card border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Lightly. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
