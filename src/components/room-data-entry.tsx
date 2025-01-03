"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CsvUploadButton } from "./csv-upload-button";
import { validateRoomData } from "@/lib/csv-parser";

interface RoomDataEntryProps {
  onDataLoaded: (data: string) => void;
  initialData?: string;
}

export function RoomDataEntry({
  onDataLoaded,
  initialData = "",
}: RoomDataEntryProps) {
  const [rooms, setRooms] = useState(initialData);

  useEffect(() => {
    const storedRooms = localStorage.getItem("rooms");
    if (storedRooms) {
      setRooms(storedRooms);
      onDataLoaded(storedRooms);
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      setRooms(initialData);
      onDataLoaded(initialData);
    }
  }, [initialData]);

  const handleDataLoaded = (rows: string[][]) => {
    console.log("Room data loaded:", rows);
    // Skip header row and format data rows
    const formattedData = rows
      .slice(1)
      .map((row) => row.join(" | "))
      .join("\n");
    console.log("Formatted room data:", formattedData);
    setRooms(formattedData);
    onDataLoaded(formattedData);
    localStorage.setItem("rooms", formattedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRooms(newValue);
    onDataLoaded(newValue);
    localStorage.setItem("rooms", newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Room Data (CSV)</Label>
        <CsvUploadButton
          onDataLoaded={handleDataLoaded}
          validator={validateRoomData}
          buttonText="Import Room CSV"
        />
      </div>
      <Textarea
        value={rooms}
        onChange={handleChange}
        placeholder="Example CSV format:
Room Number,Capacity
101,40
102,30"
        className="font-mono text-sm h-[120px]"
      />
    </div>
  );
}
