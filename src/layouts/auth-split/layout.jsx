import { useBoolean } from 'src/hooks/use-boolean';

import { Section } from './section';
import { Main, Content } from './main';
import { HeaderBase } from '../core/header-base';
import { LayoutSection } from '../core/layout-section';

// ----------------------------------------------------------------------

export function AuthSplitLayout({ sx, section, children }) {
  const mobileNavOpen = useBoolean();

  const layoutQuery = 'md';

  return (
    <LayoutSection
      headerSection={
        /** **************************************
         * Header
         *************************************** */
        <HeaderBase
          disableElevation
          layoutQuery={layoutQuery}
          onOpenNav={mobileNavOpen.onTrue}
          slotsDisplay={{
            signIn: false,
            account: false,
            purchase: false,
            contacts: false,
            searchbar: false,
            workspaces: false,
            menuButton: false,
            localization: false,
            notifications: false,
            settings: false,
          }}
          slotProps={{
            container: { maxWidth: false },
            toolbar: {
              sx: {
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                px: { xs: 2, sm: 3, md: 4 },
              },
            },
          }}
          sx={{
            position: { [layoutQuery]: 'fixed' },
            backgroundColor: '#FFFFFF',
          }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      sx={{
        backgroundColor: '#FFFFFF',
        ...sx,
      }}
      cssVars={{
        '--layout-auth-content-width': '480px',
      }}
    >
      <Main layoutQuery={layoutQuery}>
        <Section
          title={section?.title}
          layoutQuery={layoutQuery}
          imgUrl={section?.imgUrl}
          subtitle={section?.subtitle}
        />
        <Content layoutQuery={layoutQuery}>{children}</Content>
      </Main>
    </LayoutSection>
  );
}
