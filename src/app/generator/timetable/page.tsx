"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

export default function TimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<any>(null);

  useEffect(() => {
    // Get timetable from localStorage
    const storedTimetable = localStorage.getItem("generatedTimetable");
    if (storedTimetable) {
      setTimetable(JSON.parse(storedTimetable));
    }
  }, []);

  if (!timetable) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-4">No Timetable Found</h1>
          <p className="text-gray-500 mb-6">
            Please generate a timetable first.
          </p>
          <Button onClick={() => router.push("/generator")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  const downloadTimetable = () => {
    const dataStr = JSON.stringify(timetable, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timetable.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => router.push("/generator")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
        </Button>
        <Button onClick={downloadTimetable}>
          <Download className="mr-2 h-4 w-4" /> Download Timetable
        </Button>
      </div>

      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Generated Timetable</h1>

        {/* Display timetable in a structured format */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            {Object.entries(timetable).map(([day, slots]: [string, any]) => (
              <div key={day} className="mb-6 last:mb-0">
                <h2 className="text-xl font-semibold mb-4">{day}</h2>
                <div className="space-y-3">
                  {Object.entries(slots).map(([time, exams]: [string, any]) => (
                    <div key={time} className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">{time}</h3>
                      <div className="grid gap-3">
                        {exams.map((exam: any, index: number) => (
                          <div
                            key={index}
                            className="bg-background p-3 rounded border"
                          >
                            <p className="font-medium">{exam.course}</p>
                            <p className="text-sm text-muted-foreground">
                              Room: {exam.room} | Faculty: {exam.faculty}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
