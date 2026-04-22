import { TaskListPage } from '@/modules/task-list/components/TaskListPage';

interface HomePageProps {
  searchParams: Promise<{ date?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const dateValue = params.date;
  const initialDate = typeof dateValue === 'string' ? dateValue : undefined;

  return <TaskListPage initialDate={initialDate} />;
}
