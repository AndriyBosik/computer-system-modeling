import './App.css';
import Task from './component/task/Task';
import "./shared/css/common.css";
import "./shared/css/indentations.css";
import "./shared/css/materialize.min.css";
import "./shared/css/materialize-extensions.css";
import M from "materialize-css";
import System from './component/system/System';
import Actions from './component/actions/Actions';
import { useEffect, useState } from 'react';
import { checkCycle, checkConnected, buildPaths, buildTaskMatrix } from './handler/graph';
import { Help } from './component/help/Help';
import { QueueList } from './component/queue-list/QueueList';
import { Diagram } from './component/diagram/Diagram';

const test = arr => {
    if (arr.length == 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < arr[0].length; i++) {
        const values = test(arr.slice(1));
        if (values.length == 0) {
            result.push([arr[0][i]]);
        } else {
            for (let value of values) {
                result.push([arr[0][i], ...value]);
            }
        }
    }
    return result;
}

function App() {
    useEffect(() => {
        const tabs = document.querySelectorAll(".tabs");
        M.Tabs.init(tabs, {});

        const tooltips = document.querySelectorAll(".tooltipped");
        M.Tooltip.init(tooltips, {});

        const collapsibles = document.querySelectorAll(".collapsible");
        M.Collapsible.init(collapsibles, {});

        const modals = document.querySelectorAll(".modal");
        M.Modal.init(modals, {});

        const selects = document.querySelectorAll("select");
        M.FormSelect.init(selects, {});
    }, []);
    
    const [taskChecked, setTaskChecked] = useState(false);
    const [systemChecked, setSystemChecked] = useState(false);
    const [components, setComponents] = useState({task: {tasks: [], relations: []}, system: {processes: [], relations: []}});
    const [initialComponents, setInitialComponents] = useState({task: {tasks: [], relations: []}, system: {processes: [], relations: []}});
    const [taskStatus, setTaskStatus] = useState({value: "none"});
    const [systemStatus, setSystemStatus] = useState({value: "none"});
    const [diagramState, setDiagramState] = useState({systemMatrix: [], taskMatrix: [], systemPaths: [], taskQueue: []});

    const onTaskChanged = () => {
        setTaskChecked(false);
    }

    const onSystemChanged = () => {
        setSystemChecked(false);
    }

    const checkTask = (tasks, relations) => {
        setComponents(previous => ({
            ...previous,
            task: {
                tasks,
                relations
            }
        }));
        const message = checkCycle(tasks, relations);
        setTaskStatus({
            value: message == null ? "success" : "error",
            message
        });
        setTaskChecked(message == null);
    }

    const checkSystem = (processes, relations) => {
        setComponents(previous => ({
            ...previous,
            system: {
                processes,
                relations
            }
        }));
        const message = checkConnected(processes, relations);
        if (message == null) {
            const [matrix, paths] = buildPaths(processes, relations);
            setDiagramState(previous => ({
                ...previous,
                systemMatrix: matrix,
                systemPaths: paths
            }));
        }
        setSystemStatus({
            value: message == null ? "success" : "error",
            message
        });
        setSystemChecked(message == null);
    }

    const initComponents = (task, system) => {
        setInitialComponents({
            task,
            system
        });
    }

    const onModelQueue = queue => {
        M.Tabs.getInstance(document.getElementById("nav-tabs")).select("diagram");
        setDiagramState(previous => ({
            ...previous,
            taskQueue: queue,
            taskMatrix: buildTaskMatrix(components.task)
        }));
    };

    return (
        <div className="App" style={{padding: 20}}>
            <div className="s-hflex">
                <div className="s-vflex-center" style={{borderRight: "1px solid black", paddingRight: 20}}>
                    <Actions valid={systemChecked && taskChecked} task={components.task} system={components.system} onLoad={initComponents} />
                </div>
                <div className="s-vflex full-width">
                    <div className="full-width">
                        <ul id="nav-tabs" className="tabs" style={{marginBottom: 20}}>
                            <li className="tab col s3"><a className="active" href="#task">Task</a></li>
                            <li className="tab col s3"><a href="#system">System</a></li>
                            <li className="tab col s3"><a href="#queue">Queue</a></li>
                            <li className="tab col s3"><a href="#diagram">Diagram</a></li>
                            <li className="tab col s3"><a href="#statistics">Statistics</a></li>
                            <li className="tab col s3"><a href="#help">Help</a></li>
                        </ul>
                    </div>
                    <div id="task" className="nav-tab">
                        <Task onCheck={checkTask} onChange={onTaskChanged} initialStatus={taskStatus} initialTasks={initialComponents.task.tasks} initialRelations={initialComponents.task.relations} />
                    </div>
                    <div id="system" className="nav-tab">
                        <System onCheck={checkSystem} onChange={onSystemChanged} initialStatus={systemStatus} initialProcesses={initialComponents.system.processes} initialRelations={initialComponents.system.relations} />
                    </div>
                    <div id="queue" className="nav-tab">
                        <QueueList onModelQueue={onModelQueue} modelable={systemChecked} task={taskChecked ? components.task : {tasks: [], relations: []}} />
                    </div>
                    <div id="diagram" className="nav-tab">
                        {
                            (taskChecked && systemChecked && diagramState.taskQueue.length > 0) ? (
                                <Diagram systemMatrix={diagramState.systemMatrix} taskMatrix={diagramState.taskMatrix} paths={diagramState.systemPaths} queue={diagramState.taskQueue} />
                            ) : (
                                <div style={{fontSize: "25px"}}>
                                    To see diagram, you should ensure that the following conditions are met:
                                    <ol style={{textAlign: "left"}}>
                                        <li>Task on the "TASK" tab is checked</li>
                                        <li>System on the "SYSTEM" tab is checked</li>
                                        <li>Queue on the "QUEUE" tab is selected</li>
                                    </ol>
                                </div>
                            )
                        }
                    </div>
                    <div id="statistics" className="nav-tab">
                        Statistics
                    </div>
                    <div id="help" className="nav-tab">
                        <Help />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
