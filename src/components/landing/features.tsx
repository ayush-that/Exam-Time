"use client";

import { BookOpen, Calendar, Clock, Users } from "lucide-react";

const features = [
  {
    title: "Time-Saving",
    description:
      "Generate complete schedules in minutes instead of hours or days",
    icon: Clock,
  },
  {
    title: "Conflict Resolution",
    description: "Automatically avoid student and faculty scheduling conflicts",
    icon: Users,
  },
  {
    title: "Easy to Use",
    description: "Simple interface designed for educational institutions",
    icon: BookOpen,
  },
  {
    title: "Flexible Scheduling",
    description: "Customize time slots, rooms, and faculty assignments",
    icon: Calendar,
  },
];

export function Features() {
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Why Choose ExamTime?</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border hover:border-primary/50 transition-colors"
          >
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
