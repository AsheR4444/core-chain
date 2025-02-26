import path from "path"

import { createDefaultConfig } from "./create-config"
import { Config } from "./helpers"

const ROOT_DIR = path.resolve()
const SRC_DIR = path.join(ROOT_DIR, "src")
const DB_PATH = path.join(SRC_DIR, "files", "data.db")
const USER_DATA_PATH = path.join(SRC_DIR, "files")
const CSV_DATA_PATH = path.join(USER_DATA_PATH, "wallets.csv")
const CONFIG_PATH = path.join(SRC_DIR, "files", "config.yaml")
const CONFIG = createDefaultConfig()

export { CONFIG,type Config,CONFIG_PATH,createDefaultConfig,CSV_DATA_PATH, DB_PATH, ROOT_DIR, SRC_DIR, USER_DATA_PATH }
