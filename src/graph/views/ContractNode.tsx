import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ParsedSolFile } from '../../lib/ParseSolidity';
import { getFileDisplayName } from '../../lib/FileHandling';
import { GraphStyle } from './../utils/GraphStyle';
import Icon from './Icon';
import { GraphNode } from './../utils/NodePosition';
import { GraphViewState } from './ContractGraph';
import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import { Context } from '../../lib/Graph';

interface FileNodeProps {
    node: GraphNode<Context<ParsedSolFile, ContractDefinition>>;
    graphStyle: GraphStyle;
    onMouseLeave?: () => void;
    onMouseOver?: () => void;
    selectedNodeId?: string;
    graphViewState: GraphViewState;
    nodeToMax?: string;
    setSelectedNode?: (nodeId: string | undefined) => void;
    setNodeToMax?: (nodeId: string | undefined) => void;
}

function getIcon(kind: string): JSX.Element {
    switch (kind) {
        case 'interface':
            return <Icon iconClass="fas fa-file-export" />;
        case 'library':
            return <Icon iconClass="fas fa-book" />;
        case 'abstract':
        case 'contract':
        default:
            return <Icon iconClass="fas fa-file-contract" />;
    }
}

function ContractNode(props: FileNodeProps) {
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

    return props.node.element ? (
        <div
            className={`node ${
                props.node.element.element.kind === 'contract'
                    ? 'contract-node'
                    : 'contract-other'
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
                <div className="col file-title text-left">
                    {getIcon(props.node.element.element.kind)}
                    &nbsp;&nbsp;
                    {getFileDisplayName(props.node.element.element.name)}
                </div>
            </div>
            {isNodeSelected && (
                <div className="row kind-info">
                    <div className="col-12">
                        <span className="badge bg-light text-dark">
                            {props.node.element.element.kind}
                        </span>
                    </div>
                </div>
            )}
        </div>
    ) : null;
}

export default ContractNode;
