import { useId, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NoSsr from '@mui/material/NoSsr';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ width, height, disableLink = false, className, href = '/', sx, showText = true, ...other }, ref) => {
    const theme = useTheme();

    const logoColor = '#1a1f3a'; // Dark navy blue
    
    // Default sizes - larger for better visibility
    const defaultWidth = showText ? undefined : 56;
    const defaultHeight = 56;
    const finalWidth = width || defaultWidth;
    const finalHeight = height || defaultHeight;
    
    // Icon size - make it prominent and visible
    const iconSize = showText ? 40 : Math.max(finalWidth || 56, finalHeight) * 0.8;
    
    const logoIcon = (
      <Iconify
        icon="solar:rocket-2-bold-duotone"
        width={iconSize}
        sx={{ color: logoColor }}
      />
    );

    const logoText = showText ? (
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: logoColor,
          letterSpacing: '-0.3px',
          fontSize: { xs: '16px', sm: '18px' },
          lineHeight: 1,
        }}
      >
        DigiProPlat
      </Typography>
    ) : null;

    const logo = (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ height: '100%' }}
      >
        {logoIcon}
        {logoText}
      </Stack>
    );

    return (
      <NoSsr
        fallback={
          <Box
            minWidth={finalWidth}
            minHeight={finalHeight}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              verticalAlign: 'middle',
              ...sx,
            }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="logo"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            minWidth: finalWidth,
            minHeight: finalHeight,
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {logo}
        </Box>
      </NoSsr>
    );
  }
);
