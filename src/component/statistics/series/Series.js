import { DiscreteColorLegend, Hint, HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from "react-vis";
import "./Series.css";
import { useState } from "react";

const Series = ({
    data,
    title
}) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const handleMouseOver = (value) => {
        setHoveredPoint(value);
    };

    const handleMouseOut = () => {
        setHoveredPoint(null);
    };

    const getAcceleration = getStats => {
        return data.map((item, index) => ({
            index: index,
            value: getStats(item.queue).acceleration,
            connectivity: item.connectivity,
            vertexCount: item.vertexCount,
            x: index,
            y: item.queue.deadline.ticks
        }));
    }

    const getSystemEfficiency = getStats => {
        return data.map((item, index) => ({
            index: index,
            value: getStats(item.queue).systemEfficiency,
            connectivity: item.connectivity,
            vertexCount: item.vertexCount,
            x: index,
            y: item.queue.pathConnectivity.ticks
        }));
    }

    const getAlgorithmEfficiency = getStats => {
        return data.map((item, index) => ({
            index: index,
            value: getStats(item.queue).algorithmEfficiency,
            connectivity: item.connectivity,
            vertexCount: item.vertexCount,
            x: index,
            y: item.queue.connectivityPath.ticks
        }));
    }

    const maxY = data
        .map(item => Math.max(
            Math.max(item.queue.deadline.acceleration, item.queue.pathConnectivity.acceleration, item.queue.connectivityPath.acceleration),
            Math.max(item.queue.deadline.systemEfficiency, item.queue.pathConnectivity.systemEfficiency, item.queue.connectivityPath.systemEfficiency),
            Math.max(item.queue.deadline.algorithmEfficiency, item.queue.pathConnectivity.algorithmEfficiency, item.queue.connectivityPath.algorithmEfficiency)))
        .reduce((acc, value) => Math.max(acc, value), 0);

    const names = ({
        deadline: "Deadline",
        pathConnectivity: "Critical path to the end (Descending) and connectivity (Descending)",
        connectivityPath: "Connectivity (Descending) and critical path to the begin (Ascending)"
    });

    const colors = {
        acceleration: "#009688",
        systemEfficiency: "#2196f3",
        algorithmEfficiency: "#e53935"
    };

    return (
        <div className="Series">
            <h4>{title}</h4>
            <div className="s-hflex">
                {
                    ['deadline', 'pathConnectivity', 'connectivityPath'].map(item => (
                        <div className="s-vflex">
                            <XYPlot 
                                    width={data.length * 20} 
                                    height={500} 
                                    getX={d => d.index + 1} 
                                    getY={d => d.value} 
                                    margin={{ left: 100 }} 
                                    yDomain={[0, maxY + 2]} 
                                    xDomain={[0, data.length + 1]}
                                    onMouseLeave={handleMouseOut}>
                                <VerticalGridLines />
                                <HorizontalGridLines />
                                <XAxis title="#" tickFormat={number => number} tickValues={new Array(data.length).fill(0).map((_, index) => index + 1)} />
                                <YAxis title="Values" />
                                <LineSeries
                                    data={getAcceleration(point => point[item])}
                                    style={{ strokeWidth: 2 }}
                                    color={colors.acceleration}
                                    onNearestX={handleMouseOver} />
                                <LineSeries
                                    data={getSystemEfficiency(point => point[item])}
                                    style={{ strokeWidth: 2 }}
                                    color={colors.systemEfficiency}
                                    onNearestX={handleMouseOver} />
                                <LineSeries
                                    data={getAlgorithmEfficiency(point => point[item])}
                                    style={{ strokeWidth: 2 }}
                                    color={colors.algorithmEfficiency}
                                    onNearestX={handleMouseOver} />
                                {
                                    hoveredPoint && (
                                        <Hint value={hoveredPoint}>
                                            <div className="hint-content">
                                                <div className="s-hflex-start">Vertexes: {hoveredPoint.vertexCount}</div>
                                                <div className="s-hflex-start">Connectivity: {hoveredPoint.connectivity.toFixed(2)}</div>
                                            </div>
                                        </Hint>
                                    )
                                }
                                <DiscreteColorLegend
                                    style={{ position: 'absolute', left: '80px', top: '40px' }}
                                    orientation="vertical"
                                    items={[
                                        {
                                            title: "Acceleration",
                                            color: colors.acceleration
                                        },
                                        {
                                            title: "System Efficiency",
                                            color: colors.systemEfficiency
                                        },
                                        {
                                            title: "Algorithm Efficiency",
                                            color: colors.algorithmEfficiency
                                        },
                                    ]}
                                />
                            </XYPlot>
                            <div>{names[item]}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default Series;
