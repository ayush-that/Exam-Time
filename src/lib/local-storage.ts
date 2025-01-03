interface Schedule {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  data: any;
}

const STORAGE_KEYS = {
  SCHEDULES: "examtime_schedules",
};

export function getSchedules(): Schedule[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  return stored ? JSON.parse(stored) : [];
}

export function saveSchedule(
  schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">
) {
  const schedules = getSchedules();
  const newSchedule: Schedule = {
    ...schedule,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  schedules.push(newSchedule);
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  return newSchedule;
}

export function updateSchedule(id: string, data: Partial<Schedule>) {
  const schedules = getSchedules();
  const index = schedules.findIndex((s) => s.id === id);

  if (index === -1) {
    throw new Error("Schedule not found");
  }

  schedules[index] = {
    ...schedules[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  return schedules[index];
}

export function deleteSchedule(id: string) {
  const schedules = getSchedules();
  const filtered = schedules.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(filtered));
}

export function getScheduleById(id: string): Schedule | null {
  const schedules = getSchedules();
  return schedules.find((s) => s.id === id) || null;
}
