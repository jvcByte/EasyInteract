import { useState } from 'react';
import { decodeTodoStruct } from '../../lib/DecodeData';
import { celoToDoContractAddress, celoRPCUrl } from '../../constants/contract';
import type { ByteString } from '../../lib/types';

function GetTask() {
    const [task, setTask] = useState<{
        id: string;
        description: string;
        completed: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState('');
    const [error, setError] = useState('');




    const getTask = async () => {
        if (!taskId.trim()) {
            setError('Please enter a task ID');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = '0x1d65e77e' + parseInt(taskId).toString(16).padStart(64, '0');

            const response = await fetch(celoRPCUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        to: celoToDoContractAddress,
                        data: data
                    }, 'latest'],
                    id: 1
                })
            });

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error.message);
            }

            const taskData = result.result;
            if (taskData === '0x') {
                setTask(null);
                setError('Task not found');
                return;
            }

            const decoded = decodeTodoStruct(taskData as ByteString);
            if (decoded) {
                const [taskInfo] = decoded;
                setTask({
                    id: taskInfo.id.toString(),
                    description: taskInfo.description,
                    completed: taskInfo.completed
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error fetching task. See console for details.');
            setTask(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <div className="max-w-md mx-auto rounded-xl shadow-xl overflow-hidden md:max-w-2xl p-6">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold">Get Task</h1>
                </div>

                <div className="flex flex-col gap-6 mb-6">
                    <input
                        type="number"
                        min="0"
                        required
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        placeholder="Enter task ID"
                        className="border border-gray-700 rounded-md p-2"
                    />
                    <button
                        onClick={getTask}
                        disabled={loading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Get Task'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {task && (
                    <div className="p-6 rounded-lg border border-gray-600">
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">Task Details</h2>
                        <div className="space-y-3">
                            <div className='flex justify-start gap-2'>
                                <span className="font-medium">Task ID :</span>{' '}
                                <span className="">{task.id}</span>
                            </div>
                            <div className='flex justify-start gap-2'>
                                <span className="font-medium">Description :</span>{' '}
                                <span className="">{task.description}</span>
                            </div>
                            <div className="flex justify-start gap-2">
                                <span className="font-medium">Status :</span>{' '}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.completed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {task.completed ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GetTask;