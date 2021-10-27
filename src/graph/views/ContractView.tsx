import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ParsedSolFile } from '../../lib/ParseSolidity';
import { GraphStyle } from './../utils/GraphStyle';
import Icon from '../../shared/Icon';

import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import { ThreeGraphNode } from './../utils/NodePosition';
import { Context } from '../../lib/Graph';

interface ContractViewProps {
    node: ThreeGraphNode<Context<ParsedSolFile, ContractDefinition>>;
    graphStyle: GraphStyle;
    exitMaxNode: () => void;
}

export function getIcon(kind: string): JSX.Element {
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

function ContractView(props: ContractViewProps) {
    return props.node.element ? (
        <div
            className={`file-view h-100 ${
                props.node.element.element.kind === 'contract'
                    ? 'contract-node'
                    : 'contract-other'
            }`}
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
                        {props.node.element.element.name}
                    </div>
                </div>
                <div className="row kind-info">
                    <div className="col-12">
                        <span className="badge bg-light text-dark">
                            &nbsp;{getIcon(props.node.element.element.kind)}
                            &nbsp;&nbsp;{props.node.element.element.kind}&nbsp;
                        </span>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
}

export default ContractView;
