import { createContext, useContext, type PropsWithChildren } from 'react';

import { lightTheme, type AppTheme } from '../theme/theme';

const ThemeContext = createContext<AppTheme>(lightTheme);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): AppTheme => useContext(ThemeContext);
