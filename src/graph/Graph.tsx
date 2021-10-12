import './Graph.css';

import React, { useEffect, useRef, useState } from 'react';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { DAG } from './NodePosition';
import Menu from './Menu';
import {
    animate,
    init,
    onWindowResize,
    RenderedNodes,
    Three,
} from './ThreeEnv';
import ReactDOM from 'react-dom';
import FileNode from './FileNode';
import { centerNode, expendNode } from './NodeSelection';
import FileView from './FileView';

interface GraphProps {
    dag: DAG<ParsedSolFile>;
}

export enum GraphViewState {
    Wait,
    Ready,
    NodeSelected,
    NodeMaxed,
}

function zoomIn(three: Three | undefined) {
    if (three && three.controls.minDistance < three.camera.position.z * 0.9) {
        three.camera.position.z *= 0.9;
        three.camera.updateProjectionMatrix();

        three.controls.update();
    }
}

function zoomOut(three: Three | undefined) {
    if (three && three.controls.maxDistance > three.camera.position.z * 1.1) {
        three.camera.position.z *= 1.1;
        three.camera.updateProjectionMatrix();
        three.controls.update();
    }
}

function Graph(props: GraphProps) {
    const [three, setThree] = useState<Three | undefined>();
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
    const [graphViewState, setGraphViewState] = useState<GraphViewState>(
        GraphViewState.Wait,
    );
    const threeContainer = useRef<HTMLDivElement>(null);
    const [renderedNodes, setRenderedNodes] = useState<RenderedNodes>();

    const exitMaxNode = () => {
        setGraphViewState(GraphViewState.Ready);
        setSelectedNodeId(undefined);
        if (threeContainer && three) {
            three.camera.position.z = 4200;
        }
    };

    expendNode(selectedNodeId, renderedNodes);

    useEffect(() => {
        if (graphViewState === GraphViewState.Ready && three) {
            onWindowResize(three, threeContainer, setThree);
        }
    }, [graphViewState]);

    useEffect(() => {
        if (threeContainer && !three) {
            setRenderedNodes(
                init(setThree, props.dag, threeContainer, setGraphViewState),
            );
        }
    }, [threeContainer, three, props]);

    useEffect(() => {
        if (three) {
            animate(three);
        }
    }, [three]);

    const maxNode = (nodeId: string | undefined) => {
        const newNodeToMax = renderedNodes?.threeNodes.find(
            (threeNode) => threeNode.id === nodeId,
        );

        if (newNodeToMax) {
            setSelectedNodeId(newNodeToMax.id);
            setGraphViewState(GraphViewState.Wait);
            centerNode(newNodeToMax, three?.camera, three?.controls, () =>
                setGraphViewState(GraphViewState.NodeMaxed),
            );
        }
    };

    const maxedNode =
        renderedNodes &&
        graphViewState === GraphViewState.NodeMaxed &&
        renderedNodes.threeNodes.find((node) => node.id === selectedNodeId);

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
                      setNodeToMax={maxNode}
                      graphViewState={graphViewState}
                      nodeToMax={selectedNodeId}
                  />,
                  portalPart.nodeDiv,
              ),
          )
        : null;

    return (
        <>
            {maxedNode && renderedNodes && (
                <FileView
                    graphStyle={renderedNodes.graphStyle}
                    node={maxedNode}
                    exitMaxNode={exitMaxNode}
                />
            )}
            <div
                ref={threeContainer}
                style={{ display: !maxedNode ? 'block' : 'none' }}
                className="w-100 h-100 three-container"
            >
                {portals}
                <Menu
                    zoomIn={() => zoomIn(three)}
                    zoomOut={() => zoomOut(three)}
                />
            </div>
        </>
    );
}

export default Graph;
