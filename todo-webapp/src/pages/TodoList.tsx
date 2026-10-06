// screen TodoList "A User's private list of todo items" (wireframes.dsl):
// table "Title | Status" -> EditTodo, "New Todo" primary -> NewTodo. Loads
// GET /me/todo-items (todos:read) — gated by <RequireOperation> around this
// route in App.tsx.
import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  ListingTable,
  PageContent,
  PageTitle,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { todoApi } from "../api";
import type { components } from "../generated/todo-api";

type TodoItem = components["schemas"]["TodoItem"];

export default function TodoListPage(): JSX.Element {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<TodoItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    todoApi
      .GET("/me/todo-items", { params: { query: { limit: 100 } } })
      .then(({ data, error: apiError }) => {
        if (apiError) {
          setError("Could not load your todos.");
          return;
        }
        setTodos(data?.data ?? []);
      })
      .catch(() => setError("Could not load your todos."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Todos</PageTitle.Header>
        <PageTitle.Actions>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate("/todos/new")}
          >
            New Todo
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Title</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {error ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={2}>
                  <ListingTable.EmptyState title="Something went wrong" description={error} />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : todos === null ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={2}>
                  <ListingTable.EmptyState title="Loading…" description="Fetching your todos." />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : todos.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={2}>
                  <ListingTable.EmptyState
                    title="No todos yet"
                    description="Create your first todo to get started."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              todos.map((todo) => (
                <ListingTable.Row
                  key={todo.id}
                  clickable
                  onClick={() => navigate(`/todos/${todo.id}/edit`)}
                >
                  <ListingTable.Cell>{todo.title}</ListingTable.Cell>
                  <ListingTable.Cell>
                    <Chip
                      label={todo.completed ? "Done" : "Open"}
                      color={todo.completed ? "success" : "default"}
                      size="small"
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
