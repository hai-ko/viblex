import 'bootstrap/dist/css/bootstrap.min.css';

interface StandaloneWrapperProps {
    element: JSX.Element;
}

function StandaloneWrapper(props: StandaloneWrapperProps) {
    return props.element;
}

export default StandaloneWrapper;
