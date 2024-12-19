"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataEntryForm } from "@/components/data-entry-form"
import { TimetableView } from "@/components/timetable-view"
import { generateTimetable } from "@/lib/timetable-generator"
import { Card } from "@/components/ui/card"

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState("data")
  const [generatedData, setGeneratedData] = useState<any>(null)

  const handleDataSubmit = (data: any) => {
    const slots = generateTimetable(data)
    if (!slots) {
      console.error("Failed to generate timetable")
      return
    }

    setGeneratedData({
      ...data,
      generatedSlots: slots,
    })
    setActiveTab("preview")
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Timetable</h1>
        <p className="text-muted-foreground">
          Enter the required information to generate an examination timetable.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedData}>Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="space-y-4">
          <DataEntryForm onSubmit={handleDataSubmit} />
        </TabsContent>
        <TabsContent value="preview" className="space-y-4">
          {generatedData ? (
            <TimetableView schedule={generatedData} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Generate a timetable first to preview it here.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 