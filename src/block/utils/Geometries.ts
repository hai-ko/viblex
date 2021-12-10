import * as THREE from 'three';

export const CUBE_LENGTH = 200;
export const ACCOUNT_PLANE_LENGT = 220;
export const ACCOUNT_DISTNCE = 350;
export const ARROW_HEAD_SIZE = 20;
export const TX_PLANE_SIZE = 40;
export const TX_VALUE_SIZE = 10;
export const FRAME_THICKNESS = 5;

export type GeometriesRecords = Record<
    | 'BlockPlane'
    | 'Cube'
    | 'TxPlane'
    | 'TxValue'
    | 'SelectedTxPlane'
    | 'ArrowHead'
    | 'Frame',
    THREE.BufferGeometry
>;

export const Geometries: GeometriesRecords = {
    BlockPlane: new THREE.PlaneGeometry(100, 100),

    Cube: new THREE.BoxGeometry(CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH),

    TxPlane: new THREE.PlaneGeometry(TX_PLANE_SIZE, TX_PLANE_SIZE),

    TxValue: new THREE.BoxGeometry(TX_VALUE_SIZE, TX_VALUE_SIZE, 1),

    SelectedTxPlane: new THREE.PlaneGeometry(ACCOUNT_PLANE_LENGT, 75),

    ArrowHead: new THREE.CylinderGeometry(
        ARROW_HEAD_SIZE,
        ARROW_HEAD_SIZE,
        5,
        3,
    ),

    Frame: new THREE.BoxGeometry(
        FRAME_THICKNESS,
        FRAME_THICKNESS,
        FRAME_THICKNESS,
    ),
};
