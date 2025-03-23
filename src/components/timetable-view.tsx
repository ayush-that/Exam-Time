"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TimetableViewProps {
  schedule: any;
}

// Helper function to get day name
const getDayName = (date: Date): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

export function TimetableView({ schedule }: TimetableViewProps) {
  if (
    !schedule ||
    !schedule.generatedSlots ||
    schedule.generatedSlots.length === 0
  ) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No timetable data available.
        </p>
      </Card>
    );
  }

  // Group exams by date
  const examsByDate = schedule.generatedSlots.reduce((acc: any, exam: any) => {
    const date = new Date(exam.date);
    const dateStr = `${date.toLocaleDateString()} (${getDayName(date)})`;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(exam);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(examsByDate).sort(
    (a, b) =>
      new Date(a.split(" (")[0]).getTime() -
      new Date(b.split(" (")[0]).getTime()
  );

  const downloadCSV = () => {
    const csvRows = [
      ["Date", "Day", "Time", "Course", "Room", "Faculty", "Students"],
    ];

    sortedDates.forEach((dateStr) => {
      const date = new Date(dateStr.split(" (")[0]);
      const dayName = getDayName(date);

      examsByDate[dateStr].forEach((exam: any) => {
        const course = schedule.courses?.find(
          (c: any) => c.id === exam.courseId
        );
        const faculty = schedule.faculty?.find((f: any) =>
          exam.invigilators?.includes(f.id)
        );
        const room = schedule.rooms?.find((r: any) => r.id === exam.room);

        csvRows.push([
          date.toLocaleDateString(),
          dayName,
          exam.startTime,
          course ? `${course.code} - ${course.name}` : exam.courseId,
          room?.name || exam.room,
          faculty?.name || exam.invigilators?.join(", ") || "N/A",
          course?.registeredStudents?.length?.toString() || "N/A",
        ]);
      });
    });

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "examination_timetable.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Examination Timetable", 14, 15);
    doc.setFontSize(12);
    doc.text(schedule.name || "Schedule", 14, 25);

    let yOffset = 35;

    sortedDates.forEach((date, dateIndex) => {
      // Add date header
      doc.setFontSize(14);
      doc.text(date, 14, yOffset);
      yOffset += 10;

      // Add table for this date
      const tableData = examsByDate[date]
        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
        .map((exam: any) => {
          const course = schedule.courses?.find(
            (c: any) => c.id === exam.courseId
          );
          const faculty = schedule.faculty?.find((f: any) =>
            exam.invigilators?.includes(f.id)
          );
          const room = schedule.rooms?.find((r: any) => r.id === exam.room);

          return [
            exam.startTime,
            course ? `${course.code}\n${course.name}` : exam.courseId,
            room?.name || exam.room,
            faculty?.name || exam.invigilators?.join(", ") || "N/A",
            course?.registeredStudents?.length?.toString() || "N/A",
          ];
        });

      autoTable(doc, {
        startY: yOffset,
        head: [["Time", "Course", "Room", "Faculty", "Students"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 },
        },
      });

      yOffset = (doc as any).lastAutoTable.finalY + 20;

      // Add new page if needed
      if (dateIndex < sortedDates.length - 1 && yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
    });

    doc.save("examination_timetable.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 sm:gap-0 sm:flex-row justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{schedule.name}</h2>
          {schedule.description && (
            <p className="text-muted-foreground">{schedule.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Button onClick={downloadPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {sortedDates.map((dateStr) => (
        <Card key={dateStr} className="p-6 -mx-8 sm:-mx-0">
          <h3 className="text-lg font-semibold mb-4">{dateStr}</h3>
          <div className="space-y-4">
            {examsByDate[dateStr].map((exam: any, index: number) => {
              const course = schedule.courses?.find(
                (c: any) => c.id === exam.courseId
              );
              const faculty = schedule.faculty?.find((f: any) =>
                exam.invigilators?.includes(f.id)
              );
              const room = schedule.rooms?.find((r: any) => r.id === exam.room);

              return (
                <div
                  key={`${dateStr}-${index}`}
                  className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">Time</p>
                    <p>
                      {exam.startTime} - {exam.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Course</p>
                    <p>
                      {course
                        ? `${course.code} - ${course.name}`
                        : exam.courseId}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Room</p>
                    <p>{room?.name || exam.room}</p>
                  </div>
                  <div>
                    <p className="font-medium">Faculty</p>
                    <p>
                      {faculty?.name || exam.invigilators?.join(", ") || "N/A"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
