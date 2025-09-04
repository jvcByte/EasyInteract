import { decodeAbiParameters } from 'viem';
import type { ByteString } from './types';

const decodeTodoStruct = (data: ByteString) => {
    try {
        return decodeAbiParameters(
            [
                {
                    components: [
                        { name: 'id', type: 'uint256' },
                        { name: 'description', type: 'string' },
                        { name: 'completed', type: 'bool' },
                    ],
                    name: '',
                    type: 'tuple',
                },
            ],
            data
        );
    } catch (error) {
        console.error('Error decoding task:', error);
        return null;
    }
};

export { decodeTodoStruct };