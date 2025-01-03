"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exampleData } from "@/lib/example-data";
import { useToast } from "@/components/ui/use-toast";
import { getWorkingDays } from "@/lib/holiday-utils";
import { CourseDataEntry } from "./course-data-entry";
import { FacultyDataEntry } from "./faculty-data-entry";
import { RoomDataEntry } from "./room-data-entry";
import { Holiday } from "@/lib/holiday-utils";
import { X } from "lucide-react";

interface DataEntryFormProps {
  onSubmit: (data: any) => void;
}

export function DataEntryForm({ onSubmit }: DataEntryFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [examDurationHours, setExamDurationHours] = useState(3);
  const [slotsPerDay, setSlotsPerDay] = useState(3);
  const [courses, setCourses] = useState("");
  const [faculty, setFaculty] = useState("");
  const [rooms, setRooms] = useState("");
  const [skipDates, setSkipDates] = useState<Holiday[]>([]);
  const [newSkipDate, setNewSkipDate] = useState("");
  const [newSkipReason, setNewSkipReason] = useState("");

  const handleAddSkipDate = () => {
    if (!newSkipDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a date to skip",
      });
      return;
    }

    const skipDate: Holiday = {
      date: newSkipDate,
      name: newSkipReason || "Skip Day",
    };

    setSkipDates([...skipDates, skipDate]);
    setNewSkipDate("");
    setNewSkipReason("");
  };

  const handleRemoveSkipDate = (date: string) => {
    setSkipDates(skipDates.filter((d) => d.date !== date));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      toast({
        title: "Preparing data...",
        description: "Please wait while we generate your timetable.",
      });

      // Parse courses (format: code | name | credits)
      const coursesData = courses
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => {
          const parts = line.split("|").map((s) => s.trim());
          if (parts.length < 2) {
            console.warn("Invalid course line:", line);
            return null;
          }
          const [code, name, credits] = parts;
          const studentCount = parseInt(credits || "0");
          if (!code || !name) {
            console.warn("Missing required course fields:", line);
            return null;
          }
          return {
            id: code,
            code,
            name,
            registeredStudents: Array.from(
              { length: studentCount },
              (_, i) => `${code}-${i + 1}`
            ),
            faculty: [],
          };
        })
        .filter(Boolean);

      // Parse faculty (format: id | name | department | maxHours)
      const facultyData = faculty
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => {
          const [name, department, maxHours] = line
            .split("|")
            .map((s) => s.trim());
          return {
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            department,
            maxInvigilationHours: parseInt(maxHours || "8"),
          };
        })
        .filter(Boolean);

      // Parse rooms (format: number | capacity)
      const roomsData = rooms
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => {
          const [number, capacity] = line.split("|").map((s) => s.trim());
          return {
            id: number.toLowerCase().replace(/\s+/g, "-"),
            name: number,
            capacity: parseInt(capacity || "60"),
          };
        });

      // Validate required fields
      if (!startDate || !endDate) {
        throw new Error("Please select start and end dates");
      }

      if (!coursesData.length) {
        throw new Error("Please enter at least one course");
      }

      if (!facultyData.length) {
        throw new Error("Please enter at least one faculty member");
      }

      if (!roomsData.length) {
        throw new Error("Please enter at least one room");
      }

      // Prepare form data
      const formData = {
        name,
        description,
        startDate,
        endDate,
        examDurationHours,
        slotsPerDay,
        courses: coursesData,
        faculty: facultyData,
        rooms: roomsData,
        skipDates,
      };

      // Call the callback with the prepared data
      onSubmit(formData);
      toast({
        title: "Success!",
        description: "Timetable generated successfully.",
      });
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  const loadExampleData = () => {
    setName("B.Tech 3rd Year Mid-Semester Examinations");
    setDescription(
      "Mid-Semester examinations for B.Tech 3rd Year (5th Semester) - All Branches"
    );
    setStartDate("2024-11-11");
    setEndDate("2024-12-21");
    setExamDurationHours(3);
    setSlotsPerDay(3);

    // Load example data and trigger the onDataLoaded handlers
    setCourses(exampleData.courses);
    setFaculty(exampleData.faculty);
    setRooms(exampleData.rooms);

    // Add example skip dates
    setSkipDates([
      { date: "2024-11-14", name: "Children's Day" },
      { date: "2024-11-19", name: "Department Day" },
      { date: "2024-11-27", name: "College Sports Day" },
      { date: "2024-12-03", name: "College Annual Day" },
      { date: "2024-12-10", name: "Inter-College Festival" },
      { date: "2024-12-16", name: "Technical Symposium" },
    ]);

    // Also update localStorage to persist the example data
    localStorage.setItem("courses", exampleData.courses);
    localStorage.setItem("faculty", exampleData.faculty);
    localStorage.setItem("rooms", exampleData.rooms);

    toast({
      title: "Example Data Loaded",
      description:
        "The form has been populated with example data. Schedule spans six weeks with 3 slots per day (Morning, Afternoon, and Evening).",
    });
  };

  const calculateSlots = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get working days excluding Sundays and holidays
    const { workingDays, holidays } = getWorkingDays(start, end, skipDates);
    const totalSlots = workingDays.length * slotsPerDay;

    const courseCount = courses
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#")).length;

    return {
      totalSlots,
      courseCount,
      isEnoughSlots: totalSlots >= courseCount,
      workingDays: workingDays.length,
      totalDays:
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1,
      holidays,
    };
  };

  const slotInfo = calculateSlots();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Schedule Details</h3>
            <Button type="button" variant="outline" onClick={loadExampleData}>
              Load Example Data
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fall 2024 Final Examinations"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the examination schedule"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examDurationHours">Exam Duration (hours)</Label>
                <Input
                  id="examDurationHours"
                  type="number"
                  min="1"
                  max="6"
                  value={examDurationHours}
                  onChange={(e) =>
                    setExamDurationHours(parseInt(e.target.value) || 3)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slotsPerDay">Slots Per Day</Label>
                <Input
                  id="slotsPerDay"
                  type="number"
                  min="1"
                  max="3"
                  value={slotsPerDay}
                  onChange={(e) =>
                    setSlotsPerDay(parseInt(e.target.value) || 1)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Skip Dates</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    type="date"
                    value={newSkipDate}
                    onChange={(e) => setNewSkipDate(e.target.value)}
                    min={startDate}
                    max={endDate}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Reason (optional)"
                    value={newSkipReason}
                    onChange={(e) => setNewSkipReason(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={handleAddSkipDate}
                    variant="outline"
                  >
                    Add Skip Date
                  </Button>
                </div>
              </div>
              {skipDates.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Skip Dates:</Label>
                  <div className="space-y-2">
                    {skipDates.map((skipDate) => (
                      <div
                        key={skipDate.date}
                        className="flex items-center justify-between bg-muted p-2 rounded"
                      >
                        <span>
                          {new Date(skipDate.date).toLocaleDateString()} -{" "}
                          {skipDate.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkipDate(skipDate.date)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CourseDataEntry
                onDataLoaded={setCourses}
                initialData={courses}
              />
              <FacultyDataEntry
                onDataLoaded={setFaculty}
                initialData={faculty}
              />
              <RoomDataEntry onDataLoaded={setRooms} initialData={rooms} />
            </div>

            {slotInfo && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Schedule Information</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total Days: {slotInfo.totalDays} days</li>
                  <li>Working Days: {slotInfo.workingDays} days</li>
                  <li>Total Available Slots: {slotInfo.totalSlots}</li>
                  <li>Required Slots: {slotInfo.courseCount}</li>
                  <li>
                    Status:{" "}
                    {slotInfo.isEnoughSlots ? (
                      <span className="text-green-600">
                        Sufficient slots available
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Not enough slots available
                      </span>
                    )}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!slotInfo?.isEnoughSlots}>
          Generate Schedule
        </Button>
      </div>
    </form>
  );
}
