// screen NewTodo "Create a new todo item" (wireframes.dsl): input "Title",
// "Cancel" -> TodoList, "Save" primary -> TodoList. A form that only writes:
// names its submit operation, POST /me/todo-items (todos:write).
import { useState, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { todoApi } from "../api";

export default function NewTodoPage(): JSX.Element {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: apiError } = await todoApi.POST("/me/todo-items", {
      body: { title: title.trim() },
    });
    setSaving(false);
    if (apiError) {
      setError("Could not create the todo.");
      return;
    }
    navigate("/todos");
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>New Todo</PageTitle.Header>
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
              autoFocus
              fullWidth
            />
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate("/todos")} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            Save
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
