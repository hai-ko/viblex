import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getPragmas, ParsedSolFile } from '../lib/ParseSolidity';
import { getFileDisplayName } from '../lib/FileHandling';
import { GraphStyle } from './GraphStyle';
import Icon from './Icon';

import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import { Context } from '../lib/ContractHandling';
import { ThreeGraphNode } from './NodePosition';

interface ContractViewProps {
    node: ThreeGraphNode<Context<ParsedSolFile, ContractDefinition>>;
    graphStyle: GraphStyle;
    exitMaxNode: () => void;
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
                            {props.node.element.element.kind}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
}

export default ContractView;
