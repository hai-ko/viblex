import { ethers } from 'ethers';
import Icon from '../../shared/Icon';
import '../Block.css';

interface TxInfoBoxViewProps {
    transaction: ethers.providers.TransactionResponse;
    minimize: () => void;
    maximize: () => void;
    unselect: () => void;
}

function TxInfoBoxView(props: TxInfoBoxViewProps) {
    return (
        <div className="card  w-100 info-card">
            <div className="card-body">
                <div className="row row-space">
                    <div className="col-7">
                        <strong>
                            Transaction{' '}
                            {props.transaction.hash.slice(0, 4) +
                                '...' +
                                props.transaction.hash.slice(
                                    props.transaction.hash.length - 3,
                                    props.transaction.hash.length,
                                )}
                        </strong>
                    </div>
                    <div className="col-5 small text-end">
                        <button
                            type="button"
                            className="btn btn-sm menu-btn"
                            onClick={props.minimize}
                        >
                            <Icon iconClass="fas fa-window-minimize" />
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm  menu-btn"
                            onClick={props.unselect}
                        >
                            <Icon iconClass="fas fa-times" />
                        </button>
                    </div>
                </div>

                <div className="row small">
                    <div className="col-4">Gas Limit:</div>
                    <div className="col-8 info-value">
                        {props.transaction.gasLimit.toString()}
                    </div>
                </div>
                <div className="row small">
                    <div className="col-4">Data:</div>
                    <div className="col-8 info-value">
                        {(props.transaction.data.length - 2) / 2} bytes
                    </div>
                </div>
                <div className="row small row-space">
                    <div className="col-4">Hash:</div>
                    <div className="col-8 info-value small">
                        {props.transaction.hash}
                    </div>
                </div>
                <div className="row small ">
                    <div className="col-12">
                        <a
                            className=" btn btn-sm menu-btn etherscan-link w-100"
                            href={`https://etherscan.io/tx/${props.transaction.hash}`}
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

export default TxInfoBoxView;
