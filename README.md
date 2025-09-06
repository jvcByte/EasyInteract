# DApp Project Overview - EasyInteract
This is a collection of decentralized applications (DApps). Has 3 main sections, Easy Interact section, ToDo section, and ERC20  interaction section. 

### Easy Interact Section
This section is a simple contract interaction application that allows users to interact with contracts on various EVM-compatible blockchains. it's a tool i use to easily interact with contracts.

#### Key Components
- Interact: For interacting with contracts
- 

#### Features
- Network Selection: Users can select from various EVM-compatible networks through a searchable dropdown
- Dynamic RPC URLs: Automatically updates RPC endpoints when switching between networks
- ABI Parser: Parses contract ABIs to generate interactive UI components
- Function Discovery: Automatically detects and lists all available functions from the ABI
- Type-Safe Inputs: Provides appropriate input fields based on function parameter types
- Read/Write Operations: Supports both view/pure (read) and state-changing (write) functions

### ToDo Section
This section is a simple todo list application that allows users to create, view, and mark tasks as complete.

#### Key Components
- CreateTask: For adding new tasks
- GetTask: For viewing task details
- CompleteTask: For marking tasks as complete
- UpdateTask: For modifying existing tasks

#### Features
- Task Management
- Create new tasks with descriptions
- View task details by ID
- Mark tasks as complete
- Update existing task descriptions

### ERC20 Section
This section is a simple ERC20 token interaction application that allows users to interact with ERC20 tokens.

#### Key Components
- ERC20TokenInteraction
: For interacting with ERC20 tokens

#### Features
- ERC20 token interaction
- View token balance
- Transfer tokens
- Approve tokens

### Blockchain Integration
- Built on Celo Alfajores testnet and Eth Sepolia testnet
- Uses viem for ABI encoding/decoding
- Direct JSON-RPC calls to the blockchain
- Wallet integration using EIP-1193 and EIP-6963

### Technical Stack
- Frontend: React + TypeScript
- Styling: Tailwind CSS
- State Management: React hooks
- Routing: React Router
- Build Tool: Vite