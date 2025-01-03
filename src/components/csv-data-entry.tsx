"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CsvUploadButton } from "./csv-upload-button";
import {
  validateCourseData,
  validateFacultyData,
  validateRoomData,
} from "@/lib/csv-parser";

interface CsvDataEntryProps {
  type: "course" | "faculty" | "room";
  value: string;
  onChange: (value: string) => void;
  onDataLoaded: (rows: string[][]) => void;
}

export function CsvDataEntry({
  type,
  value,
  onChange,
  onDataLoaded,
}: CsvDataEntryProps) {
  const getValidator = () => {
    switch (type) {
      case "course":
        return validateCourseData;
      case "faculty":
        return validateFacultyData;
      case "room":
        return validateRoomData;
      default:
        return undefined;
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "course":
        return "Example CSV format:\nCourse Code,Course Name,Credits,Hours Per Week";
      case "faculty":
        return "Example CSV format:\nFaculty ID,Name,Department,Max Hours Per Week";
      case "room":
        return "Example CSV format:\nRoom Number,Capacity,Type,Building";
      default:
        return "";
    }
  };

  const getLabel = () => {
    switch (type) {
      case "course":
        return "Course Data (CSV)";
      case "faculty":
        return "Faculty Data (CSV)";
      case "room":
        return "Room Data (CSV)";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{getLabel()}</Label>
        <CsvUploadButton
          onDataLoaded={onDataLoaded}
          validator={getValidator()}
        />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="font-mono text-sm h-[120px]"
      />
    </div>
  );
}
