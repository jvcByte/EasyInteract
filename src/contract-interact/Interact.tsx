import { useState } from 'react';
import { isAddress } from 'viem';
import { ALCHEMY_RPC_URL, SEPOLIA_TODO_CONTRACT_ADDRESS } from '../constants/contract';
import Header from "../component/Header";

type FunctionInput = {
    name: string;
    type: string;
    internalType: string;
};

type ContractFunction = {
    name: string;
    type: 'function' | 'constructor' | 'event' | 'fallback';
    inputs: FunctionInput[];
    outputs?: { type: string; name?: string }[];
    stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
};

type FunctionState = {
    [key: string]: { [key: string]: string };
};

export default function Interact() {
    const [rpcUrl, setRpcUrl] = useState(ALCHEMY_RPC_URL);
    const [contractAddress, setContractAddress] = useState(SEPOLIA_TODO_CONTRACT_ADDRESS);
    const [abiInput, setAbiInput] = useState('');
    const [functions, setFunctions] = useState<ContractFunction[]>([]);
    const [functionStates, setFunctionStates] = useState<FunctionState>({});
    const [results, setResults] = useState<{ [key: string]: any }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    const callFunction = async (func: ContractFunction) => {
        if (!rpcUrl) {
            setError('Please provide an RPC URL');
            return;
        }

        if (!isAddress(contractAddress)) {
            setError('Please provide a valid contract address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const inputValues = functionStates[func.name] || {};
            const args = func.inputs.map((input, index) => {
                const inputName = input.name || `param_${index}`;
                // Try to parse the input value based on its type
                let value = inputValues[inputName] || '';
                
                // Basic type conversion
                try {
                    if (input.type.includes('int')) {
                        return parseInt(value) || 0;
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

            // For demo purposes, we'll just show the call data
            const result = {
                function: func.name,
                args,
                timestamp: new Date().toISOString(),
                // In a real implementation, you would use viem to make the actual contract call
                // const client = createPublicClient({ transport: http(rpcUrl) });
                // const result = await client.readContract({
                //     address: contractAddress,
                //     abi: JSON.parse(abiInput),
                //     functionName: func.name,
                //     args
                // });
                result: 'Function call would be executed here with viem client',
                note: 'Uncomment and implement the viem client code to make actual contract calls'
            };

            setResults(prev => ({
                ...prev,
                [func.name]: result
            }));

        } catch (err) {
            console.error('Error calling function:', err);
            setError(`Error: ${err instanceof Error ? err.message : 'Failed to call function'}`);
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

                <button
                    onClick={() => callFunction(func)}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md ${isView
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        } text-white font-medium disabled:opacity-50`}
                >
                    {isLoading ? 'Processing...' : isView ? 'Read' : 'Write'}
                </button>

                {result && (
                    <div className="mt-3 p-2 bg-gray-700 rounded text-sm overflow-auto">
                        <pre className="whitespace-pre-wrap text-gray-200">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen text-white">
            <Header />

            <div className="container mx-auto p-4 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">Smart Contract Interaction</h2>

                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-semibold mb-4">Contract Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">RPC URL</label>
                            <input
                                type="text"
                                value={rpcUrl}
                                onChange={(e) => setRpcUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                            />
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
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
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
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Contract Functions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {functions.map(renderFunctionCard)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}