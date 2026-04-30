import { TaskCalendarPage } from '@/modules/task-calendar/components/TaskCalendarPage';

interface CalendarPageProps {
  searchParams: Promise<{ date?: string | string[] }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const dateValue = params.date;
  const initialDate = typeof dateValue === 'string' ? dateValue : undefined;

  return <TaskCalendarPage initialDate={initialDate} />;
}

