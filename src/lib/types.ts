/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Extend the global Window interface
declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

type WindowEthereum = Window & {
    ethereum?: EthereumProvider;
};

interface CreateTaskProps {
    accounts: Array<ByteString>;
}

type functionComponent = {
    name: string;
    type: string;
}

type FunctionInput = {
    name: string;
    type: string;
    internalType: string;
};

type FunctionOutput = {
    type: string;
    name?: string;
    components?: functionComponent[];
};

type ContractFunction = {
    name: string;
    type: 'function' | 'constructor' | 'event' | 'fallback';
    inputs: FunctionInput[];
    outputs?: FunctionOutput[];
    stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
};

type FunctionState = {
    [key: string]: { [key: string]: string };
};

export type {
    ByteString,
    WindowEthereum,
    CreateTaskProps,
    functionComponent,
    FunctionInput,
    FunctionOutput,
    ContractFunction,
    FunctionState
};