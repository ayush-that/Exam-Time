"use client";

import Link from "next/link";
import { Github, Heart, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            ExamTime
          </div>
          <p className="text-sm text-muted-foreground">
            Made with <Heart className="inline-block h-4 w-4 text-red-500" />{" "}
            using Next.js and shadcn/ui
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/ayush-that/Exam-Time"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://twitter.com/shydev69"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Licensed under{" "}
            <Link
              href="https://www.gnu.org/licenses/gpl-3.0.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              GPL-3.0
            </Link>
          </p>
          <p>© {new Date().getFullYear()} ExamTime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
