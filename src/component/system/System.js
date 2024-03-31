import React, {useState, useRef, useEffect} from "react";
import "./System.css";
import { clearCanvas, doesIntersectsCircleAndLine, drawArrow, drawSystem, findIntersectionBetweenCircleAndLine, findIntersectionBetweenRectAndLine } from "../../handler/canvas.drawer";
import { MESSAGE_PROCESS_COLOR, PACKET_PROCESS_COLOR, RADIUS } from "../../metadata/const";

const System = ({onCheck, onChange, initialStatus, initialProcesses = [], initialRelations = []}) => {
    const [addProcess, setAddProcess] = useState(false);
    const [addRelation, setAddRelation] = useState(false);
    const [remove, setRemove] = useState(false);
    const [processes, setProcesses] = useState([]);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [relations, setRelations] = useState([]);
    const [graphChanged, setGraphChanged] = useState(false);
    const [type, setType] = useState("message");
    const [packetsSize, setPacketsSize] = useState(1);
    const [status, setStatus] = useState({value: "none"});
    const [history, setHistory] = useState([]);
    const canvasRef = useRef(0);

    useEffect(() => {
        drawSystem(canvasRef.current, {processes: initialProcesses, relations: initialRelations});
        if (initialProcesses.length == 0 && initialRelations.length == 0) {
            setHistory([]);
            return;
        }
        setHistory(previous => [
            ...previous,
            JSON.stringify({
                processes: initialProcesses,
                relations: initialRelations
            })
        ]);
    }, [canvasRef, initialProcesses, initialRelations]);

    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    useEffect(() => {
        if (history.length == 0) {
            setProcesses([]);
            setRelations([]);
            return;
        }

        const value = JSON.parse(history[history.length - 1]);
        setProcesses(value.processes);
        setRelations(value.relations);
    }, [history]);

    useEffect(() => {
        setGraphChanged(true);
        clearCanvas(canvasRef.current);
        drawSystem(canvasRef.current, {processes, relations});
        onChange();
    }, [processes, relations]);

    const handleAddProcessClick = event => {
        event.preventDefault();
        setAddRelation(false);
        setRemove(false);
        setAddProcess(true);
    }

    const handleAddRelationClick = event => {
        event.preventDefault();
        setAddProcess(false);
        setRemove(false);
        setAddRelation(true);
    }

    const handleCancel = event => {
        event.preventDefault();
        setAddProcess(false);
        setAddRelation(false);
        setRemove(false);
        setSelectedProcess(null);
    }

    const handleRemove = event => {
        event.preventDefault();
        setAddProcess(false);
        setAddRelation(false);
        setRemove(true);
    }

    const handleClear = event => {
        event.preventDefault();
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, 1000, 500);
        setAddProcess(false);
        setAddRelation(false);
        setRemove(false);
        setHistory([]);
        setStatus({value: "none"});
    }

    const findIntersected = (x, y) => {
        for (const process of processes) {
            const squareDistance = (x - process.x)*(x - process.x) + (y - process.y)*(y - process.y);
            if (squareDistance < Math.pow(2*RADIUS + 25, 2)) {
                return process;
            }
        }
        return null;
    }

    const findProcess = (x, y) => {
        for (const process of processes) {
            const squareDistance = (x - process.x)*(x - process.x) + (y - process.y)*(y - process.y);
            if (squareDistance < RADIUS*RADIUS) {
                return process;
            }
        }
        return null;
    }

    const findLastRelation = (x, y) => {
        const processMap = {};
        for (const process of processes) {
            processMap[process.id] = process;
        }
        for (let i = relations.length - 1; i >= 0; i--) {
            const relation = relations[i];
            const t1 = processMap[relation.id1];
            const t2 = processMap[relation.id2];
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
        if (addProcess) {
            const intersected = findIntersected(x, y);
            if (intersected != null) {
                setStatus({
                    value: "error",
                    message: "Intersects with: " + intersected.id
                });
                return;
            }
            const process = createProcess(x, y);
            
            setHistory(previous => [
                ...previous,
                JSON.stringify({
                    processes: [...processes, process],
                    relations
                })
            ]);
        } else if (addRelation) {
            const process = findProcess(x, y);
            if (process == null) {
                setStatus({
                    value: "error",
                    message: "Process not found"
                });
                return;
            }
            if (selectedProcess == null) {
                setSelectedProcess(process);
                return;
            }
            if (process.id == selectedProcess.id) {
                setStatus({
                    value: "error",
                    message: "Process cannot be connected to itself"
                });
                setSelectedProcess(null);
                return;
            }
            const existingRelation = findExistingRelation(selectedProcess.id, process.id);
            if (existingRelation != null) {
                setStatus({
                    value: "error",
                    message: "Relation already exists"
                });
                setSelectedProcess(null);
                return;
            }
            const relation = {
                id1: selectedProcess.id,
                id2: process.id
            };

            setHistory(previous => [
                ...previous,
                JSON.stringify({
                    processes,
                    relations: [...relations, relation]
                })
            ]);

            setSelectedProcess(null);
        } else if (remove) {
            const process = findProcess(x, y);
            if (process != null) {
                const newProcesses = processes.filter(p => p.id != process.id).map(p => {
                    if (p.id > process.id) {
                        p.id--;
                    }
                    return p;
                });
                const newRelations = relations.filter(r => r.id1 != process.id && r.id2 != process.id).map(r => {
                    if (r.id1 > process.id) {
                        r.id1--;
                    }
                    if (r.id2 > process.id) {
                        r.id2--;
                    }
                    return r;
                });
                setHistory(previous => [
                    ...previous,
                    JSON.stringify({
                        processes: newProcesses,
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
                    processes,
                    relations: newRelations
                })
            ]);
        }
    }

    const createProcess = (x, y) => {
        return {
            x: x,
            y: y,
            id: processes.length + 1,
            type: type,
            packetsSize: type == "message" ? null : packetsSize
        }
    }

    const handleCheck = event => {
        event.preventDefault();
        setGraphChanged(false);
        onCheck(processes, relations)
    }

    const handleBack = event =>{
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

    return (
        <div className="System s-vflex">
            <div className="actions s-hflex">
                <div className="s-vflex-center">
                    <button type="button" className={`btn blue tooltipped ${addProcess ? "disabled" : ""}`} onClick={handleAddProcessClick} data-position="top" data-tooltip="Add Process">
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
                    <button type="button" className="btn red tooltipped" onClick={handleCancel} data-position="top" data-tooltip="Cancel">
                        <i className="material-icons">cancel</i>
                    </button>
                </div>
                <div style={{width: 15}} />
                <div className="s-vflex-center">
                    <button type="button" className={`btn red tooltipped ${remove ? "disabled" : ""}`} onClick={handleRemove} data-position="top" data-tooltip="Remove Process/Relation">
                        <i className="material-icons">delete_forever</i>
                    </button>
                </div>
                <div style={{width: 15}} />
                <div className="s-vflex-center">
                    <button type="button" className="btn red tooltipped" onClick={handleClear} data-position="top" data-tooltip="Clear All">
                        <i className="material-icons">clear_all</i>
                    </button>
                </div>
                <div style={{width: 100}} />
                <div className="s-vflex-center">
                    <button type="button" className={`btn amber tooltipped ${history.length > 0 ? "" : "disabled"}`} onClick={handleBack} data-position="top" data-tooltip="Back">
                        <i className="material-icons">arrow_back</i>
                    </button>
                </div>
                <div style={{width: 15}} />
                <div className="s-vflex-center">
                    <button type="button" className={`btn amber tooltipped ${graphChanged ? "" : "disabled"}`} onClick={handleCheck} data-position="top" data-tooltip="Check">
                        <i className="material-icons">check</i>
                    </button>
                </div>
                {
                    selectedProcess == null ? null : (
                        <>
                            <div style={{width: 100}} />
                            <div className="s-vflex-center" style={{fontSize: "20px"}}>
                                Selected Process: {selectedProcess.id}
                            </div>
                        </>
                    )
                }
            </div>
            <div style={{height: 30}} />
            <div className="s-hflex">
                <form action="#" className="s-hflex">
                    <p style={{textAlign: "left"}}>
                        <label>
                            <input className="with-gap" name="type" type="radio" value="message" onChange={_ => setType("message")} checked={type == "message"} />
                            <span>Message</span>
                        </label>
                    </p>
                    <div style={{width: 50}} />
                    <p style={{textAlign: "left"}}>
                        <label>
                            <input className="with-gap" name="type" type="radio" value="packet" onChange={_ => setType("packet")} checked={type == "packet"} />
                            <span>Packets</span>
                        </label>
                    </p>
                    {
                        type == "packet" ? (
                            <>
                                <div style={{width: 50}} />
                                <div className="input-field" style={{margin: 0}}>
                                    <input id="packets-size" type="number" style={{width: 150}} min="1" placeholder="Packets size" value={packetsSize} onChange={event => setPacketsSize(event.target.value)} />
                                    <label className="active" htmlFor="weight">Packets size</label>
                                </div>
                            </>
                        ) : null
                    }
                </form>
            </div>
            <div style={{height: 10}} />
            <canvas ref={canvasRef} id="graph" width="1000" height="500" onClick={handleCanvasClick} />
            {
                status.value == "none" ? null : (
                    status.value == "error" ? (
                        <div className="error left-align">
                            <span className="red-text">Error!</span> {status.message}
                        </div>
                    ) : (
                        <div className="success left-align">
                            <span className="green-text">Success!</span> The system is correct!
                        </div>
                    )
                )
            }
        </div>
    );
}

export default System;
