import * as R from 'ramda';

export interface Edge {
    from: string;
    to: string;
}

export interface Context<C, E> {
    context: C;
    element: E;
}

export function getIncomingEdges(key: string, edges: Edge[]): Edge[] {
    return R.filter((edge: Edge) => edge.to === key, edges);
}

export function getOutgoingEdges(key: string, edges: Edge[]): Edge[] {
    return R.filter((edge: Edge) => edge.from === key, edges);
}

export function getElementById<T>(
    elementId: string,
    idPropertyName: string,
    elements: T[],
): T | undefined {
    return R.find(
        (element: T) => (element as any)[idPropertyName] === elementId,
        elements,
    );
}
