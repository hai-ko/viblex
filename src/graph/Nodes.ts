import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { getFileDisplayName } from '../lib/FileHandling';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { showImportPaths, getSegments } from './EdgeSegments';
import { GraphStyle } from './GraphStyle';
import { DAG, ThreeGraphNode } from './NodePosition';

function nodePosToThreePos(
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
): ThreeGraphNode<ParsedSolFile>[] {
    const threeNodes: ThreeGraphNode<ParsedSolFile>[] = [];

    for (const node of dag.nodes) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node';

        nodeDiv.style.width = graphStyle.ELEMENT_WIDTH.toString() + 'px';
        nodeDiv.style.height = graphStyle.ELEMENT_HEIGHT.toString() + 'px';
        nodeDiv.style.borderWidth = graphStyle.SEGMENT_THICKNESS + 'px';
        nodeDiv.style.borderColor = graphStyle.ELEMENT_BORDER_COLOR;
        nodeDiv.style.borderStyle = 'solid';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = node.element
            ? getFileDisplayName(node.element.path)
            : '';
        nodeDiv.appendChild(title);

        const objectCSS = new CSS3DObject(nodeDiv);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;

        nodeDiv.id = node.id;
        nodeDiv.addEventListener('mouseover', (e) => {
            const id = e.target ? (e.target as any).id : undefined;

            if (id) {
                const node = threeNodes.find((node) => node.id === id);
                if (node?.objectCSS) {
                    node.objectCSS.element.style.borderColor =
                        graphStyle.SEGMENT_HIGHLIGHTED_COLOR;
                }
                showImportPaths(
                    dag.edges,
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_NOT_HIGHLIGHTED_COLOR),
                );
                showImportPaths(
                    dag.edges.filter(
                        (edge) => edge.from === id || edge.to === id,
                    ),
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_HIGHLIGHTED_COLOR),
                );
            }
        });

        nodeDiv.addEventListener('mouseleave', (e) => {
            const id = e.target ? (e.target as any).id : undefined;
            if (id) {
                const node = threeNodes.find((node) => node.id === id);
                if (node?.objectCSS) {
                    node.objectCSS.element.style.borderColor =
                        graphStyle.ELEMENT_BORDER_COLOR;
                }
                showImportPaths(
                    dag.edges,
                    [...threeNodes, ...emptyNodes],
                    (o: CSS3DObject) =>
                        (o.element.style.backgroundColor =
                            graphStyle.SEGMENT_COLOR),
                );
            }
        });

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

        threeNodes.push({
            ...node,
            object,
            objectCSS,
            segments: getSegments(
                object.position.x,
                object.position.y,
                graphStyle,
            ),
        });
    }

    const emptyNodes = fillEmptyNodes(
        threeNodes,
        height,
        width,
        camera,
        graphStyle,
    );

    return [...threeNodes, ...emptyNodes];
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
                emptyNodes.push({
                    xPos: x,
                    yPos: y,
                    id: 'empty' + x + y,
                    segments: getSegments(
                        nodeXIndexToPos(x, height, width, camera, graphStyle),
                        nodeYIndexToPos(y, height, width, camera, graphStyle),
                        graphStyle,
                    ),
                });
            }
        }
    }

    return emptyNodes;
}
