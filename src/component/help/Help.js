import "./Help.css";

export const Help = () => {
    return (
        <div className="Help s-vflex">
            <div className="task description">
                <h5>How to compose a task?</h5>
                <div>
                    If you want to compose a task, go to "TASK" tab, click "ADD TASK" button and click anywhere within canvas(rectangle area with greyish border) - the task will be placed. You can specify the weight of a task in the corresponding input field called "Weight".
                    In order to add relation between tasks, follow the next steps:
                    <ol>
                        <li>Click "ADD RELATION" button</li>
                        <li>Click the task you want to add relation from</li>
                        <li>Click the task you want to add relation to</li>
                    </ol>
                    You can also specify the weight of relation as well.
                    <br />
                    To clear canvas - click "CLEAR" button.
                    <br />
                    To discard last action(task/relation addition) - click "CANCEL" button.
                    <br />
                    In order to check whether your task composition is correct - click "CHECK" button. It will display errors in the developer's console if any. <i>The correct</i> task graph <strong>must not</strong> contain any cycles.
                </div>
            </div>
            <div className="system description">
                <h5>How to compose a system?</h5>
                <div>
                    If you want to compose a system, go to "SYSTEM" tab, click "ADD PROCESS" button and click anywhere within canvas(rectangle area with greyish border) - the PROCESS will be placed.
                    In order to add relation between processes, follow the next steps:
                    <ol>
                        <li>Click "ADD RELATION" button</li>
                        <li>Click the task you want to add relation from</li>
                        <li>Click the task you want to add relation to</li>
                    </ol>
                    You can also specify whether a process is messages- or packets-based by choosing the corresponding radio option. If you choose "Packets", then new "Packets size" field will be available where you can specify how many packets the process is able to pass within one processor tick.
                    <br />
                    To clear canvas - click "CLEAR" button.
                    <br />
                    To discard last action(task/relation addition) - click "CANCEL" button.
                    <br />
                    In order to check whether your task composition is correct - click "CHECK" button. It will display errors in the developer's console if any. <i>The correct</i> system graph <strong>must be</strong> connected.
                </div>
            </div>
            <div className="state description">
                <h5>How to save/load?</h5>
                <p>
                    By default, "SAVE" button is disabled. In order to enable it, compose a task and a system and check them. If they both are correct - the "SAVE" button will be enabled. Click it to save your graphs to a file.
                    <br />
                    Also, you can use "LOAD" button to load your system from a file.
                </p>
            </div>
        </div>
    )
}