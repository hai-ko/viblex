import * as THREE from 'three';
import { ThreeEnv } from './ThreeEnv';

export function createBlock(threeEnv: ThreeEnv) {
    const length = 300;
    const fontSize = 30;

    const geometry = new THREE.BoxGeometry(length, length, length);
    const material = new THREE.MeshBasicMaterial({ color: 0x000f28 });
    const cube = new THREE.Mesh(geometry, material);

    const blockGroup = new THREE.Group();
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
        cube.position,
        new THREE.Vector3(length, length, length),
    );

    const loader = new THREE.FontLoader();
    loader.load('js/droid_sans_regular.typeface.json', function (response) {
        const textGeo = new THREE.TextGeometry('#13513706', {
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

    blockGroup.position.set(-1000, 0, 0);
    //blockGroup.scale.set(3,3,3);
    threeEnv.scene.add(blockGroup);
}

function createFramgeSegments(
    length: number,
    cubePosition: THREE.Vector3,
    group: THREE.Group,
) {
    const frameThickness = 5;
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
