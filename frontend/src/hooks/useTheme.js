import { useTheme } from '../context/ThemeContext';

/**
 * Custom hook to access theme state and toggle.
 * Exposes { isDark, toggleTheme } from ThemeContext.
 */
const useThemeHook = () => {
  return useTheme();
};

export default useThemeHook;
