import * as THREE from 'three';

export const TxPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x002009,
    side: THREE.DoubleSide,
});

export const TxDataPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x006009,
    side: THREE.DoubleSide,
});

export const TxValueMaterial = new THREE.MeshBasicMaterial({
    color: 0x009f1b,

    side: THREE.DoubleSide,
});

export const FrameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

export const CubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000f28,
    opacity: 1,
    transparent: false,
});

export const SelectedCubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x007f1b,
    transparent: true,
    opacity: 0.5,
});

export const LinkMaterial = new THREE.MeshBasicMaterial({
    color: 0x848484,
    opacity: 1,
    transparent: false,
});

export const TextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

export const BlockPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x000f28,
    side: THREE.DoubleSide,
});

export const SelectedTransactionMaterial = new THREE.MeshBasicMaterial({
    color: 0x3d1111,
    side: THREE.DoubleSide,
});
