import { createPublicClient, http, type Chain } from 'viem'
import * as allChains from 'viem/chains'

// Type for supported chains
export type ChainName = keyof typeof allChains

interface PublicClientProps {
  chainName: ChainName
  rpcUrl?: string
}

export default function publicClient({ 
  chainName, 
  rpcUrl,
  ...props 
}: PublicClientProps) {
  const chain = allChains[chainName] as Chain
  
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
    ...props
  })
}

// Export all available chains for UI selection
export const availableChains = Object.entries(allChains).map(([name, chain]) => ({
  id: name,
  name: chain.name,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: chain.rpcUrls
}))