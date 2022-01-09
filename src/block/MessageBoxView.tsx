import './Block.css';

function MessageBoxView() {
    return (
        <div className="message-box w-100 d-flex  justify-content-center">
            <div className="row w-100 d-flex  justify-content-center">
                <div className="col-8">
                    <div className="card  info-card ">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12 text-center ">
                                    <p className="first-p">
                                        No Ethereum provider detected.
                                    </p>

                                    <p>
                                        Please install a plugin like MetaMask.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageBoxView;
