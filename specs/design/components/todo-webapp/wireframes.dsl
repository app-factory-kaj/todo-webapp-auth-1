screen TodoList "A User's private list of todo items"
  navbar "Todo"
  sidebar "My Todos | Sign out"
  row
    heading "My Todos"
    right
    button "New Todo" primary -> NewTodo
  table "Title | Status" -> EditTodo
    row "Buy groceries | Open"
    row "Finish report | Open"
    row "Pay bills | Done"

screen NewTodo "Create a new todo item"
  navbar "Todo"
  sidebar "My Todos -> TodoList | Sign out"
  heading "New Todo"
  input "Title"
  row
    right
    button "Cancel" -> TodoList
    button "Save" primary -> TodoList

screen EditTodo "Edit, complete or delete a todo item"
  navbar "Todo"
  sidebar "My Todos -> TodoList | Sign out"
  heading "Edit Todo"
  input "Title"
  checkbox "Completed"
  row
    button "Delete" danger -> TodoList
    right
    button "Cancel" -> TodoList
    button "Save" primary -> TodoList

flow "Manage my todos"
  role "User"
  description "A signed-in User views, creates, edits, completes and deletes their own todo items"
  TodoList
  NewTodo
  EditTodo
