import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from '../../routes/components';
import { LoginIllustration } from '../../components/illustrations/login-illustration';

import { CONFIG } from '../../config-global';

// ----------------------------------------------------------------------

export function Section({
  sx,
  method,
  layoutQuery,
  methods,
  title = 'Manage the job',
  imgUrl = `${CONFIG.site.basePath}/assets/illustrations/illustration-dashboard.webp`,
  subtitle = 'More effectively with optimized workflows.',
  ...other
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: '#F8FAFC',
        px: { xs: 3, md: 5 },
        pb: 3,
        width: 1,
        maxWidth: { md: 480 },
        display: 'none',
        position: 'relative',
        pt: 'var(--layout-header-desktop-height)',
        [theme.breakpoints.up(layoutQuery)]: {
          gap: 6,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 400,
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: '#1C252E',
            fontWeight: 700,
            fontSize: { md: '2.5rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            mb: 2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: '#637381',
              fontSize: '1.125rem',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        <LoginIllustration
          width="100%"
          height="auto"
          sx={{
            maxWidth: 500,
            filter: 'drop-shadow(0 4px 12px rgba(26, 31, 58, 0.1))',
          }}
        />
      </Box>

      {!!methods?.length && method && (
        <Box component="ul" gap={2} display="flex" sx={{ mt: 4 }}>
          {methods.map((option) => {
            const selected = method === option.label.toLowerCase();

            return (
              <Box
                key={option.label}
                component="li"
                sx={{
                  ...(!selected && {
                    cursor: 'not-allowed',
                    filter: 'grayscale(1)',
                  }),
                }}
              >
                <Tooltip title={option.label} placement="top">
                  <Link
                    component={RouterLink}
                    href={option.path}
                    sx={{
                      ...(!selected && { pointerEvents: 'none' }),
                    }}
                  >
                    <Box
                      component="img"
                      alt={option.label}
                      src={option.icon}
                      sx={{ width: 32, height: 32 }}
                    />
                  </Link>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
