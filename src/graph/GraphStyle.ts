export interface GraphStyle {
    ELEMENT_WIDTH: number;
    ELEMENT_HEIGHT: number;
    ELEMENT_BORDER_COLOR: string;
    COL_DISTANCE: number;
    SEGMENT_THICKNESS: number;
    SEGMENT_HIGHLIGHTED_COLOR: string;
    SEGMENT_NOT_HIGHLIGHTED_COLOR: string;
    SEGMENT_COLOR: string;
    ANIMATION_DURATION: number;
}

export const DefaultGraphStyle: GraphStyle = {
    ELEMENT_WIDTH: 600,
    ELEMENT_HEIGHT: 160,
    ELEMENT_BORDER_COLOR: 'rgba(127, 255, 255, 0.25)',
    COL_DISTANCE: 125,
    SEGMENT_THICKNESS: 10,
    SEGMENT_HIGHLIGHTED_COLOR: '#ffae00',
    SEGMENT_NOT_HIGHLIGHTED_COLOR: '#6d6d6d',
    SEGMENT_COLOR: '#ffffff',
    ANIMATION_DURATION: 1000,
};
