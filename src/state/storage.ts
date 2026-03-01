import { BoardState, Theme } from '../types';
import { initialState } from './reducer';

// Storage version for migrations
const STORAGE_VERSION = 1;
const STORAGE_KEY = 'kanban-board-v1';

interface StoredData {
  version: number;
  state: BoardState;
}

// Migrate data from older versions if needed
function migrate(data: unknown): BoardState | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const stored = data as Partial<StoredData>;

  // Version 1 - current version
  if (stored.version === STORAGE_VERSION && stored.state) {
    return stored.state;
  }

  // Version 0 or unversioned - migrate to current format
  if (!stored.version && stored.state) {
    // Add any missing fields from older versions
    const migratedState: BoardState = {
      ...initialState,
      ...stored.state,
      filters: {
        ...initialState.filters,
        ...(stored.state.filters || {}),
      },
    };
    return migratedState;
  }

  // Unknown format, return null to use initial state
  return null;
}

// Load state from localStorage
export function loadFromStorage(): BoardState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Check for system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return {
        ...initialState,
        theme: prefersDark ? 'dark' : 'light',
      };
    }

    const parsed = JSON.parse(stored);
    const migrated = migrate(parsed);

    if (migrated) {
      return migrated;
    }

    // If migration failed, return initial state with system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      ...initialState,
      theme: prefersDark ? 'dark' : 'light',
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      ...initialState,
      theme: prefersDark ? 'dark' : 'light',
    };
  }
}

// Save state to localStorage
export function saveToStorage(state: BoardState): void {
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

// Clear storage (for testing or reset)
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

// Apply theme to document
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Get current system theme preference
export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
