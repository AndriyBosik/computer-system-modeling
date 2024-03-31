import { PROCESSOR_STATUS, TASK_STATUS, TICK_TYPE } from "../../metadata/const";
import { buildSystemDefinitions, buildTasksDefinitions } from "./common"

export const plan = (paths, queue, systemMatrix, taskMatrix) => {
    const taskDefinitions = buildTasksDefinitions(taskMatrix);
    const systemDefinitions = buildSystemDefinitions(systemMatrix, paths);
    const ticks = [];

    console.log("START", queue);
    for (let k = 0; k < 20; k++) {
        updatePendingTime(systemDefinitions);
        refreshPreparedTasks(taskDefinitions);
        const preparedTasks = queue.filter(item => taskDefinitions[item.vertex].status == TASK_STATUS.PREPARED);
        const processors = findFreeProcessors(preparedTasks.length, systemDefinitions);
        for (let i = 0; i < preparedTasks.length; i++) {
            if (i >= processors.length) {
                break;
            }
            const taskNumber = preparedTasks[i].vertex;
            assignTask(processors[i], preparedTasks[i], taskDefinitions[taskNumber].weight);
            taskDefinitions[taskNumber].status = TASK_STATUS.RUNNING;
        }
        for (let i = 0; i < systemDefinitions.length; i++) {
            const completedTask = nextTickProcessor(systemDefinitions[i]);
            if (completedTask != null) {
                taskDefinitions[completedTask].status = TASK_STATUS.COMPLETED;
            }
        }
        console.log("Iteration end:", taskDefinitions);
    }

    if (systemDefinitions.length == 0) {
        return [];
    }
    const answer = systemDefinitions[0].ticks.map((_, index) => systemDefinitions.map(item => item.ticks[index]));
    return answer;
}

const refreshPreparedTasks = definitions => {
    while (true) {
        let changed = false;
        for (let i = 0; i < definitions.length; i++) {
            if (definitions[i].status != TASK_STATUS.PENDING) {
                continue;
            }
            let allCompleted = true;
            for (let dep of definitions[i].deps) {
                if (definitions[dep].status != TASK_STATUS.COMPLETED) {
                    allCompleted = false;
                    break;
                }
            }
            if (allCompleted) {
                definitions[i].status = TASK_STATUS.PREPARED;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
}

const updatePendingTime = systemDefinitions => {
    for (let i = 0; i < systemDefinitions.length; i++) {
        if (systemDefinitions[i].status == PROCESSOR_STATUS.PENDING) {
            systemDefinitions[i].pendingTime += 1;
        } else {
            systemDefinitions[i].pendingTime = 0;
        }
    }
}

const assignTask = (processor, task, weight) => {
    processor.currentTask = task.vertex;
    processor.pendingTicks = new Array(weight).fill(0).map(_ => ({
        type: TICK_TYPE.RUN,
        details: {
            task: task.vertex,
            taskWeight: weight
        }
    }));
}

const nextTickProcessor = processor => {
    if (processor.pendingTicks.length > 0) {
        const tick = processor.pendingTicks[0];
        processor.pendingTicks.splice(0, 1);
        processor.ticks.push(tick);
        processor.status = processor.pendingTicks.length == 0 ? PROCESSOR_STATUS.PENDING : PROCESSOR_STATUS.RUNNING;
        const completedTask = processor.pendingTicks.length == 0 ? processor.currentTask : null;
        processor.currentTask = processor.pendingTicks.length == 0 ? null : processor.currentTask;
        processor.cache.push(completedTask);
        return completedTask;
    }
    if (processor.pendingTicks.length == 0) {
        processor.ticks.push({
            type: TICK_TYPE.EMPTY
        });
        if (processor.status == PROCESSOR_STATUS.PENDING) {
            processor.currentTask = null;
        }
    }
    return null;
}

const findFreeProcessors = (k, definitions) => {
    return definitions
        .filter(item => item.status == PROCESSOR_STATUS.PENDING)
        .sort((first, second) => first.waitingTime != second.waitingTime ? second.waitingTime - first.waitingTime : second.connectivity - first.connectivity)
        .slice(0, k);
}
