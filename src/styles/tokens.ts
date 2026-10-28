/**
 * TS에서 참조하는 디자인 토큰 (지도 마커/폴리라인 색 등 CSS 밖에서 필요한 값).
 * 값은 _tokens.scss 와 동일하게 유지한다.
 */
export const colors = {
  coral: '#F88379',
  coralPressed: '#CC5146',
  coralPressed2: '#F49780',
  coral2: '#FDD6D2',
  coral3: '#FFEAE6',
  coralStroke: '#FFB19D',
  coralBackground: '#FFFBFB',
  green: '#06BA00',
  divider: '#FAEEED',
  red: '#FF4144',
  brown: '#49251C',
  black: '#1A1A1A',
  gray900: '#2E2B2C',
  gray800: '#5B5658',
  gray600: '#7B7578',
  gray400: '#A89EA1',
  gray200: '#D9D2D4',
  gray100: '#F0EDEE',
  white: '#FFFFFF',
} as const

export type ColorToken = keyof typeof colors

export const typographyVariants = [
  'title-l',
  'title-l-bold',
  'title-m',
  'title-m-bold',
  'title-s',
  'title-s-bold',
  'body-l',
  'body-l-bold',
  'body-m',
  'body-m-medium',
  'body-m-bold',
  'body-m-regular',
  'body-m-regular-bold',
  'body-s',
  'body-s-medium',
  'body-s-bold',
  'caption',
  'caption-bold',
  'caption-s',
  'caption-s-bold',
  'card-myungjo',
] as const

export type TypographyVariant = (typeof typographyVariants)[number]

export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const
