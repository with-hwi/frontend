import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Trabuddy 브랜드 색상을 PrimeVue 프리셋으로 정의
const TrabuddyPreset = definePreset(Aura, {
  primitive: {
    // Forest Green (Primary) 색상 팔레트
    forestgreen: {
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
    // Warm Beige (Secondary) 색상 팔레트
    warmbeige: {
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
    // Coral Salmon (Accent) 색상 팔레트
    coralsalmon: {
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
  },
  semantic: {
    // Primary 색상을 Forest Green으로 설정
    primary: {
      50: '{forestgreen.50}',
      100: '{forestgreen.100}',
      200: '{forestgreen.200}',
      300: '{forestgreen.300}',
      400: '{forestgreen.400}',
      500: '{forestgreen.500}',
      600: '{forestgreen.600}',
      700: '{forestgreen.700}',
      800: '{forestgreen.800}',
      900: '{forestgreen.900}',
      950: '{forestgreen.900}', // 950은 900과 동일하게 설정
    },
    // Coral Salmon을 액센트 색상으로 추가
    accent: {
      50: '{coralsalmon.50}',
      100: '{coralsalmon.100}',
      200: '{coralsalmon.200}',
      300: '{coralsalmon.300}',
      400: '{coralsalmon.400}',
      500: '{coralsalmon.500}',
      600: '{coralsalmon.600}',
      700: '{coralsalmon.700}',
      800: '{coralsalmon.800}',
      900: '{coralsalmon.900}',
      950: '{coralsalmon.900}',
    },
    // Surface 색상을 Warm Beige 계열로 설정
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{warmbeige.50}',
          100: '{warmbeige.100}',
          200: '{warmbeige.200}',
          300: '{warmbeige.300}',
          400: '{warmbeige.400}',
          500: '{warmbeige.500}',
          600: '{warmbeige.600}',
          700: '{warmbeige.700}',
          800: '{warmbeige.800}',
          900: '{warmbeige.900}',
          950: '{warmbeige.900}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
})

export default TrabuddyPreset
