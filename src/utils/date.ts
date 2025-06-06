export const serializeDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const deserializeDate = (dateString: string) => new Date(dateString)

// Get date only from date type, independent of timezone
export const getDateOnly = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  return new Date(Date.UTC(year, month, day))
}
