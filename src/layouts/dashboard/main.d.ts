import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

export interface MainProps {
  children?: ReactNode;
  isNavHorizontal?: boolean;
  sx?: SxProps<Theme>;
  [key: string]: any;
}

export interface DashboardContentProps {
  sx?: SxProps<Theme>;
  children?: ReactNode;
  disablePadding?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  [key: string]: any;
}

export function Main(props: MainProps): JSX.Element;
export function DashboardContent(props: DashboardContentProps): JSX.Element;

