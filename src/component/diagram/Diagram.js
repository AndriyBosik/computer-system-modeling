import { useEffect, useState } from "react";
import { TICK_TYPE } from "../../metadata/const";
import "./Diagram.css";
import { TickType } from "./TickType/TickType";
import { plan } from "../../handler/planer/free.first";

export const Diagram = ({
    paths,
    queue,
    systemMatrix,
    taskMatrix
}) => {
    const [algorithmType, setAlgorithmType] = useState("free-first");
    const [ticks, setTicks] = useState(plan(paths, queue, systemMatrix, taskMatrix));

    useEffect(() => {
        setTicks(plan(paths, queue, systemMatrix, taskMatrix));
    }, [algorithmType]);

    useEffect(() => {
        setTicks(plan(paths, queue, systemMatrix, taskMatrix));
    }, [paths, queue, systemMatrix, taskMatrix]);

    return (
        queue.length == 0 ? (
            <div style={{fontSize: "25px"}}>Input data is not correct. Build correct task and system graphs and then click "Model" button on the "Queue" tab</div>
        ) : (
            <div className="Diagram s-vflex">
                <div className="s-hflex">
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

                <div className="tick-row s-hflex">
                    <div className="order s-vflex-center">
                        #
                    </div>
                    {systemMatrix.map((_, index) => <TickType key={index} type={TICK_TYPE.PROCESSOR} details={{title: `P${index + 1}`}} />)}
                </div>
                {
                    ticks.map((tick, index) => (
                        <div key={index} className="tick-row s-hflex">
                            <div className="order s-vflex-center">
                                {index + 1}
                            </div>
                            {
                                tick.map((item, processorIndex) => (
                                    <TickType key={processorIndex} type={item.type} details={item.details} />
                                ))
                            }
                        </div>
                    ))
                }
            </div>
        )
    )
}
