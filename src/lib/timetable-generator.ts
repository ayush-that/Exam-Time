interface Course {
  id: string;
  code: string;
  name: string;
  registeredStudents: string[];
  faculty: string[];
}

interface Faculty {
  id: string;
  name: string;
  department: string;
  maxInvigilationHours: number;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface ExamSlot {
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilators: string[];
}

export function generateTimetable(data: {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  startDate: string;
  endDate: string;
  examDurationHours: number;
  slotsPerDay: number;
}): ExamSlot[] | null {
  try {
    const {
      courses,
      faculty,
      rooms,
      startDate,
      endDate,
      examDurationHours,
      slotsPerDay
    } = data;

    // Validate input data
    if (!courses?.length || !faculty?.length || !rooms?.length) {
      console.error("Missing required data for timetable generation");
      return null;
    }

    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total available days
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate total available slots
    const totalSlots = totalDays * slotsPerDay;

    // Check if we have enough slots for all courses
    if (totalSlots < courses.length) {
      console.error("Not enough time slots for all courses");
      return null;
    }

    // Initialize faculty invigilation hours
    const facultyHours: { [key: string]: number } = {};
    faculty.forEach(f => {
      facultyHours[f.id] = 0;
    });

    // Initialize room usage
    const roomUsage: { [key: string]: { [key: string]: boolean } } = {};
    rooms.forEach(room => {
      roomUsage[room.id] = {};
    });

    // Generate time slots
    const slots: ExamSlot[] = [];
    let currentDate = new Date(start);
    let currentSlot = 0;

    // Sort courses by number of students (descending) to schedule larger classes first
    const sortedCourses = [...courses].sort(
      (a, b) => (b.registeredStudents?.length || 0) - (a.registeredStudents?.length || 0)
    );

    for (const course of sortedCourses) {
      let slotFound = false;
      const studentsCount = course.registeredStudents?.length || 0;

      // Find suitable room
      const suitableRooms = rooms.filter(room => room.capacity >= studentsCount);
      if (suitableRooms.length === 0) {
        console.error(`No room large enough for course ${course.code}`);
        continue;
      }

      // Try each day and slot until we find a suitable one
      while (currentDate <= end && !slotFound) {
        for (let slot = 0; slot < slotsPerDay && !slotFound; slot++) {
          const startHour = 9 + (slot * examDurationHours); // Start at 9 AM
          const endHour = startHour + examDurationHours;

          // Format times
          const startTime = `${startHour.toString().padStart(2, '0')}:00`;
          const endTime = `${endHour.toString().padStart(2, '0')}:00`;
          const dateStr = currentDate.toISOString().split('T')[0];

          // Find available room and faculty
          for (const room of suitableRooms) {
            if (roomUsage[room.id][dateStr + startTime]) {
              continue;
            }

            // Find available faculty member with the least invigilation hours
            const availableFaculty = faculty
              .filter(f => !slots.some(s => 
                s.date === dateStr && 
                s.startTime === startTime && 
                s.invigilators.includes(f.id)
              ))
              .sort((a, b) => facultyHours[a.id] - facultyHours[b.id]);

            if (availableFaculty.length > 0) {
              const assignedFaculty = availableFaculty[0];
              facultyHours[assignedFaculty.id] += examDurationHours;

              // Mark room as used for this slot
              roomUsage[room.id][dateStr + startTime] = true;

              // Create exam slot
              slots.push({
                courseId: course.id,
                date: dateStr,
                startTime,
                endTime,
                room: room.id,
                invigilators: [assignedFaculty.id]
              });

              slotFound = true;
              break;
            }
          }
        }

        if (!slotFound) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentSlot = 0;
        }
      }

      if (!slotFound) {
        console.error(`Could not find suitable slot for course ${course.code}`);
        return null;
      }
    }

    return slots;
  } catch (error) {
    console.error("Error generating timetable:", error);
    return null;
  }
} 