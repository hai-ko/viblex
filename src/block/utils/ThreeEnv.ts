import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

import * as THREE from 'three';
import { Geometries, GeometriesRecords } from './Geometries';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export interface ThreeEnv {
    camera: PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    controls: OrbitControls;
    raycaster: THREE.Raycaster;
    blockchainGroup: THREE.Group;
    cloudGroups: THREE.Group[];
    selectedBlock?: THREE.Object3D;
    selectedTransaction?: THREE.Object3D;
    fonts: any[];
    composer: EffectComposer;
    geometries: GeometriesRecords;
    stats?: Stats;
    blockObjects: {
        block: THREE.Group;
        link:
            | THREE.Mesh<
                  THREE.BufferGeometry,
                  THREE.Material | THREE.Material[]
              >
            | undefined;
        textGeometry: TextGeometry;
    }[];
}

interface ParticlesData {
    velocity: THREE.Vector3;
    numConnections: number;
}

interface CloudSettings {
    r: number;
    rHalfY: number;
    position: THREE.Vector3;
    showDots: boolean;
    showLines: boolean;
    minDistance: number;
    limitConnections: boolean;
    maxConnections: number;
    particleCount: number;
    dotSize: number;
    pointColor: string;
    transparent: boolean;
    sizeAttenuation: boolean;
}

interface CloudData {
    nodesParticlePositions: Float32Array;
    colors: Float32Array;
    positions: Float32Array;
    particlesData: ParticlesData[];
    pointCloud: THREE.Points;
    r: number;
    rHalf: number;
    rHalfY: number;
    linesMesh: THREE.LineSegments;
    settings: CloudSettings;
}

export function loadFont(path: string): Promise<any> {
    const loader = new FontLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, function (response) {
            resolve(response);
        });
    });
}

async function createThree(width: number, height: number): Promise<ThreeEnv> {
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000000);
    camera.position.z = 4000;
    camera.position.x = -3000;
    camera.position.y = 2000;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1000;
    controls.maxDistance = 7000;
    controls.target = new THREE.Vector3(-1000, 0, 0);
    controls.update();

    const ethNodesGroup = new THREE.Group();
    const blockchainGroup = new THREE.Group();
    scene.add(ethNodesGroup);
    scene.add(blockchainGroup);

    const grid = new THREE.GridHelper(100000, 100, 0x111111, 0x111111);

    grid.position.set(-20000, -2000, 0);
    scene.add(grid);

    const renderScene = new RenderPass(scene, camera);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms.resolution.value.set(
        1 / (width * window.devicePixelRatio),
        1 / (height * window.devicePixelRatio),
    );

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        1.5,
        0.4,
        0.85,
    );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.55;
    bloomPass.renderToScreen = true;

    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);

    composer.addPass(renderScene);

    composer.addPass(bloomPass);
    composer.addPass(effectFXAA);

    //setInterval(() => console.log(renderer.info), 10000);
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;
    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
    });

    return {
        camera,
        renderer,
        scene,
        controls,
        raycaster: new THREE.Raycaster(),
        cloudGroups: [],
        blockchainGroup,
        fonts: [await loadFont('js/droid_sans_mono_regular.typeface.json')],
        composer,
        geometries: Geometries,
        blockObjects: [],
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
        three.composer.setSize(newWidth, newHeight);
    }
}

function render(threeEnv: ThreeEnv) {
    if (threeEnv) {
        const time = Date.now() * 0.001;
        threeEnv.cloudGroups.forEach(
            (group) => (group.rotation.y = time * 0.01),
        );
        if (threeEnv.stats) {
            threeEnv.stats.update();
        }
        threeEnv.renderer.autoClear = false;
        threeEnv.renderer.clear();

        threeEnv.camera.layers.set(1);
        threeEnv.composer.render();

        threeEnv.renderer.clearDepth();
        threeEnv.camera.layers.set(0);
        threeEnv.renderer.render(threeEnv.scene, threeEnv.camera);
    }
}

function animateCloud(nodeData: CloudData) {
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < nodeData.settings.particleCount; i++)
        nodeData.particlesData[i].numConnections = 0;

    for (let i = 0; i < nodeData.settings.particleCount; i++) {
        // get the particle
        const particleData = nodeData.particlesData[i];

        nodeData.nodesParticlePositions[i * 3] += particleData.velocity.x * 0.5;
        nodeData.nodesParticlePositions[i * 3 + 1] +=
            particleData.velocity.y * 0.5;
        nodeData.nodesParticlePositions[i * 3 + 2] +=
            particleData.velocity.z * 0.5;

        if (
            nodeData.nodesParticlePositions[i * 3 + 1] < -nodeData.rHalfY ||
            nodeData.nodesParticlePositions[i * 3 + 1] > nodeData.rHalfY
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
            nodeData.settings.limitConnections &&
            particleData.numConnections >= nodeData.settings.maxConnections
        )
            continue;

        // Check collision
        for (let j = i + 1; j < nodeData.settings.particleCount; j++) {
            const particleDataB = nodeData.particlesData[j];
            if (
                nodeData.settings.limitConnections &&
                particleDataB.numConnections >= nodeData.settings.maxConnections
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

            if (dist < nodeData.settings.minDistance) {
                particleData.numConnections++;
                particleDataB.numConnections++;

                const alpha = 1.0 - dist / nodeData.settings.minDistance;

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
}

export function animate(
    threeEnv: ThreeEnv,
    nodeData: CloudData,
    txData: CloudData,
) {
    if (nodeData) {
        animateCloud(nodeData);
    }

    if (txData) {
        animateCloud(txData);
    }

    TWEEN.update();

    requestAnimationFrame(() => animate(threeEnv, nodeData, txData));

    render(threeEnv);
}

function createCloud(
    group: THREE.Group,
    cloudSettings: CloudSettings,
): CloudData {
    const r = cloudSettings.r;
    const rHalf = r / 2;
    const rHalfY = r / cloudSettings.rHalfY;

    const particlesData: ParticlesData[] = [];
    const maxNodeParticleCount = 500;

    const segments = maxNodeParticleCount * maxNodeParticleCount;
    const positions = new Float32Array(segments * 3);
    const colors = new Float32Array(segments * 3);

    const particleMaterial = new THREE.PointsMaterial({
        color: cloudSettings.pointColor,
        size: cloudSettings.dotSize,
        //blending: THREE.AdditiveBlending,
        transparent: cloudSettings.transparent,
        sizeAttenuation: cloudSettings.sizeAttenuation,
    });

    const nodesParticlePositions = new Float32Array(maxNodeParticleCount * 3);

    for (let i = 0; i < maxNodeParticleCount; i++) {
        const x = Math.random() * r - r / 2;
        const y = Math.random() * rHalfY * 2 - rHalfY;
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
    const nodeParticles = new THREE.BufferGeometry();
    nodeParticles.setDrawRange(0, cloudSettings.particleCount);
    nodeParticles.setAttribute(
        'position',
        new THREE.BufferAttribute(nodesParticlePositions, 3).setUsage(
            THREE.DynamicDrawUsage,
        ),
    );

    // create the particle system
    const pointCloud = new THREE.Points(nodeParticles, particleMaterial);
    group.position.set(
        cloudSettings.position.x,
        cloudSettings.position.y,
        cloudSettings.position.z,
    );
    pointCloud.layers.enable(1);
    group.add(pointCloud);

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
    linesMesh.visible = cloudSettings.showLines;
    group.add(linesMesh);

    return {
        r,
        rHalf,
        rHalfY,
        colors,
        linesMesh,
        nodesParticlePositions,
        particlesData,
        pointCloud,
        positions,
        settings: cloudSettings,
    };
}

export async function init(
    setThreeEnv: React.Dispatch<React.SetStateAction<ThreeEnv | undefined>>,
    threeContainer: React.RefObject<HTMLDivElement>,
    showStats: boolean,
) {
    const height = (threeContainer.current as any).clientHeight;
    const width = (threeContainer.current as any).clientWidth;
    const threeEnv = await createThree(height, width);
    (threeContainer.current as any).appendChild(threeEnv.renderer.domElement);
    if (showStats) {
        const stats: any = Stats() as any;
        (threeContainer.current as any).appendChild(stats.dom);
        threeEnv.stats = stats;
    }

    window.addEventListener(
        'resize',
        () => onWindowResize(threeEnv, threeContainer, setThreeEnv),

        false,
    );

    const nodeCloud = new THREE.Group();
    const txCloud = new THREE.Group();
    threeEnv.scene.add(nodeCloud);
    threeEnv.scene.add(txCloud);
    animate(
        threeEnv,
        createCloud(nodeCloud, {
            r: 1000,
            rHalfY: 2,
            position: new THREE.Vector3(0, 0, 0),
            showDots: true,
            showLines: true,
            minDistance: 150,
            limitConnections: false,
            maxConnections: 20,
            particleCount: 300,
            dotSize: 3,
            pointColor: '#ffffff',
            transparent: false,
            sizeAttenuation: false,
        }),
        createCloud(txCloud, {
            r: 1000,
            rHalfY: 2,
            position: new THREE.Vector3(0, 0, 0),
            showDots: true,
            showLines: false,
            minDistance: 150,
            limitConnections: false,
            maxConnections: 0,
            particleCount: 500,
            dotSize: 2,
            pointColor: '#007f1b',
            transparent: false,
            sizeAttenuation: false,
        }),
    );
    setThreeEnv(threeEnv);
}
