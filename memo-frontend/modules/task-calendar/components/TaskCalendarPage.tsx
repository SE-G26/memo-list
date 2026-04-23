'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTasks } from '@/modules/task-list/hooks/useTasks';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthLabel = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year} 年 ${month} 月`;
};

const toMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, offset: number) => toMonthStart(new Date(date.getFullYear(), date.getMonth() + offset, 1));
const toMonthKey = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

export function TaskCalendarPage() {
  const { allTasks } = useTasks();
  const [today] = useState(() => formatDate(new Date()));
  const [calendarState, setCalendarState] = useState(() => {
    const todayDate = new Date();
    return {
      currentMonth: toMonthStart(todayDate),
      selectedDate: formatDate(todayDate),
    };
  });
  const { currentMonth, selectedDate } = calendarState;

  const tasksByDate = useMemo(() => {
    return allTasks.reduce<Record<string, { total: number; completed: number }>>((acc, task) => {
      const day = task.dueDate;
      if (!acc[day]) {
        acc[day] = { total: 0, completed: 0 };
      }
      acc[day].total += 1;
      if (task.completed) {
        acc[day].completed += 1;
      }
      return acc;
    }, {});
  }, [allTasks]);

  const monthKey = toMonthKey(currentMonth);

  const monthStats = useMemo(() => {
    const monthTasks = allTasks.filter((task) => task.dueDate.startsWith(monthKey));
    const completed = monthTasks.filter((task) => task.completed).length;
    return {
      total: monthTasks.length,
      completed,
      rate: monthTasks.length === 0 ? 0 : Math.round((completed / monthTasks.length) * 100),
    };
  }, [allTasks, monthKey]);

  const selectedTasks = useMemo(() => {
    return allTasks
      .filter((task) => task.dueDate === selectedDate)
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [allTasks, selectedDate]);

  const jumpToMonth = (offset: number) => {
    setCalendarState((prev) => {
      const nextMonth = addMonths(prev.currentMonth, offset);
      return {
        currentMonth: nextMonth,
        selectedDate: formatDate(nextMonth),
      };
    });
  };

  const jumpToToday = () => {
    const todayDate = new Date(today);
    setCalendarState({
      currentMonth: toMonthStart(todayDate),
      selectedDate: today,
    });
  };

  const selectDate = (dateValue: string) => {
    const [year, month] = dateValue.split('-');
    setCalendarState({
      currentMonth: new Date(Number(year), Number(month) - 1, 1),
      selectedDate: dateValue,
    });
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();

  const calendarCells = useMemo(() => {
    const startDate = new Date(year, month, 1 - startWeekday);
    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
      const dateValue = formatDate(cellDate);
      const dayStat = tasksByDate[dateValue];
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = dateValue === today;
      const isSelected = dateValue === selectedDate;

      return {
        key: dateValue,
        dateValue,
        dayNumber: cellDate.getDate(),
        dayStat,
        isCurrentMonth,
        isToday,
        isSelected,
      };
    });
  }, [month, selectedDate, startWeekday, tasksByDate, today, year]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              返回任务列表
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href={`/?date=${selectedDate}`} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              查看当天任务
            </Link>
          </div>
          <Link
            href={`/task/new?date=${selectedDate}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新建任务
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-white p-1">
            <button
              type="button"
              onClick={() => jumpToMonth(-1)}
              className="rounded-full p-1.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              aria-label="上个月"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="px-2 text-xl font-semibold text-gray-900">{formatMonthLabel(currentMonth)}</h1>
            <button
              type="button"
              onClick={() => jumpToMonth(1)}
              className="rounded-full p-1.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              aria-label="下个月"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={jumpToToday}
            className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            回到本月
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-xs text-gray-500">本月任务</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{monthStats.total}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-xs text-gray-500">已完成</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{monthStats.completed}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-xs text-gray-500">完成率</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{monthStats.rate}%</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="mb-3 grid grid-cols-7 text-center text-xs text-gray-500">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell) => {
            return (
              <button
                type="button"
                key={cell.key}
                onClick={() => selectDate(cell.dateValue)}
                aria-pressed={cell.isSelected}
                className={`aspect-square rounded-xl border p-2 text-left transition-colors ${
                  cell.isSelected
                    ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200 shadow-sm'
                    : cell.isToday
                      ? 'border-blue-200 bg-blue-50/60'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p
                  className={`text-sm ${
                    cell.isSelected || cell.isToday
                      ? 'text-blue-700'
                      : cell.isCurrentMonth
                        ? 'text-gray-800'
                        : 'text-gray-400'
                  }`}
                >
                  {cell.dayNumber}
                  {cell.isToday && (
                    <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] leading-none text-white">
                      今天
                    </span>
                  )}
                </p>
                {cell.dayStat && (
                  <div className="mt-1">
                    <p className="text-[10px] text-gray-500">{cell.dayStat.total} 项</p>
                    <div className="mt-1 h-1 rounded-full bg-gray-200">
                      <div
                        className="h-1 rounded-full bg-blue-500"
                        style={{ width: `${Math.round((cell.dayStat.completed / cell.dayStat.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-medium text-gray-900">{selectedDate} 任务安排</h2>
        </div>
        {selectedTasks.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">当天暂无任务</p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => (
              <Link
                href={`/task/${task.id}/edit`}
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
              >
                <span className={task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-500">{task.completed ? '已完成' : '待完成'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
