import { useState } from 'react';
import { encodeCreateTask } from './lib/encodeData';
import { ethereum_window } from './lib/helperFunctions';
import { celoToDoContractAddress, celoChainId } from './constants/contract';
import type { CreateTaskProps } from './lib/types';

function CreateTask({ accounts }: CreateTaskProps) {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();

        const calldata = encodeCreateTask(description);

        if (!description.trim()) {
            setError('Please enter a task description');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            if (!ethereum_window) {
                alert("Wallet not Found");
            } else {
                await ethereum_window.request({
                    method: "eth_sendTransaction",
                    params: [
                        {
                            from: accounts[0],
                            to: celoToDoContractAddress,
                            data: calldata,
                            chainId: celoChainId,
                        },
                    ],
                });
            }

            console.log('Transaction data:', calldata);

            // Simulate transaction success
            setTimeout(() => {
                setSuccess(true);
                setDescription('');
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error('Error creating task:', error);
            const errorMessage = error instanceof Error ? error.message :
                typeof error === 'object' && error !== null && 'message' in error ?
                    String(error.message) : 'Unknown error occurred';
            setError(`Error creating task: ${errorMessage}`);
            setLoading(false);
        }
    };

    return (
        <div className="md:min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className='max-w-md mx-auto rounded-xl shadow-xl overflow-hidden md:max-w-2xl p-6'>
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold">Create New Task</h1>
                </div>

                <form onSubmit={createTask} className="space-y-6">
                    <div>
                        <label htmlFor="description" className="text-start block text-sm font-medium mb-2">
                            Task Description
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                            className="w-full p-2 border border-gray-700 rounded-md"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Creating Task...' : 'Create Task'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            <p>Task created successfully! The transaction is being processed.</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CreateTask;
