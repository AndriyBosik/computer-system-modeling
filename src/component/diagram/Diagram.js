import { TICK_TYPE } from "../../metadata/const";
import { Queue } from "../queue-list/queue/Queue";
import "./Diagram.css";
import { TickType } from "./TickType/TickType";

export const Diagram = ({
    paths,
    matrix,
    queue
}) => {
    return (
        queue.length == 0 ? (
            <div style={{fontSize: "25px"}}>Input data is not correct. Build correct task and system graphs and then click "Model" button on the "Queue" tab</div>
        ) : (
            <div className="Diagram s-vflex">
                <div className="tick-row s-hflex">
                    {matrix.map((_, index) => <TickType key={index} type={TICK_TYPE.PROCESSOR} details={{title: `P${index + 1}`}} />)}
                </div>
                <div className="tick-row s-hflex">
                    <TickType type={TICK_TYPE.EMPTY} details={{}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 5}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 4, processor: 3}} />
                    <TickType type={TICK_TYPE.READ} details={{task: 4}} />
                    <TickType type={TICK_TYPE.WRITE} details={{task: 1}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 2, processor: 2}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 8}} />
                </div>
                <div className="tick-row s-hflex">
                <TickType type={TICK_TYPE.RUN} details={{task: 1}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 5}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 4, processor: 3}} />
                    <TickType type={TICK_TYPE.READ} details={{task: 4}} />
                    <TickType type={TICK_TYPE.WRITE} details={{task: 1}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 2, processor: 2}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 8}} />
                </div>
                <div className="tick-row s-hflex">
                    <TickType type={TICK_TYPE.RUN} details={{task: 1}} />
                    <TickType type={TICK_TYPE.EMPTY} details={{}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 4, processor: 3}} />
                    <TickType type={TICK_TYPE.EMPTY} details={{}} />
                    <TickType type={TICK_TYPE.WRITE} details={{task: 1}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 2, processor: 2}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 8}} />
                </div>
                <div className="tick-row s-hflex">
                    <TickType type={TICK_TYPE.EMPTY} details={{}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 2}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 4, processor: 3}} />
                    <TickType type={TICK_TYPE.WRITE} details={{task: 4}} />
                    <TickType type={TICK_TYPE.EMPTY} details={{}} />
                    <TickType type={TICK_TYPE.TRANSPORT} details={{task: 5, parentTask: 2, processor: 2}} />
                    <TickType type={TICK_TYPE.RUN} details={{task: 8}} />
                </div>
            </div>
        )
    )
}
