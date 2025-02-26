import chalk from "chalk"
import { Op } from "sequelize"

import { getRandomNumber } from "@/helpers"

import { CONFIG } from "../config"

import { Wallet } from "./index"

const updateExpired = async () => {
  const now = new Date()

  const wallets = await Wallet.findAll({
    where: {
      [Op.or]: [{ nextActionDate: null }, { nextActionDate: { [Op.lt]: new Date() } }],
    },
  })

  if (!wallets.length) return

  for (const { privateKey, name } of wallets) {
    const randomSeconds = getRandomNumber(0, CONFIG.settings.random_pause_between_actions[1] / 2) * 1000
    const nextActionDate = new Date(now.getTime() + randomSeconds)

    await Wallet.update(
      {
        nextActionDate,
      },
      {
        where: {
          privateKey,
        },
      },
    )

    console.log(chalk.green(`${name}: Action time was re-generated:`))
    console.log(chalk.green(`${nextActionDate}`))
  }
}

const updateNextActionDate = async (privateKey: string, seconds: number) => {
  try {
    const now = new Date()

    await Wallet.update(
      { nextActionDate: new Date(now.getTime() + seconds * 1000) },
      {
        where: {
          privateKey,
        },
      },
    )

    return true
  } catch (e) {
    return false
  }
}

export { updateExpired, updateNextActionDate }
