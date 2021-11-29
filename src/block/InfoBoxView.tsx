import { ethers } from 'ethers';
import Icon from '../shared/Icon';
import { BlockViewState } from './BlockView';
import './InfoBox.css';

interface InfoBoxViewProps {
    selectedElement: ethers.providers.Block | undefined;
    blockViewState: BlockViewState;
    minimize: () => void;
    maximize: () => void;
    unselect: () => void;
}

function InfoBoxView(props: InfoBoxViewProps) {
    switch (props.blockViewState) {
        case BlockViewState.BlockSelectedMin:
            return (
                <div className="small w-100 info-card d-flex justify-content-end">
                    <div>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary menu-btn"
                            onClick={props.maximize}
                        >
                            <Icon iconClass="fas fa-window-maximize" />
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-primary menu-btn"
                            onClick={props.unselect}
                        >
                            <Icon iconClass="fas fa-times" />
                        </button>
                    </div>
                </div>
            );

        case BlockViewState.BlockSelected:
            const block = props.selectedElement as ethers.providers.Block;
            return (
                <div className="card  w-100 info-card">
                    <div className="card-body">
                        <div className="row row-space">
                            <div className="col-6">
                                <strong>Block #{block.number}</strong>
                            </div>
                            <div className="col-6 small text-right">
                                <a
                                    className=" btn btn-sm btn-primary menu-btn etherscan-link"
                                    href={`https://etherscan.io/block/${block.number}`}
                                    target="_blan"
                                >
                                    <Icon iconClass="fas fa-external-link-alt" />
                                </a>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary menu-btn"
                                    onClick={props.minimize}
                                >
                                    <Icon iconClass="fas fa-window-minimize" />
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary menu-btn"
                                    onClick={props.unselect}
                                >
                                    <Icon iconClass="fas fa-times" />
                                </button>
                            </div>
                        </div>

                        <div className="row small">
                            <div className="col-4">Gas Used:</div>
                            <div className="col-8 info-value">
                                {block.gasUsed.toString()}
                            </div>
                        </div>
                        <div className="row small">
                            <div className="col-4">Transactions:</div>
                            <div className="col-8 info-value">
                                {block.transactions.length}
                            </div>
                        </div>
                        <div className="row small">
                            <div className="col-4">Hash:</div>
                            <div className="col-8 info-value small">
                                {block.hash}
                            </div>
                        </div>
                    </div>
                </div>
            );
        case BlockViewState.NoSelection:
        default:
            return null;
    }
}

export default InfoBoxView;
