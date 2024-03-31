import "./Actions.css";

const Actions = ({valid, task, system, onLoad = () => {}}) => {
    const handleSave = event => {
        event.preventDefault();
        const value = JSON.stringify(task) + "\n" + JSON.stringify(system);
        const blob = new Blob([value], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "graph.sj";
        link.href = url;
        link.click();
    }

    const handleFileRead = event => {
        const result = event.target.result;
        const parts = result.split('\n');
        onLoad(JSON.parse(parts[0]), JSON.parse(parts[1]));
    }

    const handleChange = event => {
        if (event.target.files.length < 1) {
            console.log("No files were selected");
            return;
        }
        const file = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(file);
        if (event.target) {
            event.target.value = null;
        }
    }

    return (
        <div className="Actions s-vflex">
            <button type="button" className={`btn ${valid ? "" : "disabled"}`} onClick={handleSave}>Save</button>
            <div style={{height: 30}} />
            <div className="file-field input-field">
                <div className="btn" style={{margin: 0}}>
                    <span>Load</span>
                    <input type="file" onChange={handleChange} />
                    <input type="hidden" className="file-path" />
                </div>
            </div>
        </div>
    );
}

export default Actions;
