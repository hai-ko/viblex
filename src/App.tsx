import React, { useEffect, useState } from 'react';
import './App.css';
import type { PluginApi } from '@remixproject/plugin-utils';
import {PluginClient} from '@remixproject/plugin'
import { createClient } from "@remixproject/plugin-webview";
import { getAllFiles } from './remix-utils/FileHandler';
import { parseContract } from './lib/ParseContract';
import { IRemixApi } from '@remixproject/plugin-api';
import Graph from './graph/Graph';






function App() {
  const [client, setClient] = useState<PluginClient<any, Readonly<IRemixApi>> & PluginApi<Readonly<IRemixApi>> | undefined>();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {

    if (!client) {
      const client = createClient(new PluginClient({allowOrigins: ['https://remix.ethereum.org']}));
      client.onload (async () => {
        const files = await getAllFiles(client)
        setFiles(parseContract(files));
      })
      setClient(client)
    }


  }, [client]);

  let table: any = files.map((file, index) => [file, 'contract', '0', 1, index]).flat();
  table = table.length === 0 ? ['Storage', 'contract', '0', 1, 0, 'Owner', 'contract', '0', 1, 1, 'Ballot', 'contract', '0', 1, 2] : table;
  

  return (
    <div className="App">

      {table.length > 0 && <Graph width={1000} height={1000} table={table}/>}
    </div>
  );
}

export default App;


