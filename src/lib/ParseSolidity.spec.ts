import {
    getContracts,
    getImports,
    mergeParsedContent,
    parseFiles,
} from './ParseSolidity';
import { parse } from '@solidity-parser/parser';
import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';

describe('ParseSolidity', () => {
    test('parseFiles should return an error', async () => {
        const testFileA = {
            path: '/contracts/testA.sol',
            content: `
                contr A {
                    
                }
            `,
        };

        expect(parseFiles([testFileA], parse as any)[0].error).toEqual(
            'Error: The specified node does not exist',
        );
    });

    test('parseFiles', async () => {
        const testFileA = {
            path: '/contracts/testA.sol',
            content: `
                struct StructA {
                    bool test;
                }
                
                error TestError(bool test);
                
                function functionA () pure {
                
                }
                
                uint constant constantA = 8;
                
                enum EnumA {
                    Test
                }
                
                contract A {
                    
                }
            `,
        };

        expect(parseFiles([testFileA], parse as any)).toEqual([
            {
                ...testFileA,
                parsedContent: {
                    type: 'SourceUnit',
                    children: [
                        {
                            type: 'StructDefinition',
                            name: 'StructA',
                            members: [
                                {
                                    type: 'VariableDeclaration',
                                    typeName: {
                                        type: 'ElementaryTypeName',
                                        name: 'bool',
                                        stateMutability: null,
                                    },
                                    name: 'test',
                                    identifier: {
                                        type: 'Identifier',
                                        name: 'test',
                                    },
                                    storageLocation: null,
                                    isStateVar: false,
                                    isIndexed: false,
                                    expression: null,
                                },
                            ],
                        },
                        {
                            type: 'CustomErrorDefinition',
                            name: 'TestError',
                            parameters: [
                                {
                                    type: 'VariableDeclaration',
                                    typeName: {
                                        type: 'ElementaryTypeName',
                                        name: 'bool',
                                        stateMutability: null,
                                    },
                                    name: 'test',
                                    identifier: {
                                        type: 'Identifier',
                                        name: 'test',
                                    },
                                    storageLocation: null,
                                    isStateVar: false,
                                    isIndexed: false,
                                    expression: null,
                                },
                            ],
                        },
                        {
                            type: 'FunctionDefinition',
                            name: 'functionA',
                            parameters: [],
                            returnParameters: null,
                            body: {
                                type: 'Block',
                                statements: [],
                            },
                            visibility: 'default',
                            modifiers: [],
                            override: null,
                            isConstructor: false,
                            isReceiveEther: false,
                            isFallback: false,
                            isVirtual: false,
                            stateMutability: 'pure',
                        },
                        {
                            type: 'FileLevelConstant',
                            typeName: {
                                type: 'ElementaryTypeName',
                                name: 'uint',
                                stateMutability: null,
                            },
                            name: 'constantA',
                            initialValue: {
                                type: 'NumberLiteral',
                                number: '8',
                                subdenomination: null,
                            },
                            isDeclaredConst: true,
                            isImmutable: false,
                        },
                        {
                            type: 'EnumDefinition',
                            name: 'EnumA',
                            members: [
                                {
                                    type: 'EnumValue',
                                    name: 'Test',
                                },
                            ],
                        },
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

    test('mergeParsedContent', async () => {
        const parsedSolFileA = {
            path: '/contracts/testA.sol',
            content: '',
            parsedContent: {
                type: 'SourceUnit',
                children: [
                    {
                        type: 'StructDefinition',
                        name: 'StructA',
                        members: [
                            {
                                type: 'VariableDeclaration',
                                typeName: {
                                    type: 'ElementaryTypeName',
                                    name: 'bool',
                                    stateMutability: null,
                                },
                                name: 'test',
                                identifier: {
                                    type: 'Identifier',
                                    name: 'test',
                                },
                                storageLocation: null,
                                isStateVar: false,
                                isIndexed: false,
                                expression: null,
                            },
                        ],
                    },
                ],
            },
        };

        const parsedSolFileB = {
            path: '/contracts/testB.sol',
            content: '',
            parsedContent: {
                type: 'SourceUnit',
                children: [
                    {
                        type: 'StructDefinition',
                        name: 'StructA',
                        members: [
                            {
                                type: 'VariableDeclaration',
                                typeName: {
                                    type: 'ElementaryTypeName',
                                    name: 'bool',
                                    stateMutability: null,
                                },
                                name: 'test',
                                identifier: {
                                    type: 'Identifier',
                                    name: 'test',
                                },
                                storageLocation: null,
                                isStateVar: false,
                                isIndexed: false,
                                expression: null,
                            },
                        ],
                    },
                ],
            },
        };

        const parsedSolFileC = {
            path: '/contracts/testC.sol',
            content: '',
            error: 'bla',
        };

        expect(
            mergeParsedContent([
                parsedSolFileA as any,
                parsedSolFileB as any,
                parsedSolFileC,
            ]),
        ).toEqual([
            {
                type: 'StructDefinition',
                name: 'StructA',
                members: [
                    {
                        type: 'VariableDeclaration',
                        typeName: {
                            type: 'ElementaryTypeName',
                            name: 'bool',
                            stateMutability: null,
                        },
                        name: 'test',
                        identifier: {
                            type: 'Identifier',
                            name: 'test',
                        },
                        storageLocation: null,
                        isStateVar: false,
                        isIndexed: false,
                        expression: null,
                    },
                ],
            },
            {
                type: 'StructDefinition',
                name: 'StructA',
                members: [
                    {
                        type: 'VariableDeclaration',
                        typeName: {
                            type: 'ElementaryTypeName',
                            name: 'bool',
                            stateMutability: null,
                        },
                        name: 'test',
                        identifier: {
                            type: 'Identifier',
                            name: 'test',
                        },
                        storageLocation: null,
                        isStateVar: false,
                        isIndexed: false,
                        expression: null,
                    },
                ],
            },
        ]);
    });
    test('getContracts', async () => {
        const astNodes = [
            {
                type: 'ContractDefinition',
                name: 'A',
                baseContracts: [],
                subNodes: [],
                kind: 'contract',
            },
            {
                type: 'StructDefinition',
                name: 'StructA',
                members: [
                    {
                        type: 'VariableDeclaration',
                        typeName: {
                            type: 'ElementaryTypeName',
                            name: 'bool',
                            stateMutability: null,
                        },
                        name: 'test',
                        identifier: {
                            type: 'Identifier',
                            name: 'test',
                        },
                        storageLocation: null,
                        isStateVar: false,
                        isIndexed: false,
                        expression: null,
                    },
                ],
            },
        ];

        expect(getContracts(astNodes as any)).toEqual([
            {
                type: 'ContractDefinition',
                name: 'A',
                baseContracts: [],
                subNodes: [],
                kind: 'contract',
            },
        ]);
    });

    test('parseFiles', async () => {
        const testFileA = {
            path: '/contracts/testA.sol',
            content: `
                import './contractB.sol';
                import './contractC.sol';
                contract A {}
            `,
        };

        expect(
            getImports(
                parseFiles([testFileA], parse as any)[0].parsedContent
                    ?.children as ASTNode[],
            ),
        ).toEqual([
            {
                type: 'ImportDirective',
                path: './contractB.sol',
                unitAlias: null,
                unitAliasIdentifier: null,
                symbolAliases: null,
                symbolAliasesIdentifiers: null,
            },
            {
                type: 'ImportDirective',
                path: './contractC.sol',
                unitAlias: null,
                unitAliasIdentifier: null,
                symbolAliases: null,
                symbolAliasesIdentifiers: null,
            },
        ]);
    });
});
