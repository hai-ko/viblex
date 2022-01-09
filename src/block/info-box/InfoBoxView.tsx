import { ethers } from 'ethers';
import Icon from '../../shared/Icon';
import BlockInfoBoxView from './BlockInfoBoxView';
import { BlockViewState } from '../BlockView';
import '../Block.css';
import TxInfoBoxView from './TxInfoBoxView';

interface InfoBoxViewProps {
    selectedElement:
        | ethers.providers.Block
        | ethers.providers.TransactionResponse
        | undefined;
    blockViewState: BlockViewState;
    minimize: () => void;
    maximize: () => void;
    unselect: () => void;
}

function InfoBoxView(props: InfoBoxViewProps) {
    switch (props.blockViewState) {
        case BlockViewState.TransactionSelectedMin:
        case BlockViewState.BlockSelectedMin:
            return (
                <div className="small w-100 info-card d-flex justify-content-end">
                    <div>
                        <button
                            type="button"
                            className="btn btn-sm menu-btn"
                            onClick={props.maximize}
                        >
                            <Icon iconClass="fas fa-window-maximize" />
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm menu-btn "
                            onClick={props.unselect}
                        >
                            <Icon iconClass="fas fa-times" />
                        </button>
                    </div>
                </div>
            );

        case BlockViewState.TransactionSelected:
            return (
                <TxInfoBoxView
                    transaction={
                        props.selectedElement as ethers.providers.TransactionResponse
                    }
                    minimize={props.minimize}
                    maximize={props.maximize}
                    unselect={props.unselect}
                />
            );

        case BlockViewState.BlockSelected:
            return (
                <BlockInfoBoxView
                    block={props.selectedElement as ethers.providers.Block}
                    minimize={props.minimize}
                    maximize={props.maximize}
                    unselect={props.unselect}
                />
            );
        case BlockViewState.NoSelection:
        default:
            return null;
    }
}

export default InfoBoxView;
