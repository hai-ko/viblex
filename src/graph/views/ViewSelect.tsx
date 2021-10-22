import './Graph.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface ViewSelectProps {
    setView: (viewName: string) => void;
    defaultView: string;
}

function ViewSelect(props: ViewSelectProps) {
    return (
        <select
            className="view-select form-select "
            defaultValue={props.defaultView}
            onChange={(event) => props.setView(event.target.value)}
        >
            <option value="files">Files</option>
            <option value="contracts">Contracts</option>
        </select>
    );
}

export default ViewSelect;
