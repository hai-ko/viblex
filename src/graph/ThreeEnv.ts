import { PerspectiveCamera } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import {
    CSS3DObject,
    CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer';
import * as THREE from 'three';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { DAG, ThreeGraphNode } from './NodePosition';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { showImportPaths } from './EdgeSegments';
import { DefaultGraphStyle, GraphStyle } from './GraphStyle';
import { createNodes, PortalParts } from './Node';
import React from 'react';
import { GraphViewState } from './Graph';

export interface Three {
    camera: PerspectiveCamera;
    renderer: CSS3DRenderer;
    scene: THREE.Scene;
    controls: TrackballControls;
}

export interface RenderedNodes {
    threeNodes: ThreeGraphNode<ParsedSolFile>[];
    portals: PortalParts[];
    graphStyle: GraphStyle;
}

function createThree(width: number, height: number): Three {
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
    camera.position.z = 4200;

    const scene = new THREE.Scene();

    const renderer = new CSS3DRenderer();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 12000;

    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    controls.noRotate = true;

    return {
        camera,
        renderer,
        scene,
        controls,
    };
}

export function onWindowResize(
    three: Three,
    threeContainer: React.RefObject<HTMLDivElement>,
    setThree: React.Dispatch<React.SetStateAction<Three | undefined>>,
) {
    if (threeContainer.current) {
        const newWidth = threeContainer.current.clientWidth;
        const newHeight = threeContainer.current.clientHeight;
        three.renderer.setSize(newWidth, newHeight);
        three.camera.aspect = newWidth / newHeight;
        three.camera.updateProjectionMatrix();
        three.controls.handleResize();
        setThree({
            ...three,
        });
    }
}

function render(three: Three) {
    if (three) {
        three.renderer.render(three.scene, three.camera);
    }
}

export function animate(three: Three) {
    requestAnimationFrame(() => animate(three));

    TWEEN.update();

    three.controls.update();

    render(three);
}

function transform(
    threeNodes: ThreeGraphNode<ParsedSolFile>[],
    duration: number,
) {
    TWEEN.removeAll();

    for (const node of threeNodes) {
        const object = node.objectCSS;
        const target = node.object;

        if (object && target) {
            new TWEEN.Tween(object.position)
                .to(
                    {
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z,
                    },
                    Math.random() * duration + duration,
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(object.rotation)
                .to(
                    {
                        x: target.rotation.x,
                        y: target.rotation.y,
                        z: target.rotation.z,
                    },
                    Math.random() * duration + duration,
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
    }

    //@ts-ignore
    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

export function init(
    setThree: React.Dispatch<React.SetStateAction<Three | undefined>>,
    dag: DAG<ParsedSolFile>,
    threeContainer: React.RefObject<HTMLDivElement>,
    setGraphViewState: (state: GraphViewState) => void,
): RenderedNodes {
    const graphStyle = DefaultGraphStyle;
    const height = (threeContainer.current as any).clientHeight;
    const width = (threeContainer.current as any).clientWidth;

    const three = createThree(width, height);

    (threeContainer.current as any).appendChild(three.renderer.domElement);
    three.controls.addEventListener('change', () => render(three));
    three.controls.handleResize();

    const objects: CSS3DObject[] = [];

    const nodes = createNodes(
        DefaultGraphStyle,
        dag,
        height,
        width,
        three.camera,
    );

    for (const node of nodes.threeNodes) {
        if (node.objectCSS) {
            three.scene.add(node.objectCSS);
            objects.push(node.objectCSS);
        }
    }

    transform(nodes.threeNodes, graphStyle.ANIMATION_DURATION);

    setTimeout(
        () =>
            showImportPaths(dag.edges, nodes.threeNodes, (o: CSS3DObject) => {
                three.scene.add(o);
            }),
        graphStyle.ANIMATION_DURATION * 2,
    );

    window.addEventListener(
        'resize',
        () => onWindowResize(three, threeContainer, setThree),

        false,
    );

    setThree(three);
    setGraphViewState(GraphViewState.Ready);

    return nodes;
}
