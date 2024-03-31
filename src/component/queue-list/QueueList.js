import { useEffect } from "react";
import { getConnectivity, getCriticalToBegin, getCriticalToEnd, normalize, simplify, sortByConnectivityDescAndVerticesCriticalToBeginAsc, sortByLateAndEarlyDeadlineDifferenceAsc, sortByVerticesCriticalToEndDescAndConnectivityDesc } from "../../handler/queue";
import "./QueueList.css";
import { Queue } from "./queue/Queue";
import M from "materialize-css";

export const QueueList = ({
    task,
    modelable = false,
    onModelQueue = () => {}
}) => {
    useEffect(() => {
        const tooltips = document.querySelectorAll(".tooltipped");
        M.Tooltip.init(tooltips, {});
    }, [task]);

    const graph = {vertices: task.tasks, ribs: task.relations};

    const {vertices, matrix} = normalize(graph);
    const {simplifiedVertices, simplifiedMatrix} = simplify(vertices, matrix);
    const n = matrix.length;

    const connectivity = getConnectivity(matrix);

    const weightCriticalToBegin = getCriticalToBegin(vertices, matrix);
    const weightCriticalToEnd = getCriticalToEnd(vertices, matrix);

    const weightCritical = Math.max(...weightCriticalToEnd);

    const verticesCriticalToBegin = getCriticalToBegin(simplifiedVertices, simplifiedMatrix);
    const verticesCriticalToEnd = getCriticalToEnd(simplifiedVertices, simplifiedMatrix);

    const v2 = sortByLateAndEarlyDeadlineDifferenceAsc(weightCriticalToBegin, weightCriticalToEnd);
    const v4 = sortByVerticesCriticalToEndDescAndConnectivityDesc(verticesCriticalToEnd, connectivity);
    const v11 = sortByConnectivityDescAndVerticesCriticalToBeginAsc(connectivity, verticesCriticalToBegin);

    return (
        <div className="QueueList s-vflex">
            {
                task.tasks.length == 0 ? (
                    <div style={{fontSize: "25px"}}>Task graph is not created</div>
                ) : (
                    <>
                        <Queue
                            onModelQueue={onModelQueue}
                            modelable={modelable}
                            items={v2}
                            hint="Difference (Late - Early)"
                            mapHint={item => `${item.late - item.early} (${item.late} - ${item.early})`}
                            title="By the difference between late and early deadline (Ascending)" />
                        <div style={{height: 30}} />
                        <Queue
                            onModelQueue={onModelQueue}
                            modelable={modelable}
                            items={v4}
                            hint="Path | Connectivity"
                            mapHint={item => `${item.path} | ${item.connectivity}`}
                            title="By critical path by the vertices to the end (Descending) and connectivity (Descending)" />
                        <div style={{height: 30}} />
                        <Queue
                            onModelQueue={onModelQueue}
                            modelable={modelable}
                            items={v11}
                            hint="Path | Connectivity"
                            mapHint={item => `${item.path} | ${item.connectivity}`}
                            title="By connectivity (Descending) and critical path by the vertices to the begin (Ascending)" />
                        <table className="centered striped">
                            <thead>
                                <tr>
                                    <th className="number">#</th>
                                    <th>Connectivity</th>
                                    <th>Critical path by the weight to the start</th>
                                    <th>Critical path by the weight to the end</th>
                                    <th>Critical path by the vertices number to the start</th>
                                    <th>Critical path by the vertices number to the end</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Array(n).fill().map((_, index) => (
                                        <tr key={index}>
                                            <td className="number">{index + 1}</td>
                                            <td>{connectivity[index]}</td>
                                            <td>{weightCriticalToBegin[index]}</td>
                                            {
                                                weightCriticalToEnd[index] == weightCritical ? (
                                                    <td className="red-text tooltipped weight-strong" data-position="top" data-tooltip="Graph's critical by weight">{weightCriticalToEnd[index]}</td>
                                                ) : (
                                                    <td>{weightCriticalToEnd[index]}</td>
                                                )
                                            }
                                            <td>{verticesCriticalToBegin[index]}</td>
                                            <td>{verticesCriticalToEnd[index]}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </>
                )
            }
        </div>
    )
}
