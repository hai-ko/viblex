import './Menu.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from './Icon';
import ViewSelect from './ViewSelect';

interface MenuProps {
    zoomIn?: () => void;
    zoomOut?: () => void;
    autoZoom?: () => void;
    setView?: (vieName: string) => void;
    defaultView?: string;
    infoBox?: JSX.Element;
}

function Menu(props: MenuProps) {
    return (
        <div className="menu d-flex justify-content-start">
            <div className=" d-flex align-items-end w-100">
                {props.defaultView && props.setView && (
                    <ViewSelect
                        setView={props.setView}
                        defaultView={props.defaultView}
                    />
                )}

                {props.zoomIn && (
                    <button
                        type="button"
                        className="btn btn-sm btn-primary menu-btn menu-btn-space"
                        onClick={props.zoomIn}
                    >
                        <Icon iconClass="fas fa-search-plus" />
                    </button>
                )}
                {props.zoomOut && (
                    <button
                        type="button"
                        className="btn btn-sm btn-primary menu-btn"
                        onClick={props.zoomOut}
                    >
                        <Icon iconClass="fas fa-search-minus" />
                    </button>
                )}
                {props.autoZoom && (
                    <button
                        type="button"
                        className="btn btn-sm btn-primary menu-btn"
                        onClick={props.autoZoom}
                    >
                        <Icon iconClass="fas fa-expand" />
                    </button>
                )}
            </div>
            <div className=" menu-end d-flex align-items-end justify-content-end">
                {props.infoBox}
            </div>
        </div>
    );
}

export default Menu;
