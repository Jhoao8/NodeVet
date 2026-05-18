// Typography Configuration
// Aligned with frontend mobile design system
export const typography = {
  family: {
    main: {
      regular: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      light: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      medium: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      semiBold: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      bold: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    },
    display: 'Fredoka, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    monospace: '"Courier New", monospace',
  },
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  size: {
    xs: '12px',    // xs
    sm: '14px',    // sm
    md: '16px',    // md (base)
    lg: '20px',    // lg
    xl: '24px',    // xl
    xxl: '32px',   // xxl
    xxxl: '40px',  // display
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export default typography;
