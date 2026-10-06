Feature: Authentication

  @story-1
  Rule: A new User must sign up and sign in before using the app

    Scenario: A new User signs up and signs in
      Given Alice the User has never used the app before
      When Alice signs up and signs in
      Then Alice sees her own, empty todo list

    Scenario: A returning User signs in
      Given Alice the User already has an account with a todo item titled "Buy groceries"
      When Alice signs in
      Then Alice sees her todo item titled "Buy groceries"

  @story-2
  Rule: A User may sign out to secure their account

    Scenario: Alice signs out
      Given Alice the User is signed in
      When Alice signs out
      Then Alice is no longer signed in
