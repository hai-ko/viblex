import './Graph.css';

import React, { useEffect, useRef, useState } from 'react';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { DAG } from './NodePosition';
import Menu from './Menu';
import { animate, init, RenderedNodes, Three } from './ThreeEnv';
import ReactDOM from 'react-dom';
import FileNode from './FileNode';
import { expendNode, restoreOriginal } from './Node';

interface GraphProps {
    dag: DAG<ParsedSolFile>;
}

function zoomIn(three: Three | undefined) {
    if (three) {
        three.camera.fov *= 0.9;
        three.camera.updateProjectionMatrix();
        three.controls.update();
    }
}

function zoomOut(three: Three | undefined) {
    if (three) {
        three.camera.fov *= 1.1;
        three.camera.updateProjectionMatrix();
        three.controls.update();
    }
}

function Graph(props: GraphProps) {
    const [three, setThree] = useState<Three | undefined>();
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
    const threeContainer = useRef<HTMLDivElement>(null);
    const [renderedNodes, setRenderedNodes] = useState<RenderedNodes>();

    expendNode(selectedNodeId, renderedNodes);

    useEffect(() => {
        if (threeContainer && !three) {
            setRenderedNodes(init(setThree, props.dag, threeContainer));
        }
    }, [threeContainer, three, props]);

    useEffect(() => {
        if (three) {
            animate(three);
        }
    }, [three]);

    const portals = renderedNodes
        ? renderedNodes.portals.map((portalPart) =>
              ReactDOM.createPortal(
                  <FileNode
                      graphStyle={portalPart.graphStyle}
                      node={portalPart.node}
                      onMouseLeave={portalPart.onMouseLeave}
                      onMouseOver={portalPart.onMouseOver}
                      setSelectedNode={setSelectedNodeId}
                      selectedNodeId={selectedNodeId}
                  />,
                  portalPart.nodeDiv,
              ),
          )
        : null;

    return (
        <div ref={threeContainer} className="w-100 h-100 three-container">
            {portals}
            <Menu zoomIn={() => zoomIn(three)} zoomOut={() => zoomOut(three)} />
        </div>
    );
}

export default Graph;
