// screen EditTodo "Edit, complete or delete a todo item" (wireframes.dsl):
// input "Title", checkbox "Completed", "Delete" danger -> TodoList,
// "Cancel"/"Save" primary -> TodoList. Loads GET /me/todo-items/{todoItemId}
// (todos:read); Save/Delete call PATCH/DELETE (todos:write).
import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Checkbox,
  Form,
  FormControlLabel,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { todoApi } from "../api";

export default function EditTodoPage(): JSX.Element {
  const navigate = useNavigate();
  const { todoItemId } = useParams<{ todoItemId: string }>();
  const [title, setTitle] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!todoItemId) return;
    let live = true;
    todoApi
      .GET("/me/todo-items/{todoItemId}", { params: { path: { todoItemId } } })
      .then(({ data, error: apiError, response }) => {
        if (!live) return;
        if (apiError || !data) {
          if (response.status === 404) setNotFound(true);
          else setError("Could not load this todo.");
          return;
        }
        setTitle(data.title);
        setCompleted(data.completed);
      })
      .catch(() => {
        if (live) setError("Could not load this todo.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [todoItemId]);

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!todoItemId) return;
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: apiError } = await todoApi.PATCH("/me/todo-items/{todoItemId}", {
      params: { path: { todoItemId } },
      body: { title: title.trim(), completed },
    });
    setSaving(false);
    if (apiError) {
      setError("Could not save the todo.");
      return;
    }
    navigate("/todos");
  };

  const handleDelete = async (): Promise<void> => {
    if (!todoItemId) return;
    setSaving(true);
    setError(null);
    const { error: apiError } = await todoApi.DELETE("/me/todo-items/{todoItemId}", {
      params: { path: { todoItemId } },
    });
    setSaving(false);
    if (apiError) {
      setError("Could not delete the todo.");
      return;
    }
    navigate("/todos");
  };

  if (loading) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Edit Todo</PageTitle.Header>
        </PageTitle>
        <p>Loading…</p>
      </PageContent>
    );
  }

  if (notFound) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Edit Todo</PageTitle.Header>
        </PageTitle>
        <p>This todo no longer exists.</p>
        <Button variant="outlined" onClick={() => navigate("/todos")}>
          Back to My Todos
        </Button>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Edit Todo</PageTitle.Header>
      </PageTitle>

      <form onSubmit={(e) => void handleSave(e)}>
        <Form.Section>
          <Form.Stack>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={Boolean(error)}
              helperText={error ?? undefined}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                />
              }
              label="Completed"
            />
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => void handleDelete()}
            disabled={saving}
          >
            Delete
          </Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/todos")} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={saving}>
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </PageContent>
  );
}
