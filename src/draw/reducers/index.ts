declare var angular: any;

import * as _fabric from 'fabric';
let fabric = (_fabric as any).fabric as typeof _fabric;

import { Storage } from '@microsoft/office-js-helpers';
import { DrawModule } from '../module';
import { loadFile, saveFile, confirm } from '../core';
import { Tool } from '../models';
import { DrawToolsService } from '../tools';
import forEach = require('lodash/forEach');

export class DrawStateService {
    constructor(private $q: angular.IQService, private _tools: DrawToolsService) { }
    canvas: fabric.Canvas = null;
    tool: Tool;
    current: fabric.Object;
    private _cache = new Storage('draw_tool_cache');
    disableResize = false;

    init(canvas$: HTMLCanvasElement) {
        this.canvas = new fabric.Canvas(canvas$);
        if (this._cache.contains('lastSession')) {
            let data = this._cache.get('lastSession');
            this.canvas.loadFromJSON(data, () => { });
        }
    }

    async draw(tool: Tool, options?: fabric.IObjectOptions) {
        this.tool = tool;
        let shape;
        let drawTool = this._tools.getToolAction(tool.id) as any;
        if (tool.id === 'tool__download') {
            return this.download();
        }
        else if (tool.id === 'tool__rescale') {
            this.disableResize = false;
            let result = window.prompt('Enter width and height in wxh format');
            if (result == null) {
                return;
            }
            let [width, height] = result.toLowerCase().split('x');
            this.rescale(+width, +height);
            this.disableResize = true;
            return;
        }
        else if (tool.id === 'tool__image') {
            try {
                shape = await drawTool({ ...options, name: tool.id });
            }
            catch (e) {
                console.error(e);
                return;
            }
        }
        else if (tool.id === 'tool__svg') {
            try {
                shape = await drawTool({ ...options, name: tool.id });
                this.canvas.add(shape).renderAll();
                this.canvas.setActiveObject(shape);
                this.current = shape;
                this.saveState();
                return shape;
            }
            catch (e) {
                console.error(e);
                return;
            }
        }
        else {
            shape = drawTool({ ...options, name: tool.id });
        }
        this.canvas.add(shape);
        this.canvas.setActiveObject(shape);
        this.current = shape;
        this.saveState();
        this.canvas.renderAll();
        return shape;
    }

    update(props: any) {
        /*
         * BUG: Some controls grow/disappear when properties such as strokeWidth,
         * scale or radius etc are updated. Upon refreshing they are available.
         */
        this.current = this.canvas.getActiveObject();
        forEach(props as {}, (value: string, name) => {
            if (name === 'strokeDashArray' && value) {
                this.current.set(name, value.split(','));
                return;
            }
            this.current.set(name, value);
        });
        this.saveState();
        this.canvas.renderAll();
    }

    remove() {
        /*
         * BUG: Sometimes objects dont get removed
         */
        this.current.remove();
        this.saveState();
        this.canvas.renderAll();
    }

    bringToFront() {
        return this.current.bringToFront();
    }

    sendToBack() {
        return this.current.sendToBack();
    }

    rescale(width, height) {
        if (this.disableResize) {
            return;
        }
        this.canvas.setWidth(width - 373 /* container - tools - properties - borders */);
        this.canvas.setHeight(height - 1 /* borders */);
        this.canvas.renderAll();
    }

    loadFabricSVG() {
        let deferred = this.$q.defer();
        if (this.canvas) {
            let url = window.prompt('URL', 'Enter the editor svg url');
            if (/^https?/i.test(url)) {
                fabric.loadSVGFromURL(url, (objects, options) => {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    this.canvas.add(obj).renderAll();
                    deferred.resolve(true);
                    this.saveState()
                });
            }
            else {
                fabric.loadSVGFromString(url, (objects, options) => {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    this.canvas.add(obj).renderAll();
                    deferred.resolve(true);
                    this.saveState()
                });
            }
        }
        else {
            deferred.reject(false);
        }
        return deferred.promise;
    }

    async clear() {
        try {
            let result = await confirm('Are you sure you want to delete the current project?');
            if (result) {
                this._cache.clear();
                this.canvas.clear();
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    save() {
        let json = this.saveState();
        if (json == null) { return; }
        let blob = new Blob([JSON.stringify(json)], { type: 'application/json;charset=utf-8' });
        saveFile(blob, 'new_project.json');
    }

    async open() {
        await new Promise(async (resolve) => {
            let result = await loadFile();
            if (result == null) { return; }
            this.canvas.loadFromJSON(result, e => {
                this.canvas.renderAll();
                resolve(e);
            });
        });;
    }

    download() {
        if (this.canvas == null) { return; }
        let source = this.canvas.toSVG(null);
        let blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        saveFile(blob, 'new_project.svg');
    }

    saveState() {
        let json = this.canvas.toDatalessJSON();
        return this._cache.insert('lastSession', json);
    }
}
