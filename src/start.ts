import prompts from "prompts"

import { CONFIG } from "@/features/config"
import { createDatabase } from "@/features/db"
import { createCsvTemplate, importWallets, logAuthor } from "@/helpers"

import { farm } from "./app"

import "dotenv/config"

export const THREADS = CONFIG.settings.threads

enum ActionEnum {
  IMPORT_CSV = "Import CSV",
  FARM = "Farm",
}

type Choice = {
  title: string;
  value: ActionEnum;
  description: string;
}

const handleAction = async (action: ActionEnum): Promise<void> => {
  switch (action) {
  case ActionEnum.IMPORT_CSV:
    await importWallets()
    return
  case ActionEnum.FARM:
    await farm()
    return
  }
}

const main = async () => {
  logAuthor()
  createCsvTemplate()
  await createDatabase()

  const response = await prompts({
    type: "select",
    name: "action",
    message: "Choose option",
    choices: [
      { title: "Import data from CSV", value: ActionEnum.IMPORT_CSV, description: "Import your wallets from CSV to DB" },
      { title: "Start farming", value: ActionEnum.FARM },
    ] as Choice[],
  }) as prompts.Answers<"action"> & { action: ActionEnum }

  await handleAction(response.action)
}

main()
