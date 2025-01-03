export interface Course {
  department: any;
  id: string;
  name: string;
  code: string;
  duration: number; // in hours
  registeredStudents: string[];
  faculty: string[];
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  availableSlots: TimeSlot[];
  maxInvigilationHoursPerDay: number;
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

export interface ExamSlot extends TimeSlot {
  courseId: string;
  invigilators: string[];
  room: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
}

export interface TimetableConstraints {
  maxExamsPerDay: number;
  maxInvigilationHoursPerFaculty: number;
  examTimeGap: number; // minimum gap between exams in hours
  workingHours: {
    start: string;
    end: string;
  };
  excludeDates: Date[];
}

export interface ExamSchedule {
  id: string;
  name: string;
  description: string;
  semester: string;
  academicYear: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  constraints: TimetableConstraints;
  generatedSlots: ExamSlot[] | null;
  status: 'draft' | 'generated' | 'published';
} 