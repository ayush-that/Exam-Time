export async function parseCsvFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        console.log("Raw CSV text:", text);
        // Split by newlines and remove any empty lines
        const rows = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            // Try pipe separator first, if not found use comma
            if (line.includes("|")) {
              return line.split("|").map((cell) => cell.trim());
            }
            return line.split(",").map((cell) => cell.trim());
          });
        console.log("Parsed CSV rows:", rows);
        resolve(rows);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function validateCourseData(rows: string[][]): boolean {
  console.log("Validating course data:", rows);
  if (rows.length < 2) {
    // At least header and one data row
    console.log("Course data: Not enough rows");
    return false;
  }

  // Check header
  const header = rows[0];
  if (
    header.length !== 3 ||
    header[0] !== "Course Code" ||
    header[1] !== "Course Name" ||
    header[2] !== "Credits"
  ) {
    console.log("Course data: Invalid header format:", header);
    return false;
  }

  // Skip header and comment lines
  const dataRows = rows
    .slice(1)
    .filter((row) => !row[0].trim().startsWith("#"));
  if (dataRows.length < 1) {
    console.log("Course data: No valid data rows found");
    return false;
  }

  // Check if each row has code, name, and credits
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (row.length !== 3) {
      console.log(
        `Course data: Row ${i + 1} has wrong number of columns:`,
        row
      );
      return false;
    }

    // Check if all fields are present
    if (!row[0] || !row[1] || !row[2]) {
      console.log(`Course data: Row ${i + 1} has empty values:`, row);
      return false;
    }

    // Check if credits is a valid number
    const credits = Number(row[2]);
    if (isNaN(credits) || credits <= 0) {
      console.log(`Course data: Row ${i + 1} has invalid credits:`, row[2]);
      return false;
    }
  }

  return true;
}

export function validateFacultyData(rows: string[][]): boolean {
  console.log("Validating faculty data:", rows);
  if (rows.length < 2) {
    // At least header and one data row
    console.log("Faculty data: Not enough rows");
    return false;
  }

  // Check header
  const header = rows[0];
  if (
    header.length !== 4 ||
    header[0] !== "Faculty ID" ||
    header[1] !== "Name" ||
    header[2] !== "Department" ||
    header[3] !== "Max Hours Per Week"
  ) {
    console.log("Faculty data: Invalid header format:", header);
    return false;
  }

  // Skip header and comment lines
  const dataRows = rows
    .slice(1)
    .filter((row) => !row[0].trim().startsWith("#"));
  if (dataRows.length < 1) {
    console.log("Faculty data: No valid data rows found");
    return false;
  }

  // Check if each row has all required fields
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (row.length !== 4) {
      console.log(
        `Faculty data: Row ${i + 1} has wrong number of columns:`,
        row
      );
      return false;
    }

    // Check if all fields are present
    if (!row[0] || !row[1] || !row[2] || !row[3]) {
      console.log(`Faculty data: Row ${i + 1} has empty values:`, row);
      return false;
    }

    // Check if hours is a valid number
    const hours = Number(row[3]);
    if (isNaN(hours) || hours <= 0) {
      console.log(`Faculty data: Row ${i + 1} has invalid hours:`, row[3]);
      return false;
    }
  }

  return true;
}

export function validateRoomData(rows: string[][]): boolean {
  console.log("Validating room data:", rows);
  if (rows.length < 2) {
    console.log("Room data: Not enough rows");
    return false;
  }

  const header = rows[0];
  console.log("Room data header:", header);

  // Check if header matches expected format
  if (
    header.length !== 2 ||
    header[0] !== "Room Number" ||
    header[1] !== "Capacity"
  ) {
    console.log(
      "Room data: Invalid header format. Expected: Room Number,Capacity"
    );
    return false;
  }

  // Validate each data row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== 2) {
      console.log(`Room data: Row ${i} has wrong number of columns:`, row);
      return false;
    }
    if (!row[0] || !row[1]) {
      console.log(`Room data: Row ${i} has empty values:`, row);
      return false;
    }
    const capacity = Number(row[1]);
    if (isNaN(capacity) || capacity <= 0) {
      console.log(`Room data: Row ${i} has invalid capacity:`, row[1]);
      return false;
    }
  }

  return true;
}

export function formatDataToString(rows: string[][]): string {
  console.log("Formatting data to string:", rows);
  if (!Array.isArray(rows) || rows.length < 2) {
    console.error("Invalid data format:", rows);
    return "";
  }

  // Skip header row and format data rows
  const dataRows = rows.slice(1);
  const formatted = dataRows.map((row) => row.join(" | ")).join("\n");
  console.log("Formatted result:", formatted);
  return formatted;
}
