export function toLocalDateTimeInput(date = new Date()) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000
  return new Date(localTime).toISOString().slice(0, 16)
}

export function isFutureDateTime(value, now = Date.now()) {
  return Boolean(value) && new Date(value).getTime() > now
}
