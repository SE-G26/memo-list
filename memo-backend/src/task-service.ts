import crypto from 'node:crypto';
import { readDb, writeDb } from './db.js';
import { NotFoundError, ValidationError } from './errors.js';
import type {
  CompleteTaskInput,
  CompleteTaskResult,
  CreateTaskInput,
  MasteryLevel,
  Task,
  TaskFrequency,
  UpdateTaskInput,
} from './types.js';

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 15, 30] as const;

const FREQUENCIES: TaskFrequency[] = ['once', 'daily', 'weekly', 'monthly', 'weekdays'];
const MASTERY_LEVELS: MasteryLevel[] = ['good', 'fair', 'poor'];

function toDateOnly(isoOrDate: string): string {
  return isoOrDate.split('T')[0];
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDays(dateOnly: string, days: number): string {
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateOnly(date.toISOString());
}

function compareDateOnly(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// 调整日期到工作日（如果不是工作日）
function adjustToWorkday(dateOnly: string): string {
  let candidate = dateOnly;
  while (true) {
    const weekday = new Date(`${candidate}T00:00:00.000Z`).getUTCDay();
    if (weekday !== 0 && weekday !== 6) return candidate; // 0=周日, 6=周六
    candidate = addDays(candidate, 1);
  }
}

function nextDueDate(currentDueDate: string, frequency: TaskFrequency): string {
  if (frequency === 'daily') return addDays(currentDueDate, 1);
  if (frequency === 'weekly') return addDays(currentDueDate, 7);

  if (frequency === 'monthly') {
    const date = new Date(`${currentDueDate}T00:00:00.000Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    return toDateOnly(date.toISOString());
  }

  if (frequency === 'weekdays') {
    let candidate = addDays(currentDueDate, 1);
    while (true) {
      const weekday = new Date(`${candidate}T00:00:00.000Z`).getUTCDay();
      if (weekday !== 0 && weekday !== 6) return candidate;
      candidate = addDays(candidate, 1);
    }
  }

  return currentDueDate;
}

function masteryMultiplier(mastery?: MasteryLevel): number {
  if (mastery === 'good') return 1.25;
  if (mastery === 'poor') return 0.6;
  return 1;
}

function adjustedInterval(base: number, mastery?: MasteryLevel): number {
  return Math.max(1, Math.round(base * masteryMultiplier(mastery)));
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

function assertValidFrequency(value: unknown): asserts value is TaskFrequency {
  if (!FREQUENCIES.includes(value as TaskFrequency)) {
    throw new ValidationError('Invalid frequency.');
  }
}

function assertValidMastery(value: unknown): asserts value is MasteryLevel {
  if (!MASTERY_LEVELS.includes(value as MasteryLevel)) {
    throw new ValidationError('Invalid mastery level.');
  }
}

function assertCreateInput(input: CreateTaskInput): void {
  if (!input.title?.trim()) {
    throw new ValidationError('Task title is required.');
  }

  assertValidFrequency(input.frequency);

  if (!isDateOnly(input.dueDate)) {
    throw new ValidationError('dueDate must use YYYY-MM-DD format.');
  }
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dateDiff = compareDateOnly(a.dueDate, b.dueDate);
    if (dateDiff !== 0) return dateDiff;
    if (a.createdAt === b.createdAt) return 0;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

export async function listTasks(filters?: {
  userId: string;
  date?: string;
  from?: string;
  to?: string;
  includeCompleted?: boolean;
}): Promise<Task[]> {
  const db = await readDb();
  let tasks = sortTasks(db.tasks.filter((task) => task.userId === filters?.userId));

  if (filters?.date) {
    if (!isDateOnly(filters.date)) {
      throw new ValidationError('date must use YYYY-MM-DD format.');
    }
    tasks = tasks.filter((task) => task.dueDate === filters.date);
  }

  if (filters?.from) {
    if (!isDateOnly(filters.from)) {
      throw new ValidationError('from must use YYYY-MM-DD format.');
    }
    tasks = tasks.filter((task) => compareDateOnly(task.dueDate, filters.from as string) >= 0);
  }

  if (filters?.to) {
    if (!isDateOnly(filters.to)) {
      throw new ValidationError('to must use YYYY-MM-DD format.');
    }
    tasks = tasks.filter((task) => compareDateOnly(task.dueDate, filters.to as string) <= 0);
  }

  if (!filters?.includeCompleted) {
    tasks = tasks.filter((task) => !task.completed);
  }

  return tasks;
}

export async function getTaskById(userId: string, id: string): Promise<Task> {
  const db = await readDb();
  const task = db.tasks.find((item) => item.id === id && item.userId === userId);
  if (!task) {
    throw new NotFoundError('Task not found.');
  }
  return task;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  assertCreateInput(input);

  const now = nowIso();
  // 调整工作日任务的起始日期
  let dueDate = input.dueDate;
  if (input.frequency === 'weekdays') {
    dueDate = adjustToWorkday(dueDate);
  }

  const newTask: Task = {
    id: newId(),
    userId,
    title: input.title.trim(),
    frequency: input.frequency,
    reminderTime: input.reminderTime ?? null,
    isLearning: Boolean(input.isLearning),
    notes: input.notes?.trim() || undefined,
    completed: false,
    dueDate,
    createdAt: now,
    updatedAt: now,
    taskKind: input.isLearning ? 'learning_source' : 'standard',
    parentTaskId: null,
  };

  const db = await readDb();
  db.tasks.push(newTask);
  await writeDb(db);

  return newTask;
}

export async function updateTask(userId: string, id: string, updates: UpdateTaskInput): Promise<Task> {
  const db = await readDb();
  const index = db.tasks.findIndex((task) => task.id === id && task.userId === userId);
  if (index === -1) {
    throw new NotFoundError('Task not found.');
  }

  if (updates.frequency !== undefined) {
    assertValidFrequency(updates.frequency);
  }

  if (updates.dueDate !== undefined && !isDateOnly(updates.dueDate)) {
    throw new ValidationError('dueDate must use YYYY-MM-DD format.');
  }

  if (updates.title !== undefined && !updates.title.trim()) {
    throw new ValidationError('Task title cannot be empty.');
  }

  const existing = db.tasks[index];
  
  // 调整工作日任务的日期
  let updatedDueDate = updates.dueDate;
  if (updatedDueDate !== undefined && (updates.frequency === 'weekdays' || (updates.frequency === undefined && existing.frequency === 'weekdays'))) {
    updatedDueDate = adjustToWorkday(updatedDueDate);
  }

  const next: Task = {
    ...existing,
    ...updates,
    dueDate: updatedDueDate !== undefined ? updatedDueDate : existing.dueDate,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    notes: updates.notes !== undefined ? updates.notes.trim() || undefined : existing.notes,
    reminderTime: updates.reminderTime !== undefined ? updates.reminderTime : existing.reminderTime,
    updatedAt: nowIso(),
  };

  if (next.taskKind !== 'learning_review') {
    next.taskKind = next.isLearning ? 'learning_source' : 'standard';
  }

  db.tasks[index] = next;
  await writeDb(db);

  return next;
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  const db = await readDb();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((task) => !(task.id === id && task.userId === userId));

  if (db.tasks.length === before) {
    throw new NotFoundError('Task not found.');
  }

  await writeDb(db);
}

function createReviewTasks(options: {
  sourceTask: Task;
  completionDate: string;
  learnedContent: string;
  mastery?: MasteryLevel;
}): Task[] {
  const now = nowIso();
  const seriesId = options.sourceTask.seriesId || newId();
  const created: Task[] = [];
  let previousDate = options.completionDate;

  for (let idx = 0; idx < REVIEW_INTERVAL_DAYS.length; idx += 1) {
    const base = REVIEW_INTERVAL_DAYS[idx];
    const planned = addDays(options.completionDate, adjustedInterval(base, options.mastery));
    const dueDate = compareDateOnly(planned, previousDate) <= 0 ? addDays(previousDate, 1) : planned;

    const reviewTask: Task = {
      id: newId(),
      userId: options.sourceTask.userId,
      title: `Review: ${options.sourceTask.title}`,
      frequency: 'once',
      reminderTime: options.sourceTask.reminderTime ?? null,
      isLearning: true,
      notes: options.sourceTask.notes,
      completed: false,
      dueDate,
      createdAt: now,
      updatedAt: now,
      taskKind: 'learning_review',
      parentTaskId: options.sourceTask.id,
      seriesId,
      reviewStep: idx + 1,
      learningContent: options.learnedContent,
    };

    created.push(reviewTask);
    previousDate = dueDate;
  }

  options.sourceTask.seriesId = seriesId;
  options.sourceTask.learningContent = options.learnedContent;

  return created;
}

function adjustPendingReviews(options: {
  tasks: Task[];
  userId: string;
  seriesId: string;
  completedReviewStep: number;
  completedAtDate: string;
  mastery: MasteryLevel;
}): Task[] {
  const pending = options.tasks
    .filter((task) => {
      if (task.taskKind !== 'learning_review') return false;
      if (task.userId !== options.userId) return false;
      if (task.seriesId !== options.seriesId) return false;
      if (task.completed) return false;
      return (task.reviewStep ?? 0) > options.completedReviewStep;
    })
    .sort((a, b) => (a.reviewStep ?? 0) - (b.reviewStep ?? 0));

  const changed: Task[] = [];
  let previousDate = options.completedAtDate;

  for (const review of pending) {
    const stepIndex = Math.max(0, (review.reviewStep ?? 1) - 1);
    const base = REVIEW_INTERVAL_DAYS[Math.min(stepIndex, REVIEW_INTERVAL_DAYS.length - 1)];
    const proposed = addDays(options.completedAtDate, adjustedInterval(base, options.mastery));
    const dueDate = compareDateOnly(proposed, previousDate) <= 0 ? addDays(previousDate, 1) : proposed;

    if (review.dueDate !== dueDate) {
      review.dueDate = dueDate;
      review.updatedAt = nowIso();
      changed.push(review);
    }

    previousDate = dueDate;
  }

  return changed;
}

function buildRecurringSuccessor(task: Task): Task | undefined {
  if (task.frequency === 'once') return undefined;

  const now = nowIso();

  return {
    id: newId(),
    userId: task.userId,
    title: task.title,
    frequency: task.frequency,
    reminderTime: task.reminderTime ?? null,
    isLearning: task.isLearning,
    notes: task.notes,
    completed: false,
    dueDate: nextDueDate(task.dueDate, task.frequency),
    createdAt: now,
    updatedAt: now,
    taskKind: task.isLearning ? 'learning_source' : 'standard',
    parentTaskId: task.parentTaskId ?? task.id,
  };
}

export async function completeTask(userId: string, id: string, input: CompleteTaskInput): Promise<CompleteTaskResult> {
  const db = await readDb();
  const task = db.tasks.find((item) => item.id === id && item.userId === userId);

  if (!task) {
    throw new NotFoundError('Task not found.');
  }

  if (task.completed) {
    return {
      task,
      createdReviews: [],
      adjustedReviews: [],
    };
  }

  if (input.mastery !== undefined) {
    assertValidMastery(input.mastery);
  }

  const completedAt = nowIso();
  const completionDate = task.dueDate;

  task.completed = true;
  task.completedAt = completedAt;
  task.updatedAt = completedAt;

  const result: CompleteTaskResult = {
    task,
    createdReviews: [],
    adjustedReviews: [],
  };

  if (task.taskKind === 'learning_source') {
    const learnedContent = input.learnedContent?.trim();
    if (!learnedContent) {
      throw new ValidationError('learnedContent is required for learning tasks.');
    }

    const reviews = createReviewTasks({
      sourceTask: task,
      completionDate,
      learnedContent,
      mastery: input.mastery,
    });

    db.tasks.push(...reviews);
    result.createdReviews = reviews;
  }

  if (task.taskKind === 'learning_review') {
    if (!task.seriesId) {
      throw new ValidationError('Review task is missing seriesId.');
    }

    if (!input.mastery) {
      throw new ValidationError('mastery is required for review tasks.');
    }

    task.mastery = input.mastery;
    const changed = adjustPendingReviews({
      tasks: db.tasks,
      userId,
      seriesId: task.seriesId,
      completedReviewStep: task.reviewStep ?? 1,
      completedAtDate: completionDate,
      mastery: input.mastery,
    });
    result.adjustedReviews = changed;
  }

  const nextRecurringTask = buildRecurringSuccessor(task);
  if (nextRecurringTask) {
    db.tasks.push(nextRecurringTask);
    result.nextRecurringTask = nextRecurringTask;
  }

  await writeDb(db);

  return result;
}
