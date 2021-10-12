import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../lib/ParseSolidity';
import { getFileDisplayName } from '../lib/FileHandling';
import { GraphStyle } from './GraphStyle';
import { useState } from 'react';
import Icon from './Icon';
import { GraphNode } from './NodePosition';
import { getIcon } from './FileNode';
import ViewEntry from './ViewEntry';

interface FileViewProps {
    node: GraphNode<ParsedSolFile>;
    graphStyle: GraphStyle;
    exitMaxNode: () => void;
}

function FileView(props: FileViewProps) {
    const icon = getIcon(props.node.element);

    let version: string | undefined;

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
            <div className="container file-view-container">
                <div className="row ">
                    <div className="col file-title text-center">
                        {getFileDisplayName(props.node.element.path)}
                    </div>
                </div>
                <div className="row ">
                    <div className="col-12 text-center ">
                        <span className="badge  bg-dark">&nbsp;File&nbsp;</span>
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
            </div>
        </div>
    ) : null;
}

export default FileView;
