import { useState } from 'react';
import { ethereum_window } from './lib/helperFunctions';
import { encodeCompleteTask } from './lib/encodeData';
import { celoToDoContractAddress, celoChainId } from './constants/contract';
import type { ByteString } from './lib/types';

interface CompleteTaskProps {
    accounts: ByteString[];
}

function CompleteTask({ accounts }: CompleteTaskProps) {
    const [taskId, setTaskId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    

    const completeTask = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!taskId.trim()) {
            setError('Please enter a task ID');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            const taskIdNum = parseInt(taskId, 10);
            if (isNaN(taskIdNum) || taskIdNum < 0) {
                throw new Error('Please enter a valid task ID (positive number)');
            }

            const calldata = encodeCompleteTask(taskIdNum);
            
            if (!ethereum_window) {
                throw new Error('Wallet not found. Please install MetaMask.');
            }

            await ethereum_window.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: accounts[0],
                    to: celoToDoContractAddress,
                    data: calldata,
                    chainId: celoChainId,
                }],
            });

            setSuccess(true);
            setTaskId('');
            
        } catch (error) {
            console.error('Error completing task:', error);
            const errorMessage = error instanceof Error ? error.message :
                typeof error === 'object' && error !== null && 'message' in error ?
                    String(error.message) : 'Unknown error occurred';
            setError(`Error completing task: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="md:min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className='max-w-md mx-auto rounded-xl shadow-xl overflow-hidden md:max-w-2xl p-6'>
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold">Complete Task</h1>
                </div>

                <form onSubmit={completeTask} className="space-y-6">
                    <div>
                        <label htmlFor="taskId" className="text-start block text-sm font-medium mb-2">
                            Task ID to Complete
                        </label>
                        <input
                            type="number"
                            id="taskId"
                            min="0"
                            value={taskId}
                            onChange={(e) => setTaskId(e.target.value)}
                            placeholder="Enter task ID"
                            className="w-full p-2 border border-gray-700 rounded-md"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !accounts.length}
                        className="w-full bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Completing Task...' : 'Mark as Complete'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            <p>Task marked as complete! The transaction is being processed.</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CompleteTask;
