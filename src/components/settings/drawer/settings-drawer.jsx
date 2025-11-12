import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';

import COLORS from 'src/theme/core/colors.json';
import { paper, varAlpha } from 'src/theme/styles';
import { defaultFont } from 'src/theme/core/typography';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';

import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { NavOptions } from './nav-options';
import { Scrollbar } from '../../scrollbar';
import { FontOptions } from './font-options';
import { useSettingsContext } from '../context';
import { PresetsOptions } from './presets-options';
import { defaultSettings } from '../config-settings';
import { FullScreenButton } from './fullscreen-button';

// ----------------------------------------------------------------------

export function SettingsDrawer({
  sx,
  hideFont,
  hideCompact,
  hidePresets,
  hideNavColor,
  hideContrast,
  hideNavLayout,
  hideDirection,
  hideColorScheme,
}) {
  const theme = useTheme();

  const settings = useSettingsContext();

  // Force light mode - prevent dark mode
  // We control mode via data attribute, not setMode (which requires colorSchemeSelector configuration)
  useEffect(() => {
    // Force light mode using data attribute directly
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-mui-color-scheme', 'light');
      localStorage.setItem('theme-mode', 'light');
    }
  }, []);

  const renderHead = (
    <Box 
      display="flex" 
      alignItems="center" 
      sx={{ 
        py: 2, 
        pr: 1, 
        pl: 2.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}>
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset to Defaults">
        <IconButton
          onClick={() => {
            settings.onReset();
            // Force light mode via data attribute
            if (typeof window !== 'undefined') {
              document.documentElement.setAttribute('data-mui-color-scheme', 'light');
              localStorage.setItem('theme-mode', 'light');
              // Clear app settings to force defaults
              localStorage.removeItem('app-settings');
              // Reload page to apply defaults
              window.location.reload();
            }
          }}
          sx={{ color: 'text.primary' }}
        >
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton onClick={settings.onCloseDrawer} sx={{ color: 'text.primary' }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Dark mode removed - only light mode is available
  const renderMode = null;

  const renderContrast = (
    <BaseOption
      label="Contrast"
      icon="contrast"
      selected={settings.contrast === 'hight'}
      onClick={() =>
        settings.onUpdateField('contrast', settings.contrast === 'default' ? 'hight' : 'default')
      }
    />
  );

  const renderRTL = (
    <BaseOption
      label="Right to left"
      icon="align-right"
      selected={settings.direction === 'rtl'}
      onClick={() =>
        settings.onUpdateField('direction', settings.direction === 'ltr' ? 'rtl' : 'ltr')
      }
    />
  );

  const renderCompact = (
    <BaseOption
      tooltip="Dashboard only and available at large resolutions > 1600px (xl)"
      label="Compact"
      icon="autofit-width"
      selected={settings.compactLayout}
      onClick={() => settings.onUpdateField('compactLayout', !settings.compactLayout)}
    />
  );

  const renderPresets = (
    <PresetsOptions
      value={settings.primaryColor}
      onClickOption={(newValue) => settings.onUpdateField('primaryColor', newValue)}
      options={[
        { name: 'default', value: COLORS.primary.main },
        { name: 'cyan', value: PRIMARY_COLOR.cyan.main },
        { name: 'purple', value: PRIMARY_COLOR.purple.main },
        { name: 'blue', value: PRIMARY_COLOR.blue.main },
        { name: 'orange', value: PRIMARY_COLOR.orange.main },
        { name: 'red', value: PRIMARY_COLOR.red.main },
      ]}
    />
  );

  const renderNav = (
    <NavOptions
      value={{
        color: settings.navColor,
        layout: settings.navLayout,
      }}
      onClickOption={{
        color: (newValue) => settings.onUpdateField('navColor', newValue),
        layout: (newValue) => settings.onUpdateField('navLayout', newValue),
      }}
      options={{
        colors: ['integrate', 'apparent'],
        layouts: ['vertical', 'horizontal', 'mini'],
      }}
      hideNavColor={hideNavColor}
      hideNavLayout={hideNavLayout}
    />
  );

  const renderFont = (
    <FontOptions
      value={settings.fontFamily}
      onClickOption={(newValue) => settings.onUpdateField('fontFamily', newValue)}
      options={[defaultFont, 'Inter', 'DM Sans', 'Nunito Sans']}
    />
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{ backdrop: { invisible: true } }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({
            theme,
            color: 'background.paper', // Use clean white background
          }),
          width: 360,
          bgcolor: 'background.paper', // Ensure white background
          boxShadow: theme.shadows[24], // Clear shadow for visibility
          ...sx,
        },
      }}
    >
      {renderHead}

      <Scrollbar sx={{ bgcolor: 'background.paper' }}>
        <Stack spacing={4} sx={{ px: 2.5, pb: 5, pt: 3, bgcolor: 'background.paper' }}>
          <Box gap={2} display="grid" gridTemplateColumns="repeat(2, 1fr)">
            {!hideContrast && renderContrast}
            {!hideDirection && renderRTL}
            {!hideCompact && renderCompact}
          </Box>
          {!(hideNavLayout && hideNavColor) && renderNav}
          {!hidePresets && renderPresets}
          {!hideFont && renderFont}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
