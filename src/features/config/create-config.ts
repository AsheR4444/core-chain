import fs from "fs"
import { load } from "js-yaml"
import path from "path"

import { Config, validateConfig } from "./helpers"
import { CONFIG_PATH } from "."

const createDefaultConfig = (): Config => {
  if (fs.existsSync(CONFIG_PATH)) {
    const existingConfig = fs.readFileSync(CONFIG_PATH, "utf-8")
    const config = load(existingConfig) as Config
    validateConfig(config)
    return config
  }

  const configContent = `settings:
  # number of retries for ANY action
  attempts: 3

  # pause in seconds between actions
  random_pause_between_actions: [10, 20]
# --------------------------- #
onchain:
  # minimal balance in CORE to continue
  minimal_balance: 1
`

  const configDir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  fs.writeFileSync(CONFIG_PATH, configContent, "utf8")

  const config = load(configContent) as Config
  validateConfig(config)
  return config
}

export { createDefaultConfig }
