import React, { useEffect, useState } from 'react';
import './App.css';
import type { PluginApi } from '@remixproject/plugin-utils';
import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-webview';
import { IRemixApi } from '@remixproject/plugin-api';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ParsedSolFile } from './lib/ParseSolidity';
import { useRef } from 'react';
import { getAllRemixFiles } from './remix-utils/RemixFileHandler';
import GraphContainer from './graph/views/GraphContainer';
import BlockView from './block/BlockView';

function App() {
    const [client, setClient] = useState<
        | (PluginClient<any, Readonly<IRemixApi>> &
              PluginApi<Readonly<IRemixApi>>)
        | undefined
    >();

    const [files, setFiles] = useState<ParsedSolFile[]>();
    const [view, setView] = useState<string>('files');

    useEffect(() => {
        if (!client) {
            const client = createClient(
                new PluginClient({
                    allowOrigins: ['https://remix.ethereum.org'],
                }),
            );
            client.onload(async () => {
                //@ts-ignore
                const solidityParser = SolidityParser.parse;

                setFiles(await getAllRemixFiles(client, solidityParser));
            });
            setClient(client);
        }
    }, [client]);

    const graphContainer = useRef<HTMLDivElement>(null);

    return (
        <div className="App h-100 w-100" ref={graphContainer}>
            {view === 'block' ? (
                <BlockView view={view} setView={setView} />
            ) : (
                graphContainer.current &&
                files && (
                    <GraphContainer
                        files={files}
                        view={view}
                        setView={setView}
                    />
                )
            )}
        </div>
    );
}

export default App;
