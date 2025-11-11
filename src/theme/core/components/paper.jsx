import { varAlpha } from '../../styles';

// ----------------------------------------------------------------------

const MuiPaper = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { elevation: 0 },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundImage: 'none',
      backgroundColor: theme.vars.palette.background.paper, // Force light background
      color: theme.vars.palette.text.primary, // Ensure readable text color
    }),
    outlined: ({ theme }) => ({
      borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
      backgroundColor: theme.vars.palette.background.paper, // Force light background
      color: theme.vars.palette.text.primary, // Ensure readable text color
    }),
  },
};

// ----------------------------------------------------------------------

export const paper = { MuiPaper };
