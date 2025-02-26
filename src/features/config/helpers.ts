import fs from "fs"
import { load } from "js-yaml"
import { resolve } from "path"

import { CONFIG_PATH } from "."

type FromTo = [number, number]

type Settings = {
  threads: number;
  attempts: number;
  random_pause_between_actions: FromTo;
}

type Onchain = {
  minimal_balance: number;
}

export type Config = {
  settings: Settings;
  onchain: Onchain;
}

export const readConfig = (): Config => {
  try {
    const configPath = resolve(CONFIG_PATH)
    const fileContent = fs.readFileSync(configPath, "utf-8")
    const config = load(fileContent) as Config

    // Validate config here if needed
    validateConfig(config)

    return config
  } catch (error) {
    throw new Error(`Failed to read config: ${error}`)
  }
}

export const validateConfig = (config: Config): void => {
  // Validate settings
  if (!config.settings.attempts)
    throw new Error("Missing attempts in settings")

  // Validate onchain settings
  if (!config.onchain) throw new Error("Missing onchain settings")
  if (typeof config.onchain.minimal_balance !== "number")
    throw new Error("Invalid minimal_balance format")
}
