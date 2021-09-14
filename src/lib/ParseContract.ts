
export interface SolFile {
    path: string;
    content: string;
}

export function parseContract(files: SolFile[]): string[] {
    
    
    // TODO: parse file by file

    //@ts-ignore
    const parseResult = SolidityParser.parse(files.reduce((prev, curr) => prev + curr.content, ''))
    return parseResult.children.filter((child: any) => child.type === "ContractDefinition").map((contractDef: any) => contractDef.name);
}