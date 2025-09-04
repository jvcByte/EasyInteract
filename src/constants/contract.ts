export const SEPOLIA_TODO_CONTRACT_ADDRESS = '0xa2a631AE83e422Cdff66D2C7a24902a28c2b5D36';
export const ALCHEMY_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/j9Wk6msxIJZwXDWdr-1o0oqXia5y54qx';
export const EETH_SEPOLIA_CHAIN_ID = "0xaa36a7";  // 11155111

export const celoRPCUrl = "https://celo-alfajores.g.alchemy.com/v2/j9Wk6msxIJZwXDWdr-1o0oqXia5y54qx"
export const celoToDoContractAddress = "0x9e0B679c7f92a53D496883C7B1a3e21B085dF41b";
export const celoChainId = "0xaef3";  // 44787

export const TODO_ABI = [

    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "TaskCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "TaskCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "TaskUpdated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "createTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "getTask",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "completed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ToDo.Task",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "updateTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;