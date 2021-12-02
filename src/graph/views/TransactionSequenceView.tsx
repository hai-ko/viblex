import { useEffect, useRef, useState } from 'react';
import * as Trace from './TestTrace.json';
import {
    getAllAcccountAddresses,
    ReplayTransaction,
} from '../../lib/TransactionSequence';
import Menu from '../../shared/Menu';
import {
    animate,
    autoFit,
    initSequenceDiagram,
    onWindowResize,
    Three,
} from '../utils/ThreeEnv';
import { zoomIn, zoomOut } from '../utils/Zoom';
import { PortalParts, RenderedSequenceNodes, SeqNodeType } from './Node';
import TxSequenceNode from './TxSequenceNode';
import ReactDOM from 'react-dom';
import { GraphViewState } from './GraphContainer';
import TxAccountNode from './TxAccountNode';
import { GraphNode } from '../utils/NodePosition';

interface TransactionSequenceViewProps {
    setView: (view: string) => void;
    view: string;
}

function TransactionSequenceView(props: TransactionSequenceViewProps) {
    const threeContainer = useRef<HTMLDivElement>(null);
    const [three, setThree] = useState<Three | undefined>();
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
    const [renderedNodes, setRenderedNodes] = useState<RenderedSequenceNodes>();
    const [graphViewState, setGraphViewState] = useState<GraphViewState>(
        GraphViewState.Wait,
    );

    useEffect(() => {
        if (graphViewState === GraphViewState.Ready && three) {
            onWindowResize(three, threeContainer, setThree);
        }
    }, [graphViewState]);

    useEffect(() => {
        if (threeContainer && !three) {
            setRenderedNodes(
                initSequenceDiagram(
                    setThree,
                    Trace.result.trace,
                    threeContainer,
                    setGraphViewState,
                ),
            );
        }
    }, [threeContainer, three]);

    useEffect(() => {
        if (three) {
            animate(three);
        }
    }, [three]);

    const fit = () => {
        if (three && renderedNodes) {
            autoFit(
                three,
                renderedNodes.sequenceDiagramNodes.map((pair) => pair.object3D),
                renderedNodes.graphStyle,
            );
        }
    };

    useEffect(() => {
        fit();
    }, [props.view, renderedNodes, three]);

    const maxNode = (nodeId: string | undefined) => {};

    const portals = renderedNodes
        ? renderedNodes.sequenceDiagramNodes.map((node) =>
              node.seqNodeType === SeqNodeType.Account
                  ? ReactDOM.createPortal(
                        <TxAccountNode
                            graphStyle={node.portal.graphStyle}
                            node={node.portal.node as GraphNode<string>}
                            onMouseLeave={node.portal.onMouseLeave}
                            onMouseOver={node.portal.onMouseOver}
                            setSelectedNode={setSelectedNodeId}
                            selectedNodeId={selectedNodeId}
                            setNodeToMax={maxNode}
                            graphViewState={graphViewState}
                            nodeToMax={selectedNodeId}
                        />,
                        node.portal.nodeDiv,
                    )
                  : ReactDOM.createPortal(
                        <TxSequenceNode
                            graphStyle={node.portal.graphStyle}
                            node={
                                node.portal.node as GraphNode<ReplayTransaction>
                            }
                            onMouseLeave={node.portal.onMouseLeave}
                            onMouseOver={node.portal.onMouseOver}
                            setSelectedNode={setSelectedNodeId}
                            selectedNodeId={selectedNodeId}
                            setNodeToMax={maxNode}
                            graphViewState={graphViewState}
                            nodeToMax={selectedNodeId}
                            isReturn={
                                node.seqNodeType ===
                                SeqNodeType.TransactionResult
                            }
                            txId={node.txId}
                        />,
                        node.portal.nodeDiv,
                    ),
          )
        : null;

    return (
        <>
            {/* {maxedNode && renderedNodes && (
            <FileView
                graphStyle={renderedNodes.graphStyle}
                node={maxedNode}
                exitMaxNode={exitMaxNode}
            />
        )} */}
            <div
                ref={threeContainer}
                // style={{ display: !maxedNode ? 'block' : 'none' }}
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

export default TransactionSequenceView;
