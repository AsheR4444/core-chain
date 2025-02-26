import { Op } from "sequelize"

import { CONFIG } from "@/features/config"
import { Controller } from "@/features/controller"
import { getNextWallet, updateExpired,updateNextActionDate, Wallet  } from "@/features/db"
import { getRandomNumber, logger, sleep } from "@/helpers"
import { Networks } from "@/libs/eth-async"

const farm = async () => {
  await updateExpired()

  const nextWallet = await getNextWallet()
  await logger.info(`Wallet ${nextWallet?.name} | Next action date: ${nextWallet?.nextActionDate}`)

  while (true) {

    const wallet = await Wallet.findOne({
      where: {
        nextActionDate: {
          [Op.lt]: new Date(),
        },
      },
    })

    if (!wallet) {
      await sleep(10)
      continue
    }

    const controller = new Controller(wallet, { neededChain: Networks.Core })

    const nativeBalance = await controller.client.wallet.balance()

    if (nativeBalance.Ether.lessThan(CONFIG.onchain.minimal_balance)) {
      logger.error(`${wallet.name} | Not enough balance on Core chain. Need ${CONFIG.onchain.minimal_balance} ETH but have ${nativeBalance.Ether} ETH`)
    }

    const isSwapped = await controller.core.swap()

    if (isSwapped) {
      await updateNextActionDate(wallet.privateKey, getRandomNumber(CONFIG.settings.random_pause_between_actions[0], CONFIG.settings.random_pause_between_actions[1]))
      const nextWallet = await getNextWallet()
      await logger.info(`Wallet ${nextWallet?.name} | Next action date: ${nextWallet?.nextActionDate}`)
    }
  }
}

export { farm }
