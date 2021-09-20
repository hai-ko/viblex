import React, { useEffect, useState } from 'react';
import './App.css';
import type { PluginApi } from '@remixproject/plugin-utils';
import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-webview';
import { IRemixApi } from '@remixproject/plugin-api';
import Graph from './graph/Graph';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { DAG, getNodePosition } from './graph/NodePosition';
import { ParsedSolFile } from './lib/ParseSolidity';
import { useRef } from 'react';

function App() {
    const [client, setClient] = useState<
        | (PluginClient<any, Readonly<IRemixApi>> &
              PluginApi<Readonly<IRemixApi>>)
        | undefined
    >();
    const [dag, setDAG] = useState<DAG<ParsedSolFile>>();

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

                setDAG(await getNodePosition(client, solidityParser));
            });
            setClient(client);
        }
    }, [client]);

    const graphContainer = useRef<HTMLDivElement>(null);

    return (
        <div className="App h-100 w-100" ref={graphContainer}>
            {graphContainer.current && dag && <Graph dag={dag} />}
        </div>
    );
}

export default App;
