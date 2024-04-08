import { useState } from "react";
import "./StatisticsForm.css";

const StatisticsForm = ({
    onSubmit = () => {}
}) => {
    const [minVertexes, setMinVertexes] = useState('1');
    const [maxVertexes, setMaxVertexes] = useState('1');
    const [vertexStep, setVertexStep] = useState('0');
    const [minConnectivity, setMinConnectivity] = useState('0.4');
    const [maxConnectivity, setMaxConnectivity] = useState('0.6');
    const [connectivityStep, setConnectivityStep] = useState('0.1');
    const [minVertexWeight, setMinVertexWeight] = useState('10');
    const [maxVertexWeight, setMaxVertexWeight] = useState('20');
    const [totalGraphs, setTotalGraphs] = useState('10');

    const handleSubmit = event => {
        event.preventDefault();
        onSubmit({
            minVertexes,
            maxVertexes,
            vertexStep,
            minConnectivity,
            maxConnectivity,
            connectivityStep,
            minVertexWeight,
            maxVertexWeight,
            totalGraphs
        });
    };

    return (
        <div className="row">
            <form className="col s12" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="input-field col s4">
                        <input id="minVertexes" type="number" value={minVertexes} onChange={(event) => setMinVertexes(event.target.value)} />
                        <label className="active" htmlFor="minVertexes">Minimum Vertexes Count</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="maxVertexes" type="number" value={maxVertexes} onChange={event => setMaxVertexes(event.target.value)} />
                        <label className="active" htmlFor="maxVertexes">Maximum Vertexes Count</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="vertexStep" type="number" value={vertexStep} onChange={event => setVertexStep(event.target.value)} />
                        <label className="active" htmlFor="vertexStep">Vertexes Step</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="initialConnectivity" type="number" value={minConnectivity} onChange={event => setMinConnectivity(event.target.value)} />
                        <label className="active" htmlFor="initialConnectivity">Initial Graph's Connectivity</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="maxConnectivity" type="number" value={maxConnectivity} onChange={event => setMaxConnectivity(event.target.value)} />
                        <label className="active" htmlFor="maxConnectivity">Maximum Graph's Connectivity</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="connectivityStep" type="number" value={connectivityStep} onChange={event => setConnectivityStep(event.target.value)} />
                        <label className="active" htmlFor="connectivityStep">Connectivity Step</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="minVertexWeight" type="number" value={minVertexWeight} onChange={event => setMinVertexWeight(event.target.value)} />
                        <label className="active" htmlFor="minVertexWeight">Minimum Vertex Weight</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="maxVertexWeight" type="number" value={maxVertexWeight} onChange={event => setMaxVertexWeight(event.target.value)} />
                        <label className="active" htmlFor="maxVertexWeight">Maximum Vertex Weight</label>
                    </div>
                    <div className="input-field col s4">
                        <input id="totalGraphs" type="number" value={totalGraphs} onChange={event => setTotalGraphs(event.target.value)} />
                        <label className="active" htmlFor="totalGraphs">Total Amount of Generated Graphs</label>
                    </div>
                </div>
                <div className="s-hflex-end">
                    <button className="btn" type="submit" name="action">Show statistic</button>
                </div>
            </form>
        </div>
    );
}

export default StatisticsForm;
