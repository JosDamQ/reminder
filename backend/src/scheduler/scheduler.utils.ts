import { ReminderRecurrence } from '../reminders/reminder.enums';

export function getNextRemindAt(currentRemindAt: Date, recurrence: ReminderRecurrence): Date | null {
  switch (recurrence) {
    case ReminderRecurrence.DAILY:
      return addDays(currentRemindAt, 1);
    case ReminderRecurrence.WEEKLY:
      return addDays(currentRemindAt, 7);
    case ReminderRecurrence.MONTHLY:
      return addMonthsKeepingDay(currentRemindAt, 1);
    case ReminderRecurrence.NONE:
    default:
      return null;
  }
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonthsKeepingDay(date: Date, months: number): Date {
  const next = new Date(date);
  const originalDay = next.getDate();
  const targetMonthIndex = next.getMonth() + months;

  next.setDate(1);
  next.setMonth(targetMonthIndex);

  const lastDayOfTargetMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();

  next.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  next.setHours(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

  return next;
}

