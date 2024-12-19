"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { exampleData } from "@/lib/example-data"
import { useToast } from "@/components/ui/use-toast"

interface DataEntryFormProps {
  onSubmit: (data: any) => void;
}

export function DataEntryForm({ onSubmit }: DataEntryFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [examDurationHours, setExamDurationHours] = useState(3)
  const [slotsPerDay, setSlotsPerDay] = useState(3)
  const [courses, setCourses] = useState("")
  const [faculty, setFaculty] = useState("")
  const [rooms, setRooms] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      toast({
        title: "Preparing data...",
        description: "Please wait while we generate your timetable.",
      })

      // Parse courses (format: code | name | studentCount)
      const coursesData = courses.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [code, name, studentCount] = line.split('|').map(s => s.trim())
          const count = parseInt(studentCount || '0')
          return {
            id: code,
            code,
            name,
            registeredStudents: Array.from({ length: count }, (_, i) => `${code}-${i + 1}`),
            faculty: []
          }
        })

      // Parse faculty (format: name | department | maxHours)
      const facultyData = faculty.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [name, department, maxHours] = line.split('|').map(s => s.trim())
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            department,
            maxInvigilationHours: parseInt(maxHours || '8')
          }
        })

      // Parse rooms (format: name | capacity)
      const roomsData = rooms.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [name, capacity] = line.split('|').map(s => s.trim())
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            capacity: parseInt(capacity || '60')
          }
        })

      // Validate required fields
      if (!startDate || !endDate) {
        throw new Error("Please select start and end dates")
      }

      if (!coursesData.length) {
        throw new Error("Please enter at least one course")
      }

      if (!facultyData.length) {
        throw new Error("Please enter at least one faculty member")
      }

      if (!roomsData.length) {
        throw new Error("Please enter at least one room")
      }

      // Prepare form data
      const formData = {
        name,
        description,
        startDate,
        endDate,
        examDurationHours,
        slotsPerDay,
        courses: coursesData,
        faculty: facultyData,
        rooms: roomsData
      }

      // Call the callback with the prepared data
      onSubmit(formData)
      toast({
        title: "Success!",
        description: "Timetable generated successfully.",
      })
    } catch (error) {
      console.error("Error generating timetable:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }

  const loadExampleData = () => {
    setName("Fall 2024 Final Examinations")
    setDescription("Final examination schedule for Fall 2024 semester")
    setStartDate("2024-12-01")
    setEndDate("2024-12-25")
    setExamDurationHours(3)
    setSlotsPerDay(4)

    // Load example data directly
    setCourses(exampleData.courses)
    setFaculty(exampleData.faculty)
    setRooms(exampleData.rooms)

    toast({
      title: "Example Data Loaded",
      description: "The form has been populated with example data.",
    })
  }

  // Calculate total available slots and required slots
  const calculateSlots = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalSlots = daysDiff * slotsPerDay;
    
    const courseCount = courses.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .length;
    
    return {
      totalSlots,
      courseCount,
      isEnoughSlots: totalSlots >= courseCount
    };
  }

  const slotInfo = calculateSlots();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Schedule Details</h3>
            <Button
              type="button"
              variant="outline"
              onClick={loadExampleData}
            >
              Load Example Data
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Fall 2024 Final Examinations"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of the examination schedule"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examDurationHours">Exam Duration (hours)</Label>
                <Input
                  id="examDurationHours"
                  type="number"
                  min="1"
                  max="4"
                  value={examDurationHours}
                  onChange={e => setExamDurationHours(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slotsPerDay">Slots Per Day</Label>
                <Input
                  id="slotsPerDay"
                  type="number"
                  min="1"
                  max="4"
                  value={slotsPerDay}
                  onChange={e => setSlotsPerDay(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            {slotInfo && (
              <div className={`p-4 rounded-md ${
                slotInfo.isEnoughSlots ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
              }`}>
                <p>Total available slots: {slotInfo.totalSlots}</p>
                <p>Required slots for courses: {slotInfo.courseCount}</p>
                {!slotInfo.isEnoughSlots && (
                  <p className="font-semibold mt-2">
                    Warning: Not enough slots for all courses. Please either:
                    <br />- Increase the date range
                    <br />- Increase slots per day
                    <br />- Reduce the number of courses
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Data</h3>
          <div className="space-y-2">
            <Label htmlFor="courses">Courses (one per line: code | name | studentCount)</Label>
            <p className="text-sm text-muted-foreground">
              Format: CS101 | Programming Fundamentals | 240
            </p>
            <Textarea
              id="courses"
              value={courses}
              onChange={e => setCourses(e.target.value)}
              placeholder="CS101 | Programming Fundamentals | 240"
              className="font-mono text-sm"
              rows={10}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Faculty Data</h3>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty (one per line: name | department | maxHours)</Label>
            <p className="text-sm text-muted-foreground">
              Format: Dr. Smith | Computer Science | 6
            </p>
            <Textarea
              id="faculty"
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              placeholder="Dr. Smith | Computer Science | 6"
              className="font-mono text-sm"
              rows={10}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Room Data</h3>
          <div className="space-y-2">
            <Label htmlFor="rooms">Rooms (one per line: name | capacity)</Label>
            <p className="text-sm text-muted-foreground">
              Format: Room 101 | 30
            </p>
            <Textarea
              id="rooms"
              value={rooms}
              onChange={e => setRooms(e.target.value)}
              placeholder="Room 101 | 30"
              className="font-mono text-sm"
              rows={10}
              required
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Generate Timetable
        </Button>
      </div>
    </form>
  )
} 