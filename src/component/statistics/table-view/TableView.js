import "./TableView.css";

const TableView = ({
    freeFirst,
    neighborModeling
}) => {
    return (
        <div className="TableView">
            <table className="centered striped bordered">
                <thead>
                    <tr>
                        <th rowSpan={2} className="number">#</th>
                        <th rowSpan={2}>Connectivity</th>
                        <th rowSpan={2}>Vertexes count</th>
                        <th rowSpan={2}>K</th>
                        <th colSpan={4}>Find First</th>
                        <th colSpan={4}>Neighbor Modeling</th>
                    </tr>
                    <tr>
                        <th>Deadline</th>
                        <th>Path {"->"} Connectivity</th>
                        <th>Connectivity {"->"} Path</th>
                        <th>Avg</th>
                        <th>Deadline</th>
                        <th>Path {"->"} Connectivity</th>
                        <th>Connectivity {"->"} Path</th>
                        <th>Avg</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        freeFirst.map((_, index) => (
                            <>
                                <tr key={index}>
                                    <td rowSpan={3}>{index + 1}</td>
                                    <td rowSpan={3}>{freeFirst[index].connectivity.toFixed(2)}</td>
                                    <td rowSpan={3}>{freeFirst[index].vertexCount}</td>
                                    <td>K[acc]</td>
                                    <td>{freeFirst[index].queue.deadline.acceleration}</td>
                                    <td>{freeFirst[index].queue.pathConnectivity.acceleration}</td>
                                    <td>{freeFirst[index].queue.connectivityPath.acceleration}</td>
                                    <td>{freeFirst[index].queue.average.acceleration.toFixed(2)}</td>
                                    <td>{neighborModeling[index].queue.deadline.acceleration}</td>
                                    <td>{neighborModeling[index].queue.pathConnectivity.acceleration}</td>
                                    <td>{neighborModeling[index].queue.connectivityPath.acceleration}</td>
                                    <td>{neighborModeling[index].queue.average.acceleration.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>K[s_eff]</td>
                                    <td>{freeFirst[index].queue.deadline.systemEfficiency}</td>
                                    <td>{freeFirst[index].queue.pathConnectivity.systemEfficiency}</td>
                                    <td>{freeFirst[index].queue.connectivityPath.systemEfficiency}</td>
                                    <td>{freeFirst[index].queue.average.systemEfficiency.toFixed(2)}</td>
                                    <td>{neighborModeling[index].queue.deadline.systemEfficiency}</td>
                                    <td>{neighborModeling[index].queue.pathConnectivity.systemEfficiency}</td>
                                    <td>{neighborModeling[index].queue.connectivityPath.systemEfficiency}</td>
                                    <td>{neighborModeling[index].queue.average.systemEfficiency.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>K[a_eff]</td>
                                    <td>{freeFirst[index].queue.deadline.algorithmEfficiency}</td>
                                    <td>{freeFirst[index].queue.pathConnectivity.algorithmEfficiency}</td>
                                    <td>{freeFirst[index].queue.connectivityPath.algorithmEfficiency}</td>
                                    <td>{freeFirst[index].queue.average.algorithmEfficiency.toFixed(2)}</td>
                                    <td>{neighborModeling[index].queue.deadline.algorithmEfficiency}</td>
                                    <td>{neighborModeling[index].queue.pathConnectivity.algorithmEfficiency}</td>
                                    <td>{neighborModeling[index].queue.connectivityPath.algorithmEfficiency}</td>
                                    <td>{neighborModeling[index].queue.average.algorithmEfficiency.toFixed(2)}</td>
                                </tr>
                            </>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}

export default TableView;
