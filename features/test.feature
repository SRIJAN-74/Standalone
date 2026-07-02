Feature: EventHub - Core Flows (consolidated)
  As a user of EventHub
  I want to authenticate, browse events, view details and start booking
  So that I can discover and register for events

  Background:
    Given the EventHub application is accessible at "https://eventhub.rahulshettyacademy.com/"

  @auth @positive @json_id_auth_login
  Scenario: User successfully logs in with valid credentials
    Given the user is on the login page
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then the user should be redirected to the events page
    And the user profile/menu should be visible
    # Locators: email_input -> input[type="email"], password_input -> input[type="password"], signin_button -> button:has-text("Sign In")

  @auth @negative @json_id_auth_login_empty
  Scenario: User attempts login with empty credentials
    Given the user is on the login page
    When the user leaves the email field empty
    And the user leaves the password field empty
    And the user clicks the Sign In button
    Then an error message should be displayed
    # Locators: signin_button -> button:has-text("Sign In")

  @event_browsing @positive @json_id_event_list_display
  Scenario: Logged-in user views list of events
    Given the user is logged in with email 'manish123@gmail.com' and password 'Manish9@@'
    When the user navigates to the events listing page
    Then the events page should display at least one event
    And each event should show a title and a date

  @event_details @positive @json_id_event_details_view
  Scenario: User views event details from list
    Given the user is logged in and on the events listing page
    When the user clicks on the first event in the list
    Then the event details page should load
    And the event title, date and description should be visible

  @booking @positive @json_id_booking_start
  Scenario: User opens booking form from event details
    Given the user is viewing an event details page
    When the user clicks the 'Book' or 'Book Now' button
    Then a booking form or modal should appear
    And the event name should be pre-filled in the booking form
  Scenario: User opens login page
    Given I open the login page
    Then the page title should contain "Login" 

  @test
  Scenario: User creates booking
    Given user login into the app
    Then the page title should contain "EventHub — Discover & Book Events"        

  @test  
  Scenario: User logs in using valid credentials
    Given user login into the app
    When user enters valid email
    And user enters valid password 
    And user clicks the sign in button
    Then the user should be logged in

  @test
  Scenario: User sees error with invalid password
    Given user login into the app
     When user enters invalid password
    Then the user must be displayed an error message
