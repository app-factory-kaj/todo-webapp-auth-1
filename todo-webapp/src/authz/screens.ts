// Adapted from thunder-authentication's screens.example.ts pattern. THIS IS THE
// ONLY FILE THAT KNOWS ABOUT SCREENS: each row names the operation the screen
// LOADS (or, for a form that only writes, the operation its submit makes), in
// RAIL ORDER per wireframes.dsl (TodoList -> NewTodo -> EditTodo). The gate
// follows from OPERATIONS, generated from todo-api's openapi.yaml — never a
// handle typed here.

import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "todolist", label: "My Todos", path: "/todos", loads: "GET /me/todo-items" },
  { key: "newtodo", label: "New Todo", path: "/todos/new", loads: "POST /me/todo-items" },
  {
    key: "edittodo",
    label: "Edit Todo",
    path: "/todos/:todoItemId/edit",
    loads: "GET /me/todo-items/{todoItemId}",
  },
];

for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some((screen) => !screen.public && screen.loads !== null);
}
