import { ethers } from "ethers"
import { HttpsProxyAgent } from "https-proxy-agent"

import { Network, Networks } from "./data/models"
import { Contracts } from "./contracts"
import { Transactions } from "./transactions"
import { Wallet } from "./wallet"

class Client {
  network: Network
  proxy: string
  provider: ethers.JsonRpcProvider
  signer: ethers.Wallet
  contracts: Contracts
  transactions: Transactions
  wallet: Wallet
  // axiosInstance: AxiosInstance

  constructor(
    privateKey: string | null = null,
    network: Network = Networks.SaharaAI,
    proxy: string = "",
    checkProxy: boolean = false,
  ) {
    this.network = network
    this.proxy = proxy
    const fetchRequest = new ethers.FetchRequest(this.network.rpc)
    if (this.proxy) {
      if (!this.proxy.includes("://")) {
        this.proxy = `http://${this.proxy}`
      }
      // if (checkProxy) {
      //   const proxyConfig = getProxyConfigAxios(this.proxy)
      //   axios
      //     .get("http://eth0.me/", proxyConfig)
      //     .then((response) => {
      //       const yourIp = response.data.trim()
      //       console.log(yourIp)
      //       if (!this.proxy?.includes(yourIp)) {
      //         throw new exceptions.InvalidProxy(`Proxy doesn't work! Your IP is ${yourIp}.`)
      //       }
      //     })
      //     .catch((error) => {
      //       throw new exceptions.InvalidProxy(`Proxy doesn't work! Error: ${error.message}`)
      //     })
      // }
      const agent = new HttpsProxyAgent(proxy)
      fetchRequest.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({ agent: agent })
    }
    this.provider = new ethers.JsonRpcProvider(fetchRequest)
    if (!privateKey) privateKey = ethers.Wallet.createRandom().privateKey
    this.signer = new ethers.Wallet(privateKey, this.provider)
    this.contracts = new Contracts(this)
    this.transactions = new Transactions(this)
    this.wallet = new Wallet(this)
    //this.axiosInstance = createAxiosInstance(proxy)
  }
}

export { Client }
