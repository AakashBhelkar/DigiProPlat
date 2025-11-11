// ----------------------------------------------------------------------

const MuiTypography = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.vars.palette.text.primary, // Ensure readable text color
    }),
    paragraph: ({ theme }) => ({ marginBottom: theme.spacing(2) }),
    gutterBottom: ({ theme }) => ({ marginBottom: theme.spacing(1) }),
    h1: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    h2: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    h3: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    h4: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    h5: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    h6: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    body1: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    body2: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    subtitle1: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    subtitle2: ({ theme }) => ({ color: theme.vars.palette.text.primary }),
    caption: ({ theme }) => ({ color: theme.vars.palette.text.secondary }),
  },
};

// ----------------------------------------------------------------------

export const typography = { MuiTypography };
