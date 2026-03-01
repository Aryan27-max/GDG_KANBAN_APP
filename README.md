# GDG TASK - 1.Fronte-end - Kanban Task Management Application

A production-ready single-page Kanban board application built with React, TypeScript, and TailwindCSS.

# Tech Stack
<div align="center">
  <img src="https://skillicons.dev/icons?i=vite,typescript,react,tailwind" />
</div>

## Features

- **Kanban Board**: 3 default columns (Todo, In Progress, Done) with support for custom columns
- **Drag and Drop**: Smooth drag-and-drop using @dnd-kit with touch support
- **Task Management**: Create, edit, delete tasks with priority levels and color tags
- **Search & Filter**: Filter tasks by title/description, priority, and color tag
- **Dark/Light Theme**: System-default with user override, persisted to localStorage
- **Persistence**: All data persisted in localStorage with versioned storage and migration
- **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Vite** - Fast build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **@dnd-kit** - Drag and drop
- **Vitest** - Testing framework
- **@testing-library/react** - Component testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main application component
├── styles.css            # Tailwind CSS imports
├── types.ts              # TypeScript type definitions
├── state/
│   ├── reducer.ts        # State reducer
│   ├── actions.ts        # Action creators
│   └── storage.ts        # localStorage persistence
├── components/
│   ├── Board.tsx         # Main board component with DnD
│   ├── Column.tsx        # Column component
│   ├── TaskCard.tsx      # Task card component
│   ├── modals/
│   │   ├── TaskModal.tsx     # Create/edit task modal
│   │   ├── ColumnModal.tsx   # Create/rename column modal
│   │   └── ConfirmDialog.tsx # Confirmation dialog
│   └── controls/
│       ├── TopBar.tsx        # Top navigation bar
│       ├── ThemeToggle.tsx   # Theme toggle button
│       └── Filters.tsx       # Filter dropdowns
└── test/
    └── board.test.tsx    # Board tests
```

## Usage

### Creating Tasks
1. Click "Add Task" button in the top bar
2. Enter task title (required) and description (optional)
3. Select priority level (Low/Medium/High)
4. Optionally select a color tag
5. Click "Create Task"

### Moving Tasks
- Drag and drop tasks between columns
- Reorder tasks within the same column

### Editing Tasks
1. Click on a task card to open the edit modal
2. Modify title, description, priority, or tag
3. Click "Save Changes"

### Managing Columns
- Click "Add Column" to create a new column
- Click the delete button on a column header to remove it
- If a column has tasks, you'll be prompted to confirm deletion

### Theme Toggle
- Click the sun/moon icon to toggle between light and dark themes
- Theme preference is saved and persists across sessions

### Search & Filter
- Use the search bar to filter tasks by title or description
- Use the priority dropdown to filter by priority level
- Use the tag dropdown to filter by color tag

## License

MIT
