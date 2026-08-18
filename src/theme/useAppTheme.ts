import { useThemeStore } from './themeStore';

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);
  const colors = useThemeStore((state) => state.colors);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const loading = useThemeStore((state) => state.loading);

  return {
    mode,
    colors,
    toggleTheme,
    setTheme,
    loading,
    isDark: mode === 'dark',
  };
}
