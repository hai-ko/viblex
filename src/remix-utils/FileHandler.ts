import { PluginClient } from '@remixproject/plugin';
import { IRemixApi, Folder } from '@remixproject/plugin-api';
import type { PluginApi } from '@remixproject/plugin-utils';
import { SolFile } from '../lib/ParseContract';

const CONTRACT_DIR = '/contracts';

export async function getAllFiles(
    client: PluginClient<any, Readonly<IRemixApi>> &
        PluginApi<Readonly<IRemixApi>>,
): Promise<SolFile[]> {
    const resolveFolder: any = async (folder: Folder) => {
        const files = Object.keys(folder).map(async (path: string) => {
            if (folder[path].isDirectory) {
                return await Promise.all(
                    await resolveFolder(
                        await client.fileManager.getFolder(path),
                    ),
                );
            } else {
                return {
                    path,
                    content: await client.fileManager.getFile(path),
                };
            }
        });

        return (await Promise.all(files)).flat();
    };

    return resolveFolder(await client.fileManager.getFolder(CONTRACT_DIR));
}
