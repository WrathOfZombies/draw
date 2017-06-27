import * as _fabric from 'fabric';
import { Tool, Color } from '../models';
let fabric = (_fabric as any).fabric as typeof _fabric;

const lineDefaults: fabric.ILineOptions = {
    x1: 50,
    y1: 0,
    x2: 50,
    y2: 300,
    stroke: new Color('#000000').hex,
    strokeWidth: 2,
    fill: new Color('#000000').hex,
};

export const LINE_PROPS = [
    'x1',
    'y1',
    'x2',
    'y2',
];

export const Line: Tool = {
    id: 'tool__line',
    name: 'Draw Line',
    icon: 'CalculatorSubtract'
};

export const drawLine = (options?: fabric.ILineOptions): fabric.Line => {
    return new fabric.Line([lineDefaults.x1, lineDefaults.y1, lineDefaults.x2, lineDefaults.y2], {
        ...lineDefaults as any,
        ...options
    });
};
