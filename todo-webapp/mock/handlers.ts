// Mock mode's stand-in for todo-api, against the SAME contract src/generated/
// came from (specs/design/components/todo-api/openapi.yaml). Seed rows are the
// wireframes.dsl TodoList table (`node scripts/seed.mjs wireframes.dsl`), so
// the mock walk sees exactly what the wireframe draws.
//
// State lives in module scope, in the page's own JS context: a create shows up
// in the next list, a delete removes it, an edit persists — but only across
// in-app navigation. A full page load (reload, typed URL, a link that leaves
// the SPA) re-runs this module and restores the seed, which is what makes a
// verification run repeatable.
//
// No scope check here — that is mock/authz/gateway.ts's job, read from the
// contract, exactly as it is the real API gateway's job in a cell. What this
// handler owes is its path's reach: /me/todo-items answers the caller's own
// rows and nothing else, resolved from the mock identity, never a query
// parameter. A row that exists and is not the caller's is a 404.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type TodoItem = components["schemas"]["TodoItem"];

// The caller this mock speaks for. Seeding one row owned by somebody else
// keeps /me/ and "every row" from looking identical — todo-api has no
// every-row operation, but the discipline still guards against filtering on a
// literal the seed rows also hardcode.
export const mockCaller = {
  userId: "01a0ab00-0000-7000-8000-000000000001",
};

const now = new Date().toISOString();

let todos: (TodoItem & { ownerId: string })[] = [
  {
    id: "1",
    title: "Buy groceries",
    completed: false,
    createdAt: now,
    updatedAt: now,
    ownerId: mockCaller.userId,
  },
  {
    id: "2",
    title: "Finish report",
    completed: false,
    createdAt: now,
    updatedAt: now,
    ownerId: mockCaller.userId,
  },
  {
    id: "3",
    title: "Pay bills",
    completed: true,
    createdAt: now,
    updatedAt: now,
    ownerId: mockCaller.userId,
  },
  {
    id: "4",
    title: "Someone else's todo",
    completed: false,
    createdAt: now,
    updatedAt: now,
    ownerId: "not-the-caller",
  },
];

function strip({ ownerId: _ownerId, ...rest }: TodoItem & { ownerId: string }): TodoItem {
  return rest;
}

export const handlers = [
  http.get("/api/me/todo-items", () => {
    const mine = todos.filter((t) => t.ownerId === mockCaller.userId).map(strip);
    return HttpResponse.json({ count: mine.length, next: null, previous: null, data: mine });
  }),

  http.post("/api/me/todo-items", async ({ request }) => {
    const input = (await request.json()) as { title?: string };
    if (!input?.title || !input.title.trim()) {
      return HttpResponse.json(
        { code: 400, message: "Bad Request", description: "title is required" },
        { status: 400 },
      );
    }
    const nowIso = new Date().toISOString();
    const created: TodoItem & { ownerId: string } = {
      id: String(todos.length + 1),
      title: input.title.trim(),
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      ownerId: mockCaller.userId,
    };
    todos = [...todos, created];
    return HttpResponse.json(strip(created), { status: 201 });
  }),

  http.get("/api/me/todo-items/:id", ({ params }) => {
    const todo = todos.find((t) => t.id === params.id && t.ownerId === mockCaller.userId);
    if (!todo) {
      return HttpResponse.json(
        { code: 404, message: "Not Found", description: "No such todo item of the caller's" },
        { status: 404 },
      );
    }
    return HttpResponse.json(strip(todo));
  }),

  http.patch("/api/me/todo-items/:id", async ({ params, request }) => {
    const todo = todos.find((t) => t.id === params.id && t.ownerId === mockCaller.userId);
    if (!todo) {
      return HttpResponse.json(
        { code: 404, message: "Not Found", description: "No such todo item of the caller's" },
        { status: 404 },
      );
    }
    const input = (await request.json()) as { title?: string; completed?: boolean };
    if (typeof input.title === "string") todo.title = input.title;
    if (typeof input.completed === "boolean") todo.completed = input.completed;
    todo.updatedAt = new Date().toISOString();
    return HttpResponse.json(strip(todo));
  }),

  http.delete("/api/me/todo-items/:id", ({ params }) => {
    const before = todos.length;
    todos = todos.filter((t) => !(t.id === params.id && t.ownerId === mockCaller.userId));
    return before === todos.length
      ? HttpResponse.json(
          { code: 404, message: "Not Found", description: "No such todo item of the caller's" },
          { status: 404 },
        )
      : new HttpResponse(null, { status: 204 });
  }),
];
