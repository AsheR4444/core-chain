import { Decimal } from "decimal.js"

function getRandomNumber(min: number, max: number, floor: boolean = false) {
  const minDecimal = new Decimal(min)
  const maxDecimal = new Decimal(max)

  const randomFraction = new Decimal(Math.random())

  const randomNumber = minDecimal.plus(randomFraction.times(maxDecimal.minus(minDecimal)))

  if (floor) return Math.floor(randomNumber.toNumber())

  return randomNumber.toNumber()
}

export { getRandomNumber }
