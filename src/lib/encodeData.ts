import { encodeFunctionData } from 'viem';
import { TODO_ABI } from '../constants/contract';
import type { ByteString } from './types';

/**
 * Encodes the function call for createTask
 * @param description - The task description to encode
 * @returns The encoded function data
 */
export const encodeCreateTask = (description: string): ByteString => {
  return encodeFunctionData({
    abi: TODO_ABI,
    functionName: 'createTask',
    args: [description]
  });
};

/**
 * Encodes the function call for getTask
 * @param taskId - The task ID to fetch
 * @returns The encoded function data
 */
export const encodeGetTask = (taskId: number): ByteString => {
  return encodeFunctionData({
    abi: TODO_ABI,
    functionName: 'getTask',
    args: [BigInt(taskId)]
  });
};

/**
 * Encodes the function call for completeTask
 * @param taskId - The task ID to mark as complete
 * @returns The encoded function data
 */
export const encodeCompleteTask = (taskId: number): ByteString => {
  return encodeFunctionData({
    abi: TODO_ABI,
    functionName: 'completeTask',
    args: [BigInt(taskId)]
  });
};

/**
 * Encodes the function call for updateTask
 * @param taskId - The task ID to update
 * @param description - The new task description
 * @returns The encoded function data
 */
export const encodeUpdateTask = (taskId: number, description: string): ByteString => {
  return encodeFunctionData({
    abi: TODO_ABI,
    functionName: 'updateTask',
    args: [BigInt(taskId), description]
  });
};
