import * as XLSX from 'xlsx'
import { ExamSchedule } from './types'

export function exportScheduleToExcel(schedule: ExamSchedule) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create schedule info worksheet
  const scheduleInfo = [
    ['Schedule Name', schedule.name],
    ['Description', schedule.description || ''],
    ['Semester', schedule.semester],
    ['Academic Year', schedule.academicYear],
    ['Department', schedule.department],
    ['Status', schedule.status]
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(scheduleInfo)
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Schedule Info')

  // Create exam slots worksheet
  const examSlotsHeaders = [
    'Date',
    'Start Time',
    'End Time',
    'Course Code',
    'Course Name',
    'Faculty',
    'Room'
  ]
  const examSlotsData = schedule.examSlots.map(slot => [
    new Date(slot.timeSlot.startTime).toLocaleDateString(),
    new Date(slot.timeSlot.startTime).toLocaleTimeString(),
    new Date(slot.timeSlot.endTime).toLocaleTimeString(),
    slot.course.code,
    slot.course.name,
    slot.faculty.name,
    slot.room.name
  ])
  examSlotsData.unshift(examSlotsHeaders)
  const wsExams = XLSX.utils.aoa_to_sheet(examSlotsData)
  XLSX.utils.book_append_sheet(wb, wsExams, 'Exam Schedule')

  // Create courses worksheet
  const coursesHeaders = ['Code', 'Name', 'Department']
  const coursesData = schedule.courses.map(course => [
    course.code,
    course.name,
    course.department
  ])
  coursesData.unshift(coursesHeaders)
  const wsCourses = XLSX.utils.aoa_to_sheet(coursesData)
  XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses')

  // Create faculty worksheet
  const facultyHeaders = ['Name', 'Department']
  const facultyData = schedule.faculty.map(f => [f.name, f.department])
  facultyData.unshift(facultyHeaders)
  const wsFaculty = XLSX.utils.aoa_to_sheet(facultyData)
  XLSX.utils.book_append_sheet(wb, wsFaculty, 'Faculty')

  // Create rooms worksheet
  const roomsHeaders = ['Name', 'Capacity']
  const roomsData = schedule.rooms.map(room => [room.name, room.capacity])
  roomsData.unshift(roomsHeaders)
  const wsRooms = XLSX.utils.aoa_to_sheet(roomsData)
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms')

  // Generate filename
  const filename = `${schedule.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${
    schedule.semester
  }_${schedule.academicYear}.xlsx`

  // Write to file and trigger download
  XLSX.writeFile(wb, filename)
}

export function exportSchedulesToExcel(schedules: ExamSchedule[]) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create schedules overview worksheet
  const schedulesHeaders = [
    'Name',
    'Semester',
    'Academic Year',
    'Department',
    'Status',
    'Courses Count',
    'Faculty Count',
    'Rooms Count'
  ]
  const schedulesData = schedules.map(schedule => [
    schedule.name,
    schedule.semester,
    schedule.academicYear,
    schedule.department,
    schedule.status,
    schedule.courses.length,
    schedule.faculty.length,
    schedule.rooms.length
  ])
  schedulesData.unshift(schedulesHeaders)
  const wsSchedules = XLSX.utils.aoa_to_sheet(schedulesData)
  XLSX.utils.book_append_sheet(wb, wsSchedules, 'Schedules Overview')

  // Generate filename
  const filename = `exam_schedules_export_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`

  // Write to file and trigger download
  XLSX.writeFile(wb, filename)
} 