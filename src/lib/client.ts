import { createPublicClient, http } from 'viem'
import { celoAlfajores } from 'viem/chains'

export const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http()
})