import chalk from "chalk"
import { parse } from "csv-parse/sync"
import fs from "fs"

import { CSV_DATA_PATH } from "@/features/config"
import { getWallet, getWallets, Wallet } from "@/features/db"
import { Client } from "@/libs/eth-async"

const importWallets = async () => {
  if (!fs.existsSync(CSV_DATA_PATH)) {
    console.log(chalk.red(`CSV file not found at path: ${CSV_DATA_PATH}`))
    return
  }

  const fileContent = fs.readFileSync(CSV_DATA_PATH, "utf-8")
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  })

  let imported = 0
  let edited = 0
  const total = (await getWallets()).length

  for (const wallet of records) {
    const walletInstance = await getWallet(wallet["private key"])

    if (walletInstance && (walletInstance.proxy !== wallet.proxy || walletInstance.name !== wallet.name)) {
      await Wallet.update({ proxy: wallet.proxy, name: wallet.name }, { where: { privateKey: wallet["private key"] } })
      ++edited
    }

    if (!walletInstance) {
      const client = new Client(wallet["private key"])

      await Wallet.create({ ...wallet, address: client.signer.address, privateKey: wallet["private key"] })
      ++imported
    }
  }

  console.log("----------")
  console.log()
  console.log(chalk.green("Done!"))
  console.log(chalk.green(`Imported wallets from CSV: ${imported}/${total}`))
  console.log(chalk.green(`Changed wallets: ${edited}/${total}`))
  console.log(chalk.green(`Total: ${total}`))
  console.log()
  console.log("----------")
}

export { importWallets }
