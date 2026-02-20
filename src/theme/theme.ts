import { colors, radius, spacing, typography } from './tokens';

export type AppTheme = {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const lightTheme: AppTheme = {
  colors,
  spacing,
  radius,
  typography,
};
