export interface PlanTheme {
  themeId: number
  label: string
}

let themeId = 0
const labels = ['선택 안 함', '힐링/휴식', '먹방', '혼자', '무계획', '레저/스포츠']

export const planThemes = labels.map((l) => ({ themeId: themeId++, label: l }) as PlanTheme)
