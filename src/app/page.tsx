
'use client';

import { Button } from '@/components/ui/button';
import { Users, Briefcase, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">CrewUp</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
                Build Your Dream Team, Instantly.
              </h1>
              <p className="text-lg text-muted-foreground">
                CrewUp is where students, professionals, and campus organizations connect. Post your project, find skilled collaborators, and bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Explore Opportunities</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
                <Image 
                    src="https://picsum.photos/seed/crew-up/600/500" 
                    alt="A diverse team collaborating on a project" 
                    width={600} 
                    height={500} 
                    className="rounded-xl shadow-lg"
                    data-ai-hint="team collaboration"
                />
            </div>
          </div>
        </section>

        <section className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold font-headline">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Finding talent and collaborating has never been easier. Follow these simple steps to get started.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-headline">Post an Opportunity</h3>
                <p className="text-muted-foreground">
                  Share your project, event, or startup idea. Specify the roles and skills you're looking for.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-headline">Discover & Join</h3>
                <p className="text-muted-foreground">
                  Browse a wide range of projects and find a team that matches your interests and expertise.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-headline">Collaborate & Succeed</h3>
                <p className="text-muted-foreground">
                  Use our built-in tools for real-time chat and file sharing to work seamlessly with your new team.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CrewUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
