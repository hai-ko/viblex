import './Graph.css';

import React, { useEffect, useRef, useState } from 'react';
import { ParsedSolFile } from '../../lib/ParseSolidity';
import { DAG } from './../utils/NodePosition';
import Menu from '../../shared/Menu';
import {
    animate,
    autoFit,
    init,
    onWindowResize,
    RenderedNodes,
    Three,
} from './../utils/ThreeEnv';
import ReactDOM from 'react-dom';
import FileNode from './FileNode';
import { centerNode, expendNode } from './../utils/NodeSelection';
import FileView from './FileView';
import { zoomIn, zoomOut } from '../utils/Zoom';
import { GraphViewState } from './GraphContainer';

interface GraphProps {
    filesDAG: DAG<ParsedSolFile>;
    setView: (view: string) => void;
    view: string;
}

function FileGraph(props: GraphProps) {
    const [three, setThree] = useState<Three | undefined>();
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
    const [graphViewState, setGraphViewState] = useState<GraphViewState>(
        GraphViewState.Wait,
    );
    const threeContainer = useRef<HTMLDivElement>(null);
    const [renderedNodes, setRenderedNodes] =
        useState<RenderedNodes<ParsedSolFile>>();

    const exitMaxNode = () => {
        setGraphViewState(GraphViewState.Ready);
        setSelectedNodeId(undefined);
        if (threeContainer && three && renderedNodes) {
            autoFit(
                three,
                renderedNodes.threeNodes
                    .filter((node) => node.object)
                    .map(
                        (node) => node.object,
                    ) as THREE.Object3D<THREE.Event>[],
                renderedNodes.graphStyle,
            );
        }
    };

    expendNode(selectedNodeId, renderedNodes);

    useEffect(() => {
        if (graphViewState === GraphViewState.Ready && three) {
            onWindowResize(three, threeContainer, setThree);
        }
    }, [graphViewState]);

    useEffect(() => {
        if (three && renderedNodes) {
            autoFit(
                three,
                renderedNodes.threeNodes
                    .filter((node) => node.object)
                    .map(
                        (node) => node.object,
                    ) as THREE.Object3D<THREE.Event>[],
                renderedNodes.graphStyle,
            );
        }
    }, [props.view, renderedNodes, three]);

    useEffect(() => {
        if (threeContainer && !three) {
            setRenderedNodes(
                init(
                    setThree,
                    props.filesDAG,
                    threeContainer,
                    setGraphViewState,
                ),
            );
        }
    }, [threeContainer, three, props, props.filesDAG]);

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

    const fit = () => {
        if (three && renderedNodes) {
            autoFit(
                three,
                renderedNodes.threeNodes
                    .filter((node) => node.object)
                    .map(
                        (node) => node.object,
                    ) as THREE.Object3D<THREE.Event>[],
                renderedNodes.graphStyle,
            );
        }
    };

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
                    autoZoom={fit}
                    setView={props.setView}
                    defaultView={props.view}
                />
            </div>
        </>
    );
}

export default FileGraph;
