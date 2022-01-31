import { ethers } from 'ethers';
import Icon from '../../shared/Icon';
import '../Block.css';
import 'bootstrap/js/dist/collapse';

interface HelpInfoBoxViewProps {
    unselect: () => void;
}

function HelpInfoBoxView(props: HelpInfoBoxViewProps) {
    return (
        <div className="card info-card help-info">
            <div className="card-body">
                <div className="row row-space">
                    <div className="col-7">
                        <h2>Viblex</h2>
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
                        <div
                            className="accordion accordion-flush"
                            id="accordionFlushInfoBox"
                        >
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="flush-headingGettingStarted"
                                >
                                    <button
                                        className="accordion-button "
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#flush-collapseGettingStarted"
                                        aria-expanded="false"
                                        aria-controls="flush-collapseGettingStarted"
                                    >
                                        Getting started
                                    </button>
                                </h2>
                                <div
                                    id="flush-collapseGettingStarted"
                                    className="accordion-collapse collapse show"
                                    aria-labelledby="flush-headingGettingStarted"
                                    data-bs-parent="#accordionFlushInfoBox"
                                >
                                    <div className="accordion-body accordion-list">
                                        <ul className="fa-ul">
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-cube" />
                                                </span>
                                                Select a block by clicking on
                                                the block cube.
                                            </li>
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-th" />
                                                </span>
                                                If a block is slected a
                                                transaction can be selected by
                                                clicking on the transaction
                                                plane.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="flush-headingTwo"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#flush-collapseComponents"
                                        aria-expanded="false"
                                        aria-controls="flush-collapseComponents"
                                    >
                                        Component help
                                    </button>
                                </h2>
                                <div
                                    id="flush-collapseComponents"
                                    className="accordion-collapse collapse"
                                    aria-labelledby="flush-headingTwo"
                                    data-bs-parent="#accordionFlushInfoBox"
                                >
                                    <div className="accordion-body accordion-list">
                                        <ul className="fa-ul">
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-expand-arrows-alt" />
                                                </span>
                                                Cube size: gas used
                                            </li>
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-arrows-alt-h" />
                                                </span>
                                                Cube distance: time between
                                                blocks
                                            </li>
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-square-full" />
                                                </span>
                                                Square size: transaction gas
                                                limit
                                            </li>
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-palette" />
                                                </span>
                                                Dark square: value transaction
                                            </li>
                                            <li>
                                                <span className="fa-li">
                                                    <Icon iconClass="fas fa-chart-bar" />
                                                </span>
                                                Tx bar height: transaction ETH
                                                value
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="flush-headingThree"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#flush-collapseAbout"
                                        aria-expanded="false"
                                        aria-controls="flush-collapseAbout"
                                    >
                                        About
                                    </button>
                                </h2>
                                <div
                                    id="flush-collapseAbout"
                                    className="accordion-collapse collapse"
                                    aria-labelledby="flush-headingThree"
                                    data-bs-parent="#accordionFlushInfoBox"
                                >
                                    <div className="accordion-body">
                                        Visual blockchain explorer developed by{' '}
                                        <a
                                            className="external-link"
                                            href="https://github.com/hai-ko"
                                        >
                                            Heiko Burkhardt
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpInfoBoxView;
