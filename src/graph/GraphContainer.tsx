import './Graph.css';

import React, { useEffect, useState } from 'react';
import { ParsedSolFile } from '../lib/ParseSolidity';
import { DAG, getContractsDAG, getFilesDAG } from './NodePosition';
import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import { Context } from '../lib/ContractHandling';
import ContractGraph from './ContractGraph';
import FileGraph from './FileGraph';

interface GraphContainerProps {
    files: ParsedSolFile[];
}

function GraphContainer(props: GraphContainerProps) {
    const [view, setView] = useState<string>('files');
    const [filesDag, setFilesDag] = useState<DAG<ParsedSolFile> | undefined>();
    const [contractsDag, setContractsDag] = useState<
        DAG<Context<ParsedSolFile, ContractDefinition>> | undefined
    >();

    const createFilesDAG = async () => {
        if (!filesDag) {
            setFilesDag(await getFilesDAG(props.files));
        }
    };

    const createContractsDAG = async () => {
        if (!contractsDag && filesDag) {
            setContractsDag(await getContractsDAG(filesDag));
        }
    };

    useEffect(() => {
        createFilesDAG();
    }, [props.files]);

    useEffect(() => {
        if (filesDag && !contractsDag) {
            createContractsDAG();
        }
    }, [filesDag, contractsDag]);

    return (
        <>
            {view === 'contracts' && contractsDag && (
                <ContractGraph
                    contractsDag={contractsDag}
                    setView={setView}
                    view={view}
                />
            )}
            {view === 'files' && filesDag && (
                <FileGraph filesDAG={filesDag} setView={setView} view={view} />
            )}
        </>
    );
}

export default GraphContainer;
