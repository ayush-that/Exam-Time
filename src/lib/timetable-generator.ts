import { Holiday, isNonWorkingDay } from "./holiday-utils";

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
  skipDates?: Holiday[];
}): ExamSlot[] | null {
  try {
    const {
      courses,
      faculty,
      rooms,
      startDate,
      endDate,
      examDurationHours,
      slotsPerDay,
      skipDates = [],
    } = data;

    // Validate input data
    if (!courses?.length || !faculty?.length || !rooms?.length) {
      console.error("Missing required data for timetable generation");
      return null;
    }

    // Convert dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate available working days
    const workingDays: Date[] = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      if (!isNonWorkingDay(currentDate, skipDates)) {
        workingDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate time slots based on slotsPerDay
    const generateTimeSlots = (slotsCount: number) => {
      if (slotsCount === 2) {
        return [
          { startTime: "09:30", endTime: "12:30" }, // Morning slot
          { startTime: "14:30", endTime: "17:30" }, // Afternoon slot
        ];
      } else if (slotsCount === 3) {
        return [
          { startTime: "09:00", endTime: "12:00" }, // Morning slot
          { startTime: "13:00", endTime: "16:00" }, // Afternoon slot
          { startTime: "16:30", endTime: "19:30" }, // Evening slot
        ];
      } else {
        return [{ startTime: "09:30", endTime: "12:30" }];
      }
    };

    const timeSlots = generateTimeSlots(slotsPerDay);
    const maxExamsPerSlot = rooms.length; // Maximum exams that can run in parallel
    const totalAvailableSlots =
      workingDays.length * timeSlots.length * maxExamsPerSlot;

    console.log(`Working days: ${workingDays.length}`);
    console.log(`Slots per day: ${timeSlots.length}`);
    console.log(`Rooms available per slot: ${maxExamsPerSlot}`);
    console.log(`Total available slots: ${totalAvailableSlots}`);
    console.log(`Required slots: ${courses.length}`);

    if (totalAvailableSlots < courses.length) {
      console.error("Not enough slots available for all courses");
      return null;
    }

    // Initialize tracking structures
    const facultyHours: { [key: string]: { [key: string]: number } } = {};
    faculty.forEach((f) => {
      facultyHours[f.id] = {};
    });

    // Sort courses by student count (descending)
    const sortedCourses = [...courses].sort(
      (a, b) =>
        (b.registeredStudents?.length || 0) -
        (a.registeredStudents?.length || 0)
    );

    // Generate slots array
    const slots: ExamSlot[] = [];
    let unscheduledCourses = [...sortedCourses];

    // Iterate through each day and time slot
    for (const day of workingDays) {
      const dateStr = day.toISOString().split("T")[0];

      for (const timeSlot of timeSlots) {
        const slotKey = `${dateStr}-${timeSlot.startTime}`;
        const availableRooms = [...rooms];
        const availableFacultyForSlot = new Set(faculty.map((f) => f.id));

        // Try to schedule as many exams as possible in this time slot
        while (unscheduledCourses.length > 0 && availableRooms.length > 0) {
          const course = unscheduledCourses[0];

          // Find suitable room
          const roomIndex = availableRooms.findIndex(
            (room) => room.capacity >= (course.registeredStudents?.length || 0)
          );

          if (roomIndex === -1) {
            // No suitable room for this course, try next course
            unscheduledCourses.shift();
            continue;
          }

          // Find available faculty
          const availableFaculty = faculty
            .filter((f) => {
              if (!availableFacultyForSlot.has(f.id)) return false;
              const dailyHours = facultyHours[f.id][dateStr] || 0;
              return dailyHours < 6; // Max 6 hours per day
            })
            .sort((a, b) => {
              const totalHoursA = Object.values(facultyHours[a.id]).reduce(
                (sum, h) => sum + h,
                0
              );
              const totalHoursB = Object.values(facultyHours[b.id]).reduce(
                (sum, h) => sum + h,
                0
              );
              return totalHoursA - totalHoursB;
            });

          if (availableFaculty.length === 0) {
            // No available faculty for this slot, move to next time slot
            break;
          }

          // Assign faculty and update hours
          const assignedFaculty = availableFaculty[0];
          facultyHours[assignedFaculty.id][dateStr] =
            (facultyHours[assignedFaculty.id][dateStr] || 0) +
            examDurationHours;
          availableFacultyForSlot.delete(assignedFaculty.id);

          // Create exam slot
          const selectedRoom = availableRooms.splice(roomIndex, 1)[0];
          slots.push({
            courseId: course.id,
            date: dateStr,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            room: selectedRoom.id,
            invigilators: [assignedFaculty.id],
          });

          // Remove scheduled course
          unscheduledCourses.shift();
        }
      }
    }

    if (unscheduledCourses.length > 0) {
      console.error(`Failed to schedule ${unscheduledCourses.length} courses`);
      return null;
    }

    // Sort slots by date and time
    return slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    return null;
  }
}
