declare var angular: any;

import * as $ from 'jquery';
import { DrawModule } from './module';
import { DrawError } from './core';
import { DrawStateService } from './reducers';
import { DrawToolsService, Tool } from './tools';
import debounce = require('lodash/debounce');
import './styles/draw.scss';

export class DrawController {
    tools: Tool[];
    width: number;
    height: number;
    properties: any;

    constructor(
        private _scope: angular.IScope,
        private _tools: DrawToolsService,
        public state: DrawStateService
    ) {
        this.tools = [...this._tools.defaultTools, {
            icon: 'Download',
            id: 'tool__download',
            name: 'Export to SVG'
        }, {
            icon: 'FullScreen',
            id: 'tool__rescale',
            name: 'Resize'
        }];
    }

    subscribeToEvents() {
        const _update = () => {
            let obj = this.state.canvas.getActiveObject();
            if (obj == null) {
                obj = this.state.canvas.getActiveGroup();
            }
            if (obj == null) {
                return null;
            }
            let {name, type} = obj;
            return this._tools.getProperties(obj, name || `tool__${type}`);
        }

        this.state.canvas.on('object:selected', () => this._scope.$applyAsync(() => {
            this.properties = _update();
            /*
             * BUG: Apply doesn't trigger change detection.
             * `properties` is initializated but doesnt show up on the UI
             */
        }));

        this.state.canvas.on('object:modified', () => this._scope.$applyAsync(() => {
            this.state.saveState();
            this.properties = _update();
        }));

        this.state.canvas.on('selection:cleared', () => this._scope.$applyAsync(() => {
            this.properties = null;
            _update();
        }));
    }

    rescale(container: JQuery, width: number, height: number) {
        this.width = width;
        this.height = height;
        container.width(width - 12 /* borders */);
        container.height(height - 11 /* borders */);
        this.state.rescale(width, height);
    };

    async draw(tool: Tool) {
        await this.state.draw(tool);
        if (this.state.current) {
            this.properties = this._tools.getProperties(this.state.current, tool.id);
        }
    }
}

