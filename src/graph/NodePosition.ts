import { Parse, ParsedSolFile } from '../lib/ParseSolidity';
import type { PluginApi } from '@remixproject/plugin-utils';
import { PluginClient } from '@remixproject/plugin';
import * as R from 'ramda';
import { IRemixApi } from '@remixproject/plugin-api';
import { getAllRemixFiles } from '../remix-utils/RemixFileHandler';
import { buildInputGraph, getImportRootFiles } from '../lib/FileHandling';
import {
    getIncomingEdges,
    Edge,
    getElementById,
    getOutgoingEdges,
} from '../lib/Graph';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

export interface DAG<T> {
    nodes: GraphNode<T>[];
    edges: Edge[];
}

export interface GraphNode<T> {
    id: string;
    xPos: number;
    yPos: number;
    element?: T;
}

export interface ThreeGraphNode<T> extends GraphNode<T> {
    segments: CSS3DObject[];
    object?: THREE.Object3D<THREE.Event>;
    objectCSS?: CSS3DObject;
}

export async function getNodePositionOld(
    client: PluginClient<any, Readonly<IRemixApi>> &
        PluginApi<Readonly<IRemixApi>>,
    solParser: Parse,
): Promise<DAG<ParsedSolFile>> {
    const newFiles = await getAllRemixFiles(client, solParser);

    const edges = buildInputGraph(newFiles);

    const newRootFiles = getImportRootFiles(newFiles, edges);

    const buildTreeForChilds = (startXPos: number, startYPos: number) =>
        R.addIndex<ParsedSolFile, GraphNode<ParsedSolFile>[]>(R.map)(
            (
                parsedSolFile: ParsedSolFile,
                index: number,
            ): GraphNode<ParsedSolFile>[] =>
                buildTree(parsedSolFile, startXPos + 1, startYPos + index),
        );

    const buildTree = (
        root: ParsedSolFile,
        startXPos: number,
        startYPos: number,
    ): GraphNode<ParsedSolFile>[] => {
        const addRootElement = (
            elements: GraphNode<ParsedSolFile>[],
        ): GraphNode<ParsedSolFile>[] => [
            { xPos: startXPos, yPos: startYPos, element: root, id: root.path },
            ...elements,
        ];

        const retrieveIncomingEdges = (element: ParsedSolFile): Edge[] =>
            getIncomingEdges(element.path, edges);

        const incomingEdgeToElement = (edge: Edge): ParsedSolFile | undefined =>
            getElementById<ParsedSolFile>(edge.from, 'path', newFiles);

        const removeUndefineds = (
            elements: (ParsedSolFile | undefined)[],
        ): ParsedSolFile[] =>
            R.filter(
                (element) => element !== undefined,
                elements,
            ) as ParsedSolFile[];

        return R.pipe(
            retrieveIncomingEdges,
            R.map(incomingEdgeToElement),
            removeUndefineds,
            buildTreeForChilds(startXPos, startYPos),
            R.unnest,
            addRootElement,
        )(root);
    };

    return {
        edges,
        nodes: R.pipe(
            buildTreeForChilds(0, 1),
            R.unnest,
            R.uniqWith((nodeA, nodeB) => nodeA.id === nodeB.id),
        )(newRootFiles),
    };
}

export async function getNodePosition(
    client: PluginClient<any, Readonly<IRemixApi>> &
        PluginApi<Readonly<IRemixApi>>,
    solParser: Parse,
): Promise<DAG<ParsedSolFile>> {
    const newFiles = await getAllRemixFiles(client, solParser);

    const edges = buildInputGraph(newFiles);

    const newRootFiles = getImportRootFiles(newFiles, edges);

    const retrieveIncomingEdges = (element: ParsedSolFile): Edge[] =>
        getIncomingEdges(element.path, edges);

    const buildLayer = (startXPos: number, startYPos: number) =>
        R.addIndex<ParsedSolFile, GraphNode<ParsedSolFile>>(R.map)(
            (
                parsedSolFile: ParsedSolFile,
                index: number,
            ): GraphNode<ParsedSolFile> => ({
                xPos: startXPos + 1,
                yPos: startYPos + index,
                element: parsedSolFile,
                id: parsedSolFile.path,
            }),
        );

    const retrieveOutgoingEdges = (element: ParsedSolFile): Edge[] =>
        getOutgoingEdges(element.path, edges);

    const edgeToFromFile = (edge: Edge): ParsedSolFile | undefined =>
        R.find((file: ParsedSolFile) => file.path === edge.from, newFiles);

    const edgePointsOnlyToFiles = (files: ParsedSolFile[], edge: Edge) =>
        R.pipe(
            R.map((file: ParsedSolFile) => file.path),
            R.includes(edge.to),
        )(files);

    const filePointsOnlyToFiles = (
        files: ParsedSolFile[],
        edgesPerFile: Edge[],
    ): boolean =>
        R.pipe(
            R.map((edgePerFile: Edge) =>
                edgePointsOnlyToFiles(files, edgePerFile),
            ),
            R.none((a: boolean) => a === false),
        )(edgesPerFile);

    const onlyFilesPointingToFiles = (
        files: ParsedSolFile[],
        edges: Edge[][],
    ) =>
        R.filter((edges: Edge[]) => filePointsOnlyToFiles(files, edges), edges);

    const fileIsNotIncluded = (
        existingNodeIds: string[],
        file: ParsedSolFile,
    ) => !R.includes(file.path, existingNodeIds);

    const getLayerFiles = (
        startXPos: number,
        startYPos: number,
        lowerLayerFiles: ParsedSolFile[],
        existingNodeIds: string[],
    ): GraphNode<ParsedSolFile>[] => {
        const nextLayer = (
            nodes: GraphNode<ParsedSolFile>[],
        ): GraphNode<ParsedSolFile>[] =>
            nodes.length > 0
                ? [
                      ...nodes,
                      ...getLayerFiles(
                          startXPos + 1,
                          startYPos,
                          [
                              ...lowerLayerFiles,
                              ...nodes.map((n) => n.element as ParsedSolFile),
                          ],
                          [...R.map(R.prop('id'), nodes), ...existingNodeIds],
                      ),
                  ]
                : [...nodes];

        const onlyToLowerLayer = (element: ParsedSolFile[]) =>
            R.pipe(
                R.map(retrieveOutgoingEdges),
                (edges: Edge[][]) =>
                    onlyFilesPointingToFiles(lowerLayerFiles, edges),
                R.unnest,
                R.map<Edge, ParsedSolFile | undefined>(edgeToFromFile),
            )(element);

        return R.pipe(
            R.map(retrieveIncomingEdges),
            R.unnest,
            R.map<Edge, ParsedSolFile | undefined>(edgeToFromFile),
            R.reject(R.isNil) as () => ParsedSolFile[],
            onlyToLowerLayer,
            R.reject(R.isNil) as () => ParsedSolFile[],
            R.uniqWith(
                (a: ParsedSolFile, b: ParsedSolFile) => a.path === b.path,
            ),
            R.filter(R.curry(fileIsNotIncluded)(existingNodeIds)),
            buildLayer(startXPos, startYPos),
            nextLayer,
        )(lowerLayerFiles);
    };

    return {
        edges,
        nodes: [
            ...buildLayer(0, 0)(newRootFiles),
            ...getLayerFiles(
                1,
                0,
                newRootFiles,
                R.map(R.prop('path'), newRootFiles),
            ),
        ],
    };
}
