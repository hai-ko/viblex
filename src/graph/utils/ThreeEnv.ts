import { PerspectiveCamera } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import {
    CSS3DObject,
    CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer';
import * as THREE from 'three';
import { DAG, ThreeGraphNode } from './NodePosition';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { showImportPaths } from './EdgeSegments';
import { DefaultGraphStyle, GraphStyle } from './GraphStyle';
import { createNodes, PortalParts } from './../views/Node';
import React from 'react';
import { GraphViewState } from './../views/ContractGraph';

export interface Three {
    camera: PerspectiveCamera;
    renderer: CSS3DRenderer;
    scene: THREE.Scene;
    controls: TrackballControls;
}

export interface RenderedNodes<T> {
    threeNodes: ThreeGraphNode<T>[];
    portals: PortalParts<T>[];
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

function transform<T>(threeNodes: ThreeGraphNode<T>[], duration: number) {
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

export function init<T>(
    setThree: React.Dispatch<React.SetStateAction<Three | undefined>>,
    dag: DAG<T>,
    threeContainer: React.RefObject<HTMLDivElement>,
    setGraphViewState: (state: GraphViewState) => void,
): RenderedNodes<T> {
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

    const maxX = Math.max(...nodes.threeNodes.map((node) => node.xPos));
    const stepDuration = graphStyle.ANIMATION_DURATION / maxX;

    showImportPaths(
        dag.edges,
        nodes.threeNodes,
        (o: CSS3DObject, xPos: number) => {
            setTimeout(() => three.scene.add(o), xPos * stepDuration + 1);
        },
    );

    window.addEventListener(
        'resize',
        () => onWindowResize(three, threeContainer, setThree),

        false,
    );

    autoFit(three, nodes);

    setThree(three);
    setGraphViewState(GraphViewState.Ready);

    return nodes;
}

export function autoFit<T>(three: Three, renderedNodes: RenderedNodes<T>) {
    const boundingBox = new THREE.Box2();

    for (const node of renderedNodes.threeNodes) {
        if (node.object) {
            boundingBox.expandByPoint(
                new THREE.Vector2(
                    node.object.position.x,
                    node.object.position.y,
                ),
            );
        }
    }

    const size = new THREE.Vector2();
    boundingBox.getSize(size);

    const center = new THREE.Vector2();
    boundingBox.getCenter(center);

    three.camera.position.x = center.x;
    three.camera.position.y = center.y;
    three.controls.target.copy(new THREE.Vector3(center.x, center.y, 0));

    const fov = three.camera.fov * (Math.PI / 180);
    const fovh = 2 * Math.atan(Math.tan(fov / 2) * three.camera.aspect);
    const dx = Math.abs(
        (size.x + renderedNodes.graphStyle.ELEMENT_WIDTH) /
            2 /
            Math.tan(fovh / 2),
    );
    const dy = Math.abs(
        (size.y + renderedNodes.graphStyle.EXPAND_HEIGHT) /
            2 /
            Math.tan(fov / 2),
    );

    const coords = {
        x: three.camera.position.x,
        y: three.camera.position.y,
        z: three.camera.position.z,
    };
    new TWEEN.Tween(coords)
        .to(
            {
                x: three.camera.position.x,
                y: three.camera.position.y,
                z: Math.max(dx, dy) * 1.1,
            },
            500,
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            three.camera.position.set(coords.x, coords.y, coords.z);
        })
        .start();

    three.camera.updateProjectionMatrix();

    three.controls.update();
}
