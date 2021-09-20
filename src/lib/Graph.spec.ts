import {
    Edge,
    getElementById,
    getIncomingEdges,
    getOutgoingEdges,
} from './Graph';

describe('FileHandling', () => {
    test('incomingEdges', async () => {
        const edges: Edge[] = [
            { from: 'A', to: 'B' },
            { from: 'C', to: 'B' },
            { from: 'C', to: 'A' },
        ];
        expect(getIncomingEdges('B', edges)).toEqual([
            { from: 'A', to: 'B' },
            { from: 'C', to: 'B' },
        ]);
    });

    test('outgoingEdges', async () => {
        const edges: Edge[] = [
            { from: 'A', to: 'B' },
            { from: 'C', to: 'B' },
            { from: 'C', to: 'A' },
        ];
        expect(getOutgoingEdges('C', edges)).toEqual([
            { from: 'C', to: 'B' },
            { from: 'C', to: 'A' },
        ]);
    });

    test('getElementById', async () => {
        const elements = [
            { path: 'A', test: 'test' },
            { path: 'B' },
            { path: 'C' },
        ];
        expect(getElementById<{ path: string }>('A', 'path', elements)).toEqual(
            { path: 'A', test: 'test' },
        );
    });
});
