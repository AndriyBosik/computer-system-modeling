import React, {useState, useRef, useEffect} from "react";
import "./Task.css";
import { clearCanvas, doesIntersectsCircleAndLine, drawTask } from "../../handler/canvas.drawer";
import { RADIUS } from "../../metadata/const";
import M from "materialize-css";
import { generate } from "../../handler/generator";
import { generateTask } from "../../handler/generator.ui";

const Task = ({onCheck, onChange, initialStatus, initialTasks = [], initialRelations = []}) => {
    const [addTask, setAddTask] = useState(false);
    const [addRelation, setAddRelation] = useState(false);
    const [remove, setRemove] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [weight, setWeight] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [relations, setRelations] = useState([]);
    const [graphChanged, setGraphChanged] = useState(false);
    const [status, setStatus] = useState({value: "none"});
    const [history, setHistory] = useState([]);
    const [generationParams, setGenerationParams] = useState({
        minTaskWeight: 1,
        maxTaskWeight: 10,
        minRelationWeight: null,
        maxRelationWeight: null,
        tasksCount: 1,
        connectivity: 0.5,
        error: null
    });
    const canvasRef = useRef(0);
    const modalRef = useRef(0);

    useEffect(() => {
        drawTask(canvasRef.current, {tasks: initialTasks, relations: initialRelations});
        if (initialTasks.length == 0 && initialRelations.length == 0) {
            setHistory([]);
            return;
        }
        setHistory(previous => [
            ...previous,
            JSON.stringify({
                tasks: initialTasks,
                relations: initialRelations
            })
        ]);
    }, [canvasRef, initialTasks, initialRelations]);

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    useEffect(() => {
        if (history.length == 0) {
            setTasks([]);
            setRelations([]);
            return;
        }

        const value = JSON.parse(history[history.length - 1]);
        setTasks(value.tasks);
        setRelations(value.relations);
    }, [history]);

    useEffect(() => {
        setGraphChanged(true);
        clearCanvas(canvasRef.current);
        drawTask(canvasRef.current, {tasks, relations});
        onChange();
    }, [tasks, relations]);

    const handleAddTaskClick = event => {
        event.preventDefault();
        setAddRelation(false);
        setRemove(false);
        setAddTask(true);
    }

    const handleAddRelationClick = event => {
        event.preventDefault();
        setAddTask(false);
        setRemove(false);
        setAddRelation(true);
    }

    const handleCancel = event => {
        event.preventDefault();
        setAddTask(false);
        setAddRelation(false);
        setRemove(false);
        setSelectedTask(null);
    }

    const handleRemove = event => {
        event.preventDefault();
        setAddTask(false);
        setAddRelation(false);
        setRemove(true);
    }

    const handleClear = event => {
        event.preventDefault();
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setAddTask(false);
        setAddRelation(false);
        setRemove(false);
        setHistory([]);
        setStatus({value: "none"});
    }

    const findIntersected = (x, y) => {
        for (const task of tasks) {
            const squareDistance = (x - task.x)*(x - task.x) + (y - task.y)*(y - task.y);
            if (squareDistance < Math.pow(2*RADIUS + 5, 2)) {
                return task;
            }
        }
        return null;
    }

    const findTask = (x, y) => {
        for (const task of tasks) {
            const squareDistance = (x - task.x)*(x - task.x) + (y - task.y)*(y - task.y);
            if (squareDistance < RADIUS*RADIUS) {
                return task;
            }
        }
        return null;
    }

    const findLastRelation = (x, y) => {
        const taskMap = {};
        for (const task of tasks) {
            taskMap[task.id] = task;
        }
        for (let i = relations.length - 1; i >= 0; i--) {
            const relation = relations[i];
            const t1 = taskMap[relation.id1];
            const t2 = taskMap[relation.id2];
            if (doesIntersectsCircleAndLine(t1.x, t1.y, t2.x, t2.y, x, y, 5)) {
                if (x >= Math.min(t1.x, t2.x) - 10 && x <= Math.max(t1.x, t2.x) + 10 && y >= Math.min(t1.y, t2.y) - 10 && y <= Math.max(t1.y, t2.y) + 10) {
                    return relation;
                }
            }
        }
        return null;
    }

    const findExistingRelation = (from, to) => {
        for (const relation of relations) {
            if (relation.id1 == from && relation.id2 == to) {
                return relation;
            }
        }
        return null;
    }

    const handleCanvasClick = event => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (addTask) {
            const intersected = findIntersected(x, y);
            if (intersected != null) {
                setStatus({
                    value: "error",
                    message: "Intersects with: " + intersected.id
                });
                return;
            }
            const task = createTask(x, y);

            setHistory(previous => [
                ...previous,
                JSON.stringify({
                    tasks: [...tasks, task],
                    relations
                })
            ]);
        } else if (addRelation) {
            const task = findTask(x, y);
            if (task == null) {
                setStatus({
                    value: "error",
                    message: "Task not found"
                });
                return;
            }
            if (selectedTask == null) {
                setSelectedTask(task);
                return;
            }
            if (task.id == selectedTask.id) {
                setStatus({
                    value: "error",
                    message: "Task cannot be connected to itself"
                });
                setSelectedTask(null);
                return;
            }
            const existingRelation = findExistingRelation(selectedTask.id, task.id);
            if (existingRelation != null) {
                setStatus({
                    value: "error",
                    message: "Relation already exists"
                });
                setSelectedTask(null);
                return;
            }
            const relation = {
                id1: selectedTask.id,
                id2: task.id,
                weight: weight*1
            };

            setHistory(previous => [
                ...previous,
                JSON.stringify({
                    tasks,
                    relations: [...relations, relation]
                })
            ]);

            setSelectedTask(null);
        } else if (remove) {
            const task = findTask(x, y);
            if (task != null) {
                const newTasks = tasks.filter(t => t.id != task.id).map(t => {
                    if (t.id > task.id) {
                        t.id--;
                    }
                    return t;
                });
                const newRelations = relations.filter(r => r.id1 != task.id && r.id2 != task.id).map(r => {
                    if (r.id1 > task.id) {
                        r.id1--;
                    }
                    if (r.id2 > task.id) {
                        r.id2--;
                    }
                    return r;
                });
                setHistory(previous => [
                    ...previous,
                    JSON.stringify({
                        tasks: newTasks,
                        relations: newRelations
                    })
                ]);
                return;
            }
            const relation = findLastRelation(x, y);
            if (relation == null) {
                return;
            }
            const newRelations = relations.filter(r => r.id1 != relation.id1 || r.id2 != relation.id2);
            setHistory(previous => [
                ...previous,
                JSON.stringify({
                    tasks,
                    relations: newRelations
                })
            ]);
        }
    }

    const createTask = (x, y) => {
        return {
            x: x,
            y: y,
            id: tasks.length + 1,
            weight: weight * 1
        }
    }

    const handleCheck = event => {
        event.preventDefault();
        setGraphChanged(false);
        onCheck(tasks, relations)
    }

    const handleBack = event => {
        event.preventDefault();
        if (history.length == 0) {
            return;
        }
        const newHistory = [];
        for (let i = 0; i < history.length - 1; i++) {
            newHistory.push(history[i]);
        }
        setHistory(newHistory);
    }

    const getConnectivity = () => {
        if (tasks.length == 0 && relations.length == 0) {
            return null;
        }
        const totalTasksWeight = tasks.map(task => task.weight*1).reduce((a, b) => a + b, 0);
        const totalRelationsWeight = relations.map(relations => relations.weight*1).reduce((a, b) => a + b, 0);
        return (totalTasksWeight / (totalTasksWeight + totalRelationsWeight)).toFixed(2);
    }

    const startGeneration = event => {
        event.preventDefault();
        let error = null;
        const minTaskWeightPresent = generationParams.minTaskWeight > 0;
        const maxTaskWeightPresent = generationParams.minTaskWeight > 0;
        const minRelationWeightPresent = generationParams.minRelationWeight > 0;
        const maxRelationWeightPresent = generationParams.maxRelationWeight > 0;
        const tasksCountPresent = generationParams.tasksCount > 0;
        const connectivityPresent = generationParams.connectivity > 0;
        if (!minTaskWeightPresent || !maxTaskWeightPresent || !tasksCountPresent || !connectivityPresent) {
            error = "All the required parameters(Min task W, Max task W, Tasks count, Connectivity) must be set";
        } else if (generationParams.minTaskWeight > generationParams.maxTaskWeight) {
            error = "Min task W must be less or equal Max task W";
        } else if (generationParams.minTaskWeight != generationParams.maxTaskWeight && generationParams.tasksCount < 2) {
            error = "Cannot generate one task with specified task weight range [" + generationParams.minTaskWeight + "; " + generationParams.maxTaskWeight + "]";
        } else if (minRelationWeightPresent || maxRelationWeightPresent) {
            if (minRelationWeightPresent && maxRelationWeightPresent) {
                if (generationParams.minRelationWeight > generationParams.maxRelationWeight) {
                    error = "Min relation W must be less or equal Max relation W";
                } else if (generationParams.minRelationWeight != generationParams.maxRelationWeight && generationParams.tasksCount < 3) {
                    error = "Cannot generate task with relation weight range [" + generationParams.minRelationWeight + "; " + generationParams.maxRelationWeight + "] and tasks count - " + generationParams.tasksCount;
                }
            } else {
                if (generationParams.tasksCount < 2) {
                    error = "Cannot generate task with relation, but with tasks count: " + generationParams.tasksCount;
                }
            }
        }
        
        setGenerationParams(previous => ({
            ...previous,
            error
        }));

        if (error != null) {
            return;
        }

        const instance = M.Modal.getInstance(modalRef.current);
        instance.close();

        const graph = generate({
            count: generationParams.tasksCount,
            minVertexWeight: generationParams.minTaskWeight,
            maxVertexWeight: generationParams.maxTaskWeight,
            connectivity: generationParams.connectivity,
            minRibWeight: minRelationWeightPresent ? generationParams.minRelationWeight : null,
            maxRibWeight: maxRelationWeightPresent ? generationParams.maxRelationWeight : null
        });

        const {tasks, relations} = generateTask(canvasRef.current.width, canvasRef.current.height, graph.vertexes, graph.matrix);

        setHistory(previous => [
            ...previous,
            JSON.stringify({
                tasks,
                relations
            })
        ]);
    }

    return (
        <>
            <div className="Task s-vflex">
                <div className="actions s-hflex">
                    <div className="input-field" style={{margin: 0}}>
                        <input id="weight" type="number" style={{width: 150}} min="1" placeholder="Weight" value={weight} onChange={event => setWeight(event.target.value)} />
                        <label className="active" htmlFor="weight">Weight</label>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className={`btn blue tooltipped ${addTask ? "disabled" : ""}`} onClick={handleAddTaskClick} data-position="top" data-tooltip="Add Task">
                            <i className="material-icons">control_point</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className={`btn blue tooltipped ${addRelation ? "disabled" : ""}`} onClick={handleAddRelationClick} data-position="top" data-tooltip="Add Relation">
                            <i className="material-icons">settings_ethernet</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className="btn red tooltipped" onClick={handleCancel} data-position="top" data-tooltip="Cancel Action">
                            <i className="material-icons">cancel</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className={`btn red tooltipped ${remove ? "disabled" : ""}`} onClick={handleRemove} data-position="top" data-tooltip="Remove Task/Relation">
                            <i className="material-icons">delete_forever</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className="btn red tooltipped" onClick={handleClear} data-position="top" data-tooltip="Clear">
                            <i className="material-icons">clear_all</i>
                        </button>
                    </div>
                    <div style={{width: 100}} />
                    <div className="s-vflex-center">
                        <button type="button" className={`btn amber ${history.length > 0 ? "" : "disabled"}`} onClick={handleBack}>
                            <i className="material-icons">arrow_back</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <button type="button" className={`btn amber tooltipped ${graphChanged ? "" : "disabled"}`} onClick={handleCheck} data-position="top" data-tooltip="Check">
                            <i className="material-icons">check</i>
                        </button>
                    </div>
                    <div style={{width: 15}} />
                    <div className="s-vflex-center">
                        <a href="#generation-params" className="btn amber tooltipped modal-trigger" data-position="top" data-tooltip="Generate">
                            <i className="material-icons">bubble_chart</i>
                        </a>
                    </div>
                    {
                        selectedTask == null ? null : (
                            <>
                                <div style={{width: 100}} />
                                <div className="s-vflex-center" style={{fontSize: "20px"}}>
                                    Selected Task: {selectedTask.id}
                                </div>
                            </>
                        )
                    }
                </div>
                <div className="properties">
                    <ul className="collapsible">
                        <li>
                            <div className="collapsible-header s-hflex">
                                <span>Properties</span>
                                <span className="s-vflex-center"><i className="material-icons" style={{fontSize: "40px"}}>arrow_drop_down</i></span>
                            </div>
                            <div className="collapsible-body">
                                <table className="centered striped">
                                    <thead>
                                        <tr>
                                            <th>Property</th>
                                            <th>Value</th>
                                            <th>Property</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Minimum task weight</td>
                                            <td>{tasks.length == 0 ? "-" : Math.min(...tasks.map(task => task.weight))}</td>
                                            <td>Maximum task weight</td>
                                            <td>{tasks.length == 0 ? "-" : Math.max(...tasks.map(task => task.weight))}</td>
                                        </tr>
                                        <tr>
                                            <td>Minimum relation weight</td>
                                            <td>{relations.length == 0 ? "-" : Math.min(...relations.map(relation => relation.weight))}</td>
                                            <td>Maximum relation weight</td>
                                            <td>{relations.length == 0 ? "-" : Math.max(...relations.map(relation => relation.weight))}</td>
                                        </tr>
                                        <tr>
                                            <td>Tasks count</td>
                                            <td>{tasks.length}</td>
                                            <td>Connectivity</td>
                                            <td>{getConnectivity() || "-"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </li>
                    </ul>
                </div>
                <canvas ref={canvasRef} id="graph" width="1000" height="1000" onClick={handleCanvasClick} />
                {
                    status.value == "none" ? null : (
                        status.value == "error" ? (
                            <div className="error left-align">
                                <span className="red-text">Error!</span> {status.message}
                            </div>
                        ) : (
                            <div className="success left-align">
                                <span className="green-text">Success!</span> The task is correct!
                            </div>
                        )
                    )
                }
            </div>
            <div id="generation-params" className="modal" ref={modalRef}>
                {
                    generationParams.error == null ? null : (
                        <div className="model-header" style={{padding: "20px"}}>
                            <div className="error left-align equal-flex" style={{fontSize: "20px"}}>
                                <span className="red-text">Error!</span> {generationParams.error}
                            </div>
                        </div>
                    )
                }
                <div className="modal-content">
                    <div className="row">
                        <div className="input-field col s6">
                            <input id="min-task-w" type="number" min="1" placeholder="Min task W" value={generationParams.minTaskWeight} onChange={event => setGenerationParams(previous => ({...previous, minTaskWeight: event.target.value * 1}))} />
                            <label className="active" htmlFor="min-task-w">Min task W</label>
                        </div>
                        <div className="input-field col s6">
                            <input id="max-task-w" type="number" min="1" placeholder="Max task W" value={generationParams.maxTaskWeight} onChange={event => setGenerationParams(previous => ({...previous, maxTaskWeight: event.target.value * 1}))} />
                            <label className="active" htmlFor="max-task-w">Max task W</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-field col s6">
                            <input id="min-relation-w" type="number" min="0" placeholder="Min relation W" value={generationParams.minRelationWeight} onChange={event => setGenerationParams(previous => ({...previous, minRelationWeight: event.target.value * 1}))} />
                            <label className="active" htmlFor="min-relation-w">Min relation W</label>
                        </div>
                        <div className="input-field col s6">
                            <input id="max-relation-w" type="number" min="0" placeholder="Max relation W" value={generationParams.maxRelationWeight} onChange={event => setGenerationParams(previous => ({...previous, maxRelationWeight: event.target.value * 1}))} />
                            <label className="active" htmlFor="max-relation-w">Max relation W</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-field col s6">
                            <input id="tasks-count" type="number" min="1" placeholder="Tasks count" value={generationParams.tasksCount} onChange={event => setGenerationParams(previous => ({...previous, tasksCount: event.target.value * 1}))} />
                            <label className="active" htmlFor="tasks-count">Tasks count</label>
                        </div>
                        <div className="input-field col s6">
                            <input id="connectivity" type="number" min="0.01" step="0.01" placeholder="Connectivity" value={generationParams.connectivity} onChange={event => setGenerationParams(previous => ({...previous, connectivity: event.target.value * 1}))} />
                            <label className="active" htmlFor="connectivity">Connectivity</label>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="s-hflex-end">
                        <button type="button" className="btn" onClick={startGeneration}>
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Task;
