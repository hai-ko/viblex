import { ParseOptions } from '@solidity-parser/parser';
import {
    ASTNode,
    ContractDefinition,
    ImportDirective,
    SourceUnit,
} from '@solidity-parser/parser/dist/src/ast-types';
import { Token } from 'antlr4ts';

type ParseResult = SourceUnit & {
    errors?: any[];
    tokens?: Token[];
};

export type Parse = (input: string, options?: ParseOptions) => ParseResult;

export interface RawSolFile {
    path: string;
    content?: string;
    type?: string;
    error?: string;
}

export interface ParsedSolFile extends RawSolFile {
    parsedContent: ParseResult | null;
}

export enum SolDefinitionType {
    ContractDefinition = 'ContractDefinition',
    StructDefinition = 'StructDefinition',
    CustomErrorDefinition = 'CustomErrorDefinition',
    FunctionDefinition = 'FunctionDefinition',
    FileLevelConstant = 'FileLevelConstant',
    EnumDefinition = 'EnumDefinition',
    ImportDirective = 'ImportDirective',
}

export function parseFiles(
    rawSolFiles: RawSolFile[],
    solParser: Parse,
): ParsedSolFile[] {
    return rawSolFiles.map((file) => ({
        ...file,
        ...parseFile(file, solParser),
    }));
}

function parseFile(
    rawSolFile: RawSolFile,
    solParser: Parse,
): { error?: string; parsedContent: ParseResult | null } {
    try {
        return {
            parsedContent: rawSolFile.content
                ? solParser(rawSolFile.content)
                : null,
        };
    } catch (e: any) {
        return {
            parsedContent: null,
            error: e.toString(),
        };
    }
}

export function mergeParsedContent(parsedSolFiles: ParsedSolFile[]): ASTNode[] {
    return parsedSolFiles.map(getAST).flat();
}

export function getContracts(astNodes: ASTNode[]): ContractDefinition[] {
    return astNodes.filter(
        (astNodes) => astNodes.type === SolDefinitionType.ContractDefinition,
    ) as ContractDefinition[];
}

export function getImports(astNodes: ASTNode[]): ImportDirective[] {
    return astNodes.filter(
        (astNodes) => astNodes.type === SolDefinitionType.ImportDirective,
    ) as ImportDirective[];
}

// TODO: test
export function getAST(parsedSolFile: ParsedSolFile): ASTNode[] {
    return parsedSolFile.parsedContent
        ? parsedSolFile.parsedContent.children
        : [];
}
