import * as angular from 'angular';
import { DrawModule } from '../module';
import { Tool } from '../models';
import { DrawToolsService } from '../tools';
import { forEach } from 'lodash';

export class DrawStateService {
    constructor(private $q: angular.IQService, private _tools: DrawToolsService) { }
    canvas: fabric.ICanvas = null;
    tool: Tool;
    current: fabric.IObject;

    init(canvas$: HTMLCanvasElement) {
        this.canvas = new fabric.Canvas(canvas$);
    }

    async add(tool: Tool, options?: fabric.IObjectOptions) {
        this.tool = tool;
        let shape;
        if (tool.id !== 'tool__image') {
            let drawTool = this._tools.getToolAction(tool.id);
            shape = drawTool({ ...options, name: tool.id });
        }
        else {
            let url = window.prompt('URL', 'Enter the image url');
            let deferred = this.$q.defer();
            fabric.Image.fromURL(url, (image) => {
                image.scale(0.5);
                deferred.resolve(image);
            });
            shape = await deferred.promise;
        }
        this.canvas.add(shape);
        this.canvas.setActiveObject(shape);
        this.current = shape;
        return shape;
    }

    update(props: any, tool: string) {
        this.current = this.canvas.getActiveObject();
        forEach(props, (value, name) => {
            console.log(`updating ${name}:${value}`);
            this.current.set(name, value);
        });
        this.current.set(name, tool);
    }

    remove() {
        this.current.remove();
    }

    rescale(width, height) {
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
    }

    load() {
        let deferred = this.$q.defer();
        if (this.canvas) {
            let url = window.prompt('URL', 'Enter the editor svg url');
            if (/^https?/i.test(url)) {
                fabric.loadSVGFromURL(url, (objects, options) => {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    this.canvas.add(obj).renderAll();
                    deferred.resolve(true);
                });
            }
            else {
                fabric.loadSVGFromString(url, (objects, options) => {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    this.canvas.add(obj).renderAll();
                    deferred.resolve(true);
                });
            }
        }
        else {
            deferred.reject(false);
        }
        return deferred.promise;
    }

    save() {
        if (this.canvas) {
            let source = this.canvas.toSVG(null);
            let blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
            let svgUrl = URL.createObjectURL(blob);
            let downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = 'newesttree.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
}
