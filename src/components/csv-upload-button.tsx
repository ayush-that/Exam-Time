"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { parseCsvFile } from "@/lib/csv-parser";

interface CsvUploadButtonProps {
  onDataLoaded: (data: string[][]) => void;
  validator?: (rows: string[][]) => boolean;
  accept?: string;
  buttonText?: string;
}

export function CsvUploadButton({
  onDataLoaded,
  validator,
  accept = ".csv",
  buttonText = "Import CSV",
}: CsvUploadButtonProps) {
  const { toast } = useToast();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log(`Reading file for ${buttonText}:`, file.name);
      const rows = await parseCsvFile(file);
      console.log(`Parsed rows for ${buttonText}:`, rows);

      if (validator) {
        const isValid = validator(rows);
        console.log(`Validation result for ${buttonText}:`, isValid);
        if (!isValid) {
          console.log(`CSV validation failed for ${buttonText}`);
          toast({
            variant: "destructive",
            title: "Invalid CSV format",
            description: `Please ensure your CSV file matches the exact format shown in the example:
${
  buttonText === "Import Room CSV"
    ? "Room Number | Capacity"
    : buttonText === "Import Faculty CSV"
      ? "Name | Department | Max Hours"
      : "Course Code | Course Name | Credits"
}`,
          });
          return;
        }
      }

      console.log(`CSV validation passed for ${buttonText}, loading data`);
      onDataLoaded(rows);
      toast({
        title: "Success",
        description: `Data loaded successfully for ${buttonText}.`,
      });
    } catch (error) {
      console.error(`Error reading CSV for ${buttonText}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read CSV file. Please try again.",
      });
    }

    // Reset the input
    event.target.value = "";
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
        id={`csv-upload-${buttonText.toLowerCase().replace(/\s+/g, "-")}`}
      />
      <label
        htmlFor={`csv-upload-${buttonText.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <Button variant="outline" asChild>
          <span>{buttonText}</span>
        </Button>
      </label>
    </div>
  );
}
