import * as THREE from 'three';

export const CUBE_LENGTH = 200;

export const BlockPlaneGeometry = new THREE.PlaneGeometry(100, 100);

export const CubeGeometry = new THREE.BoxGeometry(
    CUBE_LENGTH,
    CUBE_LENGTH,
    CUBE_LENGTH,
);

export const TxPlaneGeometry = new THREE.PlaneGeometry(40, 40);
