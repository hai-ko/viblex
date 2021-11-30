import { ethers } from 'ethers';
import * as THREE from 'three';
import { Vector3 } from 'three';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { TxPlaneGeometry } from './Geometries';
import { LinkMaterial } from './Materials';

export async function moveMesh(
    mesh: THREE.Mesh,
    position: THREE.Vector3,
    time: number,
): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
        new TWEEN.Tween(mesh.position)
            .to(
                {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                },
                time,
            )
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()
            .onComplete(() => resolve());
    });
}

export async function rotateMesh(
    mesh: THREE.Mesh,
    time: number,
): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
        new TWEEN.Tween(mesh.rotation)
            .to({ x: 0, y: 0, z: 0 }, time)
            .easing(TWEEN.Easing.Quadratic.Out)

            .start()
            .onComplete(() => resolve());
    });
}

export async function scaleMesh(
    mesh: THREE.Mesh,
    targetScale: number,
    time: number,
): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
        new TWEEN.Tween(mesh.scale)
            .to(
                {
                    x: targetScale,
                    y: targetScale,
                    z: targetScale,
                },
                time,
            )
            .start()
            .onComplete(() => resolve());
    });
}

export function createFullBlock(
    block: ethers.providers.Block,
    scale: THREE.Vector3,
    ethProvider: ethers.providers.Web3Provider,
): THREE.Group {
    const fullBlockGroup = new THREE.Group();
    fullBlockGroup.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z);

    createTxPlane(block, fullBlockGroup, ethProvider);

    return fullBlockGroup;
}

async function createTxPlane(
    block: ethers.providers.Block,
    fullBlockGroup: THREE.Object3D,

    ethProvider: ethers.providers.Web3Provider,
) {
    const distance = 180 / block.transactions.length;
    const startX = -90;
    const txPerRow = Math.ceil(Math.sqrt(block.transactions.length));

    const blockWithTransactions = await ethProvider.getBlockWithTransactions(
        block.number,
    );

    const txGasLimit = blockWithTransactions.transactions.map((tx) =>
        tx.gasLimit.toNumber(),
    );
    const maxGasLimit = Math.max(...txGasLimit);

    const dataSize = blockWithTransactions.transactions.map(
        (tx) => tx.data.length,
    );
    const maxDataSize = Math.max(...dataSize);

    for (let i = 0; i < block.transactions.length; i++) {
        const tx = blockWithTransactions.transactions[i];

        const plane = new THREE.Mesh(
            TxPlaneGeometry,
            new THREE.MeshBasicMaterial({
                color: 0x007f1b,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5 + 0.5 * (tx.data.length / maxDataSize),
            }),
        );
        plane.userData.transaction = tx;
        plane.position.setX(startX + distance * i);
        plane.rotateY(Math.PI / 2);
        fullBlockGroup.add(plane);
        const gasLimitScale =
            0.5 + 0.5 * (tx.gasLimit.toNumber() / maxGasLimit);
        plane.scale.set(gasLimitScale, gasLimitScale, gasLimitScale);
        const farX = (i % txPerRow) * 50 - ((txPerRow - 1) * 50) / 2;
        const farY =
            1300 +
            txPerRow * 50 -
            Math.floor(i / txPerRow) * 50 -
            ((txPerRow - 1) * 50) / 2;
        moveMesh(
            plane,
            new Vector3(farX, farY, 0),
            Math.random() * 1000 + 1000,
        );
        rotateMesh(plane, 500);
    }
}