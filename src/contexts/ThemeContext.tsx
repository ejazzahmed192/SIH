import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface ThemeState {
  theme: 'light' | 'dark';
  animations: boolean;
  language: string;
  notifications: boolean;
  autoSave: boolean;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_ANIMATIONS'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_NOTIFICATIONS'; payload: boolean }
  | { type: 'TOGGLE_AUTO_SAVE'; payload: boolean };

const initialState: ThemeState = {
  theme: 'light',
  animations: true,
  language: 'en',
  notifications: true,
  autoSave: true,
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_ANIMATIONS':
      return { ...state, animations: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'TOGGLE_AUTO_SAVE':
      return { ...state, autoSave: action.payload };
    default:
      return state;
  }
}

const ThemeContext = createContext<{
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const savedAnimations = localStorage.getItem('animations') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedAutoSave = localStorage.getItem('autoSave') !== 'false';

    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
    dispatch({ type: 'TOGGLE_ANIMATIONS', payload: savedAnimations });
    dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    dispatch({ type: 'TOGGLE_NOTIFICATIONS', payload: savedNotifications });
    dispatch({ type: 'TOGGLE_AUTO_SAVE', payload: savedAutoSave });
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem('animations', state.animations.toString());
    localStorage.setItem('language', state.language);
    localStorage.setItem('notifications', state.notifications.toString());
    localStorage.setItem('autoSave', state.autoSave.toString());
  }, [state.animations, state.language, state.notifications, state.autoSave]);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}