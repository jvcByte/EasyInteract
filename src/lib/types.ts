type ByteString = `0x${string}`;

export interface EthereumProvider {
    request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
    on?: (eventName: string, listener: (...args: Array<any>) => void) => void;
    removeListener?: (
        eventName: string,
        listener: (...args: Array<any>) => void
    ) => void;
    isMetaMask?: boolean; //--> optional/in metaMask
    isCoinbaseWallet?: boolean; //--> optional/in coinbase wallet
    providers?: EthereumProvider[]; //--> optional/in Coinbase Wallet
    chainId?: string; //-->suggested by EIP-1193
}

type WindowEthereum = typeof window & {
    ethereum?: EthereumProvider;
};

interface CreateTaskProps {
    accounts: Array<ByteString>;
}

export type { ByteString, WindowEthereum, CreateTaskProps };