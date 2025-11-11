import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';

import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
}) {
  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        body: {
          '--layout-nav-zIndex': 1101,
          '--layout-nav-mobile-width': '320px',
          '--layout-header-blur': '8px',
          '--layout-header-zIndex': 1100,
          '--layout-header-mobile-height': '64px',
          '--layout-header-desktop-height': '72px',
          backgroundColor: '#FFFFFF !important', // Force white background
          ...cssVars,
        },
        '#root__layout': {
          backgroundColor: '#FFFFFF !important', // Force white background on layout root
        },
        '.layout__root': {
          backgroundColor: '#FFFFFF !important', // Force white background
        },
        '.layout__main': {
          backgroundColor: '#FFFFFF !important', // Force white background
        },
        '.layout__header': {
          backgroundColor: '#FFFFFF !important', // Force white background
        },
        '.layout__main__content': {
          backgroundColor: '#FFFFFF !important', // Force white background
        },
        '.MuiCard-root': {
          backgroundColor: '#FFFFFF !important', // Force white background on cards
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiCardContent-root': {
          backgroundColor: '#FFFFFF !important', // Force white background on card content
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiPaper-root': {
          backgroundColor: '#FFFFFF !important', // Force white background on paper
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiBox-root': {
          backgroundColor: 'transparent !important', // Default to transparent, can be overridden
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiBox-root.css-d9ojjt': {
          backgroundColor: '#FFFFFF !important', // Force white background
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiTypography-root': {
          color: '#1C252E !important', // Force dark text for readability
        },
        '.MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6': {
          color: '#1C252E !important', // Force dark text for headings
        },
        '.MuiTypography-body1, .MuiTypography-body2': {
          color: '#1C252E !important', // Force dark text for body text
        },
        '.MuiTypography-subtitle1, .MuiTypography-subtitle2': {
          color: '#1C252E !important', // Force dark text for subtitles
        },
        '.MuiTypography-caption': {
          color: '#52525B !important', // Slightly lighter for captions
        },
        'p, span, div, h1, h2, h3, h4, h5, h6': {
          color: '#1C252E !important', // Force dark text for all text elements
        },
        // Force white background on all Container components
        '.MuiContainer-root': {
          backgroundColor: '#FFFFFF !important', // Force white background on containers
          color: '#1C252E !important', // Force dark text for readability
        },
        // Specific Container variants with different CSS class names
        '.MuiContainer-root.css-1sxfz8y-MuiContainer-root, .MuiContainer-root.css-8s7acl-MuiContainer-root, .MuiContainer-root.css-j6zbd1-MuiContainer-root, .MuiContainer-root.css-pomxa5-MuiContainer-root, .MuiContainer-root[class*="css-"]': {
          backgroundColor: '#FFFFFF !important', // Force white background
          color: '#1C252E !important', // Force dark text for readability
        },
      }}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <Box id="root__layout" className={layoutClasses.root} sx={sx}>
        {sidebarSection ? (
          <>
            {sidebarSection}
            <Box
              display="flex"
              flex="1 1 auto"
              flexDirection="column"
              className={layoutClasses.hasSidebar}
            >
              {headerSection}
              {children}
              {footerSection}
            </Box>
          </>
        ) : (
          <>
            {headerSection}
            {children}
            {footerSection}
          </>
        )}
      </Box>
    </>
  );
}
