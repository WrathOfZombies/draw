import { Tool, Color } from '../models';

const triangleDefaults: fabric.ITriangleOptions = {
    width: 30,
    height: 15,
    borderColor: 'transparent',
    fill: new Color('#FF4444').hex
};

export const Triangle: Tool = {
    id: 'tool__triangle',
    name: 'Draw Triangle',
    icon: 'TriangleUp12'
};

export const drawTriangle = (options: fabric.ITriangleOptions): fabric.ITriangle => {
    return new fabric.Triangle({
        ...triangleDefaults,
        ...options
    });
};
