import React, { useEffect, useRef, useState } from 'react';
import Menu from '../shared/Menu';
import { init, onWindowResize, ThreeEnv } from './utils/ThreeEnv';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { createBlocks } from './utils/Block';
import { onClick } from './utils/Intersection';
import InfoBoxView from './InfoBoxView';
import { CubeMaterial } from './utils/Materials';
import { Object3D } from 'three';

interface BlockViewProps {
    view: string;
    setView: (view: string) => void;
}

export enum BlockViewState {
    NoSelection,
    BlockSelected,
    BlockSelectedMin,
    TransactionSelected,
}

async function createConnection(
    setProvider: React.Dispatch<
        React.SetStateAction<ethers.providers.Web3Provider | undefined>
    >,
) {
    const provider = await detectEthereumProvider();

    if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(
            provider as any,
        );
        setProvider(ethersProvider);
    }
}

async function getBlocks(
    threeEnv: ThreeEnv,
    ethProvider: ethers.providers.Web3Provider,
    loadedBlocks: ethers.providers.Block[][],
    setBlocks: React.Dispatch<React.SetStateAction<ethers.providers.Block[][]>>,
) {
    const currentBlockNumber = await ethProvider.getBlockNumber();
    let blocksToLoad = 50;

    if (loadedBlocks.length > 0) {
        const lastBlock = loadedBlocks[loadedBlocks.length - 1][0];
        blocksToLoad = currentBlockNumber - lastBlock.number;
    }

    let newLoadedBlocks = [...loadedBlocks];

    if (blocksToLoad > 0) {
        const blocks: Promise<ethers.providers.Block>[] = [
            ...Array(blocksToLoad).keys(),
        ].map((index) => ethProvider.getBlock(currentBlockNumber - index));

        newLoadedBlocks = [...loadedBlocks, [...(await Promise.all(blocks))]];

        setBlocks(newLoadedBlocks);
    }

    setTimeout(
        () => getBlocks(threeEnv, ethProvider, newLoadedBlocks, setBlocks),
        30000,
    );
}

function BlockView(props: BlockViewProps) {
    const threeContainer = useRef<HTMLDivElement>(null);
    const [threeEnv, setThreeEnv] = useState<ThreeEnv | undefined>();
    const [ethProvider, setEthProvider] = useState<
        ethers.providers.Web3Provider | undefined
    >();
    const [blocks, setBlocks] = useState<ethers.providers.Block[][]>([]);
    const [selectedElement, setSelectedElement] = useState<
        ethers.providers.Block | undefined
    >();
    const [blockViewState, setBlockViewState] = useState<BlockViewState>(
        BlockViewState.NoSelection,
    );

    const selectBlock = (block: ethers.providers.Block) => {
        setSelectedElement(block);
        if (blockViewState === BlockViewState.BlockSelectedMin) {
            setBlockViewState(BlockViewState.BlockSelectedMin);
        } else {
            setBlockViewState(BlockViewState.BlockSelected);
        }
    };

    const minimize = () => {
        if (blockViewState === BlockViewState.BlockSelected) {
            setBlockViewState(BlockViewState.BlockSelectedMin);
        }
    };

    const maximize = () => {
        if (blockViewState === BlockViewState.BlockSelectedMin) {
            setBlockViewState(BlockViewState.BlockSelected);
        }
    };

    const unselect = () => {
        if (blockViewState !== BlockViewState.NoSelection && threeEnv) {
            const block = threeEnv.selectedBlock as any;
            block.material = CubeMaterial;
            (block.parent as Object3D).remove(block.userData.fullBlock);
            delete block.userData.fullBlock;
            threeEnv.selectedBlock = undefined;
            setBlockViewState(BlockViewState.NoSelection);
        }
    };

    useEffect(() => {
        if (!ethProvider) {
            createConnection(setEthProvider);
        } else if (threeEnv && blocks.length === 0) {
            getBlocks(threeEnv, ethProvider, blocks, setBlocks);
        }
    }, [ethProvider, threeEnv]);

    useEffect(() => {
        if (blocks.length > 0 && threeEnv) {
            createBlocks(threeEnv, blocks);
        }
    }, [blocks, threeEnv]);

    useEffect(() => {
        if (threeContainer && !threeEnv) {
            init(
                setThreeEnv,

                threeContainer,
            );
        }
    }, [threeContainer, threeEnv]);

    useEffect(() => {
        if (threeEnv) {
            onWindowResize(threeEnv, threeContainer, setThreeEnv);
        }
    }, [threeEnv]);

    return (
        <>
            <div
                ref={threeContainer}
                className="w-100 h-100 three-container"
                onClick={(
                    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
                ) => {
                    if (ethProvider)
                        onClick(threeEnv, event, ethProvider, selectBlock);
                }}
            >
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
                        />
                    }
                />
            </div>
        </>
    );
}

export default BlockView;
