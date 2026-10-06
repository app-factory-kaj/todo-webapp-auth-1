# Sign in and manage todos

A User signs in through Thunder, then the webapp loads and manages their private todo list via the Todo API.

```mermaid
sequenceDiagram
    actor User
    participant todowebapp as todo-webapp
    participant userauth as user-auth
    participant todoapi as todo-api

    User->>todowebapp: open app
    todowebapp->>userauth: redirect to sign in
    userauth-->>todowebapp: signed in (token)
    todowebapp->>todoapi: list my todos
    todoapi-->>todowebapp: todo list
    User->>todowebapp: create todo
    todowebapp->>todoapi: create todo
    todoapi-->>todowebapp: created
    User->>todowebapp: mark complete
    todowebapp->>todoapi: update todo
    todoapi-->>todowebapp: updated
```

