import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import * as THREE from 'three';
import {
    getAllAcccountAddresses,
    ReplayTransaction,
} from '../../lib/TransactionSequence';
import {
    nodeXIndexToPos,
    nodeYIndexToPos,
    PosMappingData,
    SeqNodeType,
    SequenceDiagramNode,
} from '../views/Node';
import { Three, transform } from './ThreeEnv';

enum ArrowHead {
    None,
    Left,
    Right,
}

export function createSequenceBody(
    trace: ReplayTransaction[],
    posMappingData: PosMappingData,
    three: Three,
) {
    const accountAddresses = getAllAcccountAddresses(trace);

    let nodes: SequenceDiagramNode[] = createAccountNodes(
        accountAddresses,
        posMappingData,
    );

    accountAddresses.forEach((_, index) => {
        createLine(index * 2, 1, posMappingData, three, false);
    });

    let row = 2;

    const returnStack: { id: number; returnTx: ReplayTransaction }[] = [];

    for (let i = 0; i < trace.length; i++) {
        const internalTx = trace[i];

        accountAddresses.forEach((_, index) => {
            createLine(index * 2, row, posMappingData, three, false);
        });
        row++;

        const resolveFrom = () =>
            i > 0
                ? trace.find((replayTx) => {
                      let base = [...internalTx.traceAddress];
                      if (base[base.length - 1] === 0) {
                          base = base.slice(0, base.length - 1);
                      } else {
                          base[base.length - 1] = 0;
                      }

                      return replayTx.traceAddress.join('_') === base.join('_');
                  })?.action.to
                : internalTx.action.from;

        nodes = [
            ...nodes,
            ...connectAccounts(
                resolveFrom() as string,
                internalTx.action.to,
                row,
                accountAddresses,
                three,
                posMappingData,
                internalTx,
                i,
            ),
        ];

        row++;

        const returnInternalTx = {
            ...internalTx,
            action: {
                ...internalTx.action,
                from: internalTx.action.to,
                to: resolveFrom() as string,
            },
        };

        returnStack.push({ id: i, returnTx: { ...returnInternalTx } });

        const nextTx = trace[i + 1];

        if (
            (nextTx &&
                nextTx.traceAddress[nextTx.traceAddress.length - 1] > 0) ||
            !nextTx
        ) {
            let base;
            if (nextTx) {
                base = [...nextTx.traceAddress];
                base[nextTx.traceAddress.length - 1]--;
            }

            let returnEntry = returnStack[returnStack.length - 1];

            const removeTxFromStack = () => {
                accountAddresses.forEach((_, index) => {
                    createLine(index * 2, row, posMappingData, three, false);
                });
                row++;

                const { id, returnTx } = returnEntry;

                nodes = [
                    ...nodes,
                    ...connectAccounts(
                        returnTx.action.to,
                        returnTx.action.from,
                        row,
                        accountAddresses,
                        three,
                        posMappingData,
                        returnTx,
                        id,
                        true,
                    ),
                ];
                accountAddresses.forEach((_, index) => {
                    createLine(index * 2, row, posMappingData, three, false);
                });
                row++;

                returnStack.pop();
            };

            if (
                base &&
                returnEntry?.returnTx.traceAddress.join('_') ===
                    base.join('_') &&
                returnEntry.returnTx.subtraces === 0 &&
                returnEntry.returnTx.traceAddress[
                    returnEntry.returnTx.traceAddress.length - 1
                ] !== 0
            ) {
                removeTxFromStack();
            } else {
                while (
                    (!nextTx && returnStack.length > 0) ||
                    (base &&
                        returnEntry?.returnTx.traceAddress.join('_') !==
                            base.join('_'))
                ) {
                    removeTxFromStack();
                    returnEntry = returnStack[returnStack.length - 1];
                }
            }
        }
    }

    nodes.forEach((node) => three.scene.add(node.css3DObject));

    transform(nodes, posMappingData.graphStyle.ANIMATION_DURATION);

    return nodes;
}

export function connectAccounts(
    from: string,
    to: string,
    row: number,
    accountAddresses: string[],
    three: Three,
    posMappingData: PosMappingData,
    replayTx: ReplayTransaction,
    txId: number,
    isReturn?: boolean,
): SequenceDiagramNode[] {
    const fromIndex = accountAddresses.findIndex((account) => from === account);
    const toIndex = accountAddresses.findIndex((account) => to === account);
    const sequenceDiagramNodes: SequenceDiagramNode[] = [];
    const seqNodeType = isReturn
        ? SeqNodeType.TransactionResult
        : SeqNodeType.Transaction;

    if (fromIndex !== -1 && toIndex !== -1) {
        for (let i = 0; i < accountAddresses.length; i++) {
            if (i === fromIndex && toIndex === fromIndex) {
                createLoop(i * 2, row, posMappingData, three);
                sequenceDiagramNodes.push(
                    createNode(
                        i * 2 + 1,
                        row,
                        posMappingData,
                        replayTx,
                        seqNodeType,
                        txId,
                    ),
                );
            } else if (i > fromIndex && i < toIndex) {
                createPlus(
                    i * 2,
                    row,
                    posMappingData,
                    three,
                    false,
                    ArrowHead.None,
                );
                createLine(i * 2 + 1, row, posMappingData, three, true);
            } else if (i < fromIndex && i > toIndex) {
                createPlus(
                    i * 2,
                    row,
                    posMappingData,
                    three,
                    false,
                    ArrowHead.None,
                );
                createLine(i * 2 - 1, row, posMappingData, three, true);
            } else if (i === fromIndex) {
                if (fromIndex < toIndex) {
                    createPlus(
                        i * 2,
                        row,
                        posMappingData,
                        three,
                        true,
                        isReturn ? ArrowHead.Right : ArrowHead.None,
                    );
                    sequenceDiagramNodes.push(
                        createNode(
                            i * 2 + 1,
                            row,
                            posMappingData,
                            replayTx,
                            seqNodeType,
                            txId,
                        ),
                    );
                } else {
                    createPlus(
                        i * 2,
                        row,
                        posMappingData,
                        three,
                        true,
                        isReturn ? ArrowHead.Left : ArrowHead.None,
                        true,
                    );
                    sequenceDiagramNodes.push(
                        createNode(
                            i * 2 - 1,
                            row,
                            posMappingData,
                            replayTx,
                            seqNodeType,
                            txId,
                        ),
                    );
                }
            } else if (i === toIndex) {
                if (fromIndex > toIndex) {
                    createPlus(
                        i * 2,
                        row,
                        posMappingData,
                        three,
                        true,
                        isReturn ? ArrowHead.None : ArrowHead.Right,
                    );
                } else {
                    createPlus(
                        i * 2,
                        row,
                        posMappingData,
                        three,
                        true,
                        isReturn ? ArrowHead.None : ArrowHead.Left,
                        true,
                    );
                }
            } else {
                createLine(i * 2, row, posMappingData, three, false);
            }
        }
    }
    return sequenceDiagramNodes;
}

export function createLine(
    indexX: number,
    indexY: number,
    posMappingData: PosMappingData,
    three: Three,
    rotate: boolean,
) {
    const segment = document.createElement('div');
    segment.className = 'edge';
    segment.style.width =
        (rotate
            ? posMappingData.graphStyle.ELEMENT_WIDTH
            : posMappingData.graphStyle.SEGMENT_THICKNESS) + 'px';
    segment.style.height =
        (rotate
            ? posMappingData.graphStyle.SEGMENT_THICKNESS
            : posMappingData.graphStyle.ELEMENT_HEIGHT) + 'px';

    const partObject = new CSS3DObject(segment);

    partObject.position.x = nodeXIndexToPos(indexX, posMappingData);
    partObject.position.y = nodeYIndexToPos(indexY, posMappingData);

    three.scene.add(partObject);
}

function createArrowHead(
    posMappingData: PosMappingData,
    position: THREE.Vector3,
    right: boolean,
): CSS3DObject {
    const arrowSegment = document.createElement('div');

    arrowSegment.style.width = '0px';
    arrowSegment.style.height = '0px';

    arrowSegment.style.borderTop =
        posMappingData.graphStyle.SEGMENT_THICKNESS * 3 +
        'px solid transparent';
    arrowSegment.style.borderBottom =
        posMappingData.graphStyle.SEGMENT_THICKNESS * 3 +
        'px solid transparent';

    if (right) {
        arrowSegment.style.borderRight =
            posMappingData.graphStyle.SEGMENT_THICKNESS * 3 +
            'px solid ' +
            posMappingData.graphStyle.SEGMENT_COLOR;
    } else {
        arrowSegment.style.borderLeft =
            posMappingData.graphStyle.SEGMENT_THICKNESS * 3 +
            'px solid ' +
            posMappingData.graphStyle.SEGMENT_COLOR;
    }

    const arrowObject = new CSS3DObject(arrowSegment);

    arrowObject.position.x =
        position.x +
        posMappingData.graphStyle.SEGMENT_THICKNESS * 2 * (right ? 1 : -1);
    arrowObject.position.y = position.y;

    return arrowObject;
}

export function createPlus(
    indexX: number,
    indexY: number,
    posMappingData: PosMappingData,
    three: Three,
    isT: boolean,
    arrowHead: ArrowHead,
    rotate?: boolean,
) {
    const group = new THREE.Group();
    const vSegment = document.createElement('div');
    vSegment.className = 'edge';
    vSegment.style.width = posMappingData.graphStyle.SEGMENT_THICKNESS + 'px';
    vSegment.style.height = posMappingData.graphStyle.ELEMENT_HEIGHT + 'px';

    const vObject = new CSS3DObject(vSegment);

    vObject.position.x = nodeXIndexToPos(indexX, posMappingData);
    vObject.position.y = nodeYIndexToPos(indexY, posMappingData);

    group.add(vObject);

    switch (arrowHead) {
        case ArrowHead.Left:
            group.add(createArrowHead(posMappingData, vObject.position, false));
            break;
        case ArrowHead.Right:
            group.add(createArrowHead(posMappingData, vObject.position, true));
            break;
        case ArrowHead.None:
        default:
            break;
    }

    const hSegment = document.createElement('div');
    hSegment.className = 'edge';
    hSegment.style.width =
        posMappingData.graphStyle.ELEMENT_WIDTH / (isT ? 2 : 1) + 'px';
    hSegment.style.height = posMappingData.graphStyle.SEGMENT_THICKNESS + 'px';

    const hObject = new CSS3DObject(hSegment);

    hObject.position.x =
        vObject.position.x +
        (isT ? posMappingData.graphStyle.ELEMENT_WIDTH / 4 : 0) *
            (rotate ? -1 : 1);
    hObject.position.y = vObject.position.y;
    group.add(hObject);

    three.scene.add(group);
}

export function createLoop(
    indexX: number,
    indexY: number,
    posMappingData: PosMappingData,
    three: Three,
) {
    const group = new THREE.Group();
    const vSegment = document.createElement('div');
    vSegment.className = 'edge';
    vSegment.style.width = posMappingData.graphStyle.SEGMENT_THICKNESS + 'px';
    vSegment.style.height = posMappingData.graphStyle.ELEMENT_HEIGHT + 'px';

    const vObject = new CSS3DObject(vSegment);

    vObject.position.x = nodeXIndexToPos(indexX, posMappingData);
    vObject.position.y = nodeYIndexToPos(indexY, posMappingData);

    group.add(vObject);

    const h1Segment = document.createElement('div');
    h1Segment.className = 'edge';
    h1Segment.style.width = posMappingData.graphStyle.ELEMENT_WIDTH / 2 + 'px';
    h1Segment.style.height = posMappingData.graphStyle.SEGMENT_THICKNESS + 'px';

    const h1Object = new CSS3DObject(h1Segment);

    h1Object.position.x =
        vObject.position.x + posMappingData.graphStyle.ELEMENT_WIDTH / 4;
    h1Object.position.y =
        vObject.position.y + posMappingData.graphStyle.ELEMENT_HEIGHT / 4;

    group.add(h1Object);

    const h2Segment = document.createElement('div');
    h2Segment.className = 'edge';
    h2Segment.style.width = posMappingData.graphStyle.ELEMENT_WIDTH / 2 + 'px';
    h2Segment.style.height = posMappingData.graphStyle.SEGMENT_THICKNESS + 'px';

    const h2Object = new CSS3DObject(h2Segment);

    h2Object.position.x =
        vObject.position.x + posMappingData.graphStyle.ELEMENT_WIDTH / 4;
    h2Object.position.y =
        vObject.position.y - posMappingData.graphStyle.ELEMENT_HEIGHT / 4;

    group.add(h2Object);

    three.scene.add(group);
}

export function createAccountNodes(
    accountAdresses: string[],
    posMappingData: PosMappingData,
): SequenceDiagramNode[] {
    return accountAdresses.map((accountAdresses, index) =>
        createNode(
            index * 2,
            0,
            posMappingData,
            accountAdresses,
            SeqNodeType.Account,
            -1,
        ),
    );
}

function createNode(
    indexX: number,
    indexY: number,
    posMappingData: PosMappingData,
    content: ReplayTransaction | string,
    seqNodeType: SeqNodeType,
    txId: number,
): SequenceDiagramNode {
    const nodeDiv = document.createElement('div');

    const css3DObject = new CSS3DObject(nodeDiv);
    css3DObject.position.x = Math.random() * 4000 - 2000;
    css3DObject.position.y = Math.random() * 4000 - 2000;
    css3DObject.position.z = Math.random() * 4000 - 2000;

    const object3D = new THREE.Object3D();
    object3D.position.setX(nodeXIndexToPos(indexX, posMappingData));

    object3D.position.setY(nodeYIndexToPos(indexY, posMappingData));

    return {
        css3DObject,
        object3D,
        seqNodeType,
        portal: {
            graphStyle:
                seqNodeType === SeqNodeType.Account
                    ? {
                          ...posMappingData.graphStyle,
                          ELEMENT_WIDTH:
                              posMappingData.graphStyle.ELEMENT_WIDTH * 1.9,
                      }
                    : posMappingData.graphStyle,
            node: {
                id: 'seqNode' + indexX + '_' + indexY,
                xPos: indexX,
                yPos: indexY,
                yRelative: indexY,
                element: content,
            },
            onMouseLeave: () => {},
            onMouseOver: () => {},
            nodeDiv,
        },
        txId,
    };
}
