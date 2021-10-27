import { props } from 'ramda';
import React, { useEffect, useRef, useState } from 'react';
import Menu from '../shared/Menu';
import { init, onWindowResize, ThreeEnv } from './utils/ThreeEnv';

interface BlockViewProps {
    view: string;
    setView: (view: string) => void;
}

function BlockView(props: BlockViewProps) {
    const threeContainer = useRef<HTMLDivElement>(null);
    const [three, setThree] = useState<ThreeEnv | undefined>();

    useEffect(() => {
        if (threeContainer && !three) {
            init(
                setThree,

                threeContainer,
            );
        }
    }, [threeContainer, three]);

    useEffect(() => {
        if (three) {
            onWindowResize(three, threeContainer, setThree);
        }
    }, [three]);

    return (
        <>
            <div ref={threeContainer} className="w-100 h-100 three-container">
                <Menu
                    zoomIn={() => {}}
                    zoomOut={() => {}}
                    autoZoom={() => {}}
                    setView={props.setView}
                    defaultView={props.view}
                />
            </div>
        </>
    );
}

export default BlockView;
