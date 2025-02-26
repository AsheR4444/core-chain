import axios from "axios"
import Decimal from "decimal.js"
import { ethers } from "ethers"

class WrongChainID extends Error {}
class WrongCoinSymbol extends Error {}

class TokenAmount {
  Wei: bigint
  // todo: поправить тип у Ether
  Ether: Decimal
  decimals: number

  constructor(amount: bigint | number | string, decimals: number | bigint = 18, wei: boolean = false) {
    const strAmount = amount.toString()
    this.decimals = Number(decimals)

    if (wei) {
      this.Wei = BigInt(amount)
      this.Ether = new Decimal(strAmount).div(new Decimal(10).pow(this.decimals))
    } else {
      this.Wei = BigInt(new Decimal(strAmount).mul(new Decimal(10).pow(this.decimals)).ceil().toString())
      this.Ether = new Decimal(strAmount)
    }
  }

  toString(): string {
    return this.Ether.toString()
  }
}

class TxArgs {
  private args: Record<string, any>

  /**
   * An instance for named transaction arguments.
   *
   * @param kwargs Named arguments of a contract transaction.
   */
  constructor(kwargs: Record<string, any>) {
    this.args = { ...kwargs }
  }

  /**
   * Get list of transaction arguments.
   *
   * @returns List of transaction arguments.
   */
  list(): any[] {
    return Object.values(this.args)
  }

  /**
   * Get tuple of transaction arguments.
   *
   * @returns Tuple of transaction arguments.
   */
  tuple(): [string, ...any[]] {
    return Object.values(this.args) as [string, ...any[]]
  }
}

interface ABIElement {
  [key: string]: any
}

class RawContract {
  title: string
  address: string
  abi: ABIElement[]

  /**
   * Initialize the class.
   *
   * @param address - A contract address.
   * @param abi - An ABI of the contract.
   * @param title - A contract title.
   */
  constructor(address: string, abi: ABIElement[] | string | null = null, title: string = "") {
    this.title = title
    this.address = ethers.getAddress(address)
    this.abi = typeof abi === "string" ? JSON.parse(abi) : abi || []
  }

  /**
   * Compare two RawContract instances.
   *
   * @param other - Another RawContract instance.
   * @returns True if the instances are equal, otherwise false.
   */
  equals(other: RawContract): boolean {
    return this.address === other.address && JSON.stringify(this.abi) === JSON.stringify(other.abi)
  }
}

type ABIEntry = {
  constant?: boolean
  inputs: { name: string; type: string }[]
  name: string
  outputs: { name: string; type: string }[]
  payable: boolean
  stateMutability: "view" | "nonpayable" | "payable" | "pure"
  type: "function" | "constructor" | "event" | "fallback"
}

class DefaultABIs {
  static Token: ABIEntry[] = [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [{ name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ name: "remaining", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
      ],
      name: "approve",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ]
}

export { ABIEntry, DefaultABIs }

class Network {
  name: string
  rpc: string
  decimals: number
  chainId: bigint
  txType: number
  coinSymbol: string
  explorer: string

  constructor(
    name: string,
    rpc: string,
    decimals: number | null = null,
    chainId: bigint | null = null,
    txType: number = 0,
    coinSymbol: string | null = null,
    explorer: string = "",
  ) {
    this.name = name
    this.rpc = rpc
    this.txType = txType
    this.explorer = explorer

    if (!chainId) {
      try {
        const provider = new ethers.JsonRpcProvider(this.rpc)
        provider.getNetwork().then((network) => {
          chainId = network.chainId
          this.chainId = chainId
        })
      } catch (err) {
        throw new WrongChainID(`Can not get chain id: ${err}`)
      }
    }
    this.chainId = chainId as bigint

    if (!coinSymbol || !decimals) {
      try {
        axios
          .get("https://chainid.network/chains.json")
          .then((response) => {
            let network = null
            const networksInfoResponse = response.data
            for (const network_ of networksInfoResponse) {
              if (network_["chainId"] === this.chainId) {
                network = network_
                break
              }
            }

            if (!coinSymbol) {
              this.coinSymbol = network!["nativeCurrency"]["symbol"]
            }
            if (!decimals) {
              this.decimals = parseInt(network!["nativeCurrency"]["decimals"])
            }
          })
          .catch((err) => {
            throw new WrongCoinSymbol(`Can not get coin symbol: ${err}`)
          })
      } catch (err) {
        throw new WrongCoinSymbol(`Can not get coin symbol: ${err}`)
      }
    }
    this.coinSymbol = coinSymbol as string
    this.decimals = decimals as number

    if (coinSymbol) {
      this.coinSymbol = coinSymbol.toUpperCase()
    }
  }
}

class Networks {
  // Mainnets
  static Ethereum = new Network("Ethereum", "https://rpc.ankr.com/eth/", 18, 1n, 2, "ETH", "https://etherscan.io/")

  static Arbitrum = new Network(
    "Arbitrum",
    "https://rpc.ankr.com/arbitrum/",
    18,
    42161n,
    2,
    "ETH",
    "https://arbiscan.io/",
  )

  static ArbitrumNova = new Network(
    "Arbitrum_nova",
    "https://nova.arbitrum.io/rpc/",
    18,
    42170n,
    2,
    "ETH",
    "https://nova.arbiscan.io/",
  )

  static Optimism = new Network(
    "optimism",
    "https://rpc.ankr.com/optimism/",
    18,
    10n,
    2,
    "ETH",
    "https://optimistic.etherscan.io/",
  )

  static BSC = new Network("BSC", "https://rpc.ankr.com/bsc/", 18, 56n, 0, "BNB", "https://bscscan.com/")

  static Polygon = new Network(
    "Polygon",
    "https://rpc.ankr.com/polygon/",
    18,
    137n,
    2,
    "MATIC",
    "https://polygonscan.com/",
  )

  static Lisk = new Network("Lisk", "https://rpc.api.lisk.com/", 18, 1135n, 2, "ETH", "https://blockscout.lisk.com/")

  static SaharaAI = new Network("SaharaAI", "https://testnet.saharalabs.ai/", 18, 313313n, 0, "SAH", "https://testnet-explorer.saharalabs.ai/")

  static Base = new Network("Base", "https://mainnet.base.org", 18, 8453n, 2, "ETH", "https://basescan.org/")

  static Eclipse = new Network(
    "Eclipse",
    "https://eclipse.helius-rpc.com",
    9,
    9286185n,
    2,
    "ETH",
    "https://eclipsescan.xyz/",
  )

  static Core = new Network(
    "Core",
    "https://1rpc.io/core",
    18,
    1116n,
    2,
    "CORE",
    "https://scan.coredao.org/",
  )
}

class BaseTokens {
  static getRandomToken(excludeToken?: RawContract): RawContract {
    const allTokens = this.getAllTokens()

    const availableTokens = excludeToken ? allTokens.filter(token => token.address !== excludeToken.address) : allTokens

    const randomIndex = Math.floor(Math.random() * availableTokens.length)
    return availableTokens[randomIndex]
  }

  static getAllTokens(): RawContract[] {
    return Object.entries(this)
      .filter(([_, value]) => typeof value !== "function")
      .map(([_, value]) => value as RawContract)
  }
}

export { BaseTokens,Network, Networks, RawContract, TokenAmount, TxArgs, WrongChainID, WrongCoinSymbol }
