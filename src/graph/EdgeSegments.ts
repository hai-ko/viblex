import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Edge } from '../lib/Graph';
import { GraphStyle } from './GraphStyle';
import { ThreeGraphNode } from './NodePosition';

export function showImportPaths<T>(
    edges: Edge[],
    nodes: ThreeGraphNode<T>[],
    exec: (o: CSS3DObject) => void,
) {
    for (const edge of edges) {
        const fromNode = nodes.find((node) => node.id === edge.from);
        const toNode = nodes.find((node) => node.id === edge.to);
        if (fromNode && toNode) {
            exec(fromNode.segments[0]);
            exec(toNode.segments[1]);
            if (fromNode.xPos - toNode.xPos > 1) {
                exec(toNode.segments[3]);
                exec(toNode.segments[4]);
                for (let i = toNode.xPos + 1; i < fromNode.xPos - 1; i++) {
                    const node = nodes.find(
                        (n) => n.yPos === toNode.yPos && n.xPos === i,
                    );
                    if (node) {
                        exec(node.segments[4]);
                    }
                }
            }

            if (fromNode.yPos < toNode.yPos) {
                for (let i = fromNode.yPos; i <= toNode.yPos; i++) {
                    const node = nodes.find(
                        (n) => n.xPos + 1 === fromNode.xPos && n.yPos === i,
                    );
                    if (node) {
                        if (i === fromNode.yPos) {
                            exec(node.segments[3]);
                        } else if (i === toNode.yPos) {
                            exec(node.segments[2]);
                            if (fromNode.xPos - toNode.xPos > 1) {
                                exec(node.segments[3]);
                            }
                        } else {
                            exec(node.segments[2]);
                            exec(node.segments[3]);
                        }
                    }
                }
            } else if (fromNode.yPos > toNode.yPos) {
                for (let i = toNode.yPos; i <= fromNode.yPos; i++) {
                    const node = nodes.find(
                        (n) => n.xPos + 1 === fromNode.xPos && n.yPos === i,
                    );
                    if (node) {
                        if (i === fromNode.yPos) {
                            exec(node.segments[2]);
                        } else if (i === toNode.yPos) {
                            exec(node.segments[3]);
                            if (fromNode.xPos - toNode.xPos > 1) {
                                exec(node.segments[2]);
                            }
                        } else {
                            exec(node.segments[2]);
                            exec(node.segments[3]);
                        }
                    }
                }
            } else {
                if (fromNode.xPos - toNode.xPos > 1) {
                    exec(toNode.segments[3]);
                    const node = nodes.find(
                        (n) =>
                            n.xPos + 1 === fromNode.xPos &&
                            n.yPos === fromNode.yPos,
                    );
                    if (node) {
                        exec(node.segments[3]);
                    }
                }
            }
        }
    }
}

export function getSegments(x: number, y: number, graphStyle: GraphStyle) {
    const getSegment = (
        x: number,
        y: number,
        width: number,
        height: number,
    ): CSS3DObject => {
        const segment = document.createElement('div');
        segment.className = 'edge';
        segment.style.width = width + 'px';
        segment.style.height = height + 'px';

        const segmentObject = new CSS3DObject(segment);
        segmentObject.position.x = x;
        segmentObject.position.y = y;

        return segmentObject;
    };

    return [
        getSegment(
            x - graphStyle.ELEMENT_WIDTH / 2 - graphStyle.COL_DISTANCE / 4,
            y,
            graphStyle.COL_DISTANCE / 2,
            graphStyle.SEGMENT_THICKNESS,
        ),
        getSegment(
            x + graphStyle.ELEMENT_WIDTH / 2 + graphStyle.COL_DISTANCE / 4,
            y,
            graphStyle.COL_DISTANCE / 2,
            graphStyle.SEGMENT_THICKNESS,
        ),
        getSegment(
            x + graphStyle.ELEMENT_WIDTH / 2 + graphStyle.COL_DISTANCE / 2,
            y +
                (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2) /
                    2,
            graphStyle.SEGMENT_THICKNESS,
            graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2,
        ),
        getSegment(
            x + graphStyle.ELEMENT_WIDTH / 2 + graphStyle.COL_DISTANCE / 2,
            y -
                (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2) /
                    2,
            graphStyle.SEGMENT_THICKNESS,
            graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2,
        ),

        getSegment(
            x + graphStyle.ELEMENT_WIDTH + graphStyle.COL_DISTANCE,
            y - (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2),
            graphStyle.ELEMENT_WIDTH + graphStyle.COL_DISTANCE,
            graphStyle.SEGMENT_THICKNESS,
        ),
    ];
}
