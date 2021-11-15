import { ethers } from 'ethers';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { ThreeEnv } from './ThreeEnv';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

const CHAIN_START_X_SHIFT = -800;
const INITIAL_BLOCK_PART_SCALE = 0.1;
const TIME_DISTANCE_OFFSET = 30;
const SEC_DISTANCE = 10;

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

function scaleToNormal(group: THREE.Group) {
    const scale = {
        x: INITIAL_BLOCK_PART_SCALE,
        y: INITIAL_BLOCK_PART_SCALE,
        z: INITIAL_BLOCK_PART_SCALE,
    };
    new TWEEN.Tween(scale)
        .to(
            {
                x: 1,
                y: 1,
                z: 1,
            },
            2000,
        )
        .onUpdate(() => {
            group.scale.set(scale.x, scale.y, scale.z);
        })
        .start();
}

function moveOldChainPart(
    threeEnv: ThreeEnv,
    startX: number,
    blockGroupTimeDiff: number,
    onComplete: () => void,
) {
    const coords = {
        x: threeEnv.blockchainGroup.position.x,
        y: threeEnv.blockchainGroup.position.y,
        z: threeEnv.blockchainGroup.position.z,
    };
    new TWEEN.Tween(coords)
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
        .onUpdate(() => {
            threeEnv.blockchainGroup.position.set(coords.x, coords.y, coords.z);
        })
        .start()
        .onComplete(onComplete);
}

function moveNewChainPart(blockGroup: THREE.Group, onComplete: () => void) {
    const bgCoords = {
        x: blockGroup.position.x,
        y: blockGroup.position.y,
        z: blockGroup.position.z,
    };
    new TWEEN.Tween(bgCoords)
        .to(
            {
                x: 0,
                y: 0,
                z: 0,
            },
            1000,
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            blockGroup.position.set(bgCoords.x, bgCoords.y, bgCoords.z);
        })
        .start()
        .onComplete(onComplete);
}

export function createBlocks(
    threeEnv: ThreeEnv,
    blockBatchs: ethers.providers.Block[][],
) {
    const blocks = blockBatchs[blockBatchs.length - 1];
    const maxGasUsed = 31000000;
    const minGasUsed = 0;

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
            (blocks[i].gasUsed.toNumber() - minGasUsed) /
            (maxGasUsed - minGasUsed);
        const timeDiff = blockTime - currentBlock.timestamp;
        startX = createBlock(
            startX,
            currentBlock.number,
            300 * gasUsedRelation,
            timeDiff,
            blockGroup,
            i !== 0,
            cubeMaterial,
            linkMaterial,
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
            scaleToNormal(blockGroup);
        }
    });
}

function createBlock(
    startX: number,
    blockNumber: number,
    flexSize: number,
    timeDiff: number,
    blockChainGroup: THREE.Group,
    showLink: boolean,
    cubeMaterial: THREE.MeshBasicMaterial,
    linkMaterial: THREE.MeshBasicMaterial,
): number {
    const length = 200;
    const fontSize = 20;

    const scale = length / (100 + flexSize);

    const geometry = new THREE.BoxGeometry(length, length, length);

    const cube = new THREE.Mesh(geometry, cubeMaterial);

    const blockGroup = new THREE.Group();
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
        cube.position,
        new THREE.Vector3(length, length, length),
    );

    const loader = new THREE.FontLoader();
    loader.load('js/droid_sans_regular.typeface.json', function (response) {
        const textGeo = new THREE.TextGeometry(`#${blockNumber}`, {
            font: response,
            height: 2,
            size: fontSize,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh1 = new THREE.Mesh(textGeo, textMaterial);
        textMesh1.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        textMesh1.geometry.boundingBox?.getSize(size);
        textMesh1.position.set(
            0 - size.length() / 2,
            -(fontSize / 2),
            length / 2,
        );
        blockGroup.add(textMesh1);
    });

    blockGroup.add(cube);

    createFramgeSegments(length, cube.position, blockGroup);

    blockGroup.position.set(
        startX - (length / 2) * scale - timeDiffToDistance(timeDiff),
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

    if (showLink) {
        blockChainGroup.add(
            createLink(startX - nextStartX - size.x, startX, linkMaterial),
        );
    }

    return nextStartX;
}

function createLink(
    length: number,
    startX: number,
    linkMaterial: THREE.MeshBasicMaterial,
): THREE.Mesh {
    const linkThickness = 2;
    const link = new THREE.Mesh(
        new THREE.BoxGeometry(length, linkThickness, linkThickness),
        linkMaterial,
    );
    link.position.set(startX - length / 2, 0, 0);
    return link;
}

export function createFramgeSegments(
    length: number,
    cubePosition: THREE.Vector3,
    group: THREE.Group,
) {
    const frameThickness = 3;
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const frame1 = new THREE.Mesh(
        new THREE.BoxGeometry(
            length + frameThickness,
            frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame1.position.set(
        cubePosition.x,
        cubePosition.y - length / 2,
        cubePosition.z - length / 2,
    );

    group.add(frame1);

    const frame2 = new THREE.Mesh(
        new THREE.BoxGeometry(
            length + frameThickness,
            frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame2.position.set(
        cubePosition.x,
        cubePosition.y - length / 2,
        cubePosition.z + length / 2,
    );

    group.add(frame2);

    const frame3 = new THREE.Mesh(
        new THREE.BoxGeometry(
            length + frameThickness,
            frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame3.position.set(
        cubePosition.x,
        cubePosition.y + length / 2,
        cubePosition.z + length / 2,
    );

    group.add(frame3);

    const frame4 = new THREE.Mesh(
        new THREE.BoxGeometry(
            length + frameThickness,
            frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame4.position.set(
        cubePosition.x,
        cubePosition.y + length / 2,
        cubePosition.z - length / 2,
    );

    group.add(frame4);

    const frame5 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            frameThickness,
            length - frameThickness,
        ),
        frameMaterial,
    );
    frame5.position.set(
        cubePosition.x + length / 2,
        cubePosition.y + length / 2,
        cubePosition.z,
    );

    group.add(frame5);

    const frame6 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            frameThickness,
            length - frameThickness,
        ),
        frameMaterial,
    );
    frame6.position.set(
        cubePosition.x - length / 2,
        cubePosition.y + length / 2,
        cubePosition.z,
    );

    group.add(frame6);

    const frame7 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            frameThickness,
            length - frameThickness,
        ),
        frameMaterial,
    );
    frame7.position.set(
        cubePosition.x - length / 2,
        cubePosition.y - length / 2,
        cubePosition.z,
    );

    group.add(frame7);

    const frame8 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            frameThickness,
            length - frameThickness,
        ),
        frameMaterial,
    );
    frame8.position.set(
        cubePosition.x + length / 2,
        cubePosition.y - length / 2,
        cubePosition.z,
    );

    group.add(frame8);

    const frame9 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            length - frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame9.position.set(
        cubePosition.x + length / 2,
        cubePosition.y,
        cubePosition.z - length / 2,
    );

    group.add(frame9);

    const frame10 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            length - frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame10.position.set(
        cubePosition.x - length / 2,
        cubePosition.y,
        cubePosition.z + length / 2,
    );

    group.add(frame10);

    const frame11 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            length - frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame11.position.set(
        cubePosition.x - length / 2,
        cubePosition.y,
        cubePosition.z - length / 2,
    );

    group.add(frame11);

    const frame12 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            length - frameThickness,
            frameThickness,
        ),
        frameMaterial,
    );
    frame12.position.set(
        cubePosition.x + length / 2,
        cubePosition.y,
        cubePosition.z + length / 2,
    );

    group.add(frame12);
}
