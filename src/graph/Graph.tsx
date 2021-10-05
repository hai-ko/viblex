import './Graph.css';

import { useEffect, useRef, useState } from 'react';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { DAG } from './NodePosition';
import Menu from './Menu';
import { animate, init, Three } from './ThreeEnv';

interface GraphProps {
    dag: DAG<ParsedSolFile>;
}

function zoomIn(three: Three | undefined) {
    if (three) {
        three.camera.fov *= 0.9;
        three.camera.updateProjectionMatrix();
    }
}

function zoomOut(three: Three | undefined) {
    if (three) {
        three.camera.fov *= 1.1;
        three.camera.updateProjectionMatrix();
    }
}

function Graph(props: GraphProps) {
    const [three, setThree] = useState<Three | undefined>();
    const threeContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (threeContainer && !three) {
            init(setThree, props.dag, threeContainer);
        }
    }, [threeContainer, three, props]);

    useEffect(() => {
        if (three) {
            animate(three);
        }
    }, [three]);

    return (
        <div ref={threeContainer} className="w-100 h-100 three-container">
            <Menu zoomIn={() => zoomIn(three)} zoomOut={() => zoomOut(three)} />
        </div>
    );
}

export default Graph;
