import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../../lib/ParseSolidity';
import { getFileDisplayName } from '../../lib/FileHandling';
import { GraphStyle } from './../utils/GraphStyle';
import Icon from './Icon';
import { GraphNode } from './../utils/NodePosition';
import ViewEntry from './ViewEntry';

interface FileViewProps {
    node: GraphNode<ParsedSolFile>;
    graphStyle: GraphStyle;
    exitMaxNode: () => void;
}

export function getIcon(element: ParsedSolFile | undefined): JSX.Element {
    if (element?.error) {
        return <Icon iconClass="fas fa-exclamation-circle error" />;
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

function FileView(props: FileViewProps) {
    let version: string | undefined;

    const icon = getIcon(props.node.element);

    if (props.node.element?.parsedContent) {
        const solVersionPragma = getPragmas(
            props.node.element.parsedContent.children,
        ).find((pragma) => pragma.name === 'solidity');
        version = solVersionPragma && solVersionPragma.value;
    }

    return props.node.element ? (
        <div
            className={`file-view h-100 ${
                props.node.element?.type ? 'external-node' : 'local-node'
            } file`}
        >
            <div className="row">
                <div className="col text-right">
                    <button
                        type="button"
                        className="btn btn-lg btn-primary menu-btn"
                        onClick={props.exitMaxNode}
                    >
                        <Icon iconClass="fas fa-times" />
                    </button>
                </div>
            </div>
            <div className="container view-container">
                <div className="row ">
                    <div className="col title text-center">
                        {getFileDisplayName(props.node.element.path)}.sol
                    </div>
                </div>
                <div className="row kind-info">
                    <div className="col-12 text-center ">
                        <span
                            className={`badge bg-light text-dark${
                                props.node.element.error ? ' error' : ''
                            }`}
                        >
                            &nbsp;{icon}&nbsp;&nbsp;File&nbsp;
                        </span>
                    </div>
                </div>
                <div className="row ">
                    <div className="col view-headline text-left">
                        <Icon iconClass="fas fa-info-circle" /> General
                        Information
                    </div>
                </div>
                {version && (
                    <ViewEntry
                        title="Solidity Version"
                        content={version}
                        top={true}
                    />
                )}

                <ViewEntry
                    title="URL"
                    content={props.node.element.path}
                    top={version ? false : true}
                />
                {props.node.element.error && (
                    <>
                        <div className="row ">
                            <div className="col view-headline text-left">
                                <Icon iconClass="fas fa-exclamation-circle" />{' '}
                                Error
                            </div>
                        </div>
                        <ViewEntry
                            title="Message"
                            content={props.node.element.error}
                            top={true}
                        />
                    </>
                )}
            </div>
        </div>
    ) : null;
}

export default FileView;
