/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WindowEthereum, ByteString } from "./types";

/**
 * Reference to the browser's Ethereum provider (e.g., MetaMask)
 * @type {EthereumProvider}
 */
const ethereum_window = (window as WindowEthereum).ethereum;

/**
 * Detects if an Ethereum provider is available and retrieves account information
 * @async
 * @returns {Promise<{accounts: Array<ByteString>, chainId: ByteString | undefined}>}
 * Returns connected accounts and chain ID if provider is available
 */
const detectProvider = async () => {
    if (typeof ethereum_window !== "undefined") {
        console.log("Wallet Found");

        const [accounts, chainId] = await Promise.all(
            ["eth_accounts", "eth_chainId"].map((method) =>
                ethereum_window.request({ method })
            )
        );

        return { accounts: accounts as Array<ByteString>, chainId: chainId as ByteString };
    } else {
        console.log("No wallet found");
        return {
            accounts: [],
            chainId: undefined,
        };
    }
};

/**
 * Requests the user to connect their Ethereum wallet
 * @async
 * @throws {Error} If no Ethereum provider is found
 */
const connectWallet = async () => {
    if (!ethereum_window) {
        alert("Wallet not Found");
    } else {
        await ethereum_window.request({
            method: "eth_requestAccounts",
        });
    }
};




/**
 * Checks if an object matches the EIP-712 domain structure
 * @param {any} obj - The object to check
 * @returns {boolean} True if the object has all required EIP-712 domain fields
 */
const isEIP712Domain = (obj: any) => {
    const keys = obj ? Object.keys(obj) : [];
    return (
        keys.includes('name') &&
        keys.includes('version') &&
        keys.includes('chainId') &&
        keys.includes('verifyingContract') &&
        keys.includes('salt')
    );
};

/**
 * Renders EIP-712 domain data in a formatted way
 * @param {Object} domain - The domain object to render
 * @returns {JSX.Element} Formatted domain data as React components
 */
const renderEIP712Domain = (domain: any) => {
    const fields = [
        { key: 'name', label: 'Name', type: 'string' },
        { key: 'version', label: 'Version', type: 'string' },
        { key: 'chainId', label: 'Chain ID', type: 'uint256' },
        { key: 'verifyingContract', label: 'Verifying Contract', type: 'address' },
        { key: 'salt', label: 'Salt', type: 'bytes32' },
        { key: 'extensions', label: 'Extensions', type: 'uint256[]' },
    ];

    return (
        <div className="space-y-2">
            {fields.map(({ key, label, type }) => {
                if (domain[key] === undefined) return null;

                let value = domain[key];
                if (key === 'salt' && value === '0x' + '0'.repeat(64)) {
                    value = '0x000...000';
                }

                return (
                    <div key={key} className="flex flex-wrap items-start">
                        <span className="text-gray-400 w-40 break-words pr-2">
                            {label} ({type}):
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="bg-gray-800 p-2 rounded break-all font-mono text-sm">
                                <div className="w-full overflow-x-auto">
                                    {renderValue(value, type)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Renders the result of a contract call in a user-friendly format
 * @param {any} result - The value to render
 * @param {Array<{type: string, name?: string}>} [outputTypes] - Optional type information for better formatting
 * @returns {JSX.Element} Formatted result as React components
 */
const renderResult = (result: any, outputTypes?: { type: string; name?: string }[]) => {
    if (result === undefined || result === null) {
        return <div className="text-gray-400 italic">No return value</div>;
    }

    // Handle array results
    if (Array.isArray(result)) {
        if (result.length === 0) {
            return <span className="text-gray-400">[]</span>;
        }
        return (
            <div className="space-y-2">
                {result.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-800 rounded">
                        {renderResult(item, outputTypes?.[index] ? [outputTypes[index]] : undefined)}
                    </div>
                ))}
            </div>
        );
    }

    // Handle EIP-712 domain data
    if (isEIP712Domain(result)) {
        return renderEIP712Domain(result);
    }

    // Handle other object results
    if (typeof result === 'object') {
        // Check if it's a tuple/struct with named fields
        const entries = Object.entries(result);
        if (entries.length > 0) {
            return (
                <div className="grid grid-cols-1 gap-2">
                    {entries.map(([key, value]) => {
                        // Skip numeric keys (array indices)
                        if (!isNaN(Number(key))) return null;

                        // Find the output type for this field
                        const outputType = outputTypes?.find(ot => ot.name === key) ||
                            outputTypes?.[Number(key)] ||
                            { type: typeof value };

                        return (
                            <div key={key} className="flex flex-wrap items-start">
                                <span className="text-gray-400 w-32 break-words pr-2">
                                    {key} ({outputType?.type || typeof value}):
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gray-800 p-2 rounded break-all font-mono text-sm">
                                        <div className="w-full overflow-x-auto">
                                            {renderValue(value, outputType?.type)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
    }

    // Handle primitive values
    return (
        <div className="w-full overflow-x-auto">
            <span className="text-white break-all font-mono text-sm">
                {renderValue(result)}
            </span>
        </div>
    );
};

/**
 * Formats a single value based on its type
 * @param {any} value - The value to format
 * @param {string} [type] - Optional type hint (e.g., 'address', 'uint256', 'bool')
 * @returns {string | JSX.Element} Formatted string or React component
 */
const renderValue = (value: any, type?: string) => {
    // Special handling for empty arrays
    if (Array.isArray(value) && value.length === 0) {
        return <span className="text-gray-400">[]</span>;
    }

    // Special handling for addresses and hashes
    if (type === 'address' || (typeof value === 'string' && value.startsWith('0x') && value.length === 42)) {
        return (
            <span className="font-mono break-all text-sm">
                {value}
            </span>
        );
    }
    if (value === null || value === undefined) return 'null';

    // Format based on type hint if available
    if (type) {
        if (type.includes('int')) return value.toString();
        if (type === 'bool') return value ? 'true' : 'false';
        if (type === 'address') return value;
    }

    // Default formatting
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
};

export {
    ethereum_window,
    detectProvider,
    connectWallet,
    isEIP712Domain,
    renderEIP712Domain,
    renderResult,
    renderValue
};
