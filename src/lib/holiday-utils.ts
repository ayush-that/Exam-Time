// List of all Indian holidays for 2024
const HOLIDAYS_2024 = [
  { date: "2024-01-14", name: "Makara Sankranti" },
  { date: "2024-01-26", name: "Republic Day" },
  { date: "2024-02-26", name: "Maha Shivaratri" },
  { date: "2024-03-30", name: "Ugadi" },
  { date: "2024-03-31", name: "Idul Fitr" },
  { date: "2024-04-10", name: "Mahavir Jayanti" },
  { date: "2024-04-14", name: "Dr Ambedkar Jayanti" },
  { date: "2024-04-18", name: "Good Friday" },
  { date: "2024-04-30", name: "Basava Jayanti" },
  { date: "2024-05-01", name: "May Day" },
  { date: "2024-06-07", name: "Bakrid / Eid al Adha" },
  { date: "2024-07-06", name: "Muharram" },
  { date: "2024-08-15", name: "Independence Day" },
  { date: "2024-08-27", name: "Ganesh Chaturthi" },
  { date: "2024-09-05", name: "Eid e Milad" },
  { date: "2024-09-21", name: "Mahalaya Amavasye" },
  { date: "2024-10-01", name: "Maha Navami" },
  { date: "2024-10-02", name: "Vijaya Dashami" },
  { date: "2024-10-02", name: "Gandhi Jayanti" },
  { date: "2024-10-07", name: "Maharishi Valmiki Jayanti" },
  { date: "2024-10-20", name: "Diwali" },
  { date: "2024-10-21", name: "Deepavali Holiday" },
  { date: "2024-11-01", name: "Kannada Rajyothsava" },
  { date: "2024-11-08", name: "Kanakadasa Jayanti" },
  { date: "2024-12-25", name: "Christmas Day" },
];

export interface Holiday {
  date: string;
  name: string;
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

export function isHoliday(date: Date): boolean {
  const dateString = date.toISOString().split("T")[0];
  return HOLIDAYS_2024.some((holiday) => holiday.date === dateString);
}

export function isNonWorkingDay(
  date: Date,
  skipDates: Holiday[] = []
): boolean {
  // Check if it's a Sunday
  if (isSunday(date)) {
    return true;
  }

  // Check if it's a holiday
  if (isHoliday(date)) {
    return true;
  }

  // Check if it's in the skip dates list
  const dateString = date.toISOString().split("T")[0];
  return skipDates.some((holiday) => holiday.date === dateString);
}

export function getHolidayName(
  date: Date,
  skipDates: Holiday[] = []
): string | null {
  if (isSunday(date)) {
    return "Sunday";
  }

  const dateString = date.toISOString().split("T")[0];

  // Check predefined holidays
  const predefinedHoliday = HOLIDAYS_2024.find((h) => h.date === dateString);
  if (predefinedHoliday) {
    return predefinedHoliday.name;
  }

  // Check skip dates
  const skipDate = skipDates.find((h) => h.date === dateString);
  return skipDate?.name || null;
}

export function getWorkingDays(
  startDate: Date,
  endDate: Date,
  skipDates: Holiday[] = []
): {
  workingDays: Date[];
  holidays: Array<{ date: Date; name: string }>;
} {
  const workingDays: Date[] = [];
  const holidays: Array<{ date: Date; name: string }> = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (isNonWorkingDay(currentDate, skipDates)) {
      const holidayName = getHolidayName(currentDate, skipDates);
      if (holidayName) {
        holidays.push({
          date: new Date(currentDate),
          name: holidayName,
        });
      }
    } else {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { workingDays, holidays };
}
