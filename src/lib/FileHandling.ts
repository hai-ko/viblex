import {
    getAST,
    getImports,
    Parse,
    ParsedSolFile,
    parseFiles,
    RawSolFile,
} from './ParseSolidity';
import { ContentImport } from '@remixproject/plugin-api';
import {
    ASTNode,
    ImportDirective,
} from '@solidity-parser/parser/dist/src/ast-types';
import URL from 'url-parse';
import * as R from 'ramda';
import { Folder } from '@remixproject/plugin-api';
// @ts-ignore
import Path from 'path-browserify';
import { Context, Edge } from './Graph';

const SOL_FILE_EXTENSION = 'sol';

type FolderContext = Context<
    {
        getFolder: (path: string) => Promise<Folder>;
        getFile: (path: string) => Promise<string>;
    },
    Folder
>;

type ImportDirectiveContext = Context<
    {
        resolveImport: (link: string) => Promise<ContentImport>;
        solParser: Parse;
    },
    ImportDirective
>;

async function resolveFolder(
    folderContext: FolderContext,
): Promise<RawSolFile[]> {
    const isSolidityFile = (path: string): boolean =>
        folderContext.element[path].isDirectory ||
        path.split('.').pop() === SOL_FILE_EXTENSION;

    const resolveDirEntry = async (path: string): Promise<RawSolFile[]> =>
        folderContext.element[path].isDirectory
            ? await resolveFolder({
                  context: folderContext.context,
                  element: await folderContext.context.getFolder(path),
              })
            : [
                  {
                      path: Path.resolve(path),
                      content: await folderContext.context.getFile(path),
                  },
              ];

    return R.pipe(
        R.filter(isSolidityFile) as (a: string[]) => string[],
        R.map(resolveDirEntry),
        (p) => Promise.all(p),
        R.andThen(R.unnest),
        R.andThen(R.uniqWith(isDuplicateFile)),
    )(Object.keys(folderContext.element));
}

const execImport = async (
    importDirectiveContext: ImportDirectiveContext,
): Promise<ParsedSolFile[]> => {
    try {
        const contentImport =
            await importDirectiveContext.context.resolveImport(
                importDirectiveContext.element.path,
            );

        const parsedFiles = parseFiles(
            [
                {
                    path: importDirectiveContext.element.path,
                    content: contentImport.content,
                    type: contentImport.type,
                },
            ],
            importDirectiveContext.context.solParser,
        );

        return [
            ...parsedFiles,
            ...(parsedFiles[0].parsedContent
                ? await retrieveExternalContent(
                      parsedFiles[0].parsedContent?.children,
                      importDirectiveContext.context.resolveImport,
                      importDirectiveContext.context.solParser,
                      contentImport.url,
                  )
                : []),
        ];
    } catch (e: any) {
        return parseFiles(
            [
                {
                    path: importDirectiveContext.element.path,
                    error: e.toString(),
                },
            ],
            importDirectiveContext.context.solParser,
        );
    }
};

export async function getAllFiles(
    getFolder: (path: string) => Promise<Folder>,
    getFile: (path: string) => Promise<string>,
    resolveImport: (link: string) => Promise<ContentImport>,
    baseFolderPath: string,
    solParser: Parse,
): Promise<ParsedSolFile[]> {
    const localFiles = parseFiles(
        await resolveFolder({
            context: { getFolder, getFile },
            element: await getFolder(baseFolderPath),
        }),
        solParser,
    );

    return R.uniqWith(isDuplicateFile)(
        await resolveExternalImports(localFiles, resolveImport, solParser),
    );
}

function isDuplicateFile<T extends RawSolFile>(iDA: T, iDB: T): boolean {
    return iDA.path === iDB.path;
}

export async function resolveExternalImports(
    files: ParsedSolFile[],
    resolveImport: (link: string) => Promise<ContentImport>,
    solParser: Parse,
): Promise<ParsedSolFile[]> {
    return R.pipe(
        R.map(async (file: ParsedSolFile) => [
            file,
            ...(await retrieveExternalContent(
                getAST(file),
                resolveImport,
                solParser,
            )),
        ]),
        (a) => Promise.all(a),
        R.andThen(R.unnest),
    )(files);
}

function isExternalFile(pathElement: { path: string }) {
    return pathElement.path.match('^(github|http|https|swarm|ipfs)://.*$')
        ? true
        : false;
}

async function retrieveExternalContent(
    astNodes: ASTNode[],
    resolveImport: (link: string) => Promise<ContentImport>,
    solParser: Parse,
    baseUrl?: string,
): Promise<ParsedSolFile[]> {
    const resolveImportPathToAbsoluteUrl = (
        importDirective: ImportDirective,
    ): ImportDirective =>
        baseUrl
            ? {
                  ...importDirective,
                  path: new URL(importDirective.path, baseUrl).href,
              }
            : { ...importDirective };

    const addContextToImportDirective = (importDirective: ImportDirective) => ({
        context: { resolveImport, solParser },
        element: importDirective,
    });

    return R.pipe(
        getImports,
        R.map(resolveImportPathToAbsoluteUrl),
        R.filter(isExternalFile),
        R.map(addContextToImportDirective),
        R.map(execImport),
        (a) => Promise.all(a),
        R.andThen(R.unnest),
        R.andThen(R.uniqWith(isDuplicateFile)),
    )(astNodes);
}

export function buildInputGraph(parsedFiles: ParsedSolFile[]): Edge[] {
    return R.pipe(R.map(getImportsAsEdge), R.unnest)(parsedFiles);
}

function getImportsAsEdge(parsedSolFile: ParsedSolFile): Edge[] {
    const importToEdge = (importDirective: ImportDirective): Edge => ({
        to: parsedSolFile.path,
        from: isExternalFile(importDirective)
            ? importDirective.path
            : isExternalFile(parsedSolFile)
            ? new URL(importDirective.path, parsedSolFile.path).href
            : Path.resolve(
                  Path.dirname(parsedSolFile.path),
                  importDirective.path,
              ),
    });

    return R.pipe(getAST, getImports, R.map(importToEdge))(parsedSolFile);
}

export function getImportRootFiles(
    files: ParsedSolFile[],
    edges: Edge[],
): ParsedSolFile[] {
    const isImportRoot = (fileToCheck: ParsedSolFile) =>
        R.filter((edge: Edge) => fileToCheck.path === edge.from, edges)
            .length === 0;

    return R.filter(isImportRoot, files);
}

export function getFileDisplayName(path: string): string {
    const shortName = (name: string) =>
        name.length > 20
            ? name.slice(0, 7) +
              '...' +
              name.slice(name.length - 8, name.length)
            : name;

    const getBasename = (path: string): string => Path.basename(path, '.sol');

    return R.pipe(getBasename, shortName)(path);
}
