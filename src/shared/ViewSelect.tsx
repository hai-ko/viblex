import '@fortawesome/fontawesome-free/css/all.min.css';
import './ViewSelect.css';

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
            <option value="block">Block</option>
        </select>
    );
}

export default ViewSelect;
