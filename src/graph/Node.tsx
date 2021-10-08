import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { showImportPaths, getSegments } from './EdgeSegments';
import { GraphStyle } from './GraphStyle';
import { DAG, GraphNode, ThreeGraphNode } from './NodePosition';
import { RenderedNodes } from './ThreeEnv';

export interface PortalParts {
    graphStyle: GraphStyle;
    node: GraphNode<ParsedSolFile>;
    onMouseLeave: () => void;
    onMouseOver: () => void;
    nodeDiv: HTMLDivElement;
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

export function createNodes(
    graphStyle: GraphStyle,
    dag: DAG<ParsedSolFile>,
    height: number,
    width: number,
    camera: THREE.PerspectiveCamera,
): RenderedNodes {
    const threeNodes: ThreeGraphNode<ParsedSolFile>[] = [];
    const portals: PortalParts[] = [];

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
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_NOT_HIGHLIGHTED_COLOR),
                );
                showImportPaths(
                    dag.edges.filter(
                        (edge) => edge.from === node.id || edge.to === node.id,
                    ),
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_HIGHLIGHTED_COLOR),
                );
            };

            const onMouseLeave = () => {
                showImportPaths(
                    dag.edges,
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_COLOR),
                );
            };

            const object = new THREE.Object3D();
            object.position.x = nodeXIndexToPos(
                node.xPos,
                height,
                width,
                camera,
                graphStyle,
            );

            object.position.y = nodeYIndexToPos(
                node.yPos,
                height,
                width,
                camera,
                graphStyle,
            );

            const segments = getSegments(
                object.position.x,
                object.position.y,
                graphStyle,
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
                graphStyle,
                node,
                onMouseLeave,
                onMouseOver,
                nodeDiv,
            });
        }
    }

    const emptyNodes = fillEmptyNodes(
        threeNodes,
        height,
        width,
        camera,
        graphStyle,
    );

    return { threeNodes: [...threeNodes, ...emptyNodes], portals, graphStyle };
}

function nodeXIndexToPos(
    index: number,
    height: number,
    width: number,
    camera: THREE.PerspectiveCamera,
    graphStyle: GraphStyle,
) {
    const pos = nodePosToThreePos(0, 40, height, width, camera);
    return (
        parseInt(index.toString()) *
            (graphStyle.ELEMENT_WIDTH + graphStyle.COL_DISTANCE) +
        pos.x
    );
}

function nodeYIndexToPos(
    index: number,
    height: number,
    width: number,
    camera: THREE.PerspectiveCamera,
    graphStyle: GraphStyle,
) {
    const pos = nodePosToThreePos(0, 40, height, width, camera);
    return (
        -(
            parseInt(index.toString()) *
            (graphStyle.ELEMENT_HEIGHT + graphStyle.COL_DISTANCE)
        ) + pos.y
    );
}

function fillEmptyNodes(
    threeNodes: ThreeGraphNode<ParsedSolFile>[],
    height: number,
    width: number,
    camera: THREE.PerspectiveCamera,
    graphStyle: GraphStyle,
): ThreeGraphNode<ParsedSolFile>[] {
    const maxX = Math.max(...threeNodes.map((node) => node.xPos));
    const maxY = Math.max(...threeNodes.map((node) => node.yPos));
    const emptyNodes: ThreeGraphNode<ParsedSolFile>[] = [];
    for (let x = 1; x <= maxX; x++) {
        for (let y = 0; y <= maxY; y++) {
            if (
                !threeNodes.find((node) => node.xPos === x && node.yPos === y)
            ) {
                const segments = getSegments(
                    nodeXIndexToPos(x, height, width, camera, graphStyle),
                    nodeYIndexToPos(y, height, width, camera, graphStyle),
                    graphStyle,
                );

                emptyNodes.push({
                    xPos: x,
                    yPos: y,
                    id: 'empty' + x + y,
                    segments: segments.segments,
                    segmentsInitialValues: segments.initialValues,
                });
            }
        }
    }

    return emptyNodes;
}
