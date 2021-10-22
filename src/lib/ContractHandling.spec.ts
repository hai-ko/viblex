import { getContracts, ParsedSolFile, parseFiles } from './ParseSolidity';
import { parse } from '@solidity-parser/parser';
import {
    ASTNode,
    ContractDefinition,
} from '@solidity-parser/parser/dist/src/ast-types';
import {
    createInheritanceEdges,
    getAllContracts,
    getContractId,
    getRootContracts,
} from './ContractHandling';
import { getContractsDAG, getFilesDAG } from '../graph/utils/NodePosition';
import { Context } from './Graph';

describe('ContractHandling', () => {
    const rawFiles = [
        {
            path: '/a.sol',
            content: 'import "./b.sol"; contract A is B {}',
        },
        {
            path: '/b.sol',
            content: 'contract B {}',
        },
    ];

    const rawFilesB = [
        {
            path: '/a.sol',
            content: 'import "./x.sol"; contract A is B {}',
        },
        {
            path: '/x.sol',
            content: 'import "./b.sol";',
        },
        {
            path: '/b.sol',
            content: 'contract B {}',
        },
    ];

    const rawFilesC = [
        {
            path: '/a.sol',
            content: 'import "./x.sol"; contract A is B {}',
        },
        {
            path: '/x.sol',
            content: 'import "./b.sol";',
        },
        {
            path: '/b.sol',
            content: 'contract B {}',
        },
        {
            path: '/C.sol',
            content: 'contract C is B {}',
        },
    ];

    const rawFilesD = [
        {
            path: '/ab.sol',
            content: 'import "./x.sol"; contract A {} contract B is A {}',
        },
    ];

    test('getRootContracts', async () => {
        const parsedFiles = parseFiles(rawFiles, parse as any);

        const contractsWithContext = parsedFiles.map(
            (
                file: ParsedSolFile,
            ): Context<ParsedSolFile, ContractDefinition> => ({
                context: file,
                element: getContracts(
                    file.parsedContent?.children as ASTNode[],
                )[0],
            }),
        );
        const filesDAG = await getFilesDAG(parsedFiles);
        const contractsDAG = await getContractsDAG(filesDAG);

        expect(
            getRootContracts(contractsWithContext, contractsDAG.edges).map(
                (contract) => contract.element.name,
            ),
        ).toEqual(['A']);
    });

    test('createInheritanceEdges', async () => {
        const parsedFiles = parseFiles(rawFiles, parse as any);

        const filesDAG = await getFilesDAG(parsedFiles);

        expect(createInheritanceEdges(filesDAG)).toEqual([
            {
                from: 'B@/b.sol',
                to: 'A@/a.sol',
            },
        ]);
    });

    test('createInheritanceEdges: same file inheritance', async () => {
        const parsedFiles = parseFiles(rawFilesD, parse as any);

        const filesDAG = await getFilesDAG(parsedFiles);

        expect(createInheritanceEdges(filesDAG)).toEqual([
            {
                from: 'A@/ab.sol',
                to: 'B@/ab.sol',
            },
        ]);
    });

    test('createInheritanceEdges with intermediate layer', async () => {
        const parsedFiles = parseFiles(rawFilesB, parse as any);

        const filesDAG = await getFilesDAG(parsedFiles);

        expect(createInheritanceEdges(filesDAG)).toEqual([
            {
                from: 'B@/b.sol',
                to: 'A@/a.sol',
            },
        ]);
    });

    test('createInheritanceEdges with existing base contract name but no import path', async () => {
        const parsedFiles = parseFiles(rawFilesC, parse as any);

        const filesDAG = await getFilesDAG(parsedFiles);

        expect(createInheritanceEdges(filesDAG)).toEqual([
            {
                from: 'B@/b.sol',
                to: 'A@/a.sol',
            },
        ]);
    });

    test('getContractId', async () => {
        const parsedFiles = parseFiles(rawFiles, parse as any);

        const contractsWithContext = parsedFiles.map(
            (
                file: ParsedSolFile,
            ): Context<ParsedSolFile, ContractDefinition> => ({
                context: file,
                element: getContracts(
                    file.parsedContent?.children as ASTNode[],
                )[0],
            }),
        );

        expect(getContractId(contractsWithContext[0])).toEqual('A@/a.sol');
    });

    test('getAllContracts', async () => {
        const parsedFiles = parseFiles(rawFiles, parse as any);

        const filesDAG = await getFilesDAG(parsedFiles);
        expect(
            getAllContracts(filesDAG).map((contract) => contract.element.name),
        ).toEqual(['A', 'B']);
    });
});
