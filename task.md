Personal Productivity Dashboard (MVP)
Overview

Build a simple Personal Productivity Dashboard using only HTML, CSS, and Vanilla JavaScript.

The application should help users stay productive by providing:

Greeting section
Current date and time
Focus timer
To-do list
Quick links

All user data must be stored locally using the browser Local Storage API.

Technical Constraints
TC-1: Technology Stack

The project must use:

HTML for structure
CSS for styling
Vanilla JavaScript only

Restrictions:

Do not use React
Do not use Vue
Do not use Angular
Do not use any frontend framework
No backend server required
TC-2: Data Storage

Data persistence requirements:

Use Browser Local Storage API
Store all application data locally
No external database
No cloud storage
Application must continue working after page refresh

Data to store:

To-do list items
Quick links
TC-3: Browser Compatibility

The application must work correctly on:

Google Chrome
Mozilla Firefox
Microsoft Edge
Safari

The application should be usable as:

Standalone web application
Browser extension-ready interface
Non-Functional Requirements
NFR-1: Simplicity

The application must:

Have a clean interface
Be easy to understand
Require no setup process
Require no installation
Require no test setup
Be intuitive for first-time users
NFR-2: Performance

The application should:

Load quickly
Respond instantly to user interactions
Update UI without noticeable lag
Work smoothly with dozens of tasks
NFR-3: Visual Design

The UI should provide:

User-friendly appearance
Clear visual hierarchy
Readable typography
Consistent spacing
Responsive layout for desktop and mobile devices
Required Features (MVP)
1. Greeting Section
Requirements

Display:

Current date
Current time
Dynamic greeting based on local time
Greeting Rules
Time Range	Greeting
05:00 - 11:59	Good Morning
12:00 - 16:59	Good Afternoon
17:00 - 20:59	Good Evening
21:00 - 04:59	Good Night
Acceptance Criteria
Date updates correctly
Time updates in real-time
Greeting changes automatically according to current hour
2. Focus Timer
Requirements

Implement a Pomodoro-style timer.

Default duration:

25 minutes

Controls:

Start
Stop/Pause
Reset
Acceptance Criteria
Timer starts counting down when Start is clicked
Timer pauses when Stop is clicked
Timer returns to 25:00 when Reset is clicked
Display updates every second
Timer cannot run multiple intervals simultaneously
3. To-Do List
Requirements

Users must be able to:

Add tasks
Edit tasks
Mark tasks as completed
Delete tasks
Data Model
{
  id: number,
  text: string,
  completed: boolean
}
Local Storage

Save:

Task content
Completion status
Acceptance Criteria
Added tasks appear immediately
Edited tasks update correctly
Completed tasks show visual distinction
Deleted tasks are removed permanently
Tasks persist after page refresh
4. Quick Links
Requirements

Users must be able to:

Add website links
Save website name
Open links in a new browser tab
Delete saved links
Data Model
{
  id: number,
  title: string,
  url: string
}
Local Storage

Save:

Link title
Link URL
Acceptance Criteria
Links can be added successfully
Clicking a link opens a new tab
Links remain after page refresh
Links can be deleted
Suggested Layout
Header
Greeting
Current date
Current time
Main Content
Left Section

Focus Timer

Right Section

To-Do List

Bottom Section

Quick Links

Folder Structure

The project must follow this structure:

project-root/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
└── README.md
Folder Rules
CSS

Only one CSS file is allowed:

css/style.css
JavaScript

Only one JavaScript file is allowed:

js/app.js
Code Quality

Requirements:

Clean code
Readable naming conventions
Modular functions
Consistent formatting
Avoid duplicated logic
Definition of Done

The project is considered complete when:

Greeting section works correctly
Date and time display correctly
Focus timer functions properly
To-do list CRUD operations work
Quick links feature works
Local Storage persists data
UI is responsive
Folder structure follows requirements
Only one CSS file exists
Only one JavaScript file exists
No framework is used
No backend is required
Application works after browser refresh