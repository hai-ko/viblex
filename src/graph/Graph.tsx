import "./Graph.css";
import * as THREE from "three";

import { CSS3DRenderer, CSS3DObject  } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
//@ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";

interface Three {
  camera: PerspectiveCamera;
  renderer: CSS3DRenderer;
  scene: THREE.Scene;
  controls: TrackballControls;
}

interface GraphProps {
  width: number;
  height: number;
  table: (string | number)[]
}

function init(
  setThree: React.Dispatch<React.SetStateAction<Three | undefined>>,
  table: (string | number)[],
  threeContainer: React.MutableRefObject<null>
) {
    const height = (threeContainer.current as any).clientHeight;
    const width = (threeContainer.current as any).clientWidth;
    const camera = new THREE.PerspectiveCamera( 50, width / height, 1, 10000 );
	camera.position.z = 4200;

	const scene = new THREE.Scene();
    const objects: CSS3DObject[] = [];
    const targets: any = { table: [], sphere: [], helix: [], grid: [] };

    for ( let i = 0; i < table.length; i += 5 ) {

        const element = document.createElement( 'div' );
        element.className = 'element';
        

        const number = document.createElement( 'div' );
        number.className = 'number';
        number.textContent = (( i / 5 ) + 1).toString();
        element.appendChild( number );

        const symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = table[ i ].toString();
        element.appendChild( symbol );

        const details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
        element.appendChild( details );

        const objectCSS = new CSS3DObject( element );
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add( objectCSS );
        objects.push( objectCSS );

        const object = new THREE.Object3D();
        object.position.x = ( parseInt(table[ i + 3 ].toString()) * 140 ) - 1500;
        object.position.y = - ( parseInt(table[ i + 4 ].toString()) * 180 ) + 1400;

        targets.table.push(object);

      
    }

    const renderer = new CSS3DRenderer();
    (threeContainer.current as any).appendChild(renderer.domElement);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    const controls = new TrackballControls( camera, renderer.domElement );
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', () => render(three) );
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    controls.noRotate = true;

    const three = {
        camera,
        renderer,
        scene,
        controls,
    }

    transform( targets.table, 2000, objects );
    setThree(three);

}

function render(three: Three) {
    if (three) {
        three.renderer.render(three.scene, three.camera)
    }
    
}

function transform( targets: any, duration: number, objects: CSS3DObject[] ) {

    TWEEN.removeAll();

    for ( let i = 0; i < objects.length; i ++ ) {

        const object = objects[ i ];
        const target = targets[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    //@ts-ignore
    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}

function animate(three: Three) {
    requestAnimationFrame(() =>  animate(three) );

    TWEEN.update();

    three.controls.update();

    render(three);
}

function Graph(props: GraphProps) {
  const [three, setThree] = useState<Three | undefined>();
  const threeContainer = useRef(null);

  useEffect(() => {
    if (threeContainer && !three) {
      init(setThree, props.table, threeContainer);
    } 
  }, [threeContainer, three, props]);

  useEffect(() => {

    if(three) {
      animate(three)
    }

  }, [three]);

  return (
    <div ref={threeContainer} className="three-container" style={{height: props.height, width: props.width}} />
  );
}

export default Graph;
