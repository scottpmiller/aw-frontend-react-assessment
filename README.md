# Task Management App

A React-based task management application for the Senior Frontend Engineer Assessment.

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone <repo-url>
cd frontend-react-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Usage

- Add new tasks using the input field
- Click the checkbox to mark tasks as complete/incomplete
- Delete tasks using the Delete button
- Use the Refresh button to reload tasks from local storage

## Current Known Issues

### Critical Bug Report - Task State Inconsistency

**Reporter:** Sarah M. (Marketing Team)  
**Date:** June 18, 2025  
**Priority:** High  

**Problem Description:**
"Tasks are randomly disappearing and reappearing when I work quickly. Sometimes when I mark a task as complete and immediately add a new one, the completed task becomes uncompleted again. This happens most often when I'm working fast during busy periods. I've lost important tasks multiple times and had to recreate them from memory."

**Steps to Reproduce:**
1. Load the task management app
2. Mark a task as complete quickly
3. Immediately add a new task while the previous save is still processing
4. Observe that the completed task may revert to uncompleted state
5. Sometimes tasks appear to duplicate or disappear entirely

**Expected Behavior:**
Task completions and additions should be processed reliably regardless of timing

**Impact:**
- Lost productivity due to recreating tasks
- Unreliable task tracking affecting project deadlines
- Team members losing confidence in the tool

## Assessment Instructions

1. Run the app locally
2. Try to reproduce the reported issues
3. Identify the root cause of the bugs
4. Fix the issues so the app works reliably

**Time Limit:** 2 hours maximum

**Requirements:** 
- Must use AI tools during the assessment
- Focus on problem discovery and user experience
- Record your entire working session