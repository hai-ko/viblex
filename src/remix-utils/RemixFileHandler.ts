import { PluginClient } from '@remixproject/plugin';
import { IRemixApi } from '@remixproject/plugin-api';
import type { PluginApi } from '@remixproject/plugin-utils';
import { getAllFiles } from '../lib/FileHandling';
import { Parse, ParsedSolFile } from '../lib/ParseSolidity';

const CONTRACT_DIR = '/contracts';

export async function getAllRemixFiles(
    client: PluginClient<any, Readonly<IRemixApi>> &
        PluginApi<Readonly<IRemixApi>>,
    solParser: Parse,
): Promise<ParsedSolFile[]> {
    return getAllFiles(
        client.fileManager.getFolder,
        client.fileManager.getFile,
        client.contentImport.resolve,
        CONTRACT_DIR,
        solParser,
    );
}
