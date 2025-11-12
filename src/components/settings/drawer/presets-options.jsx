import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { alpha as hexAlpha } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { varAlpha } from 'src/theme/styles';

import { Block } from './styles';
import { SvgColor } from '../../svg-color';

// ----------------------------------------------------------------------

export function PresetsOptions({ value, options, onClickOption }) {
  const theme = useTheme();
  
  return (
    <Block title="Presets">
      <Box component="ul" gap={1.5} display="grid" gridTemplateColumns="repeat(3, 1fr)">
        {options.map((option) => {
          const selected = value === option.name;

          return (
            <Box component="li" key={option.name} sx={{ display: 'flex' }}>
              <ButtonBase
                onClick={() => onClickOption(option.name)}
                sx={{
                  width: 1,
                  height: 64,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  color: option.value,
                  '&:hover': {
                    borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
                  },
                  ...(selected && {
                    bgcolor: hexAlpha(option.value, 0.08),
                    borderColor: option.value,
                    boxShadow: theme.shadows[2],
                  }),
                }}
              >
                <SvgColor
                  src={`${CONFIG.site.basePath}/assets/icons/setting/ic-siderbar-duotone.svg`}
                  sx={{ width: 28, height: 28, color: 'currentColor' }}
                />
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Block>
  );
}
