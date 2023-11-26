import { agent } from './setup.ts'

async function main() {
  const identifier = await agent.didManagerCreate({ alias: 'decentralinked' })
  console.log(`New identifier created`)
  console.log(JSON.stringify(identifier, null, 2))
}

main().catch(console.log)