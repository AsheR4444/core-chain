import { CONFIG } from "@/features/config"

import { sleep } from "./functions"
import { logger } from "./logger"

const retry = (actionName: string) => {
  return function(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const walletName = (this as any).name

      for (let attempt = 1; attempt <= CONFIG.settings.attempts; attempt++) {
        try {
          const result = await originalMethod.apply(this, args)
          if (result) {
            if (attempt > 1) {
              logger.success(
                `${walletName} | ${actionName} succeeded on attempt ${attempt}`,
              )
            }
            return true
          }
        } catch (error) {
          logger.error(
            `${walletName} | ${actionName} attempt ${attempt} failed: ${error}`,
          )
        }

        if (attempt < CONFIG.settings.attempts) {
          logger.info(
            `${walletName} | Retrying ${actionName} (attempt ${attempt + 1}/${
              CONFIG.settings.attempts
            })`,
          )
          await sleep(5)
        }
      }

      logger.error(
        `${walletName} | ${actionName} failed after ${CONFIG.settings.attempts} attempts`,
      )
      return false
    }

    return descriptor
  }
}

export { retry }
