import {
  Course,
  Faculty,
  Room,
  TimeSlot,
  ExamSlot,
  TimetableConstraints,
} from "./types";

export class TimetableGenerator {
  private courses: Course[];
  private faculty: Faculty[];
  private rooms: Room[];
  private constraints: TimetableConstraints;
  private generatedSlots: ExamSlot[] = [];
  private facultyInvigilationCount: Map<string, number> = new Map();

  constructor(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    constraints: TimetableConstraints
  ) {
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.constraints = constraints;
    // Initialize invigilation count for each faculty
    this.faculty.forEach((f) => this.facultyInvigilationCount.set(f.id, 0));
  }

  private formatTime(hour: number, minute: number = 0): string {
    return `${Math.floor(hour).toString().padStart(2, "0")}:${Math.floor(minute).toString().padStart(2, "0")}`;
  }

  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hourStr, minuteStr] = timeStr.split(":");
    return {
      hour: parseInt(hourStr, 10),
      minute: parseInt(minuteStr, 10),
    };
  }

  private addHours(timeStr: string, hours: number): string {
    const { hour, minute } = this.parseTime(timeStr);
    const totalMinutes =
      (hour + Math.floor(hours)) * 60 + minute + Math.round((hours % 1) * 60);
    return this.formatTime(Math.floor(totalMinutes / 60), totalMinutes % 60);
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  private timeToMinutes(time: string): number {
    const { hour, minute } = this.parseTime(time);
    return hour * 60 + minute;
  }

  private minutesToTime(minutes: number): string {
    return this.formatTime(Math.floor(minutes / 60), minutes % 60);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;
    try {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    } catch (error) {
      console.error("Error comparing dates:", error);
      console.log("Date 1:", date1);
      console.log("Date 2:", date2);
      return false;
    }
  }

  private isSlotAvailable(slot: TimeSlot, courseId: string): boolean {
    try {
      const course = this.courses.find((c) => c.id === courseId);
      if (!course) {
        console.warn(`Course not found: ${courseId}`);
        return false;
      }

      const slotStartMinutes = this.timeToMinutes(slot.startTime);
      const slotEndMinutes = this.timeToMinutes(
        this.addHours(slot.startTime, course.duration)
      );
      const slotEndWithGapMinutes =
        slotEndMinutes + this.constraints.examTimeGap * 60;

      // Check if there are any conflicts with existing slots
      const conflictingSlots = this.generatedSlots.filter((existingSlot) => {
        try {
          const sameDate = this.isSameDay(existingSlot.date, slot.date);
          if (!sameDate) return false;

          const existingCourse = this.courses.find(
            (c) => c.id === existingSlot.courseId
          );
          if (!existingCourse) {
            console.warn(`Existing course not found: ${existingSlot.courseId}`);
            return false;
          }

          const existingStartMinutes = this.timeToMinutes(
            existingSlot.startTime
          );
          const existingEndMinutes = this.timeToMinutes(
            this.addHours(existingSlot.startTime, existingCourse.duration)
          );
          const existingEndWithGapMinutes =
            existingEndMinutes + this.constraints.examTimeGap * 60;

          return (
            (slotStartMinutes >= existingStartMinutes &&
              slotStartMinutes < existingEndWithGapMinutes) ||
            (slotEndWithGapMinutes > existingStartMinutes &&
              slotEndWithGapMinutes <= existingEndWithGapMinutes) ||
            (slotStartMinutes <= existingStartMinutes &&
              slotEndWithGapMinutes >= existingEndWithGapMinutes)
          );
        } catch (error) {
          console.error("Error checking slot conflict:", error);
          return true; // Assume conflict on error
        }
      });

      if (conflictingSlots.length > 0) {
        return false;
      }

      // Check student conflicts
      const studentsWithConflicts = conflictingSlots.some((existingSlot) => {
        const existingCourse = this.courses.find(
          (c) => c.id === existingSlot.courseId
        );
        if (!existingCourse) return false;

        return course.registeredStudents.some((studentId) =>
          existingCourse.registeredStudents.includes(studentId)
        );
      });

      // Check if we've exceeded max exams per day
      const examsOnThisDay = this.generatedSlots.filter((existingSlot) =>
        this.isSameDay(existingSlot.date, slot.date)
      ).length;

      if (examsOnThisDay >= this.constraints.maxExamsPerDay) {
        return false;
      }

      return !studentsWithConflicts;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }

  private getAvailableInvigilators(slot: TimeSlot, course: Course): string[] {
    try {
      const availableFaculty = this.faculty.filter((f) => {
        try {
          // Check faculty availability
          const isAvailable = f.availableSlots.some(
            (availableSlot) =>
              this.isSameDay(availableSlot.date, slot.date) &&
              this.isTimeInRange(
                slot.startTime,
                availableSlot.startTime,
                availableSlot.endTime
              ) &&
              this.isTimeInRange(
                this.addHours(slot.startTime, course.duration),
                availableSlot.startTime,
                availableSlot.endTime
              )
          );

          // Check daily workload
          const dailyInvigilationHours = this.generatedSlots
            .filter(
              (examSlot) =>
                this.isSameDay(examSlot.date, slot.date) &&
                examSlot.invigilators.includes(f.id)
            )
            .reduce((total, examSlot) => {
              const examCourse = this.courses.find(
                (c) => c.id === examSlot.courseId
              );
              return total + (examCourse?.duration || 0);
            }, 0);

          return (
            isAvailable && dailyInvigilationHours < f.maxInvigilationHoursPerDay
          );
        } catch (error) {
          console.error("Error checking faculty availability:", error);
          return false;
        }
      });

      // Sort faculty by priority
      return availableFaculty
        .sort((a, b) => {
          const aIsCourseFaculty = course.faculty.includes(a.id);
          const bIsCourseFaculty = course.faculty.includes(b.id);

          if (aIsCourseFaculty !== bIsCourseFaculty) {
            return aIsCourseFaculty ? -1 : 1;
          }

          const aCount = this.facultyInvigilationCount.get(a.id) || 0;
          const bCount = this.facultyInvigilationCount.get(b.id) || 0;

          if (aCount !== bCount) {
            return aCount - bCount;
          }

          return Math.random() - 0.5;
        })
        .map((f) => f.id);
    } catch (error) {
      console.error("Error getting available invigilators:", error);
      return [];
    }
  }

  private getAvailableRoom(
    slot: TimeSlot,
    requiredCapacity: number
  ): Room | null {
    try {
      const availableRooms = this.rooms.filter(
        (room) =>
          room.isAvailable &&
          room.capacity >= requiredCapacity &&
          room.capacity <= requiredCapacity * 2 && // Don't use rooms that are too large
          !this.generatedSlots.some(
            (examSlot) =>
              this.isSameDay(examSlot.date, slot.date) &&
              examSlot.room === room.id &&
              (this.isTimeInRange(
                slot.startTime,
                examSlot.startTime,
                examSlot.endTime
              ) ||
                this.isTimeInRange(
                  this.addHours(
                    slot.startTime,
                    this.courses.find((c) => c.id === examSlot.courseId)
                      ?.duration || 0
                  ),
                  examSlot.startTime,
                  examSlot.endTime
                ))
          )
      );

      if (availableRooms.length === 0) {
        // If no rooms within optimal capacity range, try any room that fits
        return (
          this.rooms.find(
            (room) =>
              room.isAvailable &&
              room.capacity >= requiredCapacity &&
              !this.generatedSlots.some(
                (examSlot) =>
                  this.isSameDay(examSlot.date, slot.date) &&
                  examSlot.room === room.id &&
                  (this.isTimeInRange(
                    slot.startTime,
                    examSlot.startTime,
                    examSlot.endTime
                  ) ||
                    this.isTimeInRange(
                      this.addHours(
                        slot.startTime,
                        this.courses.find((c) => c.id === examSlot.courseId)
                          ?.duration || 0
                      ),
                      examSlot.startTime,
                      examSlot.endTime
                    ))
              )
          ) || null
        );
      }

      return availableRooms[Math.floor(Math.random() * availableRooms.length)];
    } catch (error) {
      console.error("Error getting available room:", error);
      return null;
    }
  }

  public generateTimetable(): ExamSlot[] {
    try {
      console.log("Starting timetable generation...");
      console.log("Courses:", this.courses.length);
      console.log("Faculty:", this.faculty.length);
      console.log("Rooms:", this.rooms.length);

      this.generatedSlots = [];
      this.facultyInvigilationCount.clear();
      this.faculty.forEach((f) => this.facultyInvigilationCount.set(f.id, 0));

      // Sort courses by number of students and faculty constraints
      const sortedCourses = [...this.courses].sort((a, b) => {
        // First priority: number of students
        const studentDiff =
          b.registeredStudents.length - a.registeredStudents.length;
        if (studentDiff !== 0) return studentDiff;

        // Second priority: number of faculty constraints
        return b.faculty.length - a.faculty.length;
      });

      // Start date is today
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      // Try to schedule for the next 4 weeks
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 28);

      // Track used rooms per time slot
      const roomUsage = new Map<string, number>();

      for (const course of sortedCourses) {
        console.log(`Processing course: ${course.code}`);
        let slotAssigned = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!slotAssigned && attempts < maxAttempts) {
          attempts++;

          // Try each day
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // Skip excluded dates
            if (
              this.constraints.excludeDates.some((d) => this.isSameDay(d, date))
            ) {
              continue;
            }

            const { hour: startHour } = this.parseTime(
              this.constraints.workingHours.start
            );
            const { hour: endHour } = this.parseTime(
              this.constraints.workingHours.end
            );

            // Try each hour in the working day
            for (
              let hour = startHour;
              hour <= endHour - course.duration;
              hour++
            ) {
              const slot: TimeSlot = {
                date: new Date(date),
                startTime: this.formatTime(hour),
                endTime: this.formatTime(hour + course.duration),
              };

              if (this.isSlotAvailable(slot, course.id)) {
                const invigilators = this.getAvailableInvigilators(
                  slot,
                  course
                );
                const room = this.getAvailableRoom(
                  slot,
                  course.registeredStudents.length
                );

                if (invigilators.length >= 2 && room) {
                  // Update invigilation counts
                  const selectedInvigilators = invigilators.slice(0, 2);
                  selectedInvigilators.forEach((id) => {
                    this.facultyInvigilationCount.set(
                      id,
                      (this.facultyInvigilationCount.get(id) || 0) + 1
                    );
                  });

                  // Update room usage count
                  roomUsage.set(room.id, (roomUsage.get(room.id) || 0) + 1);

                  this.generatedSlots.push({
                    ...slot,
                    courseId: course.id,
                    invigilators: selectedInvigilators,
                    room: room.id,
                  });
                  slotAssigned = true;
                  console.log(`Assigned slot for course ${course.code}`);
                  break;
                }
              }
            }

            if (slotAssigned) break;
          }
        }

        if (!slotAssigned) {
          console.warn(
            `Could not assign slot for course: ${course.code} after ${maxAttempts} attempts`
          );
        }
      }

      // Sort generated slots by date and time
      this.generatedSlots.sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      console.log(`Generated ${this.generatedSlots.length} exam slots`);
      return this.generatedSlots;
    } catch (error) {
      console.error("Error in timetable generation:", error);
      throw new Error(
        "Failed to generate timetable: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }
}
