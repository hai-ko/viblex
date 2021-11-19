import { ethers } from 'ethers';
import * as THREE from 'three';
import { Object3D } from 'three';
import { createFullBlock } from './FullBlock';
import { CubeMaterial, SelectedCubeMaterial } from './Materials';
import { ThreeEnv } from './ThreeEnv';

export function onClick(
    threeEnv: ThreeEnv | undefined,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ethProvider: ethers.providers.Web3Provider,
) {
    if (threeEnv) {
        event.preventDefault();
        const mouse = new THREE.Vector2();

        const canvasBounds = threeEnv.renderer
            .getContext()
            .canvas.getBoundingClientRect();
        mouse.x =
            ((event.clientX - canvasBounds.left) /
                (canvasBounds.right - canvasBounds.left)) *
                2 -
            1;
        mouse.y =
            -(
                (event.clientY - canvasBounds.top) /
                (canvasBounds.bottom - canvasBounds.top)
            ) *
                2 +
            1;

        threeEnv.raycaster.setFromCamera(mouse, threeEnv.camera);
        const objects: any[] = [];
        threeEnv.blockchainGroup.traverseVisible((obj) => objects.push(obj));

        const intersects = threeEnv.raycaster.intersectObjects(objects, false);
        intersects.sort(sortIntersections);
        const filtered = intersects.filter((intersect) =>
            intersect.object.userData.block ? true : false,
        );

        if (filtered[0] && !threeEnv.selectedBlock) {
            (filtered[0].object as any).material = SelectedCubeMaterial;

            const fullBlockGroup = createFullBlock(
                filtered[0].object.userData.block,
                (filtered[0].object.parent as Object3D).scale,
                ethProvider,
            );
            (filtered[0].object.parent as Object3D).add(fullBlockGroup);
            filtered[0].object.userData.fullBlock = fullBlockGroup;

            threeEnv.selectedBlock = filtered[0].object;
        } else if (filtered.length === 0 && threeEnv.selectedBlock) {
            // (threeEnv.selectedBlock as any).material = CubeMaterial;
            // (threeEnv.selectedBlock.parent as Object3D).remove(
            //     threeEnv.selectedBlock.userData.fullBlock,
            // );
            // delete threeEnv.selectedBlock.userData.fullBlock;
            // threeEnv.selectedBlock = undefined;
        } else if (
            threeEnv.selectedBlock &&
            filtered[0].object.userData.block?.number !==
                threeEnv.selectedBlock.userData.block?.number
        ) {
            (threeEnv.selectedBlock as any).material = CubeMaterial;

            const fullBlockGroup = createFullBlock(
                filtered[0].object.userData.block,
                (filtered[0].object.parent as Object3D).scale,
                ethProvider,
            );
            (filtered[0].object.parent as Object3D).add(fullBlockGroup);
            filtered[0].object.userData.fullBlock = fullBlockGroup;
            (threeEnv.selectedBlock.parent as Object3D).remove(
                threeEnv.selectedBlock.userData.fullBlock,
            );
            delete threeEnv.selectedBlock.userData.fullBlock;

            (filtered[0].object as any).material = SelectedCubeMaterial;

            threeEnv.selectedBlock = filtered[0].object;
        }
    }
}

function sortIntersections(a: any, b: any) {
    return a.distance - b.distance;
}
