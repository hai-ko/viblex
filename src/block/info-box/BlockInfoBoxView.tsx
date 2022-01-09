import { ethers } from 'ethers';
import Icon from '../../shared/Icon';
import '../Block.css';

interface BlockInfoBoxViewProps {
    block: ethers.providers.Block;
    minimize: () => void;
    maximize: () => void;
    unselect: () => void;
}

function BlockInfoBoxView(props: BlockInfoBoxViewProps) {
    return (
        <div className="card  w-100 info-card">
            <div className="card-body">
                <div className="row row-space">
                    <div className="col-6">
                        <strong>Block #{props.block.number}</strong>
                    </div>
                    <div className="col-6 small text-end">
                        <button
                            type="button"
                            className="btn btn-sm menu-btn"
                            onClick={props.minimize}
                        >
                            <Icon iconClass="fas fa-window-minimize" />
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm menu-btn"
                            onClick={props.unselect}
                        >
                            <Icon iconClass="fas fa-times" />
                        </button>
                    </div>
                </div>

                <div className="row small">
                    <div className="col-4">Gas Used:</div>
                    <div className="col-8 info-value">
                        {props.block.gasUsed.toString()}
                    </div>
                </div>
                <div className="row small">
                    <div className="col-4">Transactions:</div>
                    <div className="col-8 info-value">
                        {props.block.transactions.length}
                    </div>
                </div>
                <div className="row small row-space">
                    <div className="col-4">Hash:</div>
                    <div className="col-8 info-value small">
                        {props.block.hash}
                    </div>
                </div>
                <div className="row small ">
                    <div className="col-12">
                        <a
                            className=" btn btn-sm menu-btn etherscan-link w-100"
                            href={`https://etherscan.io/block/${props.block.number}`}
                            target="_blank"
                        >
                            Show on Etherscan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlockInfoBoxView;
