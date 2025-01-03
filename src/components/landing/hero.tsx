"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="text-center space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Exam Scheduling
          <span className="block text-primary">Made Simple</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Create conflict-free examination timetables in minutes. Perfect for
          schools, colleges, and universities.
        </p>
      </div>
      <div className="flex justify-center">
        <Link href="/generator">
          <Button size="lg" className="gap-2">
            Generate Timetable <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
