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
import TransactionSequenceView from './graph/views/TransactionSequenceView';
import { Routes, Route, Link } from 'react-router-dom';
import StandaloneWrapper from './StandaloneWrapper';

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

    const getSelectedView = (): JSX.Element => {
        switch (view) {
            case 'block':
                return <BlockView view={view} setView={setView} />;
            case 'transactions':
                return (
                    <TransactionSequenceView view={view} setView={setView} />
                );
            case 'files':
            case 'contracts':
                return graphContainer.current && files ? (
                    <GraphContainer
                        files={files}
                        view={view}
                        setView={setView}
                    />
                ) : (
                    <></>
                );

            default:
                return <div>Unknown view slected.</div>;
        }
    };

    const remixView = (
        <div className="App h-100 w-100" ref={graphContainer}>
            {getSelectedView()}
        </div>
    );

    return (
        <Routes>
            <Route path="/remix" element={remixView} />
            <Route
                path="/"
                element={<StandaloneWrapper element={<BlockView />} />}
            />
        </Routes>
    );
}

export default App;
