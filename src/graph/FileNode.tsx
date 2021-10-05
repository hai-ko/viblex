import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../lib/ParseSolidity';
import { getFileDisplayName } from '../lib/FileHandling';
import { GraphStyle } from './GraphStyle';
import { useState } from 'react';
import Icon from './Icon';
import { fileURLToPath } from 'url';
import { isPropertyAccessOrQualifiedName } from 'typescript';

interface FileNodeProps {
    file: ParsedSolFile;
    graphStyle: GraphStyle;
    onMouseLeave: () => void;
    onMouseOver: () => void;
}

function isSelected(
    onMouseOver: () => void,
    setSelected: React.Dispatch<React.SetStateAction<boolean>>,
) {
    onMouseOver();
    setSelected(true);
}

function unSelected(
    onMouseLeave: () => void,
    setSelected: React.Dispatch<React.SetStateAction<boolean>>,
) {
    onMouseLeave();
    setSelected(false);
}

function FileNode(props: FileNodeProps) {
    const [selected, setSelected] = useState<boolean>(false);

    const nodeDivStyle: React.CSSProperties = {
        width: props.graphStyle.ELEMENT_WIDTH.toString() + 'px',
        height: props.graphStyle.ELEMENT_HEIGHT.toString() + 'px',
        borderWidth: props.graphStyle.SEGMENT_THICKNESS + 'px',
        borderColor: selected
            ? props.graphStyle.SEGMENT_HIGHLIGHTED_COLOR
            : props.graphStyle.ELEMENT_BORDER_COLOR,
        borderStyle: 'solid',
    };

    let icon: JSX.Element;

    switch (props.file.type) {
        case 'http':
        case 'https':
        case 'ipfs':
        case 'swarm':
            icon = <Icon iconClass="far fa-file-alt" />;
            break;
        case 'github':
            icon = <Icon iconClass="fab fa-gitpub" />;
            break;
        default:
            icon = <Icon iconClass="fas fa-file-alt" />;
    }

    let version: string | undefined;

    if (props.file.parsedContent) {
        const solVersionPragma = getPragmas(
            props.file.parsedContent.children,
        ).find((pragma) => pragma.name === 'solidity');
        version = solVersionPragma && solVersionPragma.value;
    }

    return (
        <div
            className={`container node ${
                props.file.type ? 'external-node' : 'local-node'
            } file`}
            style={nodeDivStyle}
            onMouseLeave={() => unSelected(props.onMouseLeave, setSelected)}
            onMouseOver={() => isSelected(props.onMouseOver, setSelected)}
        >
            <div className="row">
                <div className="col file-title">
                    {getFileDisplayName(props.file.path)}
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
                <div className="col-10">{props.file.path}</div>
            </div>
        </div>
    );
}

export default FileNode;
