/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { isAddress } from 'viem';
import Select from 'react-select';
import Header from "../component/Header";
import { publicClient, walletClient, availableChains, type ChainName } from '../../lib/client';
import type { ContractFunction, FunctionState, ByteString } from '../../lib/types';
import { renderResult } from '../../lib/helperFunctions';

export default function Interact() {
    const [rpcUrl, setRpcUrl] = useState("");
    const [contractAddress, setContractAddress] = useState("");
    const [selectedChain, setSelectedChain] = useState<{ value: ChainName; label: string } | null>();
    const [abiInput, setAbiInput] = useState('');
    const [functions, setFunctions] = useState<ContractFunction[]>([]);
    const [functionStates, setFunctionStates] = useState<FunctionState>({});
    const [results, setResults] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [accounts, setAccounts] = useState<Array<ByteString>>([]);


    const connectWallet = async () => {
        const [address] = await walletClient({
            chainName: selectedChain?.value as ChainName
        }).requestAddresses();
        setAccounts([address]);
    };


    const parseAbiInput = () => {
        try {
            setError('');
            if (!abiInput.trim()) {
                throw new Error('ABI cannot be empty');
            }

            const abi = JSON.parse(abiInput);
            if (!Array.isArray(abi)) {
                throw new Error('ABI must be an array');
            }

            // Filter for only function types and exclude constructors
            const functionItems = abi.filter(
                (item) => item.type === 'function'
            ) as ContractFunction[];

            if (functionItems.length === 0) {
                throw new Error('No functions found in ABI');
            }

            setFunctions(functionItems);

            // Initialize state for each function's inputs
            const newStates: FunctionState = {};
            functionItems.forEach((func) => {
                newStates[func.name] = {};
                func.inputs.forEach((input) => {
                    const inputName = input.name || `param_${func.inputs.indexOf(input)}`;
                    newStates[func.name][inputName] = '';
                });
            });
            setFunctionStates(newStates);

        } catch (err) {
            console.error('Error parsing ABI:', err);
            setError(`Invalid ABI: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setFunctions([]);
        }
    };

    const handleInputChange = (funcName: string, inputName: string, value: string) => {
        setFunctionStates(prev => ({
            ...prev,
            [funcName]: {
                ...prev[funcName],
                [inputName]: value
            }
        }));
    };

    const callFunction = async (func: ContractFunction, isSimulation: boolean = false) => {
        if (!contractAddress) {
            setError('Contract address is required');
            return;
        }

        if (!isAddress(contractAddress)) {
            setError('Invalid contract address');
            return;
        }

        if (!selectedChain) {
            setError('Please select a network');
            return;
        }

        if (func.stateMutability !== 'view' && func.stateMutability !== 'pure' && !accounts[0]) {
            setError('Please connect your wallet to execute this function');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const client = publicClient({
                chainName: selectedChain.value,
                rpcUrl: rpcUrl
            });

            const inputValues = functionStates[func.name] || {};
            const args = func.inputs.map((input, index) => {
                const inputName = input.name || `param_${index}`;
                const value = inputValues[inputName] || '';

                // Basic type conversion
                try {
                    if (input.type.includes('int')) {
                        return BigInt(value) || 0n;
                    } else if (input.type === 'bool') {
                        return value.toLowerCase() === 'true';
                    } else if (input.type === 'address') {
                        if (!isAddress(value)) {
                            throw new Error(`Invalid address: ${value}`);
                        }
                        return value;
                    }
                } catch (err) {
                    console.error(`Error parsing ${inputName}:`, err);
                    throw new Error(`Invalid value for ${inputName}: ${(err as Error).message}`);
                }

                return value;
            });

            // For view/pure functions, just read
            if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
                const res = await client.readContract({
                    address: contractAddress as `0x${string}`,
                    abi: JSON.parse(abiInput),
                    functionName: func.name,
                    args
                });

                const result = {
                    function: func.name,
                    args,
                    timestamp: new Date().toISOString(),
                    result: res,
                    note: 'Function call completed successfully'
                };

                setResults(prev => ({
                    ...prev,
                    [func.name]: result
                }));
                return;
            }

            // For write functions, handle simulation and execution
            const account = accounts[0];
            const wClient = walletClient({
                chainName: selectedChain.value,
                rpcUrl: rpcUrl
            });

            // Simulate the transaction first
            const { request } = await client.simulateContract({
                address: contractAddress as `0x${string}`,
                abi: JSON.parse(abiInput),
                functionName: func.name,
                args,
                account: account as `0x${string}`
            });

            if (isSimulation) {
                // Just show the simulation result
                const result = {
                    function: func.name,
                    args,
                    timestamp: new Date().toISOString(),
                    result: request,
                    note: 'Simulation successful. Ready to execute.',
                    isSimulation: true
                };

                setResults(prev => ({
                    ...prev,
                    [func.name]: result
                }));
                return;
            }

            // Execute the transaction
            const hash = await wClient.writeContract(request);

            // Wait for transaction receipt
            const receipt = await client.waitForTransactionReceipt({ hash });

            const result = {
                function: func.name,
                args,
                timestamp: new Date().toISOString(),
                result: receipt,
                note: 'Transaction executed successfully',
                transactionHash: hash
            };

            setResults(prev => ({
                ...prev,
                [func.name]: result
            }));

        } catch (err) {
            console.error('Error:', err);
            setError(`Error: ${err instanceof Error ? err.message : 'Operation failed'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputs = (func: ContractFunction) => {
        return func.inputs.map((input, index) => {
            const inputName = input.name || `param_${index}`;
            return (
                <div key={index} className="mb-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {inputName} ({input.type})
                    </label>
                    <input
                        type="text"
                        value={functionStates[func.name]?.[inputName] || ''}
                        onChange={(e) => handleInputChange(func.name, inputName, e.target.value)}
                        placeholder={`${input.type}`}
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                    />
                </div>
            );
        });
    };

    const renderFunctionCard = (func: ContractFunction) => {
        const isView = func.stateMutability === 'view' || func.stateMutability === 'pure';
        const result = results[func.name];

        return (
            <div key={func.name} className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-blue-400">{func.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${isView ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                        {isView ? 'read' : 'write'}
                    </span>
                </div>

                {func.inputs.length > 0 && (
                    <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Inputs:</h4>
                        {renderInputs(func)}
                    </div>
                )}

                {func.outputs && func.outputs.length > 0 && (
                    <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Returns:</h4>
                        <div className="text-sm text-gray-300">
                            {func.outputs.map((output, i) => (
                                <div key={i}>
                                    {output.name ? `${output.name}: ` : ''}{output.type}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    {!isView && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                callFunction(func, true);
                            }}
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Simulate'}
                        </button>
                    )}
                    <button
                        onClick={() => callFunction(func, false)}
                        disabled={isLoading}
                        className={
                            `flex-1 py-2 px-4 rounded-md ${isView
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-yellow-600 hover:bg-yellow-700'
                            } text-white font-medium disabled:opacity-50`
                        }
                    >
                        {isLoading ? 'Processing...' : isView ? 'Read' : 'Write'}
                    </button>
                </div>

                {result && (() => {
                    const func = functions.find(f => f.name === result.function);
                    const hasReturnValue = func?.outputs && func.outputs.length > 0 &&
                        !(func.outputs.length === 1 && func.outputs[0].type === 'tuple' &&
                            func.outputs[0].components?.length === 0);

                    return (
                        <div className="mt-3 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="mb-3">
                                    <h4 className="text-sm font-semibold text-blue-400 mb-1">
                                        {result.function} {hasReturnValue ? 'Result' : 'Transaction'}
                                    </h4>
                                    <div className="text-xs text-gray-400">
                                        {new Date(result.timestamp).toLocaleString()}
                                    </div>
                                </div>

                                {hasReturnValue ? (
                                    <div className="bg-gray-900 rounded-lg mt-2 max-h-96 overflow-y-auto">
                                        <div className="p-4">
                                            {renderResult(result.result, func?.outputs)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 p-3 bg-green-900/20 border border-green-800/50 rounded-lg text-sm text-green-300">
                                        ✓ Transaction completed successfully
                                    </div>
                                )}

                                {result.note && (
                                    <div className="mt-3 text-xs text-gray-400 italic">
                                        {result.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        );
    };

    return (
        <div className="w-[100vw] h-[100vh] text-white px-8 py-4">
            <div>
                {accounts.length > 0 ? (
                    <Header accounts={accounts} />
                ) : (
                    <div className='flex justify-end'>
                        <button onClick={connectWallet}>Connect Wallet</button>
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2 mt-6 text-[#1e293b] dark:text-white">Easy Interact</h2>
                <h2 className="text-lg font-base mb-6 text-[#1e293b] dark:text-white">
                    Simple interface for interacting with EVM compatible contracts.
                    Select the Network, Supply the Contract address, and ABI to interact with the contract.
                </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full p-4">

                <div className="w-full md:w-1/4 h-fit bg-gray-800 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-semibold mb-4">Contract Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Network Name</label>
                            <div className="text-gray-900">
                                <Select
                                    value={selectedChain}
                                    onChange={(selectedOption) => {
                                        setSelectedChain(selectedOption);
                                        if (selectedOption) {
                                            const chain = availableChains.find(c => c.id === selectedOption.value);
                                            if (chain?.rpcUrls?.default?.http?.[0]) {
                                                setRpcUrl(chain.rpcUrls.default.http[0]);
                                            }
                                        }
                                    }}
                                    options={availableChains.map(chain => ({
                                        value: chain.id as ChainName,
                                        label: chain.name
                                    }))}
                                    classNamePrefix="react-select"
                                    placeholder="Select Network... e.g. Ethereum"
                                    isSearchable={true}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            backgroundColor: '#364153', // bg-gray-800
                                            borderColor: '#4b5563', // border-gray-600
                                            '&:hover': {
                                                borderColor: '#6b7280' // border-gray-500
                                            },

                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: '#1f2937', // bg-gray-800
                                            color: 'white'
                                        }),
                                        option: (base, { isFocused, isSelected }) => ({
                                            ...base,
                                            backgroundColor: isSelected
                                                ? '#3b82f6' // bg-blue-500 when selected
                                                : isFocused
                                                    ? '#374151' // bg-gray-700 when focused
                                                    : '#1f2937', // bg-gray-800
                                            color: isSelected ? 'white' : 'white',
                                            '&:active': {
                                                backgroundColor: '#3b82f6' // bg-blue-500
                                            }
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: 'white',
                                            textAlign: 'left',
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: 'white',
                                            textAlign: 'left',
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#9ca3af', // text-gray-400
                                            textAlign: 'left',
                                        })
                                    }}
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#3b82f6', // blue-500
                                            primary25: '#1e40af', // blue-800
                                            neutral0: '#1f2937', // bg-gray-800
                                            neutral80: 'white',
                                            neutral30: '#9ca3af' // text-gray-400
                                        }
                                    })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Contract Address</label>
                            <input
                                type="text"
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                placeholder="0x..."
                                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Contract ABI (JSON)
                            </label>
                            <textarea
                                value={abiInput}
                                onChange={(e) => setAbiInput(e.target.value)}
                                placeholder='[{"inputs":[], "name":"myFunction", ...}]'
                                className="w-full h-32 p-2 border border-gray-600 rounded-md bg-gray-700 text-white font-mono text-sm"
                            />
                        </div>

                        <button
                            onClick={parseAbiInput}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 font-medium rounded-md"
                        >
                            Parse ABI & Generate UI
                        </button>

                        {error && (
                            <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {functions.length > 0 && (
                    <div className='w-full md:w-3/4'>
                        <h3 className="text-xl font-semibold mb-4">Contract Functions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {functions.map(renderFunctionCard)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}