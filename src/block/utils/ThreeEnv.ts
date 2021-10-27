import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'three';

export interface ThreeEnv {
    camera: PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    ethNodesGroup: THREE.Group;
    controls: OrbitControls;
    settings: {
        showDots: boolean;
        showLines: boolean;
        minDistance: number;
        limitConnections: boolean;
        maxConnections: number;
        particleCount: number;
    };
}

interface ParticlesData {
    velocity: THREE.Vector3;
    numConnections: number;
}
interface EthNodesData {
    nodesParticlePositions: Float32Array;
    colors: Float32Array;
    positions: Float32Array;
    particlesData: ParticlesData[];
    pointCloud: THREE.Points;
    r: number;
    rHalf: number;
    linesMesh: THREE.LineSegments;
}

function createThree(width: number, height: number): ThreeEnv {
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.z = 2000;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1000;
    controls.maxDistance = 5000;

    const ethNodesGroup = new THREE.Group();
    scene.add(ethNodesGroup);

    return {
        camera,
        renderer,
        scene,
        ethNodesGroup,
        controls,
        settings: {
            showDots: true,
            showLines: true,
            minDistance: 150,
            limitConnections: false,
            maxConnections: 20,
            particleCount: 500,
        },
    };
}

export function onWindowResize(
    three: ThreeEnv,
    threeContainer: React.RefObject<HTMLDivElement>,
    setThree: React.Dispatch<React.SetStateAction<ThreeEnv | undefined>>,
) {
    if (threeContainer.current) {
        const newWidth = threeContainer.current.clientWidth;
        const newHeight = threeContainer.current.clientHeight;
        three.renderer.setSize(newWidth, newHeight);
        three.camera.aspect = newWidth / newHeight;
        three.camera.updateProjectionMatrix();
    }
}

function render(threeEnv: ThreeEnv) {
    if (threeEnv) {
        const time = Date.now() * 0.001;

        threeEnv.ethNodesGroup.rotation.y = time * 0.1;
        threeEnv.renderer.render(threeEnv.scene, threeEnv.camera);
    }
}

export function animate(threeEnv: ThreeEnv, nodeData: EthNodesData) {
    if (nodeData) {
        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for (let i = 0; i < threeEnv.settings.particleCount; i++)
            nodeData.particlesData[i].numConnections = 0;

        for (let i = 0; i < threeEnv.settings.particleCount; i++) {
            // get the particle
            const particleData = nodeData.particlesData[i];

            nodeData.nodesParticlePositions[i * 3] += particleData.velocity.x;
            nodeData.nodesParticlePositions[i * 3 + 1] +=
                particleData.velocity.y;
            nodeData.nodesParticlePositions[i * 3 + 2] +=
                particleData.velocity.z;

            if (
                nodeData.nodesParticlePositions[i * 3 + 1] < -nodeData.rHalf ||
                nodeData.nodesParticlePositions[i * 3 + 1] > nodeData.rHalf
            )
                particleData.velocity.y = -particleData.velocity.y;

            if (
                nodeData.nodesParticlePositions[i * 3] < -nodeData.rHalf ||
                nodeData.nodesParticlePositions[i * 3] > nodeData.rHalf
            )
                particleData.velocity.x = -particleData.velocity.x;

            if (
                nodeData.nodesParticlePositions[i * 3 + 2] < -nodeData.rHalf ||
                nodeData.nodesParticlePositions[i * 3 + 2] > nodeData.rHalf
            )
                particleData.velocity.z = -particleData.velocity.z;

            if (
                threeEnv.settings.limitConnections &&
                particleData.numConnections >= threeEnv.settings.maxConnections
            )
                continue;

            // Check collision
            for (let j = i + 1; j < threeEnv.settings.particleCount; j++) {
                const particleDataB = nodeData.particlesData[j];
                if (
                    threeEnv.settings.limitConnections &&
                    particleDataB.numConnections >=
                        threeEnv.settings.maxConnections
                )
                    continue;

                const dx =
                    nodeData.nodesParticlePositions[i * 3] -
                    nodeData.nodesParticlePositions[j * 3];
                const dy =
                    nodeData.nodesParticlePositions[i * 3 + 1] -
                    nodeData.nodesParticlePositions[j * 3 + 1];
                const dz =
                    nodeData.nodesParticlePositions[i * 3 + 2] -
                    nodeData.nodesParticlePositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < threeEnv.settings.minDistance) {
                    particleData.numConnections++;
                    particleDataB.numConnections++;

                    const alpha = 1.0 - dist / threeEnv.settings.minDistance;

                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[i * 3];
                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[i * 3 + 1];
                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[i * 3 + 2];
                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[j * 3];
                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[j * 3 + 1];
                    nodeData.positions[vertexpos++] =
                        nodeData.nodesParticlePositions[j * 3 + 2];

                    nodeData.colors[colorpos++] = alpha;
                    nodeData.colors[colorpos++] = alpha;
                    nodeData.colors[colorpos++] = alpha;

                    nodeData.colors[colorpos++] = alpha;
                    nodeData.colors[colorpos++] = alpha;
                    nodeData.colors[colorpos++] = alpha;

                    numConnected++;
                }
            }
        }

        nodeData.linesMesh.geometry.setDrawRange(0, numConnected * 2);
        nodeData.linesMesh.geometry.attributes.position.needsUpdate = true;
        nodeData.linesMesh.geometry.attributes.color.needsUpdate = true;

        nodeData.pointCloud.geometry.attributes.position.needsUpdate = true;

        requestAnimationFrame(() => animate(threeEnv, nodeData));

        render(threeEnv);
    }
}

export function init(
    setThree: React.Dispatch<React.SetStateAction<ThreeEnv | undefined>>,
    threeContainer: React.RefObject<HTMLDivElement>,
) {
    const height = (threeContainer.current as any).clientHeight;
    const width = (threeContainer.current as any).clientWidth;
    const threeEnv = createThree(height, width);
    const r = 800;
    const rHalf = r / 2;

    const particlesData: ParticlesData[] = [];
    const maxNodeParticleCount = 1000;

    const segments = maxNodeParticleCount * maxNodeParticleCount;
    const positions = new Float32Array(segments * 3);
    const colors = new Float32Array(segments * 3);

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false,
    });

    const nodeParticles = new THREE.BufferGeometry();
    const nodesParticlePositions = new Float32Array(maxNodeParticleCount * 3);

    for (let i = 0; i < maxNodeParticleCount; i++) {
        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        nodesParticlePositions[i * 3] = x;
        nodesParticlePositions[i * 3 + 1] = y;
        nodesParticlePositions[i * 3 + 2] = z;

        // add it to the geometry
        particlesData.push({
            velocity: new THREE.Vector3(
                -1 + Math.random() * 2,
                -1 + Math.random() * 2,
                -1 + Math.random() * 2,
            ),
            numConnections: 0,
        });
    }

    nodeParticles.setDrawRange(0, threeEnv.settings.particleCount);
    nodeParticles.setAttribute(
        'position',
        new THREE.BufferAttribute(nodesParticlePositions, 3).setUsage(
            THREE.DynamicDrawUsage,
        ),
    );

    // create the particle system
    const pointCloud = new THREE.Points(nodeParticles, particleMaterial);
    threeEnv.ethNodesGroup.add(pointCloud);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3).setUsage(
            THREE.DynamicDrawUsage,
        ),
    );
    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage),
    );

    geometry.computeBoundingSphere();

    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
    });

    const linesMesh = new THREE.LineSegments(geometry, material);
    threeEnv.ethNodesGroup.add(linesMesh);

    //

    (threeContainer.current as any).appendChild(threeEnv.renderer.domElement);

    window.addEventListener(
        'resize',
        () => onWindowResize(threeEnv, threeContainer, setThree),

        false,
    );

    setThree(threeEnv);

    animate(threeEnv, {
        r,
        rHalf,
        colors,
        linesMesh,
        nodesParticlePositions,
        particlesData,
        pointCloud,
        positions,
    });
}
