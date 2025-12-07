// src/theme/ThemeWrapper.tsx

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useThemeStore } from '../store/themeStore';
import { getTheme } from './theme';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};