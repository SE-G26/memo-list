import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from './task-service.js';
import { NotFoundError, ValidationError } from './errors.js';
import {
  completeTaskSchema,
  createTaskSchema,
  listTaskQuerySchema,
  updateTaskSchema,
} from './validation.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'memo-backend' });
});

app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const parsed = listTaskQuerySchema.parse(req.query);
    const tasks = await listTasks({
      date: parsed.date,
      from: parsed.from,
      to: parsed.to,
      includeCompleted: parsed.includeCompleted,
    });
    res.json({ tasks });
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const payload = createTaskSchema.parse(req.body);
    const task = await createTask(payload);
    res.status(201).json({ task });
  } catch (error) {
    handleError(error, res);
  }
});

app.get('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const task = await getTaskById(req.params.id);
    res.json({ task });
  } catch (error) {
    handleError(error, res);
  }
});

app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const payload = updateTaskSchema.parse(req.body);
    const task = await updateTask(req.params.id, payload);
    res.json({ task });
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    await deleteTask(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/tasks/:id/complete', async (req: Request, res: Response) => {
  try {
    const payload = completeTaskSchema.parse(req.body);
    const result = await completeTask(req.params.id, payload);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
});

function handleError(error: unknown, res: Response): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request payload.',
      details: error.issues,
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error.' });
}
