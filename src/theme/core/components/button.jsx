import { buttonClasses } from '@mui/material/Button';

import { varAlpha, stylesMode } from '../../styles';

// LoadingButton classes fallback for older MUI Lab versions
const loadingButtonClasses = {
  loadingIndicatorStart: 'MuiLoadingButton-loadingIndicatorStart',
  loadingIndicatorEnd: 'MuiLoadingButton-loadingIndicatorEnd',
};

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];

function styleColors(ownerState, styles) {
  const outputStyle = COLORS.reduce((acc, color) => {
    if (!ownerState.disabled && ownerState.color === color) {
      acc = styles(color);
    }
    return acc;
  }, {});

  return outputStyle;
}

// ----------------------------------------------------------------------

const MuiButtonBase = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ fontFamily: theme.typography.fontFamily }) },
};

// ----------------------------------------------------------------------

const softVariant = {
  colors: COLORS.map((color) => ({
    props: ({ ownerState }) =>
      !ownerState.disabled && ownerState.variant === 'soft' && ownerState.color === color,
    style: ({ theme }) => ({
      color: theme.vars.palette[color].dark,
      backgroundColor: varAlpha(theme.vars.palette[color].mainChannel, 0.16),
      '&:hover': { backgroundColor: varAlpha(theme.vars.palette[color].mainChannel, 0.32) },
      [stylesMode.dark]: { color: theme.vars.palette[color].light },
    }),
  })),
  base: [
    {
      props: ({ ownerState }) => ownerState.variant === 'soft',
      style: ({ theme }) => ({
        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        '&:hover': { backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24) },
        [`&.${buttonClasses.disabled}`]: {
          backgroundColor: theme.vars.palette.action.disabledBackground,
        },
        [`& .${loadingButtonClasses.loadingIndicatorStart}`]: { left: 14 },
        [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: { right: 14 },
        [`&.${buttonClasses.sizeSmall}`]: {
          [`& .${loadingButtonClasses.loadingIndicatorStart}`]: { left: 10 },
          [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: { right: 10 },
        },
      }),
    },
  ],
};

const MuiButton = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { color: 'inherit', disableElevation: true },

  /** **************************************
   * VARIANTS
   *************************************** */
  variants: [
    /**
     * @variant soft
     */
    ...[...softVariant.base, ...softVariant.colors],
  ],

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      // Base styles for all buttons: white background, black border, black text/icon
      const baseStyles = {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000000',
        borderColor: '#000000',
        '& .MuiSvgIcon-root': {
          color: '#000000',
        },
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: '#000000',
          color: '#000000',
          '& .MuiSvgIcon-root': {
            color: '#000000',
          },
        },
        '&:active': {
          backgroundColor: '#E0E0E0',
          borderColor: '#000000',
        },
        '&.Mui-disabled': {
          backgroundColor: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.26)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
      };
      return baseStyles;
    },
    /**
     * @variant contained
     */
    contained: ({ theme, ownerState }) => {
      // Override contained variant to match white bg, black border style
      return {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000000',
        borderColor: '#000000',
        boxShadow: 'none',
        '& .MuiSvgIcon-root': {
          color: '#000000',
        },
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: '#000000',
          color: '#000000',
          boxShadow: 'none',
          '& .MuiSvgIcon-root': {
            color: '#000000',
          },
        },
        '&:active': {
          backgroundColor: '#E0E0E0',
          borderColor: '#000000',
        },
        '&.Mui-disabled': {
          backgroundColor: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.26)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
      };
    },
    /**
     * @variant outlined
     */
    outlined: ({ theme, ownerState }) => {
      // Override outlined variant to match white bg, black border style
      return {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000000',
        borderColor: '#000000',
        '& .MuiSvgIcon-root': {
          color: '#000000',
        },
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: '#000000',
          color: '#000000',
          '& .MuiSvgIcon-root': {
            color: '#000000',
          },
        },
        '&:active': {
          backgroundColor: '#E0E0E0',
          borderColor: '#000000',
        },
        '&.Mui-disabled': {
          backgroundColor: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.26)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
      };
    },
    /**
     * @variant text
     */
    text: ({ ownerState, theme }) => {
      // Override text variant to match white bg, black border style
      return {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000000',
        borderColor: '#000000',
        '& .MuiSvgIcon-root': {
          color: '#000000',
        },
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: '#000000',
          color: '#000000',
          '& .MuiSvgIcon-root': {
            color: '#000000',
          },
        },
        '&:active': {
          backgroundColor: '#E0E0E0',
          borderColor: '#000000',
        },
        '&.Mui-disabled': {
          backgroundColor: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.26)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
      };
    },
    /**
     * @size
     */
    sizeSmall: ({ ownerState }) => ({
      height: 30,
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '4px', paddingRight: '4px' }
        : { paddingLeft: '8px', paddingRight: '8px' }),
    }),
    sizeMedium: ({ ownerState }) => ({
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '8px', paddingRight: '8px' }
        : { paddingLeft: '12px', paddingRight: '12px' }),
    }),
    sizeLarge: ({ ownerState }) => ({
      height: 48,
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '10px', paddingRight: '10px' }
        : { paddingLeft: '16px', paddingRight: '16px' }),
    }),
  },
};

// ----------------------------------------------------------------------

const MuiIconButton = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      // White background, black border, black icon
      return {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid #000000',
        borderColor: '#000000',
        '& .MuiSvgIcon-root': {
          color: '#000000',
        },
        '&:hover': {
          backgroundColor: '#F5F5F5',
          borderColor: '#000000',
          color: '#000000',
          '& .MuiSvgIcon-root': {
            color: '#000000',
          },
        },
        '&:active': {
          backgroundColor: '#E0E0E0',
          borderColor: '#000000',
        },
        '&.Mui-disabled': {
          backgroundColor: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.26)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.26)',
          },
        },
      };
    },
  },
};

// ----------------------------------------------------------------------

export const button = { MuiButtonBase, MuiButton, MuiIconButton };
