import { ParsedSolFile } from './ParseSolidity';
import { parse } from '@solidity-parser/parser';
import {
    buildInputGraph,
    getAllFiles,
    getImportRootFiles,
    resolveExternalImports,
} from './FileHandling';

const resolverMock = async (link: string): Promise<any> => {
    switch (link) {
        case 'http://test.test/contracts/testA.sol':
            return {
                type: 'http',
                cleanUrl: 'test.test/contracts/testA.sol',
                content: 'contract A {}',
                url: 'http://test.test/contracts/testA.sol',
            };

        case 'http://test.test/contracts/testB.sol':
            return {
                type: 'http',
                cleanUrl: 'test.test/contracts/testB.sol',
                content: 'import "../testC.sol";',
                url: 'http://test.test/contracts/testB.sol',
            };

        case 'http://test.test/testC.sol':
            return {
                type: 'http',
                cleanUrl: 'test.test/contracts/testC.sol',
                content: 'contract C {}',
                url: 'http://test.test/contracts/testC.sol',
            };

        case 'http://test.test/contracts/testD.sol':
            return {
                type: 'http',
                cleanUrl: 'test.test/contracts/testD.sol',
                content: 'import "../testC.sol"; import "./testE.sol";',
                url: 'http://test.test/contracts/testD.sol',
            };

        case 'http://test.test/contracts/testE.sol':
            return {
                type: 'http',
                cleanUrl: 'test.test/contracts/testE.sol',
                content: 'import "../testC.sol";',
                url: 'http://test.test/contracts/testE.sol',
            };

        case '/contracts':
            return {
                '/contracts/contractA.sol': {
                    isDirectory: false,
                },
                '/contracts/B.json': {
                    isDirectory: false,
                },
                '/contracts/subdir': {
                    isDirectory: true,
                },
            };

        case '/contracts/subdir':
            return {
                '/contracts/subdir/contractC.sol': {
                    isDirectory: false,
                },
            };

        case '/contracts/subdir/contractC.sol':
            return 'contract C {}';

        case '/contracts/contractA.sol':
            return 'import "..subdir/contractC.sol";';

        case '/contractsX':
            return {
                '/contractsX/contractA.sol': { isDirectory: false },
            };

        case '/contractsX/contractA.sol':
            return 'import "http://test.test/contracts/testA.sol";';

        case '/contractsZ':
            return {
                '/contractsZ/contractZ.sol': { isDirectory: false },
            };

        case '/contractsZ/contractZ.sol':
            return 'import "http://test.test/contracts/testD.sol";';

        case '/contractsD':
            return {
                '/contractsD/contractD.sol': { isDirectory: false },
                '/contractsD/contractE.sol': { isDirectory: false },
            };

        case '/contractsD/contractD.sol':
            return 'import "http://test.test/contracts/testA.sol";';

        case '/contractsD/contractE.sol':
            return 'import "http://test.test/contracts/testA.sol";';

        default:
            throw Error(link + ' not found');
    }
};

describe('FileHandling', () => {
    test('resolveExternalImports', async () => {
        const parsedFiles: ParsedSolFile[] = [
            {
                path: './contractA.sol',

                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ];
        expect(
            await resolveExternalImports(
                parsedFiles,
                resolverMock,
                parse as any,
            ),
        ).toEqual([
            {
                path: './contractA.sol',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testA.sol',
                content: 'contract A {}',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'A',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
        ]);
    });

    test('resolveExternalImports', async () => {
        const parsedFiles: ParsedSolFile[] = [
            {
                path: './contractA.sol',

                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testB.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ];

        expect(
            await resolveExternalImports(
                parsedFiles,
                resolverMock,
                parse as any,
            ),
        ).toEqual([
            {
                path: './contractA.sol',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testB.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testB.sol',
                content: 'import "../testC.sol";',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: '../testC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/testC.sol',
                content: 'contract C {}',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'C',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
        ]);
    });

    test('resolveExternalImports with two external imports', async () => {
        const parsedFiles: ParsedSolFile[] = [
            {
                path: './contractA.sol',

                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testD.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ];

        expect(
            await resolveExternalImports(
                parsedFiles,
                resolverMock,
                parse as any,
            ),
        ).toEqual([
            {
                path: './contractA.sol',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testD.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testD.sol',
                content: 'import "../testC.sol"; import "./testE.sol";',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: '../testC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                        {
                            type: 'ImportDirective',
                            path: './testE.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/testC.sol',
                content: 'contract C {}',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'C',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testE.sol',
                content: 'import "../testC.sol";',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: '../testC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ]);
    });

    test('getAllFiles', async () => {
        const parsedFiles = await getAllFiles(
            resolverMock,
            resolverMock,
            resolverMock,
            '/contracts',
            parse as any,
        );

        expect(parsedFiles).toEqual([
            {
                path: '/contracts/contractA.sol',
                content: 'import "..subdir/contractC.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            path: '..subdir/contractC.sol',
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                            type: 'ImportDirective',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                        },
                    ],
                },
            },
            {
                path: '/contracts/subdir/contractC.sol',
                content: 'contract C {}',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'C',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
        ]);
    });

    test('getAllFiles no duplicate files', async () => {
        const parsedFiles = await getAllFiles(
            resolverMock,
            resolverMock,
            resolverMock,
            '/contractsD',
            parse as any,
        );

        expect(parsedFiles).toEqual([
            {
                path: '/contractsD/contractD.sol',
                content: 'import "http://test.test/contracts/testA.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testA.sol',
                content: 'contract A {}',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'A',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
            {
                path: '/contractsD/contractE.sol',
                content: 'import "http://test.test/contracts/testA.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ]);
    });

    test('getAllFiles with external Import', async () => {
        const parsedFiles = await getAllFiles(
            resolverMock,
            resolverMock,
            resolverMock,
            '/contractsX',
            parse as any,
        );

        expect(parsedFiles).toEqual([
            {
                path: '/contractsX/contractA.sol',
                content: 'import "http://test.test/contracts/testA.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: 'http://test.test/contracts/testA.sol',
                content: 'contract A {}',
                type: 'http',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ContractDefinition',
                            name: 'A',
                            baseContracts: [],
                            subNodes: [],
                            kind: 'contract',
                        },
                    ],
                },
            },
        ]);
    });

    test('buildInputGraph', async () => {
        const edges = buildInputGraph([
            {
                path: '/contracts/contractA.sol',
                content: 'import "./subdir/contractC.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './subdir/contractC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ]);

        expect(edges).toEqual([
            {
                to: '/contracts/contractA.sol',
                from: '/contracts/subdir/contractC.sol',
            },
        ]);
    });

    test('buildInputGraph with two files', async () => {
        const edges = buildInputGraph([
            {
                path: '/contracts/contractA.sol',
                content: 'import "./subdir/contractC.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './subdir/contractC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: '/contracts/contractK.sol',
                content: 'import "./subdir/contractC.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './subdir/contractC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ]);

        expect(edges).toEqual([
            {
                to: '/contracts/contractA.sol',
                from: '/contracts/subdir/contractC.sol',
            },
            {
                to: '/contracts/contractK.sol',
                from: '/contracts/subdir/contractC.sol',
            },
        ]);
    });

    test('buildInputGraph no redundant edges', async () => {
        const edges = buildInputGraph([
            {
                path: '/contracts/contractN.sol',
                content: 'import "./contractA.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './contractA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: '/contracts/contractK.sol',
                content: 'import "./contractA.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './contractA.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                path: '/contracts/contractA.sol',
                content: 'import "./subdir/contractC.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: './subdir/contractC.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
        ]);

        expect(edges).toEqual([
            {
                to: '/contracts/contractN.sol',
                from: '/contracts/contractA.sol',
            },
            {
                to: '/contracts/contractK.sol',
                from: '/contracts/contractA.sol',
            },
            {
                to: '/contracts/contractA.sol',
                from: '/contracts/subdir/contractC.sol',
            },
        ]);
    });

    test('buildInputGraph with external imports', async () => {
        const parsedFiles = await getAllFiles(
            resolverMock,
            resolverMock,
            resolverMock,
            '/contractsZ',
            parse as any,
        );

        expect(buildInputGraph(parsedFiles)).toEqual([
            {
                to: '/contractsZ/contractZ.sol',
                from: 'http://test.test/contracts/testD.sol',
            },
            {
                to: 'http://test.test/contracts/testD.sol',
                from: 'http://test.test/testC.sol',
            },
            {
                to: 'http://test.test/contracts/testD.sol',
                from: 'http://test.test/contracts/testE.sol',
            },
            {
                to: 'http://test.test/contracts/testE.sol',
                from: 'http://test.test/testC.sol',
            },
        ]);
    });

    test('getImportRootFiles', async () => {
        let parsedFiles = await getAllFiles(
            resolverMock,
            resolverMock,
            resolverMock,
            '/contractsZ',
            parse as any,
        );

        parsedFiles = [
            ...parsedFiles,
            ...(await getAllFiles(
                resolverMock,
                resolverMock,
                resolverMock,
                '/contracts/subdir',
                parse as any,
            )),
        ];

        expect(
            getImportRootFiles(parsedFiles, buildInputGraph(parsedFiles)),
        ).toEqual([
            {
                path: '/contractsZ/contractZ.sol',
                content: 'import "http://test.test/contracts/testD.sol";',
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'ImportDirective',
                            path: 'http://test.test/contracts/testD.sol',
                            unitAlias: null,
                            unitAliasIdentifier: null,
                            symbolAliases: null,
                            symbolAliasesIdentifiers: null,
                        },
                    ],
                },
            },
            {
                content: 'contract C {}',
                parsedContent: {
                    children: [
                        {
                            baseContracts: [],
                            kind: 'contract',
                            name: 'C',
                            subNodes: [],
                            type: 'ContractDefinition',
                        },
                    ],
                    type: 'SourceUnit',
                },
                path: '/contracts/subdir/contractC.sol',
            },
        ]);
    });
});
