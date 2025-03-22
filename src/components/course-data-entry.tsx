"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CsvUploadButton } from "./csv-upload-button";
import { validateCourseData } from "@/lib/csv-parser";

interface CourseDataEntryProps {
  onDataLoaded: (data: string) => void;
  initialData?: string;
}

export function CourseDataEntry({
  onDataLoaded,
  initialData = "",
}: CourseDataEntryProps) {
  const [courses, setCourses] = useState(initialData);

  useEffect(() => {
    const storedCourses = localStorage.getItem("courses");
    if (storedCourses) {
      setCourses(storedCourses);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("courses", courses);
  }, [courses]);

  useEffect(() => {
    if (initialData) {
      setCourses(initialData);
    }
  }, [initialData]);

  const handleDataLoaded = (rows: string[][]) => {
    console.log("Raw course data rows:", rows);
    // Skip header row and comment lines
    const formattedData = rows
      .filter((row, index) => {
        // Skip header row and comment lines
        if (index === 0 && row[0] === "Course Code") return false;
        if (row[0].trim().startsWith("#")) return false;
        return true;
      })
      .map((row) => {
        // Ensure we have at least code, name, and credits
        if (row.length < 3) {
          console.warn("Row has insufficient data:", row);
          return null;
        }
        // Extract code, name, and credits
        const [code, name, credits] = row;
        if (!code || !name || !credits) {
          console.warn("Missing required course fields:", row);
          return null;
        }
        return `${code} | ${name} | ${credits}`;
      })
      .filter(Boolean)
      .join("\n");

    console.log("Formatted course data:", formattedData);
    if (!formattedData) {
      console.error("No valid course data found");
      return;
    }

    setCourses(formattedData);
    onDataLoaded(formattedData);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Course Data (CSV)</Label>
        <CsvUploadButton
          onDataLoaded={handleDataLoaded}
          validator={validateCourseData}
          buttonText="Import Course CSV"
        />
      </div>
      <Textarea
        value={courses}
        onChange={(e) => {
          setCourses(e.target.value);
          onDataLoaded(e.target.value);
        }}
        placeholder="Example CSV format:
Course Code,Course Name,Credits
CS101,Introduction to Programming,45
CS102,Data Structures,55"
        className="font-mono text-sm h-[150px] sm:h-[120px]"
      />
    </div>
  );
}
