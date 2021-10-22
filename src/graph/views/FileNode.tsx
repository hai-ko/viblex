import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../../lib/ParseSolidity';
import { getFileDisplayName } from '../../lib/FileHandling';
import { GraphStyle } from './../utils/GraphStyle';
import Icon from './Icon';
import { GraphNode } from './../utils/NodePosition';
import { GraphViewState } from './ContractGraph';

interface FileNodeProps {
    node: GraphNode<ParsedSolFile>;
    graphStyle: GraphStyle;
    onMouseLeave?: () => void;
    onMouseOver?: () => void;
    selectedNodeId?: string;
    graphViewState: GraphViewState;
    nodeToMax?: string;
    setSelectedNode?: (nodeId: string | undefined) => void;
    setNodeToMax?: (nodeId: string | undefined) => void;
}

export function getIcon(element: ParsedSolFile | undefined): JSX.Element {
    if (element?.error) {
        return <Icon iconClass="fas fa-exclamation-circle" />;
    }

    if (element) {
        switch (element.type) {
            case 'http':
            case 'https':
            case 'ipfs':
            case 'swarm':
                return <Icon iconClass="far fa-file-alt" />;

            case 'github':
                return <Icon iconClass="fab fa-gitpub" />;

            default:
                return <Icon iconClass="fas fa-file-alt" />;
        }
    } else {
        return <Icon iconClass="fas fa-file-alt" />;
    }
}

function FileNode(props: FileNodeProps) {
    const icon = getIcon(props.node.element);

    let version: string | undefined;

    if (props.node.element?.parsedContent) {
        const solVersionPragma = getPragmas(
            props.node.element.parsedContent.children,
        ).find((pragma) => pragma.name === 'solidity');
        version = solVersionPragma && solVersionPragma.value;
    }

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
                props.node.element?.error
                    ? 'error-node'
                    : props.node.element?.type
                    ? 'external-node'
                    : 'local-node'
            } file`}
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
                    {icon}&nbsp;&nbsp;
                    {getFileDisplayName(props.node.element.path)}
                </div>
            </div>
            {version && isNodeSelected && (
                <div className="row file-info">
                    <div className="col-1 text-center d-flex align-content-center flex-wrap">
                        <Icon iconClass="fas fa-tags" />
                    </div>
                    <div className="col-10">{version}</div>
                </div>
            )}
            {isNodeSelected && (
                <div className="row file-info">
                    <div className="col-1 text-center d-flex align-content-center flex-wrap">
                        <Icon iconClass="fas fa-folder-open" />
                    </div>
                    <div className="col-10">{props.node.element.path}</div>
                </div>
            )}
        </div>
    ) : null;
}

export default FileNode;
