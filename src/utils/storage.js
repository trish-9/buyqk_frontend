const STORAGE_PREFIX = 'buyqk_'

export function loadData(key, fallback = []) {
  try {
    const saved = localStorage.getItem(
      `${STORAGE_PREFIX}${key}`
    )

    if (!saved) {
      return fallback
    }

    const parsed = JSON.parse(saved)

    return parsed
  } catch (error) {
    console.error(
      `Failed to load ${key}:`,
      error
    )

    return fallback
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(data)
    )

    return true
  } catch (error) {
    console.error(
      `Failed to save ${key}:`,
      error
    )

    return false
  }
}

export function removeData(key) {
  try {
    localStorage.removeItem(
      `${STORAGE_PREFIX}${key}`
    )

    return true
  } catch (error) {
    console.error(
      `Failed to remove ${key}:`,
      error
    )

    return false
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`
}