import { Wallet } from "@/features/db"
import { Core } from "@/features/onchain/core"
import { Client, Network } from "@/libs/eth-async"

export class Controller {
  core: Core
  client: Client

  constructor(wallet: Wallet, { neededChain }: { neededChain: Network }) {
    this.client = new Client(wallet.privateKey, neededChain, wallet.proxy)
    this.core = new Core(wallet.name, this.client)
  }
}
