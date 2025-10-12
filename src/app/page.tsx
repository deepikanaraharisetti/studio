
'use client';

import { Button } from '@/components/ui/button';
import { Users, Briefcase, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import React from 'react';

const featuredOpportunities = [
    { id: '1', title: 'AI-Powered Study Buddy App', skills: ['React', 'Firebase', 'AI/ML'] },
    { id: '2', title: 'Eco-Friendly Campus Initiative', skills: ['Marketing', 'Project Management'] },
    { id: '3', title: 'Annual Charity Hackathon', skills: ['Event Planning', 'Node.js'] },
    { id: '4', title: 'Short Film Production', skills: ['Video Editing', 'Storytelling'] },
    { id: '5', title: 'Peer-to-Peer Tutoring Platform', skills: ['Full-Stack', 'PostgreSQL'] },
];

function FeaturedProjectsCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      orientation="vertical"
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      className="w-full max-w-md"
    >
      <CarouselContent className="-mt-1 h-[420px]">
        {featuredOpportunities.map((op) => (
          <CarouselItem key={op.id} className="pt-1 basis-1/3">
            <div className="p-1">
              <Card className="shadow-md hover:shadow-primary/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{op.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {op.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}


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
                <Button size="lg" variant="outline">
                  <Link href="/dashboard">Explore Opportunities</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
                <FeaturedProjectsCarousel />
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
