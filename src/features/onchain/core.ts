import Decimal from "decimal.js"
import { TransactionRequest } from "ethers"

import { CoreContracts, CoreTokens } from "@/data/contracts"
import { logger, retry, sleep } from "@/helpers"
import { Client, RawContract, TxArgs } from "@/libs/eth-async"

class Core {
  private name: string
  private client: Client

  constructor(name: string, client: Client) {
    this.name = name
    this.client = client
  }

  private getTokenIndex(token: { address: string }): number {
    if (token.address === CoreTokens.SolvBTC_B.address) return 0
    if (token.address === CoreTokens.SolvBTC_CORE.address) return 1
    if (token.address === CoreTokens.WBTC.address) return 2
    throw new Error("Invalid token address")
  }

  private async calculateSwap({ fromTokenAddress, fromTokenIndex, toTokenIndex } : {fromTokenAddress: string, fromTokenIndex: number, toTokenIndex: number}) {
    const contract = await this.client.contracts.get(CoreContracts.BITFLUX)
    const dxAmount = await this.client.wallet.balance(fromTokenAddress)

    const calculateSwapFunction = contract.getFunction("calculateSwap")
    const result = await calculateSwapFunction.staticCall(fromTokenIndex, toTokenIndex, dxAmount.Wei)

    return result
  }

  private async getTokenWithHighestBalance() {
    const tokens = CoreTokens.getAllTokens()

    const balances = await Promise.all(tokens.map(async token => {
      const balance = await this.client.wallet.balance(token.address)
      return { token, balance }
    }))

    const sortedBalances = balances.sort((a, b) => new Decimal(b.balance.Wei.toString()).minus(new Decimal(a.balance.Wei.toString())).toNumber())
    return sortedBalances[0].token
  }

  @retry("Swap on BitFlux")
  private async _swap({ fromToken, toToken }: {fromToken: RawContract, toToken: RawContract}) {
    logger.info(`${this.name} | Swap ${fromToken.title} to ${toToken.title}`)

    if (fromToken.address === toToken.address) throw new Error("fromToken and toToken cannot be the same")
    const fromTokenIndex = this.getTokenIndex(fromToken)
    const toTokenIndex = this.getTokenIndex(toToken)

    const contract = await this.client.contracts.get(CoreContracts.BITFLUX)

    const dxAmount = await this.client.wallet.balance(fromToken.address)
    const minDy = await this.calculateSwap({ fromTokenAddress: fromToken.address, fromTokenIndex: fromTokenIndex, toTokenIndex: toTokenIndex })

    const approvedAmount = await this.client.transactions.approvedAmount(fromToken, CoreContracts.BITFLUX)
    const isNeedApprove = new Decimal(approvedAmount.Wei.toString()).lt(new Decimal(dxAmount.Wei.toString()))

    if (isNeedApprove) {
      await this.client.transactions.approve(fromToken, CoreContracts.BITFLUX, dxAmount)
      await sleep(2)
    }

    const args = new TxArgs({
      tokenIndexFrom: fromTokenIndex,
      tokenIndexTo: toTokenIndex,
      dx: dxAmount.Wei,
      minDy: minDy,
      deadline: new Date().setSeconds(new Date().getSeconds() + 10),
    })

    const txParams: TransactionRequest = {
      to: CoreContracts.BITFLUX.address,
      data: contract.interface.encodeFunctionData("swap", args.tuple()),
      value: 0n,
    }

    try {
      const receipt = await this.client.transactions.sendTransactionAndWait(txParams)

      if (receipt && receipt.status === 1) {
        logger.success(`${this.name} | Swap on BitFlux: ${this.client.network.explorer}tx/${receipt.hash}`)
        return true
      }

      return false
    } catch (error) {
      //console.log(error)
      return false
    }
  }

  async swap() {
    const tokenWithHighestBalance = await this.getTokenWithHighestBalance()
    const toToken = CoreTokens.getRandomToken(tokenWithHighestBalance)

    return await this._swap({ fromToken: tokenWithHighestBalance, toToken: toToken })
  }
}

export { Core }
