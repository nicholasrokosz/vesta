import type { MantineThemeOverride } from '@mantine/core'

export const theme: MantineThemeOverride = {
  primaryColor: 'vesta',
  colors: {
    vesta: [
      '#FCFAFF',
      '#DFCAFC',
      '#D0B1FB',
      '#B98BF9',
      '#8434F4',
      '#9B5AF6',
      '#8434F4',
      '#620BDA',
      '#4C09AA',
      '#3B0783',
    ],
    neutral: [
      '#F9FAFA',
      '#F4F4F6',
      '#E6E7EA',
      '#D2D5DA',
      '#9DA3AF',
      '#6A7181',
      '#4E545F',
      '#3E434C',
      '#272A30',
      '#191B1F',
    ],
  },
  spacing: {
    xxxs: '0.125rem',
    xxs: '0.25rem',
    xs: '.5rem',
    s: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
    xxxl: '4rem',
  },
  globalStyles: () => ({
    a: {
      textDecoration: 'none',
    },
  }),
  components: {
    Text: {
      defaultProps: (theme) => ({
        fz: theme.fontSizes.sm,
      }),
    },
    Indicator: {
      defaultProps: (theme) => ({
        size: theme.fontSizes.md,
      }),
    },
    Avatar: {
      defaultProps: (theme) => ({
        color: theme.colors.vesta,
      }),
    },
  },
}
