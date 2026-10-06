# todo-webapp-auth-1 — PRD

## Problem Statement

People jot down tasks across sticky notes, chat threads, and scraps of paper, and lose track of what still needs doing. There is no single, private place for one person to keep and manage their own list of tasks, reachable from anywhere they can sign in.

## Solution

A simple todo web application where each person signs in with their own account and manages a private list of tasks — adding, editing, completing, and removing items — with nothing shared and nothing visible to anyone else.

## Actors

- **User** — a signed-in person who creates, views, edits, completes, and deletes their own todo items. There is only one kind of signed-in person; no actor has elevated or administrative capabilities.

## User Stories

1. As a User, I want to sign up and sign in securely, so that my todos are kept private to me.
2. As a User, I want to sign out, so that I can secure my account on a shared device.
3. As a User, I want to create a new todo item, so that I can track a task I need to do.
4. As a User, I want to view my list of todo items, so that I can see everything I still need to do.
5. As a User, I want to edit a todo item, so that I can correct or update it.
6. As a User, I want to mark a todo item as complete, so that I can track my progress.
7. As a User, I want to delete a todo item, so that I can remove a task I no longer need.

## Product Decisions

- Sign-in is via SSO through Thunder, the platform IDP (organization default).
- Self-service enrolment is enabled: a new user signs themselves up and signs in directly — this app describes people who sign themselves up.
- Todos are personal only — no sharing, assignment, or collaboration between users.
- Every signed-in user has the same single role; there is no admin or elevated actor.
- The core todo feature set is basic CRUD plus completion — no due dates, priorities, categories, or tags.
- No third-party integrations (e.g. email, payments, maps) are required by this product.

## Out of Scope

- Sharing or collaborating on todo lists between users.
- An admin role or any user-management capability.
- Due dates, priority levels, categories, or tags on todos.
- Notifications or reminders of any kind.

## Open Questions

None at this time.