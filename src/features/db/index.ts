import { DataTypes, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from "sequelize"

import { DB_PATH } from "@/features/config"
import { shuffleArray } from "@/helpers"

import { updateExpired, updateNextActionDate } from "./update"

const DB = new Sequelize(`sqlite:///${DB_PATH}`, {
  dialect: "sqlite",
  storage: DB_PATH,
  logging: false,
})

class Wallet extends Model<InferAttributes<Wallet>, InferCreationAttributes<Wallet>> {
  declare privateKey: string
  declare name: string
  declare proxy: string
  declare nextActionDate: Date | null
  declare address: string
}

Wallet.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    privateKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proxy: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    nextActionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "wallets",
    sequelize: DB,
  },
)

const getEvmWallet = async (privateKey: string) => {
  const wallet = await Wallet.findOne({
    where: { privateKey },
  })

  return wallet
}

const getNextWallet = async () => {
  return await Wallet.findOne({
    where: {
      nextActionDate: {
        [Op.gte]: new Date(),
      },
    },
    order: [["nextActionDate", "ASC"]],
  })
}

const getWallets = async () => {
  return await Wallet.findAll()
}

/**
 * @deprecated
 * FOR TESTING PURPOSES ONLY
 * DO NOT USE IT ON PROD
 */
const getTestWallet = async () => {
  return await Wallet.findOne({
    where: {
      name: "main",
    },
  })
}

const createDatabase = async () => {
  await DB.sync()
}

const getWallet = async (privateKey: string) => {
  const wallet = await Wallet.findOne({
    where: { privateKey },
  })

  return wallet
}

const getShuffledWallets = async () => {
  const wallets = await getWallets()

  return shuffleArray(wallets)
}

export { createDatabase, DB, getEvmWallet, getNextWallet, getShuffledWallets, getTestWallet, getWallet, getWallets, updateExpired, updateNextActionDate,Wallet }
