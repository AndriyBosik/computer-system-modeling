import { useState } from "react";
import StatisticsForm from "./statistics-form/StatisticsForm";
import "react-vis/dist/style.css";
import "./Statistics.css";
import Series from "./series/Series";
import { generateStatistics } from "../../handler/statistics";
import TableView from "./table-view/TableView";
import OverallGraphics from "./overall-graphics/OverallGraphics";

const Statistics = ({
    systemMatrix,
    paths
}) => {
    const [mode, setMode] = useState("table");

    const [statistics, setStatistics] = useState({
        freeFirst: [],
        neighborModeling: []
    });

    const handleGeneration = generationData => {
        setStatistics({
            freeFirst: generateStatistics(
                "free-first",
                Object.entries(generationData).reduce((acc, [key, value]) => ({...acc, [key]: value*1}), {}),
                systemMatrix,
                paths),
            neighborModeling: generateStatistics(
                "neighbor-modeling",
                Object.entries(generationData).reduce((acc, [key, value]) => ({...acc, [key]: value*1}), {}),
                systemMatrix,
                paths)
        });
    }

    return (
        <div className="Statistics">
            <StatisticsForm onSubmit={handleGeneration} />
            {
                (statistics.freeFirst.length == 0 && statistics.neighborModeling.length == 0) ? null : (
                    <div className="s-vflex">
                        <div className="s-flex-start">
                            <div className="switch">
                                <label>
                                    Graphics view
                                    <input type="checkbox" checked={mode == "table"} onClick={_ => setMode(previous => previous == "table" ? "graphics" : "table")} />
                                    <span className="lever"></span>
                                    Table view
                                </label>
                            </div>
                        </div>
                        {
                            mode == "table" ? (
                                <TableView freeFirst={statistics.freeFirst} neighborModeling={statistics.neighborModeling} />
                            ) : (
                                <div className="s-vflex">
                                    <OverallGraphics freeFirst={statistics.freeFirst} neighborModeling={statistics.neighborModeling} />
                                    <Series
                                        data={statistics.freeFirst}
                                        title="Free First" />
                                    <Series
                                        data={statistics.neighborModeling}
                                        title="Neighbor Modeling" />
                                </div>
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Statistics;
