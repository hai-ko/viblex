import { ethers } from 'ethers';
import * as THREE from 'three';
import {
    ACCOUNT_DISTNCE,
    ACCOUNT_PLANE_LENGT,
    ARROW_HEAD_SIZE,
} from './Geometries';
import {
    SelectedTransactionMaterial,
    LinkMaterial,
    TextMaterial,
} from './Materials';
import { scaleTo } from './Shared';
import { ThreeEnv } from './ThreeEnv';

function createText(
    text: string,
    font: THREE.Font,
    material: THREE.MeshBasicMaterial,
): { mesh: THREE.Mesh; size: THREE.Vector3 } {
    const textGeo = new THREE.TextGeometry(text, {
        font,
        height: 2,
        size: 25,
    });
    const textMesh = new THREE.Mesh(textGeo, material);

    const bBox = new THREE.Box3().setFromObject(textMesh);
    const size = new THREE.Vector3();
    bBox.getSize(size);
    return { mesh: textMesh, size };
}

export function createTransactionMesh(
    font: THREE.Font,
    parent: THREE.Object3D<THREE.Event>,
    tx: ethers.providers.TransactionResponse,
    threeEnv: ThreeEnv,
): THREE.Group {
    const parnentBBox = new THREE.Box3().setFromObject(parent);
    const parentSize = new THREE.Vector3();
    parnentBBox.getSize(parentSize);

    const txMeshGroup = new THREE.Group();

    const toPlane = new THREE.Mesh(
        threeEnv.geometries.SelectedTxPlane,
        SelectedTransactionMaterial,
    );
    toPlane.position.set(ACCOUNT_DISTNCE / 2 + ACCOUNT_PLANE_LENGT / 2, 0, -2);
    txMeshGroup.add(toPlane);

    const toText = createText(
        tx.to
            ? tx.to.slice(0, 4) +
                  '...' +
                  tx.to.slice(tx.to.length - 2, tx.to.length)
            : '0x0',
        font,
        TextMaterial,
    );
    toText.mesh.position.set(ACCOUNT_DISTNCE / 2 + 15, -toText.size.y / 2, -1);
    txMeshGroup.add(toText.mesh);

    const arrowHead = new THREE.Mesh(
        threeEnv.geometries.ArrowHead,
        LinkMaterial,
    );
    arrowHead.position.set(ACCOUNT_DISTNCE / 2 - 50, 0, -1);
    arrowHead.rotateY(Math.PI / 2);
    arrowHead.rotateZ(Math.PI / 2);
    txMeshGroup.add(arrowHead);

    const remainder = tx.value.mod(1e14);
    const ethValue = ethers.utils.formatEther(tx.value.sub(remainder));

    const valueText = createText(ethValue + ' ETH', font, LinkMaterial);

    valueText.mesh.position.set(
        ACCOUNT_DISTNCE / 2 - valueText.size.x - ARROW_HEAD_SIZE - 60,
        -valueText.size.y / 2,
        -1,
    );

    txMeshGroup.add(valueText.mesh);

    const fromPlane = new THREE.Mesh(
        threeEnv.geometries.SelectedTxPlane,
        SelectedTransactionMaterial,
    );
    fromPlane.position.set(
        valueText.mesh.position.x - ACCOUNT_PLANE_LENGT / 2 - 30,
        0,
        -2,
    );
    txMeshGroup.add(fromPlane);

    const fromText = createText(
        tx.from.slice(0, 4) +
            '...' +
            tx.from.slice(tx.from.length - 2, tx.from.length),
        font,
        TextMaterial,
    );
    fromText.mesh.position.set(
        valueText.mesh.position.x - ACCOUNT_PLANE_LENGT - 30 + 15,
        -fromText.size.y / 2,
        -1,
    );
    txMeshGroup.add(fromText.mesh);

    const bBox = new THREE.Box3().setFromObject(txMeshGroup);
    const size = new THREE.Vector3();
    bBox.getSize(size);

    txMeshGroup.position.set(
        parent.position.x - parentSize.x / 2 - (size.x / 2) * 2 - 200,
        1350,
        parent.position.z,
    );
    txMeshGroup.scale.set(0.01, 0.01, 0.01);
    scaleTo(new THREE.Vector3(2, 2, 2), txMeshGroup, 1000);

    return txMeshGroup;
}
