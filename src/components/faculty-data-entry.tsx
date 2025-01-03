"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CsvUploadButton } from "./csv-upload-button";
import { validateFacultyData } from "@/lib/csv-parser";

interface FacultyDataEntryProps {
  onDataLoaded: (data: string) => void;
  initialData?: string;
}

export function FacultyDataEntry({
  onDataLoaded,
  initialData = "",
}: FacultyDataEntryProps) {
  const [faculty, setFaculty] = useState(initialData);

  useEffect(() => {
    const storedFaculty = localStorage.getItem("faculty");
    if (storedFaculty) {
      setFaculty(storedFaculty);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("faculty", faculty);
  }, [faculty]);

  useEffect(() => {
    if (initialData) {
      setFaculty(initialData);
    }
  }, [initialData]);

  const handleDataLoaded = (rows: string[][]) => {
    console.log("Raw faculty data rows:", rows);
    // Skip header row and comment lines
    const formattedData = rows
      .filter((row, index) => {
        // Skip header row and comment lines
        if (index === 0 && row[0] === "Faculty ID") return false;
        if (row[0].trim().startsWith("#")) return false;
        return true;
      })
      .map((row) => {
        // Ensure we have all required fields
        if (row.length < 4) {
          console.warn("Row has insufficient data:", row);
          return null;
        }
        // Extract name, department, and hours
        const [_, name, department, hours] = row;
        if (!name || !department || !hours) {
          console.warn("Missing required faculty fields:", row);
          return null;
        }
        return `${name} | ${department} | ${hours}`;
      })
      .filter(Boolean)
      .join("\n");

    if (!formattedData) {
      console.error("No valid faculty data found");
      return;
    }

    console.log("Setting faculty data:", formattedData);
    setFaculty(formattedData);
    onDataLoaded(formattedData);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Faculty Data (CSV)</Label>
        <CsvUploadButton
          onDataLoaded={handleDataLoaded}
          validator={validateFacultyData}
          buttonText="Import Faculty CSV"
        />
      </div>
      <Textarea
        value={faculty}
        onChange={(e) => {
          setFaculty(e.target.value);
          onDataLoaded(e.target.value);
        }}
        placeholder="Example CSV format:
Faculty ID,Name,Department,Max Hours Per Week
F001,Dr. Smith,Computer Science,8
F002,Dr. Jones,Physics,8"
        className="font-mono text-sm h-[120px]"
      />
    </div>
  );
}
