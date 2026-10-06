// Persistence for todo items. Every query here is scoped to the owning
// caller's id (userId) — the service layer never queries without it.

import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

# One row of the todo_items table.
#
# + id - the item's id
# + userId - the owning caller's id — the gateway assertion's `sub`
# + title - the item's title
# + completed - whether the item is complete
# + createdAt - when the row was created
# + updatedAt - when the row was last changed
public type TodoItemRow record {|
    string id;
    string userId;
    string title;
    boolean completed;
    time:Utc createdAt;
    time:Utc updatedAt;
|};

final postgresql:Client dbClient = check initDbClient();
final () dbReady = check initSchema();

function initDbClient() returns postgresql:Client|error {
    int port = check int:fromString(todoDbPort);
    return new (host = todoDbHost, username = todoDbUser, password = todoDbPassword,
        database = todoDbName, port = port);
}

function initSchema() returns error? {
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS todo_items (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE INDEX IF NOT EXISTS todo_items_user_id_idx ON todo_items (user_id)
    `);
}

# Total number of the caller's todo items.
#
# + userId - the owning caller's id
# + return - the count, or an error
function countTodoItems(string userId) returns int|error {
    record {| int count; |} result = check dbClient->queryRow(
        `SELECT COUNT(*)::int AS count FROM todo_items WHERE user_id = ${userId}`);
    return result.count;
}

# A page of the caller's todo items, newest first.
#
# + userId - the owning caller's id
# + pageLimit - max rows to return
# + pageOffset - rows to skip
# + return - the matching rows, or an error
function listTodoItemRows(string userId, int pageLimit, int pageOffset) returns TodoItemRow[]|error {
    stream<TodoItemRow, sql:Error?> rows = dbClient->query(`
        SELECT id, user_id AS "userId", title, completed,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todo_items
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${pageLimit} OFFSET ${pageOffset}
    `);
    TodoItemRow[] items = [];
    check from TodoItemRow row in rows
        do {
            items.push(row);
        };
    return items;
}

# A single todo item of the caller's.
#
# + userId - the owning caller's id
# + id - the item's id
# + return - the row, () when no such item of the caller's exists, or an error
function getTodoItemRow(string userId, string id) returns TodoItemRow?|error {
    TodoItemRow|sql:Error result = dbClient->queryRow(`
        SELECT id, user_id AS "userId", title, completed,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todo_items
        WHERE id = ${id} AND user_id = ${userId}
    `);
    if result is sql:NoRowsError {
        return ();
    }
    if result is sql:Error {
        return result;
    }
    return result;
}

# Creates a new todo item for the caller.
#
# + userId - the owning caller's id
# + title - the item's title, already validated non-blank
# + return - the created row, or an error
function createTodoItemRow(string userId, string title) returns TodoItemRow|error {
    string id = uuid:createRandomUuid();
    time:Utc now = time:utcNow();
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO todo_items (id, user_id, title, completed, created_at, updated_at)
        VALUES (${id}, ${userId}, ${title}, false, ${now}, ${now})
    `);
    return {id, userId, title, completed: false, createdAt: now, updatedAt: now};
}

# Edits and/or completes a todo item of the caller's.
#
# + userId - the owning caller's id
# + id - the item's id
# + title - the new title, or () to leave it unchanged
# + completed - the new completion state, or () to leave it unchanged
# + return - the updated row, () when no such item of the caller's exists, or an error
function updateTodoItemRow(string userId, string id, string? title, boolean? completed)
        returns TodoItemRow?|error {
    time:Utc now = time:utcNow();
    sql:ParameterizedQuery query = `UPDATE todo_items SET updated_at = ${now}`;
    if title is string {
        query = sql:queryConcat(query, `, title = ${title}`);
    }
    if completed is boolean {
        query = sql:queryConcat(query, `, completed = ${completed}`);
    }
    query = sql:queryConcat(query, ` WHERE id = ${id} AND user_id = ${userId}`);
    sql:ExecutionResult result = check dbClient->execute(query);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is () || affectedRowCount == 0 {
        return ();
    }
    return getTodoItemRow(userId, id);
}

# Deletes a todo item of the caller's.
#
# + userId - the owning caller's id
# + id - the item's id
# + return - true when a row was deleted, false when no such item of the caller's existed, or an error
function deleteTodoItemRow(string userId, string id) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(
        `DELETE FROM todo_items WHERE id = ${id} AND user_id = ${userId}`);
    int? affectedRowCount = result.affectedRowCount;
    return affectedRowCount is int && affectedRowCount > 0;
}
