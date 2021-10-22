import './ViewEntry.css';

interface ViewEntry {
    title: string;
    content: string;
    top?: boolean;
}

function ViewEntry(props: ViewEntry) {
    return (
        <div className={`row entry${props.top ? ' entry-top' : ''}`}>
            <div className="col-12 text-left entry-title">{props.title}</div>
            <div className="col-12 text-left entry-content">
                {props.content}
            </div>
        </div>
    );
}

export default ViewEntry;
