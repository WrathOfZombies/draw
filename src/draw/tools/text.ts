import * as _fabric from 'fabric';
import { Tool, Color } from '../models';
let fabric = (_fabric as any).fabric as typeof _fabric;

const textDefaults: fabric.IITextOptions = {
    fontFamily: 'Segoe UI',
    fontSize: 32
};

export const TEXT_PROPS = [
    'fontSize',
    'fontWeight',
    'fontFamily',
    'textDecoration',
    'textAlign',
    'fontStyle',
    'lineHeight',
    'shadow',
    'textBackgroundColor',
    'text'
];

export const Text: Tool = {
    id: 'tool__text',
    name: 'Draw Text',
    icon: 'InsertTextBox'
};

export const drawText = (options?: fabric.ITextOptions): fabric.Text => {
    return new fabric.Text('Text', {
        ...textDefaults as any,
        ...options
    });
};
