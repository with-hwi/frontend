// Trabuddy 브랜드 색상 정의
export const trabuddyColors = {
  // Forest Green (Primary)
  primary: {
    50: '#f8f8f0',
    100: '#f0f0e0',
    200: '#e6e6cc',
    300: '#d4d4a6',
    400: '#c0c080',
    500: '#a8a868', // 기본 Forest Green
    600: '#9d9d60',
    700: '#7a7a40',
    800: '#565620',
    900: '#333300',
  },
  // Warm Beige (Secondary)
  secondary: {
    50: '#fdfcfa',
    100: '#faf6f0',
    200: '#f4ebe0',
    300: '#ead5c1',
    400: '#ddc0a2',
    500: '#c9a882', // 기본 Warm Beige
    600: '#b8956f',
    700: '#9d7c56',
    800: '#7a6147',
    900: '#5a4735',
  },
  // Coral Salmon (Accent)
  accent: {
    50: '#fef7f4',
    100: '#feeee8',
    200: '#fddad0',
    300: '#fabaa8',
    400: '#f69a80',
    500: '#f07b5c', // 기본 Coral Salmon
    600: '#e85d3d',
    700: '#d14426',
    800: '#b73620',
    900: '#962f1e',
  },
} as const

// 컴포넌트에서 사용하기 쉬운 색상 별칭
export const brandColors = {
  primary: trabuddyColors.primary[500],
  primaryHover: trabuddyColors.primary[600],
  primaryActive: trabuddyColors.primary[700],

  secondary: trabuddyColors.secondary[500],
  secondaryHover: trabuddyColors.secondary[600],
  secondaryActive: trabuddyColors.secondary[700],

  accent: trabuddyColors.accent[500],
  accentHover: trabuddyColors.accent[600],
  accentActive: trabuddyColors.accent[700],

  // 배경색
  background: trabuddyColors.secondary[50],
  surface: trabuddyColors.secondary[100],

  // 텍스트 색상
  textPrimary: trabuddyColors.primary[900],
  textSecondary: trabuddyColors.secondary[700],
  textMuted: trabuddyColors.secondary[600],
} as const
