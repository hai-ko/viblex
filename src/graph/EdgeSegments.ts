import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Edge } from '../lib/Graph';
import { GraphStyle } from './GraphStyle';
import { ThreeGraphNode } from './NodePosition';

export function showImportPaths<T>(
    edges: Edge[],
    nodes: ThreeGraphNode<T>[],
    exec: (o: CSS3DObject, xPos: number, isLeftArrow?: boolean) => void,
) {
    for (const edge of edges) {
        const fromNode = nodes.find((node) => node.id === edge.from);
        const toNode = nodes.find((node) => node.id === edge.to);
        if (fromNode && toNode) {
            exec(fromNode.segments[0], fromNode.xPos);
            exec(toNode.segments[1], fromNode.xPos);
            exec(toNode.segments[5], fromNode.xPos, true);
            if (fromNode.xPos - toNode.xPos > 1) {
                exec(toNode.segments[3], fromNode.xPos);
                exec(toNode.segments[4], fromNode.xPos);
                for (let i = toNode.xPos + 1; i < fromNode.xPos - 1; i++) {
                    const node = nodes.find(
                        (n) => n.yPos === toNode.yPos && n.xPos === i,
                    );
                    if (node) {
                        exec(node.segments[4], fromNode.xPos);
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
                            exec(node.segments[3], fromNode.xPos);
                        } else if (i === toNode.yPos) {
                            exec(node.segments[2], fromNode.xPos);
                            if (fromNode.xPos - toNode.xPos > 1) {
                                exec(node.segments[3], fromNode.xPos);
                            }
                        } else {
                            exec(node.segments[2], fromNode.xPos);
                            exec(node.segments[3], fromNode.xPos);
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
                            exec(node.segments[2], fromNode.xPos);
                        } else if (i === toNode.yPos) {
                            exec(node.segments[3], fromNode.xPos);
                            if (fromNode.xPos - toNode.xPos > 1) {
                                exec(node.segments[2], fromNode.xPos);
                            }
                        } else {
                            exec(node.segments[2], fromNode.xPos);
                            exec(node.segments[3], fromNode.xPos);
                        }
                    }
                }
            } else {
                if (fromNode.xPos - toNode.xPos > 1) {
                    exec(toNode.segments[3], fromNode.xPos);
                    const node = nodes.find(
                        (n) =>
                            n.xPos + 1 === fromNode.xPos &&
                            n.yPos === fromNode.yPos,
                    );
                    if (node) {
                        exec(node.segments[3], fromNode.xPos);
                    }
                }
            }
        }
    }
}

export const getSegmentValues = [
    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x - graphStyle.ELEMENT_WIDTH / 2 - graphStyle.COL_DISTANCE / 4,
            y,
            graphStyle.COL_DISTANCE / 2,
            graphStyle.SEGMENT_THICKNESS,
        ];
    },

    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x +
                graphStyle.ELEMENT_WIDTH / 2 +
                graphStyle.COL_DISTANCE / 4 +
                (graphStyle.SEGMENT_THICKNESS * 3) / 2,
            y,
            graphStyle.COL_DISTANCE / 2 - graphStyle.SEGMENT_THICKNESS * 3,
            graphStyle.SEGMENT_THICKNESS,
        ];
    },

    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x + graphStyle.ELEMENT_WIDTH / 2 + graphStyle.COL_DISTANCE / 2,
            y +
                (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2) /
                    2,
            graphStyle.SEGMENT_THICKNESS,
            graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2,
        ];
    },
    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x + graphStyle.ELEMENT_WIDTH / 2 + graphStyle.COL_DISTANCE / 2,
            y -
                (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2) /
                    2,
            graphStyle.SEGMENT_THICKNESS,
            graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2,
        ];
    },
    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x + graphStyle.ELEMENT_WIDTH + graphStyle.COL_DISTANCE,
            y - (graphStyle.ELEMENT_HEIGHT / 2 + graphStyle.COL_DISTANCE / 2),
            graphStyle.ELEMENT_WIDTH + graphStyle.COL_DISTANCE,
            graphStyle.SEGMENT_THICKNESS,
        ];
    },
    (x: number, y: number, graphStyle: GraphStyle): number[] => {
        return [
            x +
                graphStyle.ELEMENT_WIDTH / 2 +
                (graphStyle.SEGMENT_THICKNESS * 3) / 2,
            y,
            graphStyle.COL_DISTANCE / 2,
            graphStyle.SEGMENT_THICKNESS,
        ];
    },
];

export function getSegments(x: number, y: number, graphStyle: GraphStyle) {
    const getSegment = (
        values: number[],
        isLeftArrow?: boolean,
    ): CSS3DObject => {
        const segment = document.createElement('div');
        segment.className = isLeftArrow ? '' : 'edge';
        segment.style.width = isLeftArrow ? '0px' : values[2] + 'px';
        segment.style.height = isLeftArrow ? '0px' : values[3] + 'px';

        if (isLeftArrow) {
            segment.style.borderTop =
                graphStyle.SEGMENT_THICKNESS * 3 + 'px solid transparent';
            segment.style.borderBottom =
                graphStyle.SEGMENT_THICKNESS * 3 + 'px solid transparent';
            segment.style.borderRight =
                graphStyle.SEGMENT_THICKNESS * 3 +
                'px solid ' +
                graphStyle.SEGMENT_COLOR;
        }

        const segmentObject = new CSS3DObject(segment);
        segmentObject.position.x = values[0];
        segmentObject.position.y = values[1];

        return segmentObject;
    };

    const segments = [
        getSegment(getSegmentValues[0](x, y, graphStyle)),
        getSegment(getSegmentValues[1](x, y, graphStyle)),
        getSegment(getSegmentValues[2](x, y, graphStyle)),
        getSegment(getSegmentValues[3](x, y, graphStyle)),
        getSegment(getSegmentValues[4](x, y, graphStyle)),
        getSegment(getSegmentValues[5](x, y, graphStyle), true),
    ];

    return {
        segments,
        initialValues: segments.map((seg) => ({
            x: seg.position.x,
            y: seg.position.y,
            height: seg.element.style.height,
        })),
    };
}
