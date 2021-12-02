import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { ReplayTransaction } from '../../lib/TransactionSequence';
import { showImportPaths, getSegments } from './../utils/EdgeSegments';
import { GraphStyle } from './../utils/GraphStyle';
import { DAG, GraphNode, ThreeGraphNode } from './../utils/NodePosition';
import { RenderedNodes } from './../utils/ThreeEnv';

export enum SeqNodeType {
    Account,
    Transaction,
    TransactionResult,
}

export interface CSSObject3DPair {
    css3DObject: CSS3DObject;
    object3D: THREE.Object3D;
}

export interface SequenceDiagramNode {
    css3DObject: CSS3DObject;
    object3D: THREE.Object3D;
    portal: PortalParts<ReplayTransaction | string>;
    seqNodeType: SeqNodeType;
    txId: number;
}

export interface PosMappingData {
    graphStyle: GraphStyle;
    width: number;
    height: number;
    camera: THREE.PerspectiveCamera;
}

export interface PortalParts<T> {
    graphStyle: GraphStyle;
    node: GraphNode<T>;
    onMouseLeave: () => void;
    onMouseOver: () => void;
    nodeDiv: HTMLDivElement;
}

export interface RenderedSequenceNodes {
    sequenceDiagramNodes: SequenceDiagramNode[];

    graphStyle: GraphStyle;
}

export function nodePosToThreePos(
    x: number,
    y: number,
    height: number,
    width: number,
    camera: THREE.PerspectiveCamera,
): THREE.Vector3 {
    const vec = new THREE.Vector3();
    const threePos = new THREE.Vector3();

    vec.set((x / width) * 2 - 1, -(y / height) * 2 + 1, 0.5);

    vec.unproject(camera);

    vec.sub(camera.position).normalize();

    const distance = -camera.position.z / vec.z;

    threePos.copy(camera.position).add(vec.multiplyScalar(distance));

    return threePos;
}

export function createNodes<T>(
    dag: DAG<T>,
    posMappingData: PosMappingData,
): RenderedNodes<T> {
    const threeNodes: ThreeGraphNode<T>[] = [];
    const portals: PortalParts<T>[] = [];

    for (const node of dag.nodes) {
        if (node.element) {
            const nodeDiv = document.createElement('div');

            const objectCSS = new CSS3DObject(nodeDiv);
            objectCSS.position.x = Math.random() * 4000 - 2000;
            objectCSS.position.y = Math.random() * 4000 - 2000;
            objectCSS.position.z = Math.random() * 4000 - 2000;

            const onMouseOver = () => {
                showImportPaths(
                    dag.edges,
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject, xPos: number, isLeftArrow?: boolean) =>
                        isLeftArrow
                            ? (o.element.style.borderRightColor =
                                  posMappingData.graphStyle.SEGMENT_NOT_HIGHLIGHTED_COLOR)
                            : (o.element.style.backgroundColor =
                                  posMappingData.graphStyle.SEGMENT_NOT_HIGHLIGHTED_COLOR),
                );
                showImportPaths(
                    dag.edges.filter(
                        (edge) => edge.from === node.id || edge.to === node.id,
                    ),
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject, xPos: number, isLeftArrow?: boolean) =>
                        isLeftArrow
                            ? (o.element.style.borderRightColor =
                                  posMappingData.graphStyle.SEGMENT_HIGHLIGHTED_COLOR)
                            : (o.element.style.backgroundColor =
                                  posMappingData.graphStyle.SEGMENT_HIGHLIGHTED_COLOR),
                );
            };

            const onMouseLeave = () => {
                showImportPaths(
                    dag.edges,
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject, xPos: number, isLeftArrow?: boolean) =>
                        isLeftArrow
                            ? (o.element.style.borderRightColor =
                                  posMappingData.graphStyle.SEGMENT_COLOR)
                            : (o.element.style.backgroundColor =
                                  posMappingData.graphStyle.SEGMENT_COLOR),
                );
            };

            const object = new THREE.Object3D();
            object.position.x = nodeXIndexToPos(node.xPos, posMappingData);

            object.position.y = nodeYIndexToPos(node.yPos, posMappingData);

            const segments = getSegments(
                object.position.x,
                object.position.y,
                posMappingData.graphStyle,
            );

            threeNodes.push({
                ...node,
                object,
                objectCSS,
                segments: segments.segments,
                segmentsInitialValues: segments.initialValues,
                initialPosition: { x: object.position.x, y: object.position.y },
            });

            portals.push({
                graphStyle: posMappingData.graphStyle,
                node,
                onMouseLeave,
                onMouseOver,
                nodeDiv,
            });
        }
    }

    const emptyNodes = fillEmptyNodes(threeNodes, posMappingData);

    return {
        threeNodes: [...threeNodes, ...emptyNodes],
        portals,
        graphStyle: posMappingData.graphStyle,
    };
}

export function nodeXIndexToPos(index: number, posMappingData: PosMappingData) {
    const pos = nodePosToThreePos(
        0,
        40,
        posMappingData.height,
        posMappingData.width,
        posMappingData.camera,
    );
    return (
        parseInt(index.toString()) *
            (posMappingData.graphStyle.ELEMENT_WIDTH +
                posMappingData.graphStyle.COL_DISTANCE) +
        pos.x
    );
}

export function nodeYIndexToPos(index: number, posMappingData: PosMappingData) {
    const pos = nodePosToThreePos(
        0,
        40,
        posMappingData.height,
        posMappingData.width,
        posMappingData.camera,
    );
    return (
        -(
            parseInt(index.toString()) *
            (posMappingData.graphStyle.ELEMENT_HEIGHT +
                posMappingData.graphStyle.COL_DISTANCE)
        ) + pos.y
    );
}

function fillEmptyNodes<T>(
    threeNodes: ThreeGraphNode<T>[],
    posMappingData: PosMappingData,
): ThreeGraphNode<T>[] {
    const maxX = Math.max(...threeNodes.map((node) => node.xPos));
    const maxY = Math.max(...threeNodes.map((node) => node.yPos));
    const emptyNodes: ThreeGraphNode<T>[] = [];
    for (let x = 1; x <= maxX; x++) {
        for (let y = 0; y <= maxY; y++) {
            if (
                !threeNodes.find((node) => node.xPos === x && node.yPos === y)
            ) {
                const segments = getSegments(
                    nodeXIndexToPos(x, posMappingData),
                    nodeYIndexToPos(y, posMappingData),
                    posMappingData.graphStyle,
                );

                emptyNodes.push({
                    xPos: x,
                    yPos: y,
                    yRelative: 0,
                    id: 'empty' + x + y,
                    segments: segments.segments,
                    segmentsInitialValues: segments.initialValues,
                });
            }
        }
    }

    return emptyNodes;
}
