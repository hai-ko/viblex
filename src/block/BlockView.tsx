import React, { useEffect, useRef, useState } from 'react';
import Menu from '../shared/Menu';
import { init, onWindowResize, ThreeEnv } from './utils/ThreeEnv';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { BLOCKS_TO_SHOW, createBlocks } from './utils/Block';
import { onClick } from './utils/Intersection';
import InfoBoxView from './info-box/InfoBoxView';
import { CubeMaterial } from './utils/Materials';
import { Object3D, Vector3 } from 'three';
import PageVisibility from 'react-page-visibility';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import MessageBoxView from './MessageBoxView';
import './Block.css';

interface BlockViewProps {
    view?: string;
    setView?: (view: string) => void;
}

export enum BlockViewState {
    WaitForConnection,
    NoConnection,
    NoSelection,
    HelpSelected,
    BlockSelected,
    BlockSelectedMin,
    TransactionSelected,
    TransactionSelectedMin,
}

async function createConnection(
    setProvider: React.Dispatch<
        React.SetStateAction<ethers.providers.Provider | undefined>
    >,
    setBlockViewState: React.Dispatch<React.SetStateAction<BlockViewState>>,
    rpc: string,
    showHelp: boolean,
) {
    if (rpc) {
        setProvider(
            new ethers.providers.JsonRpcProvider(decodeURIComponent(rpc)),
        );
        setBlockViewState(
            showHelp ? BlockViewState.HelpSelected : BlockViewState.NoSelection,
        );
    } else {
        const provider = await detectEthereumProvider();

        if (provider) {
            const ethersProvider = new ethers.providers.Web3Provider(
                provider as any,
            );
            setProvider(ethersProvider);
            setBlockViewState(
                showHelp
                    ? BlockViewState.HelpSelected
                    : BlockViewState.NoSelection,
            );
        } else {
            setBlockViewState(BlockViewState.NoConnection);
        }
    }
}

async function getBlocks(
    threeEnv: ThreeEnv,
    ethProvider: ethers.providers.Provider,
    loadedBlocks: ethers.providers.Block[][],
    setBlocks: React.Dispatch<React.SetStateAction<ethers.providers.Block[][]>>,
    setGetBlocksTimeout: React.Dispatch<
        React.SetStateAction<NodeJS.Timeout | undefined>
    >,
) {
    const currentBlockNumber = await ethProvider.getBlockNumber();
    let blocksToLoad = BLOCKS_TO_SHOW;

    if (loadedBlocks.length > 0) {
        const lastBlock = loadedBlocks[loadedBlocks.length - 1][0];
        blocksToLoad = currentBlockNumber - lastBlock.number;
    }

    let newLoadedBlocks = [...loadedBlocks];

    if (blocksToLoad > 0) {
        const blocks: Promise<ethers.providers.Block>[] = [
            ...Array(blocksToLoad).keys(),
        ].map((index) => ethProvider.getBlock(currentBlockNumber - index));

        newLoadedBlocks = loadedBlocks[loadedBlocks.length - 1]
            ? [loadedBlocks[loadedBlocks.length - 1], await Promise.all(blocks)]
            : [await Promise.all(blocks)];

        setBlocks(newLoadedBlocks);
    }

    setGetBlocksTimeout(
        setTimeout(
            () =>
                getBlocks(
                    threeEnv,
                    ethProvider,
                    newLoadedBlocks,
                    setBlocks,
                    setGetBlocksTimeout,
                ),
            30000,
        ),
    );
}

function BlockView(props: BlockViewProps) {
    const rpc = queryString.parse(useLocation().search).rpc as string;
    const stats = queryString.parse(useLocation().search).stats as string;

    const [getBlocksTimeout, setGetBlocksTimeout] = useState<NodeJS.Timeout>();
    const threeContainer = useRef<HTMLDivElement>(null);
    const [threeEnv, setThreeEnv] = useState<ThreeEnv | undefined>();
    const [ethProvider, setEthProvider] = useState<
        ethers.providers.Provider | undefined
    >();
    const [blocks, setBlocks] = useState<ethers.providers.Block[][]>([]);
    const [selectedElement, setSelectedElement] = useState<
        | ethers.providers.Block
        | ethers.providers.TransactionResponse
        | undefined
    >();
    const [blockViewState, setBlockViewState] = useState<BlockViewState>(
        BlockViewState.WaitForConnection,
    );

    const selectBlock = (block: ethers.providers.Block) => {
        setSelectedElement(block);
        if (blockViewState !== BlockViewState.BlockSelectedMin) {
            setBlockViewState(BlockViewState.BlockSelected);
        }
    };

    const selectTransaction = (
        transaction: ethers.providers.TransactionResponse,
    ) => {
        setSelectedElement(transaction);
        if (blockViewState !== BlockViewState.TransactionSelectedMin) {
            setBlockViewState(BlockViewState.TransactionSelected);
        }
    };

    const minimize = () => {
        if (blockViewState === BlockViewState.BlockSelected) {
            setBlockViewState(BlockViewState.BlockSelectedMin);
        } else if (blockViewState === BlockViewState.TransactionSelected) {
            setBlockViewState(BlockViewState.TransactionSelectedMin);
        }
    };

    const maximize = () => {
        if (blockViewState === BlockViewState.BlockSelectedMin) {
            setBlockViewState(BlockViewState.BlockSelected);
        } else if (blockViewState === BlockViewState.TransactionSelectedMin) {
            setBlockViewState(BlockViewState.TransactionSelected);
        }
    };

    const unselect = () => {
        if (
            blockViewState !== BlockViewState.NoSelection &&
            blockViewState !== BlockViewState.HelpSelected &&
            threeEnv
        ) {
            const block = threeEnv.selectedBlock as any;
            block.material = CubeMaterial;
            (block.parent as Object3D).remove(block.userData.fullBlock);
            delete block.userData.fullBlock;
            threeEnv.selectedBlock = undefined;
        }
        setBlockViewState(BlockViewState.NoSelection);
    };

    const showHelp = () => {
        setBlockViewState(BlockViewState.HelpSelected);
    };

    const visibilityHandler = (isVisable: boolean) => {
        if (!isVisable && getBlocksTimeout) {
            clearTimeout(getBlocksTimeout);
            setGetBlocksTimeout(undefined);
        } else if (
            isVisable &&
            !getBlocksTimeout &&
            threeEnv &&
            ethProvider &&
            blocks.length > 0
        ) {
            getBlocks(
                threeEnv,
                ethProvider,
                blocks,
                setBlocks,
                setGetBlocksTimeout,
            );
        }
    };

    useEffect(() => {
        if (!ethProvider && threeContainer) {
            const width = (threeContainer.current as any).clientWidth;
            createConnection(
                setEthProvider,
                setBlockViewState,
                rpc,
                width > 1000,
            );
        } else if (ethProvider && threeEnv && blocks.length === 0) {
            getBlocks(
                threeEnv,
                ethProvider,
                blocks,
                setBlocks,
                setGetBlocksTimeout,
            );
        }
        return () => {
            if (getBlocksTimeout) {
                clearTimeout(getBlocksTimeout);
            }
        };
    }, [ethProvider, threeEnv, threeContainer]);

    useEffect(() => {
        if (blocks.length > 0 && threeEnv) {
            createBlocks(threeEnv, blocks);
        }
    }, [blocks, threeEnv]);

    useEffect(() => {
        if (threeEnv && blockViewState === BlockViewState.NoConnection) {
            threeEnv.controls.target = new Vector3(0, 0, 0);
            threeEnv.controls.update();
        }
    }, [blockViewState]);

    useEffect(() => {
        if (threeContainer && !threeEnv) {
            init(
                setThreeEnv,

                threeContainer,
                stats === 'true',
            );
        }
    }, [threeContainer, threeEnv]);

    useEffect(() => {
        if (threeEnv) {
            onWindowResize(threeEnv, threeContainer, setThreeEnv);
        }
    }, [threeEnv]);

    return (
        <PageVisibility onChange={visibilityHandler}>
            <div
                ref={threeContainer}
                className="w-100 h-100 three-container"
                onClick={(
                    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
                ) => {
                    if (ethProvider)
                        onClick(
                            threeEnv,
                            event,
                            ethProvider,
                            selectBlock,
                            selectTransaction,
                        );
                }}
            >
                {blockViewState === BlockViewState.NoConnection && (
                    <MessageBoxView />
                )}
                <Menu
                    setView={props.setView}
                    defaultView={props.view}
                    infoBox={
                        <InfoBoxView
                            selectedElement={selectedElement}
                            blockViewState={blockViewState}
                            minimize={minimize}
                            maximize={maximize}
                            unselect={unselect}
                            showHelp={showHelp}
                        />
                    }
                />
            </div>
        </PageVisibility>
    );
}

export default BlockView;
