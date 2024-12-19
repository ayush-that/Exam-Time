"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TimetableViewProps {
  schedule: any;
}

export function TimetableView({ schedule }: TimetableViewProps) {
  if (!schedule || !schedule.generatedSlots || schedule.generatedSlots.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No timetable data available.</p>
      </Card>
    )
  }

  // Group exams by date
  const examsByDate = schedule.generatedSlots.reduce((acc: any, exam: any) => {
    const date = new Date(exam.date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(exam)
    return acc
  }, {})

  // Sort dates
  const sortedDates = Object.keys(examsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )

  const downloadCSV = () => {
    const csvRows = [
      ['Date', 'Time', 'Course', 'Room', 'Faculty', 'Students']
    ]

    sortedDates.forEach(date => {
      examsByDate[date].forEach((exam: any) => {
        const course = schedule.courses?.find((c: any) => c.id === exam.courseId)
        const faculty = schedule.faculty?.find((f: any) => exam.invigilators?.includes(f.id))
        const room = schedule.rooms?.find((r: any) => r.id === exam.room)
        
        csvRows.push([
          date,
          exam.startTime,
          course ? `${course.code} - ${course.name}` : exam.courseId,
          room?.name || exam.room,
          faculty?.name || exam.invigilators?.join(', ') || 'N/A',
          course?.registeredStudents?.length?.toString() || 'N/A'
        ])
      })
    })

    const csvContent = csvRows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'examination_timetable.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Examination Timetable', 14, 15)
    doc.setFontSize(12)
    doc.text(schedule.name || 'Schedule', 14, 25)
    
    let yOffset = 35

    sortedDates.forEach((date, dateIndex) => {
      // Add date header
      doc.setFontSize(14)
      doc.text(date, 14, yOffset)
      yOffset += 10

      // Add table for this date
      const tableData = examsByDate[date]
        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
        .map((exam: any) => {
          const course = schedule.courses?.find((c: any) => c.id === exam.courseId)
          const faculty = schedule.faculty?.find((f: any) => exam.invigilators?.includes(f.id))
          const room = schedule.rooms?.find((r: any) => r.id === exam.room)

          return [
            exam.startTime,
            course ? `${course.code}\n${course.name}` : exam.courseId,
            room?.name || exam.room,
            faculty?.name || exam.invigilators?.join(', ') || 'N/A',
            course?.registeredStudents?.length?.toString() || 'N/A'
          ]
        })

      autoTable(doc, {
        startY: yOffset,
        head: [['Time', 'Course', 'Room', 'Faculty', 'Students']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 }
        }
      })

      yOffset = (doc as any).lastAutoTable.finalY + 20

      // Add new page if needed
      if (dateIndex < sortedDates.length - 1 && yOffset > 250) {
        doc.addPage()
        yOffset = 20
      }
    })

    doc.save('examination_timetable.pdf')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={downloadCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
        <Button variant="outline" onClick={downloadPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-6 p-4">
          {sortedDates.map(date => (
            <Card key={date} className="p-4">
              <h3 className="mb-4 text-lg font-semibold">{date}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsByDate[date]
                    .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
                    .map((exam: any, index: number) => {
                      const course = schedule.courses?.find((c: any) => c.id === exam.courseId)
                      const faculty = schedule.faculty?.find((f: any) => exam.invigilators?.includes(f.id))
                      const room = schedule.rooms?.find((r: any) => r.id === exam.room)

                      return (
                        <TableRow key={`${date}-${index}`}>
                          <TableCell>{exam.startTime}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {course ? course.name : exam.courseId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {course?.code || 'Unknown Code'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{room?.name || exam.room}</TableCell>
                          <TableCell>
                            {faculty?.name || exam.invigilators?.join(', ') || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {course?.registeredStudents?.length || 'N/A'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 