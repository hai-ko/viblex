import { Three } from './ThreeEnv';

export function zoomIn(three: Three | undefined) {
    if (three && three.controls.minDistance < three.camera.position.z * 0.9) {
        three.camera.position.z *= 0.9;
        three.camera.updateProjectionMatrix();

        three.controls.update();
    }
}

export function zoomOut(three: Three | undefined) {
    if (three && three.controls.maxDistance > three.camera.position.z * 1.1) {
        three.camera.position.z *= 1.1;
        three.camera.updateProjectionMatrix();
        three.controls.update();
    }
}
