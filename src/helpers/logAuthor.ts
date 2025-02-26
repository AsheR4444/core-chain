import chalk from "chalk"
import figlet from "figlet"

const logAuthor = () => {
  console.log(chalk.hex("#955bc9")(figlet.textSync("DegenCoding", { font: "Modular" })))

  console.log()
  console.log(
    chalk.hex("#3997fb").bold.underline("Telegram") + ": " + chalk.hex("#eb1c6c").underline("https://t.me/degencoding"),
  )
  console.log()
}

export { logAuthor }
