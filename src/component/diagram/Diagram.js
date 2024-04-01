import { useEffect, useState } from "react";
import { TICK_TYPE } from "../../metadata/const";
import "./Diagram.css";
import { TickType } from "./TickType/TickType";
import { plan } from "../../handler/planer/free.first";
import { getCriticalToEnd } from "../../handler/queue";
import { toStr } from "../../handler/debug";

export const Diagram = props => {
    const {paths, queue, systemMatrix, taskMatrix} = props;
    const [algorithmType, setAlgorithmType] = useState("free-first");
    const [mode, setMode] = useState("execution", "dataTransfer")
    const [ticks, setTicks] = useState(plan(paths, queue, systemMatrix, taskMatrix));
    const [stats, setStats] = useState({
        totalTasksWeight: null,
        ticksCount: null,
        acceleration: null,
        load: null
    });

    useEffect(() => {
        setTicks(plan(paths, queue, systemMatrix, taskMatrix));
    }, [props]);

    useEffect(() => {
        setStats(calculateStats(taskMatrix));
    }, [ticks]);

    const calculateStats = taskMatrix => {
        let totalTasksWeight = 0;
        for (let i = 0; i < taskMatrix.length; i++) {
            totalTasksWeight += taskMatrix[i][i];
        }
        const ticksCount = ticks.length;
        const accelerationCoefficient = (totalTasksWeight / ticksCount).toFixed(2);
        const load = (accelerationCoefficient / systemMatrix.length).toFixed(2);
        return {
            totalTasksWeight,
            ticksCount,
            accelerationCoefficient,
            load
        };
    }

    return (
        <div className="Diagram s-vflex">
            <div className="s-hflex">
                <div>
                    <form action="#" className="s-hflex">
                        <p style={{textAlign: "left"}}>
                            <label>
                                <input className="with-gap" name="algorithm-type" type="radio" value="free-first" onChange={_ => setAlgorithmType("free-first")} checked={algorithmType == "free-first"} />
                                <span>Free First</span>
                            </label>
                        </p>
                        <div style={{width: 50}} />
                        <p style={{textAlign: "left"}}>
                            <label>
                                <input className="with-gap" name="algorithm-type" type="radio" value="neighbor-modeling" onChange={_ => setAlgorithmType("neighbor-modeling")} checked={algorithmType == "neighbor-modeling"} />
                                <span>Neighbor Modeling</span>
                            </label>
                        </p>
                    </form>
                </div>
                <div className="equal-flex"></div>
                <div>
                <div className="switch">
                    <label>
                        Data transfer
                        <input type="checkbox" checked={mode == "execution"} onClick={_ => setMode(previous => previous == "execution" ? "dataTransfer" : "execution")} />
                        <span className="lever"></span>
                        Execution
                    </label>
                </div>
                </div>
            </div>

            <table className="centered striped" style={{marginBottom: "20px"}}>
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
                        <td>Total tasks weight</td>
                        <td>{stats.totalTasksWeight || "-"}</td>
                        <td>Ticks count</td>
                        <td>{stats.ticksCount || "-"}</td>
                    </tr>
                    <tr>
                        <td>Acceleration coefficient</td>
                        <td>{stats.accelerationCoefficient || "-"}</td>
                        <td>Processors load</td>
                        <td>{stats.load || "-"}</td>
                    </tr>
                </tbody>
            </table>

            <div className="tick-row s-hflex">
                <div className="order s-vflex-center">
                    #
                </div>
                {systemMatrix.map((_, index) => <TickType
                    key={index}
                    primaryTick={{type: TICK_TYPE.PROCESSOR, details: {title: `P${index + 1}`}}}
                    secondaryTick={{type: TICK_TYPE.PROCESSOR, details: {title: `P${index + 1}`}}} />)}
            </div>
            {
                ticks.map((tick, index) => (
                    <div key={index} className="tick-row s-hflex">
                        <div className="order s-vflex-center">
                            {index + 1}
                        </div>
                        {
                            tick.map((item, processorIndex) => (
                                <TickType
                                    key={mode + ":" + processorIndex}
                                    primaryTick={mode == "execution" ? item.execution : item.dataTransfer}
                                    secondaryTick={mode != "execution" ? item.execution : item.dataTransfer} />
                            ))
                        }
                    </div>
                ))
            }
        </div>
    )
}
