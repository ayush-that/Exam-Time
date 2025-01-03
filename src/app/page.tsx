import Link from "next/link";
import { ParticlesBackground } from "@/components/particles-background";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, BookOpen, Calendar } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          <ParticlesBackground />
          <div className="container relative flex flex-col items-center justify-center gap-4 py-20 md:py-32 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Exam Scheduling
              <br />
              Made Simple
            </h1>
            <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Create conflict-free examination timetables in minutes. Perfect
              for schools, colleges, and universities.
            </p>
            <Link href="/generator">
              <Button size="lg" className="mt-4">
                Generate Timetable <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section className="container py-12 md:py-24 lg:py-32">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Why Choose ExamTime?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 bg-background/60 backdrop-blur rounded-lg border">
              <Clock className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Time-Saving</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Generate complete schedules in minutes instead of hours or days
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background/60 backdrop-blur rounded-lg border">
              <Users className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Conflict Resolution</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Automatically avoid student and faculty scheduling conflicts
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background/60 backdrop-blur rounded-lg border">
              <BookOpen className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Simple interface designed for educational institutions
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background/60 backdrop-blur rounded-lg border">
              <Calendar className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Customize time slots, rooms, and faculty assignments
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
