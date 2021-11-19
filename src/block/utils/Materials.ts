import * as THREE from 'three';

export const TxPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x7f5700,
    side: THREE.DoubleSide,
});

export const FrameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

export const CubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000f28,
    opacity: 1,
    transparent: false,
});

export const SelectedCubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x7f5700,
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
