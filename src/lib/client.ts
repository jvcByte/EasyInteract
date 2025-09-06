import { createPublicClient, createWalletClient, custom, http, type Chain } from 'viem'
import * as allChains from 'viem/chains'
import { ethereum_window } from './helperFunctions'
import { type EthereumProvider } from './types'
/**
 * Type for supported chains
 */
type ChainName = keyof typeof allChains

/**
 * Interface for public client properties
 */
interface PublicClientProps {
  chainName: ChainName
  rpcUrl?: string
}

/**
 * Creates a public client for a specific chain
 * @param chainName - The name of the chain to create a client for
 * @param rpcUrl - The URL of the RPC endpoint for the chain
 * @returns The public client for the specified chain
 */
function publicClient({
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

function walletClient({
  chainName,
  ...props
}: PublicClientProps) {
  const chain = allChains[chainName] as Chain

  return createWalletClient({
    chain,
    transport: custom(ethereum_window as EthereumProvider),
    ...props
  })
}

/**
 * Export all available chains for UI selection
 * @returns An array of objects containing chain information
 */
const availableChains = Object.entries(allChains).map(([name, chain]) => ({
  id: name,
  name: chain.name,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: chain.rpcUrls
}))

export {
  publicClient,
  walletClient,
  availableChains
}

export type {
  ChainName,
}