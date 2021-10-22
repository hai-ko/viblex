import { Edge } from '../../lib/Graph';
import * as R from 'ramda';

function walkUp(startNodeId: string, edges: Edge[]): string[] {
    return R.pipe(
        R.filter<Edge, 'array'>((edge) => edge.from === startNodeId),
        R.map<Edge, string>((edge) => edge.to),
        R.map((nodeId) => walkUp(nodeId, edges)),
        R.unnest,
        (nodes) => [startNodeId, ...nodes],
    )(edges);
}

function walkDown(startNodeId: string, edges: Edge[]): string[] {
    return R.pipe(
        R.filter<Edge, 'array'>((edge) => edge.to === startNodeId),
        R.map<Edge, string>((edge) => edge.from),
        R.map((nodeId) => walkDown(nodeId, edges)),
        R.unnest,
        (nodes) => [startNodeId, ...nodes],
    )(edges);
}

export function createCluster(
    nodeIds: string[],
    edges: Edge[],
): Map<string, number> {
    const uncheckedNodeIds = [...nodeIds];
    let nodeToCheck = uncheckedNodeIds.pop();
    let clusterId = 0;
    const clusterMap = new Map<string, number>();

    while (nodeToCheck) {
        const cluster = R.uniq([
            ...walkDown(nodeToCheck, edges),
            ...walkUp(nodeToCheck, edges),
        ]);
        let clusterIdToUse: number = clusterId;
        cluster.forEach((nodeId) => {
            if (clusterMap.has(nodeId)) {
                clusterIdToUse = clusterMap.get(nodeId) as number;
            }
        });

        cluster.forEach((nodeId) => clusterMap.set(nodeId, clusterIdToUse));

        clusterId = clusterIdToUse === clusterId ? clusterId + 1 : clusterId;
        nodeToCheck = uncheckedNodeIds.pop();
    }

    return clusterMap;
}
