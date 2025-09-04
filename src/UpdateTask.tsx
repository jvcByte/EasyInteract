import { useState } from 'react';
import { encodeUpdateTask } from './lib/encodeData';
import { ethereum_window } from './lib/helperFunctions';
import { celoToDoContractAddress, celoChainId } from './constants/contract';
import type { ByteString } from './lib/types';

interface UpdateTaskProps {
  accounts: ByteString[];
}

function UpdateTask({ accounts }: UpdateTaskProps) {
  const [taskId, setTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskId.trim() || !description.trim()) {
      setError('Please enter both task ID and description');
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

      const calldata = encodeUpdateTask(taskIdNum, description);

      if (!ethereum_window) {
        throw new Error('Ethereum provider not found. Please install MetaMask.');
      }

      if (!accounts[0]) {
        throw new Error('No connected account found. Please connect your wallet.');
      }

      const txHash = await ethereum_window.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: celoToDoContractAddress,
          data: calldata,
          chainId: celoChainId,
          gas: '200000', // Sufficient gas for the update operation
        }],
      });

      console.log('Transaction hash:', txHash);
      setSuccess(true);
      setTaskId('');
      setDescription('');
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message :
        typeof error === 'object' && error !== null && 'message' in error ?
          String(error.message) : 'Unknown error occurred';
      setError(`Error updating task: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className='max-w-md mx-auto rounded-xl shadow-xl overflow-hidden md:max-w-2xl p-6'>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">Update Task</h1>
        </div>

        <form onSubmit={updateTask} className="space-y-6">
          <div>
            <label htmlFor="taskId" className="text-start block text-sm font-medium mb-2">
              Task ID
            </label>
            <input
              type="number"
              id="taskId"
              min="0"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID to update"
              className="w-full p-2 border border-gray-700 rounded-md"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="text-start block text-sm font-medium mb-2">
              New Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter new task description"
              className="w-full p-2 border border-gray-700 rounded-md"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !accounts.length}
            className="w-full bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Updating Task...' : 'Update Task'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p>Task updated successfully! The transaction is being processed.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UpdateTask;
