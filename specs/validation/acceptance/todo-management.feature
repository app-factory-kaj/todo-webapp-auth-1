Feature: Todo management

  @story-3
  Rule: A User can create a new todo item

    Scenario: Alice creates a todo item
      Given Alice the User is signed in with an empty todo list
      When Alice creates a todo item titled "Buy groceries"
      Then Alice's todo list has exactly one item, titled "Buy groceries" and not completed

    @negative
    Scenario: Alice cannot create a todo item with no title
      Given Alice the User is signed in with an empty todo list
      When Alice tries to create a todo item with no title
      Then Alice's todo list still has no items

  @story-4
  Rule: A User sees only their own todo items

    Scenario: Alice views her todo list
      Given Alice the User has todo items titled "Buy groceries" and "Finish report"
      When Alice views her todo list
      Then Alice sees exactly the todo items titled "Buy groceries" and "Finish report"

    @negative
    Scenario: Bob does not see Alice's todo items
      Given Alice the User has a todo item titled "Buy groceries"
      And Bob the User has an empty todo list
      When Bob views his todo list
      Then Bob's todo list has no items

  @story-5
  Rule: A User can edit one of their own todo items

    Scenario: Alice edits a todo item's title
      Given Alice the User has a todo item titled "Buy groceries"
      When Alice edits that item's title to "Buy groceries and milk"
      Then Alice's todo item is titled "Buy groceries and milk"

  @story-6
  Rule: A User can mark one of their own todo items as complete

    Scenario: Alice completes a todo item
      Given Alice the User has an incomplete todo item titled "Buy groceries"
      When Alice marks that item as complete
      Then Alice's todo item titled "Buy groceries" is completed

  @story-7
  Rule: A User can delete one of their own todo items

    Scenario: Alice deletes a todo item
      Given Alice the User has a todo item titled "Buy groceries" in an otherwise empty list
      When Alice deletes that item
      Then Alice's todo list has no items
