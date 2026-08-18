import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';

interface iListItem {
  id: number;
  description: string;
}

declare module 'express-session' {
  interface SessionData {
    list: iListItem[];
    nextId: number;
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS: allow the React dev server (localhost:3000) to call this API with cookies.
// In production the React build is served from this same origin, so CORS is a no-op there.
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Render sits behind a reverse proxy load balancer; without this, secure cookies
// never get set because Express doesn't think the connection is HTTPS.
app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isProduction, // true on Render (HTTPS), false on laptop (HTTP)
      sameSite: isProduction ? 'none' : 'lax',
    },
  })
);

function ensureList(req: Request): void {
  if (!req.session.list) {
    req.session.list = [{ id: 1, description: 'List item' }];
    req.session.nextId = 2;
    console.log(`[session ${req.sessionID}] no list found, initialized with default item`);
  }
}

app.get('/api/list', (req: Request, res: Response) => {
  ensureList(req);
  console.log(`[session ${req.sessionID}] GET /api/list -> ${JSON.stringify(req.session.list)}`);
  res.json(req.session.list);
});

app.post('/api/list', (req: Request, res: Response) => {
  ensureList(req);

  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!description) {
    console.log(`[session ${req.sessionID}] POST /api/list rejected empty description`);
    res.status(400).json({ error: 'description is required' });
    return;
  }

  const newItem: iListItem = { id: req.session.nextId as number, description };
  req.session.nextId = (req.session.nextId as number) + 1;
  (req.session.list as iListItem[]).push(newItem);

  console.log(
    `[session ${req.sessionID}] POST /api/list added ${JSON.stringify(newItem)} -> ${JSON.stringify(req.session.list)}`
  );
  res.json(req.session.list);
});

app.delete('/api/list/:id', (req: Request, res: Response) => {
  ensureList(req);

  const id = Number(req.params.id);
  const before = (req.session.list as iListItem[]).length;
  req.session.list = (req.session.list as iListItem[]).filter((item) => item.id !== id);
  const removed = before - (req.session.list as iListItem[]).length;

  console.log(
    `[session ${req.sessionID}] DELETE /api/list/${id} removed ${removed} item(s) -> ${JSON.stringify(req.session.list)}`
  );
  res.json(req.session.list);
});

// Single-server strategy: serve the React build (copied into ../public) for everything else.
app.use(express.static(path.join(__dirname, '../public')));
app.get('/*splat', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
