import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from './Icon';

interface MenuProps {
    zoomIn: () => void;
    zoomOut: () => void;
}

function Menu(props: MenuProps) {
    return (
        <div className="menu w-100">
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
            <button type="button" className="btn btn-sm btn-primary menu-btn">
                Primary
            </button>
        </div>
    );
}

export default Menu;
