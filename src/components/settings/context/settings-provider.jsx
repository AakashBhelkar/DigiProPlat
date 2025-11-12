import { useMemo, useState, useCallback, createContext, useEffect } from 'react';

import { useLocalStorage } from 'src/hooks/use-local-storage';

import { STORAGE_KEY } from '../config-settings';

// ----------------------------------------------------------------------

export const SettingsContext = createContext(undefined);

export const SettingsConsumer = SettingsContext.Consumer;

// ----------------------------------------------------------------------

export function SettingsProvider({ children, settings }) {
  // Use provided settings or merge with defaults
  const defaultSettingsWithLightMode = {
    ...settings,
    colorScheme: 'light', // Always default to light mode
    // Ensure all default properties are set
    contrast: settings.contrast ?? 'default',
    primaryColor: settings.primaryColor ?? 'default',
    navLayout: settings.navLayout ?? 'horizontal',
    navColor: settings.navColor ?? 'integrate',
    direction: settings.direction ?? 'ltr',
    compactLayout: settings.compactLayout ?? false, // Default to false for minimal
    fontFamily: settings.fontFamily ?? 'Public Sans',
  };
  
  const values = useLocalStorage(STORAGE_KEY, defaultSettingsWithLightMode);
  
  // Reset to defaults on mount and ensure all settings are properly initialized
  useEffect(() => {
    // Always enforce light mode - override any saved dark mode preference
    if (values.state.colorScheme !== 'light') {
      values.setField('colorScheme', 'light');
    }
    // Ensure all settings have default values - only set if missing
    const currentState = values.state;
    
    // Only update if settings are missing (not if they're different from defaults)
    // This allows users to customize settings while ensuring defaults exist
    if (!currentState.contrast) {
      values.setField('contrast', 'default');
    }
    if (!currentState.primaryColor) {
      values.setField('primaryColor', 'default');
    }
    if (!currentState.navLayout) {
      values.setField('navLayout', 'horizontal');
    }
    if (!currentState.navColor) {
      values.setField('navColor', 'integrate');
    }
    if (!currentState.direction) {
      values.setField('direction', 'ltr');
    }
    if (currentState.compactLayout === undefined) {
      values.setField('compactLayout', false);
    }
    if (!currentState.fontFamily) {
      values.setField('fontFamily', 'Public Sans');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  // Wrapper to block dark mode changes (but allow nav layout changes)
  const onUpdateFieldWrapper = useCallback(
    (name, updateValue) => {
      // Block dark mode - always use light mode
      if (name === 'colorScheme' && updateValue === 'dark') {
        values.setField('colorScheme', 'light');
        return;
      }
      // Allow nav layout changes
      values.setField(name, updateValue);
    },
    [values]
  );

  const memoizedValue = useMemo(
    () => ({
      ...values.state,
      colorScheme: 'light', // Always force light mode
      canReset: values.canReset,
      onReset: values.resetState,
      onUpdate: values.setState,
      onUpdateField: onUpdateFieldWrapper,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
    }),
    [
      values.canReset,
      values.resetState,
      values.setState,
      values.state,
      onUpdateFieldWrapper,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
