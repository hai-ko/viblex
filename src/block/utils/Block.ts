import { ethers } from 'ethers';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { ThreeEnv } from './ThreeEnv';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { FrameMaterial, TextMaterial } from './Materials';
import { CUBE_LENGTH, FRAME_THICKNESS } from './Geometries';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import { scaleTo } from './Shared';

const CHAIN_START_X_SHIFT = -800;
const INITIAL_BLOCK_PART_SCALE = 0.1;
const TIME_DISTANCE_OFFSET = 100;
const SEC_DISTANCE = 10;
export const MAX_GAS_USED = 31000000;
export const MIN_GAS_USED = 0;
export const BLOCKS_TO_SHOW = 50;

function timeDiffToDistance(timeDiff: number): number {
    return timeDiff * SEC_DISTANCE + TIME_DISTANCE_OFFSET;
}

function vanishTransparency(material: THREE.MeshBasicMaterial) {
    new TWEEN.Tween(material)
        .to({ opacity: 1 }, 5000)
        .start()
        .onComplete(() => {
            material.transparent = false;
        });
}

function moveOldChainPart(
    threeEnv: ThreeEnv,
    startX: number,
    blockGroupTimeDiff: number,
    onComplete: () => void,
) {
    new TWEEN.Tween(threeEnv.blockchainGroup.position)
        .to(
            {
                x:
                    threeEnv.blockchainGroup.position.x +
                    startX -
                    CHAIN_START_X_SHIFT -
                    timeDiffToDistance(blockGroupTimeDiff),
                y: 0,
                z: 0,
            },
            1000,
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(onComplete);
}

function moveNewChainPart(blockGroup: THREE.Group, onComplete: () => void) {
    new TWEEN.Tween(blockGroup.position)
        .to(
            {
                x: 0,
                y: 0,
                z: 0,
            },
            1000,
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(onComplete);
}

function removeBlocks(threeEnv: ThreeEnv, lastBlockNumber: number) {
    Object.keys(threeEnv.blockObjects)
        .filter((key) => parseInt(key) <= lastBlockNumber - BLOCKS_TO_SHOW)
        .forEach((key) => {
            threeEnv.blockObjects[parseInt(key)].block.removeFromParent();
            threeEnv.blockObjects[parseInt(key)].link?.removeFromParent();
            threeEnv.blockObjects[parseInt(key)].textGeometry.dispose();
            delete threeEnv.blockObjects[parseInt(key)];
        });
}
export function createBlocks(
    threeEnv: ThreeEnv,
    blockBatchs: ethers.providers.Block[][],
) {
    const blocks = blockBatchs[blockBatchs.length - 1];

    removeBlocks(threeEnv, blocks[0].number);

    let startX = CHAIN_START_X_SHIFT;
    let blockTime = blocks[0].timestamp;

    let blockGroupTimeDiff =
        blockBatchs.length > 1
            ? blockBatchs[blockBatchs.length - 1][
                  blockBatchs[blockBatchs.length - 1].length - 1
              ].timestamp - blockBatchs[blockBatchs.length - 2][0].timestamp
            : 0;

    const blockGroup = new THREE.Group();

    const cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000f28,
        opacity: blockBatchs.length > 1 ? 0.1 : 1,
        transparent: blockBatchs.length > 1 ? true : false,
    });
    const linkMaterial = new THREE.MeshBasicMaterial({
        color: 0x848484,
        opacity: blockBatchs.length > 1 ? 0.1 : 1,
        transparent: blockBatchs.length > 1 ? true : false,
    });

    for (let i = 0; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const gasUsedRelation =
            (blocks[i].gasUsed.toNumber() - MIN_GAS_USED) /
            (MAX_GAS_USED - MIN_GAS_USED);
        const timeDiff = blockTime - currentBlock.timestamp;
        startX = createBlock(
            threeEnv,
            startX,
            currentBlock,
            200 * gasUsedRelation,
            timeDiff,
            blockGroup,
            i !== 0,
            cubeMaterial,
            linkMaterial,
            threeEnv.fonts[0],
        );
        blockTime = currentBlock.timestamp;
    }

    if (blockBatchs.length > 1) {
        blockGroup.position.setX(
            (-(
                startX +
                CHAIN_START_X_SHIFT -
                timeDiffToDistance(blockGroupTimeDiff)
            ) /
                2) *
                INITIAL_BLOCK_PART_SCALE,
        );
        blockGroup.scale.set(
            INITIAL_BLOCK_PART_SCALE,
            INITIAL_BLOCK_PART_SCALE,
            INITIAL_BLOCK_PART_SCALE,
        );
    }

    if (blockGroupTimeDiff > 0) {
        blockGroup.add(
            createLink(
                timeDiffToDistance(blockGroupTimeDiff) + TIME_DISTANCE_OFFSET,
                startX,
                linkMaterial,
                threeEnv,
            ),
        );
    }

    threeEnv.scene.add(blockGroup);

    moveOldChainPart(threeEnv, startX, blockGroupTimeDiff, () => {
        if (blockBatchs.length > 1) {
            vanishTransparency(cubeMaterial);
        }

        moveNewChainPart(blockGroup, () => {
            if (blockBatchs.length > 1) {
                vanishTransparency(linkMaterial);
            }
            const newBG = new THREE.Group();
            threeEnv.scene.remove(threeEnv.blockchainGroup);
            threeEnv.scene.remove(blockGroup);
            newBG.add(threeEnv.blockchainGroup);

            newBG.add(blockGroup);

            threeEnv.scene.add(newBG);
            threeEnv.blockchainGroup = newBG;
        });
        if (blockBatchs.length > 1) {
            scaleTo(new THREE.Vector3(1, 1, 1), blockGroup);
        }
    });
}

function createBlock(
    threeEnv: ThreeEnv,
    startX: number,
    block: ethers.providers.Block,
    flexSize: number,
    timeDiff: number,
    blockChainGroup: THREE.Group,
    showLink: boolean,
    cubeMaterial: THREE.MeshBasicMaterial,
    linkMaterial: THREE.MeshBasicMaterial,
    font: any,
): number {
    const fontSize = 20;
    const scale = (300 + flexSize) / CUBE_LENGTH;

    const cube = new THREE.Mesh(threeEnv.geometries.Cube, cubeMaterial);
    cube.userData.block = block;

    const blockGroup = new THREE.Group();
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
        cube.position,
        new THREE.Vector3(CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH),
    );

    const textGeometry = new TextGeometry(`#${block.number}`, {
        font,
        height: 2,
        size: fontSize,
    });

    const textMesh1 = new THREE.Mesh(textGeometry, TextMaterial);
    textMesh1.geometry.computeBoundingBox();
    const textMeshSize = new THREE.Vector3();
    textMesh1.geometry.boundingBox?.getSize(textMeshSize);
    textMesh1.position.set(
        0 - textMeshSize.length() / 2,
        -(fontSize / 2),
        CUBE_LENGTH / 2,
    );
    blockGroup.add(textMesh1);

    blockGroup.add(cube);

    createFramgeSegments(CUBE_LENGTH, cube.position, blockGroup, threeEnv);

    blockGroup.position.set(
        startX - (CUBE_LENGTH / 2) * scale - timeDiffToDistance(timeDiff),
        0,
        0,
    );
    blockGroup.scale.set(scale, scale, scale);
    blockChainGroup.add(blockGroup);

    cube.geometry.computeBoundingBox();

    const wp = new Vector3();
    cube.getWorldPosition(wp);

    const size = new Vector3();
    const boundingBox = new THREE.Box3().setFromObject(blockGroup);
    boundingBox.getSize(size);

    const nextStartX = wp.x - size.x / 2;

    let link;

    if (showLink) {
        (link = createLink(
            startX - nextStartX - size.x,
            startX,
            linkMaterial,
            threeEnv,
        )),
            blockChainGroup.add(link);
    }

    threeEnv.blockObjects[block.number] = {
        block: blockGroup,
        link,
        textGeometry,
    };

    return nextStartX;
}

function createLink(
    length: number,
    startX: number,
    linkMaterial: THREE.MeshBasicMaterial,
    threeEnv: ThreeEnv,
): THREE.Mesh {
    const link = new THREE.Mesh(threeEnv.geometries.Frame, linkMaterial);
    link.scale.setX(length / FRAME_THICKNESS),
        link.position.set(startX - length / 2, 0, 0);
    return link;
}

export function createFramgeSegments(
    length: number,
    cubePosition: THREE.Vector3,
    group: THREE.Group,
    threeEnv: ThreeEnv,
) {
    const frame1 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame1.scale.setX((length + FRAME_THICKNESS) / FRAME_THICKNESS);
    frame1.position.set(
        cubePosition.x,
        cubePosition.y - length / 2,
        cubePosition.z - length / 2,
    );
    frame1.layers.enable(1);
    group.add(frame1);

    const frame2 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame2.scale.setX((length + FRAME_THICKNESS) / FRAME_THICKNESS);
    frame2.position.set(
        cubePosition.x,
        cubePosition.y - length / 2,
        cubePosition.z + length / 2,
    );
    frame2.layers.enable(1);
    group.add(frame2);

    const frame3 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame3.scale.setX((length + FRAME_THICKNESS) / FRAME_THICKNESS);
    frame3.position.set(
        cubePosition.x,
        cubePosition.y + length / 2,
        cubePosition.z + length / 2,
    );
    frame3.layers.enable(1);
    group.add(frame3);

    const frame4 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame4.scale.setX((length + FRAME_THICKNESS) / FRAME_THICKNESS);
    frame4.position.set(
        cubePosition.x,
        cubePosition.y + length / 2,
        cubePosition.z - length / 2,
    );
    frame4.layers.enable(1);
    group.add(frame4);

    const frame5 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame5.scale.setZ((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame5.position.set(
        cubePosition.x + length / 2,
        cubePosition.y + length / 2,
        cubePosition.z,
    );
    frame5.layers.enable(1);
    group.add(frame5);

    const frame6 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame6.scale.setZ((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame6.position.set(
        cubePosition.x - length / 2,
        cubePosition.y + length / 2,
        cubePosition.z,
    );
    frame6.layers.enable(1);
    group.add(frame6);

    const frame7 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame7.scale.setZ((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame7.position.set(
        cubePosition.x - length / 2,
        cubePosition.y - length / 2,
        cubePosition.z,
    );
    frame7.layers.enable(1);
    group.add(frame7);

    const frame8 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame8.scale.setZ((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame8.position.set(
        cubePosition.x + length / 2,
        cubePosition.y - length / 2,
        cubePosition.z,
    );
    frame8.layers.enable(1);
    group.add(frame8);

    const frame9 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame9.scale.setY((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame9.position.set(
        cubePosition.x + length / 2,
        cubePosition.y,
        cubePosition.z - length / 2,
    );
    frame9.layers.enable(1);
    group.add(frame9);

    const frame10 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame10.scale.setY((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame10.position.set(
        cubePosition.x - length / 2,
        cubePosition.y,
        cubePosition.z + length / 2,
    );
    frame10.layers.enable(1);
    group.add(frame10);

    const frame11 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame11.scale.setY((length - FRAME_THICKNESS) / FRAME_THICKNESS);
    frame11.position.set(
        cubePosition.x - length / 2,
        cubePosition.y,
        cubePosition.z - length / 2,
    );
    frame11.layers.enable(1);
    group.add(frame11);

    const frame12 = new THREE.Mesh(threeEnv.geometries.Frame, FrameMaterial);
    frame12.scale.setY((length - FRAME_THICKNESS) / FRAME_THICKNESS);

    frame12.position.set(
        cubePosition.x + length / 2,
        cubePosition.y,
        cubePosition.z + length / 2,
    );
    frame12.layers.enable(1);
    group.add(frame12);
}
