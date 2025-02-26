import { existsSync, writeFileSync } from "fs"
import { join } from "path"

import { CSV_DATA_PATH } from "@/features/config"

export const writeJsonToFile = (data: unknown, filename: string) => {
  try {
    const filePath = join(process.cwd(), filename)
    writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`Data written to ${filePath}`)
  } catch (error) {
    console.error(`Error writing to file: ${error}`)
  }
}

export const sleep = (sec: number) => {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000))
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const createCsvTemplate = () => {
  if (existsSync(CSV_DATA_PATH)) {
    return
  }

  const headers = ["name", "private key", "proxy"]
  const csvContent = headers.join(",") + "\n"

  writeFileSync(CSV_DATA_PATH, csvContent, "utf-8")
}
