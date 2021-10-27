import './Graph.css';

import React, { useEffect, useState } from 'react';
import { ParsedSolFile } from '../../lib/ParseSolidity';
import { DAG, getContractsDAG, getFilesDAG } from '../utils/NodePosition';
import { ContractDefinition } from '@solidity-parser/parser/dist/src/ast-types';
import ContractGraph from './ContractGraph';
import FileGraph from './FileGraph';
import { Context } from '../../lib/Graph';

interface GraphContainerProps {
    files: ParsedSolFile[];
    setView: (view: string) => void;
    view: string;
}

function GraphContainer(props: GraphContainerProps) {
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
            {props.view === 'contracts' && contractsDag && (
                <ContractGraph
                    contractsDag={contractsDag}
                    setView={props.setView}
                    view={props.view}
                />
            )}
            {props.view === 'files' && filesDag && (
                <FileGraph
                    filesDAG={filesDag}
                    setView={props.setView}
                    view={props.view}
                />
            )}
        </>
    );
}

export default GraphContainer;
