import { DAG, GraphNode } from '../graph/NodePosition';
import { getContracts, ParsedSolFile } from './ParseSolidity';
import * as R from 'ramda';
import {
    ContractDefinition,
    InheritanceSpecifier,
} from '@solidity-parser/parser/dist/src/ast-types';
import { Edge } from './Graph';

export interface Context<C, E> {
    context: C;
    element: E;
}

function getContractsFromFile(
    node: GraphNode<ParsedSolFile>,
): Context<ParsedSolFile, ContractDefinition>[] {
    const getFileContextForContract = R.map(
        (
            contract: ContractDefinition,
        ): Context<ParsedSolFile, ContractDefinition> => ({
            context: node.element as ParsedSolFile,
            element: contract,
        }),
    );

    const getASTNodes = (node: GraphNode<ParsedSolFile>) =>
        node.element?.parsedContent?.children
            ? node.element?.parsedContent?.children
            : [];

    return R.pipe(
        getASTNodes,
        R.reject(R.isNil),
        getContracts,
        getFileContextForContract,
    )(node);
}

export function createInheritanceEdges(filesDag: DAG<ParsedSolFile>) {
    const getFileContextForInheritanceSpecifier = (
        contracts: Context<ParsedSolFile, ContractDefinition>[],
    ) =>
        R.map(
            (contract: Context<ParsedSolFile, ContractDefinition>) => ({
                context: {
                    contract: contract.element,
                    file: contract.context,
                    contracts,
                },
                element: contract.element.baseContracts,
            }),
            contracts,
        );

    const getAllLinkedEdges = (
        from: string,

        edges: Edge[],
    ): Edge[] =>
        R.pipe(
            R.filter<Edge, 'array'>(
                (edge: Edge): boolean => edge.from === from,
            ),

            R.map((edge) => [edge, ...getAllLinkedEdges(edge.to, edges)]),

            R.unnest,
        )(edges);

    const importPathExists = (
        from: string,
        to: string,
        edges: Edge[],
    ): boolean =>
        R.pipe(
            (from: string) => getAllLinkedEdges(from, edges),

            R.filter<Edge, 'array'>((edge) => edge.to === to),

            R.isEmpty,
            R.not,
        )(from);

    const findBaseContractCandidates = (
        inheritanceContext: Context<
            {
                contract: ContractDefinition;
                file: ParsedSolFile;
                contracts: Context<ParsedSolFile, ContractDefinition>[];
            },
            InheritanceSpecifier[]
        >,
    ) =>
        R.map(
            (inheritanceSpecifier: InheritanceSpecifier) => ({
                context: {
                    ...inheritanceContext.context,
                    inheritanceSpecifier,
                },
                element: R.pipe(
                    R.filter<
                        Context<ParsedSolFile, ContractDefinition>,
                        'array'
                    >(
                        (
                            contract: Context<
                                ParsedSolFile,
                                ContractDefinition
                            >,
                        ) =>
                            contract.element.name ===
                            inheritanceSpecifier.baseName.namePath,
                    ),
                    R.filter<
                        Context<ParsedSolFile, ContractDefinition>,
                        'array'
                    >((candidates) =>
                        R.or(
                            candidates.context.path ===
                                inheritanceContext.context.file.path,

                            importPathExists(
                                candidates.context.path,
                                inheritanceContext.context.file.path,
                                filesDag.edges,
                            ),
                        ),
                    ),
                )(inheritanceContext.context.contracts),
            }),
            inheritanceContext.element,
        );

    const toEdge = (
        link: Context<
            {
                inheritanceSpecifier: InheritanceSpecifier;
                contract: ContractDefinition;
                file: ParsedSolFile;
            },
            Context<ParsedSolFile, ContractDefinition>[]
        >,
    ) => ({
        to: link.context.contract.name + '@' + link.context.file.path,
        from: getContractId(link.element[0]),
    });

    return R.pipe(
        R.map(getContractsFromFile),
        R.unnest,
        getFileContextForInheritanceSpecifier,
        R.map(findBaseContractCandidates),
        R.unnest,
        R.reject<
            Context<
                {
                    inheritanceSpecifier: InheritanceSpecifier;
                    contract: ContractDefinition;
                    file: ParsedSolFile;
                },
                Context<ParsedSolFile, ContractDefinition>[]
            >
        >((candidates) => candidates.element.length === 0),
        R.map(toEdge),
    )(filesDag.nodes);
}

export function getContractId(
    contract: Context<ParsedSolFile, ContractDefinition>,
) {
    return contract.element.name + '@' + contract.context.path;
}

export function getAllContracts(filesDag: DAG<ParsedSolFile>) {
    return R.pipe(R.map(getContractsFromFile), R.unnest)(filesDag.nodes);
}

export function getRootContracts(
    contracts: Context<ParsedSolFile, ContractDefinition>[],
    edges: Edge[],
) {
    const isContractRoot = (
        contract: Context<ParsedSolFile, ContractDefinition>,
    ) =>
        R.filter((edge: Edge) => getContractId(contract) === edge.from, edges)
            .length === 0;

    return R.filter(isContractRoot, contracts);
}
