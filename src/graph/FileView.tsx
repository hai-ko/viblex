import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../lib/ParseSolidity';
import { getFileDisplayName } from '../lib/FileHandling';
import { GraphStyle } from './GraphStyle';
import { useState } from 'react';
import Icon from './Icon';
import { GraphNode } from './NodePosition';
import { getIcon } from './FileNode';

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
            <div className="row ">
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
            <div className="row">
                <div className="col file-title text-center">
                    {getFileDisplayName(props.node.element.path)}
                </div>
            </div>
            {version && (
                <div className="row file-info">
                    <div className="col-1 text-center d-flex align-content-center flex-wrap">
                        <Icon iconClass="fas fa-tags" />
                    </div>
                    <div className="col-10">{version}</div>
                </div>
            )}

            <div className="row file-info">
                <div className="col-1 text-center d-flex align-content-center flex-wrap">
                    {icon}
                </div>
                <div className="col-10">{props.node.element.path}</div>
            </div>
        </div>
    ) : null;
}

export default FileView;
