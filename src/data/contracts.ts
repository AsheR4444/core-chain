import { BaseTokens, DefaultABIs, RawContract } from "@/libs/eth-async"

import CORE_ABI from "./abis/core-abi.json"

class CoreContracts {
  static BITFLUX = new RawContract("0x4bcb9Ea3dACb8FfE623317E0B102393A3976053C", CORE_ABI, "BitFlux")
}

class CoreTokens extends BaseTokens {
  static WBTC = new RawContract("0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd", DefaultABIs.Token, "WBTC")
  static SolvBTC_B = new RawContract("0x5b1fb849f1f76217246b8aaac053b5c7b15b7dc3", DefaultABIs.Token, "SolvBTC.b")
  static SolvBTC_CORE = new RawContract("0x9410e8052bc661041e5cb27fdf7d9e9e842af2aa", DefaultABIs.Token, "SolvBTC.core")
}

export { CoreContracts, CoreTokens }
