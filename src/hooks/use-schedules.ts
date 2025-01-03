"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as localStorage from "@/lib/local-storage";

export function useSchedules() {
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => localStorage.getSchedules(),
    staleTime: 1000,
  });

  const createSchedule = useCallback(
    (data: any) => {
      const newSchedule = localStorage.saveSchedule(data);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      return newSchedule;
    },
    [queryClient]
  );

  const updateSchedule = useCallback(
    ({ id, ...data }: { id: string; [key: string]: any }) => {
      const updatedSchedule = localStorage.updateSchedule(id, data);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      return updatedSchedule;
    },
    [queryClient]
  );

  const deleteSchedule = useCallback(
    (id: string) => {
      localStorage.deleteSchedule(id);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    [queryClient]
  );

  return {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
