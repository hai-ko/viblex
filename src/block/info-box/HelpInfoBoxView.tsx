import { ethers } from 'ethers';
import Icon from '../../shared/Icon';
import '../Block.css';

interface HelpInfoBoxViewProps {
    unselect: () => void;
}

function HelpInfoBoxView(props: HelpInfoBoxViewProps) {
    return (
        <div className="card  w-100 info-card">
            <div className="card-body">
                <div className="row row-space">
                    <div className="col-7">
                        <strong>Viblex</strong>
                    </div>
                    <div className="col-5 small text-end">
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
                    <div className="col-12">
                        <p>Select a block by clicking on the block cube.</p>
                        <p>
                            If a block is slected a transaction can be selected
                            by clicking on the transaction plane.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpInfoBoxView;
