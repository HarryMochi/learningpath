
import Link from 'next/link';
import Logo from '@/components/logo';
import TypingEffect from './typing-effect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <div className="flex flex-col justify-between h-full p-8 text-foreground">
            <Link href="/">
              <Logo />
            </Link>
            <div className="w-full max-w-md">
              <h1 className="font-headline text-4xl font-bold">
                Unlock your <TypingEffect words={['potential', 'knowledge']} />
              </h1>
              <p className="text-muted-foreground mt-2">
                Join a community of learners and start your journey to mastery with our AI-powered courses.
              </p>
            </div>
            <div/>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        {children}
      </div>
    </div>
  )
}
