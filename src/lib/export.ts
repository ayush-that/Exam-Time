import * as XLSX from "xlsx";
import { ExamSchedule } from "./types";

// Helper function to get day name
function getDayName(date: Date): string {
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
}

export function exportScheduleToExcel(schedule: ExamSchedule) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create schedule info worksheet
  const scheduleInfo = [
    ["Schedule Name", schedule.name],
    ["Description", schedule.description || ""],
    ["Academic Year", schedule.academicYear],
    ["Semester", schedule.semester],
    ["Department", schedule.department],
    ["Status", schedule.status],
    ["Courses", schedule.courses.length.toString()],
    ["Faculty", schedule.faculty.length.toString()],
    ["Rooms", schedule.rooms.length.toString()],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(scheduleInfo);
  XLSX.utils.book_append_sheet(wb, wsInfo, "Schedule Info");

  // Create exam slots worksheet
  const examSlotsHeaders = [
    "Date",
    "Day",
    "Start Time",
    "End Time",
    "Course Code",
    "Course Name",
    "Faculty",
    "Room",
  ];

  const examSlotsData =
    schedule.generatedSlots?.map((slot) => {
      const date = new Date(slot.date);
      const course = schedule.courses.find((c) => c.id === slot.courseId);
      const faculty = schedule.faculty.find((f) =>
        slot.invigilators.includes(f.id)
      );
      const room = schedule.rooms.find((r) => r.id === slot.room);

      return [
        date.toLocaleDateString(),
        getDayName(date),
        slot.startTime,
        slot.endTime,
        course?.code || "Unknown",
        course?.name || "Unknown",
        faculty?.name || "Unknown",
        room?.name || "Unknown",
      ];
    }) || [];

  examSlotsData.sort((a, b) => {
    const dateA = new Date(a[0]);
    const dateB = new Date(b[0]);
    if (dateA.getTime() === dateB.getTime()) {
      return a[2].localeCompare(b[2]); // Compare times if dates are equal
    }
    return dateA.getTime() - dateB.getTime();
  });

  examSlotsData.unshift(examSlotsHeaders);
  const wsExams = XLSX.utils.aoa_to_sheet(examSlotsData);
  XLSX.utils.book_append_sheet(wb, wsExams, "Exam Schedule");

  // Create courses worksheet
  const coursesHeaders = ["Code", "Name", "Department", "Students"];
  const coursesData = schedule.courses.map((course) => [
    course.code,
    course.name,
    course.department || "N/A",
    course.registeredStudents?.length || 0,
  ]);
  coursesData.unshift(coursesHeaders);
  const wsCourses = XLSX.utils.aoa_to_sheet(coursesData);
  XLSX.utils.book_append_sheet(wb, wsCourses, "Courses");

  // Create faculty worksheet
  const facultyHeaders = ["Name", "Department", "Max Hours"];
  const facultyData = schedule.faculty.map((f) => [
    f.name,
    f.department,
    f.maxInvigilationHoursPerDay,
  ]);
  facultyData.unshift(facultyHeaders);
  const wsFaculty = XLSX.utils.aoa_to_sheet(facultyData);
  XLSX.utils.book_append_sheet(wb, wsFaculty, "Faculty");

  // Create rooms worksheet
  const roomsHeaders = ["Name", "Capacity"];
  const roomsData = schedule.rooms.map((room) => [room.name, room.capacity]);
  roomsData.unshift(roomsHeaders);
  const wsRooms = XLSX.utils.aoa_to_sheet(roomsData);
  XLSX.utils.book_append_sheet(wb, wsRooms, "Rooms");

  // Generate filename
  const filename = `${schedule.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;

  // Write the workbook
  XLSX.writeFile(wb, filename);
}

export function exportSchedulesToExcel(schedules: ExamSchedule[]) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create schedules overview worksheet
  const schedulesHeaders = [
    "Name",
    "Semester",
    "Academic Year",
    "Department",
    "Status",
    "Courses Count",
    "Faculty Count",
    "Rooms Count",
  ];
  const schedulesData = schedules.map((schedule) => [
    schedule.name,
    schedule.semester,
    schedule.academicYear,
    schedule.department,
    schedule.status,
    schedule.courses.length,
    schedule.faculty.length,
    schedule.rooms.length,
  ]);
  schedulesData.unshift(schedulesHeaders);
  const wsSchedules = XLSX.utils.aoa_to_sheet(schedulesData);
  XLSX.utils.book_append_sheet(wb, wsSchedules, "Schedules Overview");

  // Generate filename
  const filename = `exam_schedules_export_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;

  // Write to file and trigger download
  XLSX.writeFile(wb, filename);
}
