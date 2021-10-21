import { DAG, GraphNode } from '../graph/NodePosition';
import { getContracts, ParsedSolFile } from './ParseSolidity';
import * as R from 'ramda';
import {
    ContractDefinition,
    InheritanceSpecifier,
} from '@solidity-parser/parser/dist/src/ast-types';
import { Context, Edge } from './Graph';

type ContractInheritanceContext = Context<
    {
        inheritanceSpecifier: InheritanceSpecifier;
        contract: ContractDefinition;
        file: ParsedSolFile;
    },
    Context<ParsedSolFile, ContractDefinition>[]
>;

type InheritanceContext = Context<
    {
        contract: ContractDefinition;
        file: ParsedSolFile;
        contracts: Context<ParsedSolFile, ContractDefinition>[];
        edges: Edge[];
    },
    InheritanceSpecifier[]
>;

function getContractsFromFile(
    node: GraphNode<ParsedSolFile>,
): Context<ParsedSolFile, ContractDefinition>[] {
    const getFileContextForContract = (
        contract: ContractDefinition,
    ): Context<ParsedSolFile, ContractDefinition> => ({
        context: node.element as ParsedSolFile,
        element: contract,
    });

    const getASTNodes = (node: GraphNode<ParsedSolFile>) =>
        node.element?.parsedContent?.children
            ? node.element?.parsedContent?.children
            : [];

    return R.pipe(
        getASTNodes,
        R.reject(R.isNil),
        getContracts,
        R.map(getFileContextForContract),
    )(node);
}

function getAllLinkedEdges(from: string, edges: Edge[]): Edge[] {
    return R.pipe(
        R.filter<Edge, 'array'>((edge: Edge): boolean => edge.from === from),
        R.map((edge) => [edge, ...getAllLinkedEdges(edge.to, edges)]),
        R.unnest,
    )(edges);
}

function importPathExists(from: string, to: string, edges: Edge[]): boolean {
    return R.pipe(
        (from: string) => getAllLinkedEdges(from, edges),
        R.filter<Edge, 'array'>((edge) => edge.to === to),
        R.isEmpty,
        R.not,
    )(from);
}

function findBaseContracts(inheritanceContext: InheritanceContext) {
    const isConnected = (
        candidate: Context<ParsedSolFile, ContractDefinition>,
    ) =>
        R.or(
            candidate.context.path === inheritanceContext.context.file.path,
            importPathExists(
                candidate.context.path,
                inheritanceContext.context.file.path,
                inheritanceContext.context.edges,
            ),
        );

    const findBaseContract = (inheritanceSpecifier: InheritanceSpecifier) => ({
        context: {
            ...inheritanceContext.context,
            inheritanceSpecifier,
        },
        element: R.pipe(
            R.filter<Context<ParsedSolFile, ContractDefinition>, 'array'>(
                (contract: Context<ParsedSolFile, ContractDefinition>) =>
                    contract.element.name ===
                    inheritanceSpecifier.baseName.namePath,
            ),
            R.filter<Context<ParsedSolFile, ContractDefinition>, 'array'>(
                isConnected,
            ),
        )(inheritanceContext.context.contracts),
    });

    return R.map(findBaseContract, inheritanceContext.element);
}

function createEdge(link: ContractInheritanceContext) {
    return {
        to: link.context.contract.name + '@' + link.context.file.path,
        from: getContractId(link.element[0]),
    };
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
                    edges: filesDag.edges,
                },
                element: contract.element.baseContracts,
            }),
            contracts,
        );

    return R.pipe(
        R.map(getContractsFromFile),
        R.unnest,
        getFileContextForInheritanceSpecifier,
        R.map(findBaseContracts),
        R.unnest,
        R.reject<ContractInheritanceContext>((e) => R.isEmpty(e.element)),
        R.map(createEdge),
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
