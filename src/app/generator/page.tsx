"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryForm } from "@/components/data-entry-form";
import { TimetableView } from "@/components/timetable-view";
import { generateTimetable } from "@/lib/timetable-generator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState("data");
  const [generatedData, setGeneratedData] = useState<any>(null);
  const { toast } = useToast();

  const handleDataSubmit = (data: any) => {
    try {
      const slots = generateTimetable(data);
      if (!slots) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate timetable",
        });
        return;
      }

      setGeneratedData({
        ...data,
        generatedSlots: slots,
      });
      setActiveTab("preview");

      // Store the generated timetable
      localStorage.setItem(
        "generatedTimetable",
        JSON.stringify({
          ...data,
          generatedSlots: slots,
        })
      );

      toast({
        title: "Success",
        description: "Timetable generated successfully!",
      });

      // Scroll to preview section
      setTimeout(() => {
        const previewSection = document.getElementById("preview-section");
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to generate timetable: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Generate Timetable
        </h1>
        <p className="text-muted-foreground">
          Enter the required information to generate an examination timetable.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedData}>
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="space-y-4">
          <DataEntryForm onSubmit={handleDataSubmit} />
        </TabsContent>
        <TabsContent value="preview" className="space-y-4" id="preview-section">
          {generatedData ? (
            <TimetableView schedule={generatedData} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No timetable data available. Please generate a timetable first.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
