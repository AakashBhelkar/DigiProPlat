import { useMemo, useState, useCallback, createContext, useEffect } from 'react';

import { useLocalStorage } from 'src/hooks/use-local-storage';

import { STORAGE_KEY } from '../config-settings';

// ----------------------------------------------------------------------

export const SettingsContext = createContext(undefined);

export const SettingsConsumer = SettingsContext.Consumer;

// ----------------------------------------------------------------------

export function SettingsProvider({ children, settings }) {
  // Force light mode and horizontal layout as default - override any saved preferences
  const defaultSettingsWithLightMode = {
    ...settings,
    colorScheme: 'light', // Always default to light mode
    navLayout: 'horizontal', // Always default to horizontal navigation
  };
  
  const values = useLocalStorage(STORAGE_KEY, defaultSettingsWithLightMode);
  
  // Force light mode and horizontal layout always - prevent any changes
  useEffect(() => {
    // Always enforce light mode - override any saved dark mode preference
    if (values.state.colorScheme !== 'light') {
      values.setField('colorScheme', 'light');
    }
    // Always enforce horizontal layout - override any saved vertical layout preference
    if (values.state.navLayout !== 'horizontal') {
      values.setField('navLayout', 'horizontal');
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

  // Wrapper to block dark mode and vertical layout changes
  const onUpdateFieldWrapper = useCallback(
    (name, updateValue) => {
      // Block dark mode - always use light mode
      if (name === 'colorScheme' && updateValue === 'dark') {
        values.setField('colorScheme', 'light');
        return;
      }
      // Block vertical/mini layout - always use horizontal layout
      if (name === 'navLayout' && (updateValue === 'vertical' || updateValue === 'mini')) {
        values.setField('navLayout', 'horizontal');
        return;
      }
      values.setField(name, updateValue);
    },
    [values]
  );

  const memoizedValue = useMemo(
    () => ({
      ...values.state,
      colorScheme: 'light', // Always force light mode
      navLayout: 'horizontal', // Always force horizontal layout
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
