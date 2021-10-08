import { ParsedSolFile } from '../lib/ParseSolidity';
import { GraphStyle } from './GraphStyle';
import { ThreeGraphNode } from './NodePosition';
import { RenderedNodes } from './ThreeEnv';

// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { PerspectiveCamera, Vector3 } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

export function restoreOriginal(renderedNodes: RenderedNodes | undefined) {
    if (renderedNodes) {
        renderedNodes.threeNodes.forEach((node) => {
            if (node.objectCSS && node.initialPosition) {
                node.objectCSS.position.x = node.initialPosition.x;
                node.objectCSS.position.y = node.initialPosition.y;
            }

            node.segments.forEach((segment, index) => {
                segment.position.x = node.segmentsInitialValues[index].x;
                segment.position.y = node.segmentsInitialValues[index].y;
                segment.element.style.height =
                    node.segmentsInitialValues[index].height;
            });
        });
    }
}

function transformSelectedNodes(
    node: ThreeGraphNode<ParsedSolFile>,
    style: GraphStyle,
    selectedNode: ThreeGraphNode<ParsedSolFile>,
) {
    if (node.yPos > selectedNode.yPos) {
        if (node.initialPosition && node.objectCSS) {
            node.objectCSS.position.y =
                node.initialPosition.y - style.EXPAND_HEIGHT;
        }

        node.segments.forEach((segment, index) => {
            segment.position.y =
                node.segmentsInitialValues[index].y - style.EXPAND_HEIGHT;
        });
    }

    if (node.yPos === selectedNode.yPos) {
        node.segments[3].position.y =
            node.segmentsInitialValues[3].y - style.EXPAND_HEIGHT / 2;

        node.segments[3].element.style.height =
            style.ELEMENT_HEIGHT / 2 +
            style.COL_DISTANCE / 2 +
            style.EXPAND_HEIGHT +
            'px';
        node.segments[4].position.y =
            node.segmentsInitialValues[4].y - style.EXPAND_HEIGHT;
    }
}

export function centerNode(
    selectedNode: ThreeGraphNode<ParsedSolFile>,
    camera: PerspectiveCamera | undefined,
    controls: TrackballControls | undefined,
    onComplete: () => void,
) {
    if (camera && selectedNode.objectCSS && controls) {
        const coords = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        };
        new TWEEN.Tween(coords)
            .to(
                {
                    x: selectedNode.objectCSS.position.x,
                    y: selectedNode.objectCSS.position.y,
                    z: 1,
                },
                500,
            )
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                camera.position.set(coords.x, coords.y, coords.z);
                if (selectedNode.objectCSS) {
                    controls.target = new Vector3(coords.x, coords.y, 0);
                }
            })
            .start()
            .onComplete(onComplete);
    }
}

export function expendNode(
    selectedNodeId: string | undefined,
    renderedNodes: RenderedNodes | undefined,
) {
    restoreOriginal(renderedNodes);
    const selectedNode =
        selectedNodeId &&
        renderedNodes?.threeNodes.find((node) => node.id === selectedNodeId);

    if (selectedNode && renderedNodes) {
        const style = renderedNodes.graphStyle;

        if (selectedNode.objectCSS && selectedNode.initialPosition) {
            //centerNode(selectedNode, camera, controls);
            selectedNode.objectCSS.position.y =
                selectedNode.initialPosition.y - style.EXPAND_HEIGHT / 2;
        }
        renderedNodes.threeNodes
            .filter((node) => node.yPos >= selectedNode.yPos)
            .forEach((node) => {
                transformSelectedNodes(node, style, selectedNode);
            });
    }
}
