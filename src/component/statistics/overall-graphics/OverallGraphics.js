import { useEffect, useState } from "react";
import "./OverallGraphics.css";
import M from "materialize-css";
import { DiscreteColorLegend, HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from "react-vis";

const names = {
    acceleration: "Acceleration",
    systemEfficiency: "System Efficiency",
    algorithmEfficiency: "Algorithm Efficiency",
    ticks: "Ticks Count"
};

const colors = {
    findFirst: {
        deadline: "#5e35b1",
        pathConnectivity: "#d81b60",
        connectivityPath: "#4caf50"
    },
    neighborModeling: {
        deadline: "#1e88e5",
        pathConnectivity: "#b388ff",
        connectivityPath: "#ff9800"
    }
};

const OverallGraphics = ({
    freeFirst,
    neighborModeling
}) => {
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [selectedVertexesCount, setSelectedVertexesCount] = useState(null);
    const [data, setData] = useState({});
    const [maxY, setMaxY] = useState(null);
    const [vertexesCountOptions, setVertexesCountOptions] = useState(
        Object.keys(
            freeFirst.map(item => item.vertexCount).map(item => item*1).reduce((acc, value) => ({...acc, [value]: true}), {})));

    useEffect(() => {
        setVertexesCountOptions(Object.keys(
            freeFirst.map(item => item.vertexCount).map(item => item*1).reduce((acc, value) => ({...acc, [value]: true}), {})));
    }, [freeFirst, neighborModeling]);

    const connectivities = Object.keys(
        freeFirst.map(item => item.connectivity.toFixed(2)).reduce((acc, value) => ({...acc, [value]: true}), {}));

    useEffect(() => {
        const select = document.querySelectorAll("select");
        M.FormSelect.init(select, {});

        select.forEach(item => {
            item.addEventListener("change", event => {
                if (item.classList.contains("metric")) {
                    setSelectedMetric(event.target.value);
                } else if (item.classList.contains("vertexes-count")) {
                    setSelectedVertexesCount(event.target.value);
                }
            });
        });

        return () => {
            select.forEach(item => {
                const instance = M.FormSelect.getInstance(item);
                if (instance) {
                    instance.destroy();
                }
            });
        };
    }, [vertexesCountOptions]);

    useEffect(() => {
        if (selectedMetric == null || selectedVertexesCount == null) {
            setData({});
            return;
        }

        setData(getGraphicsData(selectedMetric, selectedVertexesCount));
    }, [selectedMetric, selectedVertexesCount, freeFirst, neighborModeling]);

    useEffect(() => {
        if (Object.keys(data).length == 0) {
            setMaxY(null);
            return;
        }
        const value = Math.max(
            Math.max(
                Math.max(...Object.values(data.freeFirst.deadline).map(item => item.y)),
                Math.max(...Object.values(data.freeFirst.pathConnectivity).map(item => item.y)),
                Math.max(...Object.values(data.freeFirst.connectivityPath).map(item => item.y))),
            Math.max(
                Math.max(...Object.values(data.neighborModeling.deadline).map(item => item.y)),
                Math.max(...Object.values(data.neighborModeling.pathConnectivity).map(item => item.y)),
                Math.max(...Object.values(data.neighborModeling.connectivityPath).map(item => item.y))));
        setMaxY(value);
    }, [data]);

    const mapToCoordinates = values => {
        return Object.entries(values)
            .map(([key, metricValues]) => ({x: key*1, y: metricValues.reduce((a, b) => a + b, 0) / metricValues.length}));
    };

    const getGraphicsData = (metric, vertexesCount) => {

        const values = {
            freeFirst: {
                deadline: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {}),
                pathConnectivity: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {}),
                connectivityPath: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {})
            },
            neighborModeling: {
                deadline: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {}),
                pathConnectivity: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {}),
                connectivityPath: connectivities.reduce((acc, value) => ({...acc, [value]: []}), {})
            }
        };
        for (const item of freeFirst) {
            if (item.vertexCount*1 != vertexesCount*1) {
                continue;
            }
            const key = item.connectivity.toFixed(2);
            values.freeFirst.deadline[key].push(item.queue.deadline[metric]);
            values.freeFirst.pathConnectivity[key].push(item.queue.pathConnectivity[metric]);
            values.freeFirst.connectivityPath[key].push(item.queue.connectivityPath[metric]);
        }

        for (const item of neighborModeling) {
            if (item.vertexCount*1 != vertexesCount*1) {
                continue;
            }
            const key = item.connectivity.toFixed(2);
            values.neighborModeling.deadline[key].push(item.queue.deadline[metric]);
            values.neighborModeling.pathConnectivity[key].push(item.queue.pathConnectivity[metric]);
            values.neighborModeling.connectivityPath[key].push(item.queue.connectivityPath[metric]);
        }

        return {
            freeFirst: {
                deadline: mapToCoordinates(values.freeFirst.deadline),
                pathConnectivity: mapToCoordinates(values.freeFirst.pathConnectivity),
                connectivityPath: mapToCoordinates(values.freeFirst.connectivityPath)
            },
            neighborModeling: {
                deadline: mapToCoordinates(values.neighborModeling.deadline),
                pathConnectivity: mapToCoordinates(values.neighborModeling.pathConnectivity),
                connectivityPath: mapToCoordinates(values.neighborModeling.connectivityPath)
            }
        };
    }

    return (
        <div className="OverallGraphics s-vflex" style={{marginTop: "40px"}}>
            <div className="row full-width">
                <div class="input-field col s4">
                    <select className="vertexes-count" value={selectedVertexesCount}>
                        <option value="" disabled selected>Choose vertex count</option>
                        {
                            vertexesCountOptions.map(option => (
                                <option value={`${option}`}>{option}</option>
                            ))
                        }
                    </select>
                    <label>Vertex count</label>
                </div>
                <div class="input-field col s4">
                    <select className="metric" value={selectedMetric}>
                        <option value="" disabled selected>Choose metric</option>
                        <option value="acceleration">Acceleration</option>
                        <option value="systemEfficiency">System efficiency</option>
                        <option value="algorithmEfficiency">Algorithm efficiency</option>
                        <option value="ticks">Ticks count</option>
                    </select>
                    <label>Metric</label>
                </div>
            </div>
            <div className="s-hflex-center">
                {
                    Object.keys(data).length == 0 ? null : (
                        <XYPlot
                            width={1000} 
                            height={500} 
                            getX={d => d.x} 
                            getY={d => d.y} 
                            margin={{ left: 100 }} 
                            yDomain={[0, maxY + 1]} 
                            xDomain={[0, 1]}>
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis title="#" tickFormat={number => number} tickValues={new Array(11).fill(0).map((_, index) => (index/10).toFixed(1))} />
                            <YAxis title={names[selectedMetric]} />
                            
                            <LineSeries
                                data={data.freeFirst.deadline}
                                style={{ strokeWidth: 3 }}
                                color={colors.findFirst.deadline} />
                            <LineSeries
                                data={data.freeFirst.pathConnectivity}
                                style={{ strokeWidth: 3 }}
                                color={colors.findFirst.pathConnectivity} />
                            <LineSeries
                                data={data.freeFirst.connectivityPath}
                                style={{ strokeWidth: 3 }}
                                color={colors.findFirst.connectivityPath} />

                            <LineSeries
                                data={data.neighborModeling.deadline}
                                style={{ strokeWidth: 3 }}
                                color={colors.neighborModeling.deadline} />
                            <LineSeries
                                data={data.neighborModeling.pathConnectivity}
                                style={{ strokeWidth: 3 }}
                                color={colors.neighborModeling.pathConnectivity} />
                            <LineSeries
                                data={data.neighborModeling.connectivityPath}
                                style={{ strokeWidth: 3 }}
                                color={colors.neighborModeling.connectivityPath} />

                            <DiscreteColorLegend
                                style={{ position: 'absolute', left: '80px', top: '40px' }}
                                orientation="vertical"
                                items={[
                                    {
                                        title: "Find First [Deadline]",
                                        color: colors.findFirst.deadline
                                    },
                                    {
                                        title: "Find First [Path -> Connectivity]",
                                        color: colors.findFirst.pathConnectivity
                                    },
                                    {
                                        title: "Find First [Connectivity -> Path]",
                                        color: colors.findFirst.connectivityPath
                                    },
                                    {
                                        title: "Neighbor Modeling [Deadline]",
                                        color: colors.neighborModeling.deadline
                                    },
                                    {
                                        title: "Neighbor Modeling [Path -> Connectivity]",
                                        color: colors.neighborModeling.pathConnectivity
                                    },
                                    {
                                        title: "Neighbor Modeling [Connectivity -> Path]",
                                        color: colors.neighborModeling.connectivityPath
                                    }
                                ]}
                            />
                        </XYPlot>
                    )
                }
            </div>
        </div>
    );
}

export default OverallGraphics;
