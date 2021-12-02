import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { GraphStyle } from './../utils/GraphStyle';
import { GraphNode } from './../utils/NodePosition';
import { GraphViewState } from './GraphContainer';
import { ReplayTransaction } from '../../lib/TransactionSequence';
import Icon from '../../shared/Icon';

interface TxSequenceNodeProps {
    node: GraphNode<ReplayTransaction>;
    graphStyle: GraphStyle;
    isReturn: boolean;
    onMouseLeave?: () => void;
    onMouseOver?: () => void;
    selectedNodeId?: string;
    graphViewState: GraphViewState;
    nodeToMax?: string;
    setSelectedNode?: (nodeId: string | undefined) => void;
    setNodeToMax?: (nodeId: string | undefined) => void;
    txId: number;
}

function TxSequenceNode(props: TxSequenceNodeProps) {
    const isNodeSelected =
        props.selectedNodeId === props.node.id ||
        props.nodeToMax === props.node.id;

    const nodeDivStyle: React.CSSProperties = {
        width: props.graphStyle.ELEMENT_WIDTH.toString() + 'px',
        height:
            (isNodeSelected
                ? props.graphStyle.ELEMENT_HEIGHT +
                  props.graphStyle.EXPAND_HEIGHT
                : props.graphStyle.ELEMENT_HEIGHT
            ).toString() + 'px',
        borderWidth: props.graphStyle.SEGMENT_THICKNESS + 'px',
        borderColor: isNodeSelected
            ? props.graphStyle.SEGMENT_HIGHLIGHTED_COLOR
            : props.graphStyle.ELEMENT_BORDER_COLOR,
        borderStyle: 'solid',
    };

    return (
        <div
            className={`node contract ${
                props.isReturn ? 'contract-other' : 'contract-node'
            }`}
            style={nodeDivStyle}
            onMouseDown={() => {
                if (
                    props.graphViewState === GraphViewState.Ready &&
                    props.setNodeToMax &&
                    props.onMouseLeave
                ) {
                    props.setNodeToMax(props.node.id);
                    props.onMouseLeave();
                }
            }}
            onMouseLeave={() => {
                if (
                    props.graphViewState === GraphViewState.Ready &&
                    props.setSelectedNode &&
                    props.onMouseLeave
                ) {
                    props.setSelectedNode(undefined);
                    props.onMouseLeave();
                }
            }}
            onMouseOver={() => {
                if (
                    props.graphViewState === GraphViewState.Ready &&
                    props.setSelectedNode &&
                    props.onMouseOver
                ) {
                    props.setSelectedNode(props.node.id);
                    props.onMouseOver();
                }
            }}
        >
            <div className="row">
                <div className="col file-title text-left d-flex justify-content-between align-items-center">
                    <div className="seq-input-data">
                        {props.node.element &&
                            `${
                                props.txId
                            }/${props.node.element.action.input.slice(0, 10)}`}
                    </div>
                    <div>
                        <span className="badge bg-light text-dark call-type">
                            {props.node.element &&
                                (props.isReturn
                                    ? 'result'
                                    : props.node.element.action.callType)}
                        </span>
                    </div>
                </div>
            </div>
            {isNodeSelected && props.node.element && (
                <>
                    {!props.isReturn && (
                        <div className="row tx-info">
                            <div className="col-2 text-left ">
                                <Icon iconClass="fas fa-arrow-alt-circle-right" />
                            </div>
                            <div className="col-10">
                                <span className="seq-input-data">
                                    {(props.node.element.action.input.length -
                                        2) /
                                        2}
                                </span>{' '}
                                bytes
                            </div>
                        </div>
                    )}
                    {!props.isReturn && (
                        <div className="row tx-info">
                            <div className="col-2 text-left ">
                                <Icon iconClass="fab fa-ethereum" />
                            </div>
                            <div className="col-10 seq-input-data">
                                {props.node.element.action.value}
                            </div>
                        </div>
                    )}
                    {props.isReturn && (
                        <div className="row tx-info">
                            <div className="col-2 text-left ">
                                <Icon iconClass="fas fa-arrow-alt-circle-left" />
                            </div>
                            <div className="col-10">
                                <span className="seq-input-data">
                                    {' '}
                                    {(props.node.element.result.output.length -
                                        2) /
                                        2}
                                </span>{' '}
                                bytes
                            </div>
                        </div>
                    )}
                    {props.isReturn && (
                        <div className="row tx-info">
                            <div className="col-2 text-left ">
                                <Icon iconClass="fas fa-gas-pump" />
                            </div>
                            <div className="col-10 seq-input-data">
                                {props.node.element.result.gasUsed}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TxSequenceNode;
