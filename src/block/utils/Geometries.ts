import * as THREE from 'three';

export const CUBE_LENGTH = 200;
export const ACCOUNT_PLANE_LENGT = 220;
export const ACCOUNT_DISTNCE = 350;
export const ARROW_HEAD_SIZE = 20;
export const TX_PLANE_SIZE = 40;
export const TX_VALUE_SIZE = 10;

export const BlockPlaneGeometry = new THREE.PlaneGeometry(100, 100);

export const CubeGeometry = new THREE.BoxGeometry(
    CUBE_LENGTH,
    CUBE_LENGTH,
    CUBE_LENGTH,
);

export const TxPlaneGeometry = new THREE.PlaneGeometry(
    TX_PLANE_SIZE,
    TX_PLANE_SIZE,
);

export const TxValueGeometry = new THREE.BoxGeometry(
    TX_VALUE_SIZE,
    TX_VALUE_SIZE,
    1,
);

export const SelectedTxPlaneGeometry = new THREE.PlaneGeometry(
    ACCOUNT_PLANE_LENGT,
    75,
);

export const ArrowHeadGeometry = new THREE.CylinderGeometry(
    ARROW_HEAD_SIZE,
    ARROW_HEAD_SIZE,
    5,
    3,
);
