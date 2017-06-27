declare var angular: any;
import debounce = require('lodash/debounce');
import { DrawStateService } from './reducers';
import { DrawToolsService } from './tools';
import { DrawController } from './editor';

export const DrawModule = angular.module('Draw', []);

DrawModule.factory('DrawToolsService', () => {
    let toolsService = new DrawToolsService();
    return toolsService;
});

DrawModule.factory('DrawStateService', [
    '$q',
    'DrawToolsService',
    ($q, toolsService: DrawToolsService) => {
        let service = new DrawStateService($q, toolsService);
        return service;
    }]
);

DrawModule.directive('draw', [
    'DrawStateService',
    'DrawToolsService',
    (state: DrawStateService, tools: DrawToolsService) => {
        return <angular.IDirective>{
            restrict: 'EA',
            bindToController: true,
            scope: {
                'save': '&onSave',
                'events': '&onEvents'
            },
            template: `
                <canvas class="draw__canvas"></canvas>
                <section class="draw__toolbox">
                    <artice class="draw__tool"
                        ng-repeat="tool in Draw.tools track by $index"
                        ng-class="{'draw__tool--selected':tool.id===Draw.state.tool.id}"
                        ng-click="Draw.draw(tool)"
                        id="{{tool.id}}" title="{{tool.name}}">

                        <i class="ms-Icon ms-Icon--{{tool.icon}}"></i>
                    </artice>
                </section>
                <section class="draw__properties" ng-if="!Draw.state.current">
                    <h3 class="ms-font-l">Project Actions</h3>
                    <section class="actions">
                        <button class="draw__tool" ng-click="Draw.state.save()">
                            <i class="ms-Icon ms-Icon--Save"></i>
                        </button>
                        <button class="draw__tool" ng-click="Draw.state.open()">
                            <i class="ms-Icon ms-Icon--OpenFile"></i>
                        </button>
                        <button class="draw__tool" ng-click="Draw.state.clear()">
                            <i class="ms-Icon ms-Icon--Delete"></i>
                        </button>
                    </section>
                    <p>Draw or choose a shape to display its properties</p>
                </section>
                <section class="draw__properties" ng-if="Draw.state.current">
                    <h3 class="ms-font-l">Tool Actions</h3>
                    <section class="actions">
                        <button class="draw__tool" ng-click="Draw.state.update(Draw.properties)">
                            <i class="ms-Icon ms-Icon--Save"></i>
                        </button>
                        <button class="draw__tool" ng-click="Draw.state.remove()">
                            <i class="ms-Icon ms-Icon--Delete"></i>
                        </button>
                        <button class="draw__tool" title="Bring to Top" ng-click="Draw.state.bringToFront()">
                            <i class="ms-Icon ms-Icon--GroupedAscending"></i>
                        </button>
                        <button class="draw__tool" title="Send to Back" ng-click="Draw.state.sendToBack()">
                            <i class="ms-Icon ms-Icon--GroupedDescending"></i>
                        </button>
                    </section>
                    <section class="scroll-container">
                        <div class="ms-TextField" ng-repeat="(key, value) in (Draw.properties) track by $index">
                            <label class="ms-Label">{{key}}</label>
                            <input class="ms-TextField-field" type="text" ng-model="Draw.properties[key]" placeholder="{{key}}" >
                        </div>
                    </section>
                </section>
            `,
            controller: ['$scope', 'DrawToolsService', 'DrawStateService', DrawController],
            controllerAs: 'Draw',
            link: (scope: any, element, attrs) => {
                const resize = ((scope: any, element: JQuery) => {
                    let width = element.parent().width();
                    let height = element.parent().height();
                    (scope.Draw as DrawController).rescale(element, width, height);
                });

                element.addClass('draw__container');
                let canvas$ = element.children('.draw__canvas')[0] as HTMLCanvasElement;
                state.init(canvas$);
                resize(scope, element);
                (scope.Draw as DrawController).subscribeToEvents();
                let debounceResize = debounce(() => resize(scope, element), 250);
                window.addEventListener('resize', debounceResize);

                scope.$on('$destroy', () => window.removeEventListener('resize'));
            }
        };
    }
]);
