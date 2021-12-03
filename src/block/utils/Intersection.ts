import { ethers } from 'ethers';
import * as THREE from 'three';
import { Object3D } from 'three';
import { createFullBlock } from './FullBlock';
import { CubeMaterial, FrameMaterial, SelectedCubeMaterial } from './Materials';
import { createFrame } from './Shared';
import { ThreeEnv } from './ThreeEnv';
import { createTransactionMesh } from './Transaction';

export function onClick(
    threeEnv: ThreeEnv | undefined,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ethProvider: ethers.providers.Web3Provider,
    selectBlock: (block: ethers.providers.Block) => void,
    selectTransaction: (
        transaction: ethers.providers.TransactionResponse,
    ) => void,
) {
    if (threeEnv) {
        //event.preventDefault();
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
            intersect.object.userData.block
                ? true
                : false || intersect.object.userData.transaction
                ? true
                : false,
        );

        const selectedElement: THREE.Intersection | undefined = filtered[0];

        if (selectedElement && selectedElement.object.userData.block) {
            blockSelected(selectedElement, threeEnv, ethProvider, selectBlock);
        } else if (
            selectedElement &&
            selectedElement.object.userData.transaction
        ) {
            transactionSelected(selectedElement, threeEnv, selectTransaction);
        }
    }
}

function blockSelected(
    selectedElement: THREE.Intersection,
    threeEnv: ThreeEnv,
    ethProvider: ethers.providers.Web3Provider,
    selectBlock: (block: ethers.providers.Block) => void,
) {
    if (
        threeEnv.selectedBlock &&
        selectedElement.object.userData.block?.number !==
            threeEnv.selectedBlock.userData.block?.number
    ) {
        (threeEnv.selectedBlock as any).material = CubeMaterial;
        (threeEnv.selectedBlock.parent as Object3D).remove(
            threeEnv.selectedBlock.userData.fullBlock,
        );
        delete threeEnv.selectedBlock.userData.fullBlock;
    }

    if (
        (threeEnv.selectedBlock &&
            selectedElement.object.userData.block?.number !==
                threeEnv.selectedBlock.userData.block?.number) ||
        !threeEnv.selectedBlock
    ) {
        (selectedElement.object as any).material = SelectedCubeMaterial;

        const fullBlockGroup = createFullBlock(
            selectedElement.object.userData.block,
            (selectedElement.object.parent as Object3D).scale,
            ethProvider,
        );
        (selectedElement.object.parent as Object3D).add(fullBlockGroup);
        selectedElement.object.userData.fullBlock = fullBlockGroup;

        threeEnv.selectedBlock = selectedElement.object;
        selectBlock(selectedElement.object.userData.block);
    }
}

function transactionSelected(
    selectedElement: THREE.Intersection,
    threeEnv: ThreeEnv,
    selectTransaction: (
        transaction: ethers.providers.TransactionResponse,
    ) => void,
) {
    if (selectedElement.object.parent) {
        const tx = selectedElement.object.userData
            .transaction as ethers.providers.TransactionResponse;
        if (threeEnv.selectedTransaction) {
            threeEnv.selectedTransaction.parent?.remove(
                threeEnv.selectedTransaction.userData.transactionFrame,
            );
            threeEnv.selectedTransaction.parent?.remove(
                threeEnv.selectedTransaction.userData.selectedTxView,
            );
        }

        const size: number = (selectedElement.object as any).geometry.parameters
            .width;

        const transactionFrame = createFrame(
            selectedElement.object.position,
            size + 7,
            size + 7,
            FrameMaterial,
        );
        selectedElement.object.parent?.add(transactionFrame);
        selectedElement.object.userData.transactionFrame = transactionFrame;

        const selectedTxView = createTransactionMesh(
            threeEnv.fonts[0],
            selectedElement.object.parent,
            tx,
        );
        selectedElement.object.parent?.add(selectedTxView);
        selectedElement.object.userData.selectedTxView = selectedTxView;

        threeEnv.selectedTransaction = selectedElement.object;

        selectTransaction(tx);
    }
}

function sortIntersections(a: any, b: any) {
    return a.distance - b.distance;
}
