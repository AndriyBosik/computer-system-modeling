import React from "react";
import "./TableView.css";
import { aggregate } from "../../../handler/aggregator";

const TableView = ({
    freeFirst,
    neighborModeling
}) => {
    const freeFirstStats = aggregate(freeFirst);
    const neighborModelingStats = aggregate(neighborModeling);

    const connectivities = Object.keys(freeFirst.map(item => item.connectivity.toFixed(2)).reduce((acc, value) => ({...acc, [value]: true}), {}))
        .map(Number)
        .sort((a, b) => a - b);

    const vertexes = Object.keys(freeFirst.map(item => item.vertexCount).map(item => item*1).reduce((acc, value) => ({...acc, [value]: true}), {}))
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="TableView">
            <table className="centered striped bordered">
                <thead>
                    <tr>
                        <th rowSpan={2} className="number">#</th>
                        <th rowSpan={2}>Vertexes count</th>
                        <th rowSpan={2}>Connectivity</th>
                        <th rowSpan={2}>K</th>
                        <th colSpan={3}>Free First</th>
                        <th colSpan={3}>Neighbor Modeling</th>
                    </tr>
                    <tr>
                        <th>Deadline</th>
                        <th>Path {"->"} Connectivity</th>
                        <th>Connectivity {"->"} Path</th>
                        <th>Deadline</th>
                        <th>Path {"->"} Connectivity</th>
                        <th>Connectivity {"->"} Path</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        vertexes.map((vertex, i) => 
                            connectivities.map((connectivity, j) => 
                                <React.Fragment key={i + ":" + j.toFixed(2)}>
                                    <tr>
                                        <td rowSpan={4}>{i*connectivities.length + j + 1}</td>
                                        <td rowSpan={4}>{vertex}</td>
                                        <td rowSpan={4}>{connectivity.toFixed(2)}</td>
                                        <td>K[acc]</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].deadline.acceleration.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.acceleration.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.acceleration.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].deadline.acceleration.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.acceleration.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.acceleration.toFixed(2)}</td>
                                    </tr>

                                    <tr>
                                        <td>K[s_eff]</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].deadline.systemEfficiency.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.systemEfficiency.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.systemEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].deadline.systemEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.systemEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.systemEfficiency.toFixed(2)}</td>
                                    </tr>

                                    <tr>
                                        <td>K[a_eff]</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].deadline.algorithmEfficiency.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.algorithmEfficiency.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.algorithmEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].deadline.algorithmEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.algorithmEfficiency.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.algorithmEfficiency.toFixed(2)}</td>
                                    </tr>

                                    <tr>
                                        <td>K[ticks]</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].deadline.ticks.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.ticks.toFixed(2)}</td>
                                        <td>{freeFirstStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.ticks.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].deadline.ticks.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].pathConnectivity.ticks.toFixed(2)}</td>
                                        <td>{neighborModelingStats[vertex + ":" + connectivity.toFixed(2)].connectivityPath.ticks.toFixed(2)}</td>
                                    </tr>
                                </React.Fragment>
                            )
                        )
                    }
                </tbody>
            </table>
        </div>
    );
}

export default TableView;
