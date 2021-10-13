import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from './Icon';
import ViewSelect from './ViewSelect';

interface MenuProps {
    zoomIn: () => void;
    zoomOut: () => void;
    setView: (vieName: string) => void;
    defaultView: string;
}

function Menu(props: MenuProps) {
    return (
        <div className="menu w-100 d-flex align-items-center">
            <ViewSelect
                setView={props.setView}
                defaultView={props.defaultView}
            />
            <button
                type="button"
                className="btn btn-sm btn-primary menu-btn"
                onClick={props.zoomIn}
            >
                <Icon iconClass="fas fa-search-plus" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-primary menu-btn"
                onClick={props.zoomOut}
            >
                <Icon iconClass="fas fa-search-minus" />
            </button>
        </div>
    );
}

export default Menu;
