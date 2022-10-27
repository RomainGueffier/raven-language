import fs from 'node:fs'
import readline from 'node:readline'
import main from './main'

const args = process.argv?.slice(2)

if (args?.[0] === '-f' && args?.[1]) {
  const source = fs.readFileSync(args?.[1], 'utf8')
  main(source)
  process.exit(0)
}

// prompt mode
if (args?.length === 0) {
  const repl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const prompt = () => {
    repl.question('💲 ', (input) => {
      if (!input) process.exit(0)
      if (input.trim() === 'exit') repl.close()
      main(input)
      prompt()
    })
  }

  repl.on('close', () => {
    console.log('\n👋 bye from RAVEN!')
    process.exit(0)
  })
  prompt()
} else {
  console.log('Bad parameters given')
  process.exit(1)
}
