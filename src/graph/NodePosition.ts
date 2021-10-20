import { ParsedSolFile } from '../lib/ParseSolidity';
import * as R from 'ramda';
import { buildInputGraph, getImportRootFiles } from '../lib/FileHandling';
import { getIncomingEdges, Edge, getOutgoingEdges } from '../lib/Graph';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import {
    Context,
    createInheritanceEdges,
    getAllContracts,
    getContractId,
    getRootContracts,
} from '../lib/ContractHandling';
import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import { createCluster } from './NodePositionOptimizer';

export interface DAG<T> {
    nodes: GraphNode<T>[];
    edges: Edge[];
}

export interface GraphNode<T> {
    id: string;
    xPos: number;
    yPos: number;
    yRelative: number;
    element?: T;
}

export interface ThreeGraphNode<T> extends GraphNode<T> {
    segments: CSS3DObject[];
    segmentsInitialValues: { x: number; y: number; height: string }[];
    object?: THREE.Object3D<THREE.Event>;
    objectCSS?: CSS3DObject;
    initialPosition?: { x: number; y: number };
}

function buildLayer<T>(
    startXPos: number,
    startYPos: number,
    idCreation: (element: T) => string,
) {
    return R.addIndex<T, GraphNode<T>>(R.map)(
        (element: T, index: number): GraphNode<T> => ({
            xPos: startXPos + 1,
            yPos: startYPos + index,
            yRelative: index,
            element,
            id: idCreation(element),
        }),
    );
}

export async function createDAG<T>(
    rawNodes: T[],
    rootRawNodes: T[],
    edges: Edge[],
    getId: (element: T) => string,
): Promise<DAG<T>> {
    const retrieveIncomingEdges = (element: T): Edge[] =>
        getIncomingEdges(getId(element), edges);

    const retrieveOutgoingEdges = (element: T): Edge[] =>
        getOutgoingEdges(getId(element), edges);

    const edgeToFromRawNode = (edge: Edge): T | undefined =>
        R.find((element: T) => getId(element) === edge.from, rawNodes);

    const edgePointsOnlyToRawNodes = (rawNodes: T[], edge: Edge) =>
        R.pipe(
            R.map((rawNode: T) => getId(rawNode)),
            R.includes(edge.to),
        )(rawNodes);

    const rawNodePointsOnlyToRawNodes = (
        rawNodes: T[],
        edgesPerRawNode: Edge[],
    ): boolean =>
        R.pipe(
            R.map((edgePerRawNode: Edge) =>
                edgePointsOnlyToRawNodes(rawNodes, edgePerRawNode),
            ),
            R.none((a: boolean) => a === false),
        )(edgesPerRawNode);

    const onlyRawNodePointingToRawNodes = (rawNodes: T[], edges: Edge[][]) =>
        R.filter(
            (edges: Edge[]) => rawNodePointsOnlyToRawNodes(rawNodes, edges),
            edges,
        );

    const rawNodeIsNotIncluded = (existingNodeIds: string[], rawNode: T) =>
        !R.includes(getId(rawNode), existingNodeIds);

    const getLayerFiles = (
        startXPos: number,
        startYPos: number,
        lowerLayerNodes: T[],
        existingNodeIds: string[],
    ): GraphNode<T>[] => {
        const nextLayer = (nodes: GraphNode<T>[]): GraphNode<T>[] =>
            nodes.length > 0
                ? [
                      ...nodes,
                      ...getLayerFiles(
                          startXPos + 1,
                          startYPos,
                          [
                              ...lowerLayerNodes,
                              ...nodes.map((n) => n.element as T),
                          ],
                          [...R.map(R.prop('id'), nodes), ...existingNodeIds],
                      ),
                  ]
                : [...nodes];

        const onlyToLowerLayer = (element: T[]) =>
            R.pipe(
                R.map(retrieveOutgoingEdges),
                (edges: Edge[][]) =>
                    onlyRawNodePointingToRawNodes(lowerLayerNodes, edges),
                R.unnest,
                R.map<Edge, T | undefined>(edgeToFromRawNode),
            )(element);

        return R.pipe(
            R.map(retrieveIncomingEdges),

            R.unnest,
            R.map<Edge, T | undefined>(edgeToFromRawNode),
            R.reject(R.isNil) as () => T[],
            onlyToLowerLayer,
            R.reject(R.isNil) as () => T[],
            R.uniqWith((a: T, b: T) => getId(a) === getId(b)),
            R.filter(R.curry(rawNodeIsNotIncluded)(existingNodeIds)),
            buildLayer<T>(startXPos, startYPos, (node) => getId(node)),
            nextLayer,
        )(lowerLayerNodes);
    };

    const nodes = [
        ...buildLayer<T>(0, 0, getId)(rootRawNodes),
        ...getLayerFiles(1, 0, rootRawNodes, R.map(getId, rootRawNodes)),
    ];

    const clusterMap = createCluster(
        R.map((node: T) => getId(node))(rootRawNodes),
        edges,
    );

    const nodePosForCluster = (clusterId: number, offset: number) => {
        const filteredRootNodes = R.filter(
            (rootRawNode) => clusterMap.get(getId(rootRawNode)) === clusterId,
            rootRawNodes,
        );
        const nodes = [
            ...buildLayer<T>(0, 0, getId)(filteredRootNodes),
            ...getLayerFiles(
                1,
                0,
                filteredRootNodes,
                R.map(getId, filteredRootNodes),
            ),
        ];

        return {
            maxY: R.pipe(
                R.map<GraphNode<T>, number>((node) => node.yPos),
                R.reduce<number, number>(R.max, -Infinity),
            )(nodes),
            nodes: R.map<GraphNode<T>, GraphNode<T>>(
                (node) => ({
                    ...node,
                    yPos: node.yPos + offset,
                }),
                nodes,
            ),
        };
    };

    let offsetNodes: GraphNode<T>[] = [];
    let offset = 0;

    for (const clusterId of R.uniq([...clusterMap.values()])) {
        const nodeWithPost = nodePosForCluster(clusterId, offset);
        offsetNodes = [...offsetNodes, ...nodeWithPost.nodes];
        offset += nodeWithPost.maxY + 1;
    }

    return {
        edges,
        nodes: offsetNodes,
    };
}

export async function getContractsDAG(filesDAG: DAG<ParsedSolFile>) {
    const edges = createInheritanceEdges(filesDAG);

    const contracts = getAllContracts(filesDAG);

    return createDAG<Context<ParsedSolFile, ContractDefinition>>(
        contracts,
        getRootContracts(contracts, edges),
        edges,
        getContractId,
    );
}

export async function getFilesDAG(
    files: ParsedSolFile[],
): Promise<DAG<ParsedSolFile>> {
    const edges = buildInputGraph(files);

    const newRootFiles = getImportRootFiles(files, edges);

    return createDAG<ParsedSolFile>(
        files,
        newRootFiles,
        edges,
        (file: ParsedSolFile) => file.path,
    );
}
