# memo-list
一个具有自动安排复习功能的to-do list应用

## Project Structure

- `memo-frontend`: Next.js frontend application
- `memo-backend`: standalone backend API service for task management + memory-curve scheduling

## Run Locally

1. Start backend

```bash
cd memo-backend
npm install
npm run dev
```

Backend default URL: `http://localhost:4000`

2. Start frontend (new terminal)

```bash
cd memo-frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev
```

Frontend default URL: `http://localhost:3000`

## 如何进行贡献？

1. 请将仓库`fork`一份到自己的名下。
2. 将自己的仓库`clone`一份到本地。
3. 在本地进行修改。
4. `git push`修改后的本地仓库到自己的云端仓库。
5. 在原仓库提交`PR`合并修改。
