import * as THREE from 'three';

export function createFrame(
    position: THREE.Vector3,
    width: number,
    height: number,
    material: THREE.Material,
): THREE.Group {
    const frameGroup = new THREE.Group();
    const frameThickness = 5;

    const frame1 = new THREE.Mesh(
        new THREE.BoxGeometry(width, frameThickness, frameThickness),
        material,
    );
    frame1.position.set(0, height / 2, 0);

    frameGroup.add(frame1);

    const frame2 = new THREE.Mesh(
        new THREE.BoxGeometry(width, frameThickness, frameThickness),
        material,
    );
    frame2.position.set(0, -height / 2, 0);

    frameGroup.add(frame2);

    const frame3 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            height + frameThickness,
            frameThickness,
        ),
        material,
    );
    frame3.position.set(height / 2, 0, 0);

    frameGroup.add(frame3);

    const frame4 = new THREE.Mesh(
        new THREE.BoxGeometry(
            frameThickness,
            height + frameThickness,
            frameThickness,
        ),
        material,
    );
    frame4.position.set(-height / 2, 0, 0);

    frameGroup.add(frame4);

    frameGroup.position.set(position.x, position.y, position.z);

    return frameGroup;
}
