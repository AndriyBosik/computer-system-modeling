import { PROCESSOR_STATUS, TASK_STATUS, TRANSFER_STATUS } from "../../metadata/const";
import {
    addTransfer,
    assignTask,
    buildSystemDefinitions,
    buildTasksDefinitions,
    findPreparedTasks,
    getNextPath,
    refreshPreparedTasks,
    updateStatusAndPendingTime,
    waitTask,
    getTicks,
    runProcessors,
    runIos} from "./common"

export const plan = (paths, queue, systemMatrix, taskMatrix) => {
    const taskDefinitions = buildTasksDefinitions(taskMatrix, queue);
    const systemDefinitions = buildSystemDefinitions(systemMatrix, paths);
    for (;;) {
        const allCompleted = taskDefinitions.filter(task => task.status != TASK_STATUS.COMPLETED).length == 0;
        if (allCompleted) {
            break;
        }
        updateStatusAndPendingTime(systemDefinitions);
        refreshPreparedTasks(taskDefinitions);
        const preparedTasks = findPreparedTasks(queue, taskDefinitions, systemDefinitions);
        const processors = findFreeProcessors(preparedTasks.length, systemDefinitions);
        for (let i = 0; i < preparedTasks.length; i++) {
            if (i >= processors.length) {
                break;
            }
            
            const taskNumber = preparedTasks[i].vertex;
            const task = taskDefinitions[taskNumber];

            const waitingFor = task.deps.filter(dep => processors[i].cache.indexOf(dep) == -1);
            if (waitingFor.length == 0) {
                assignTask(processors[i], task);
            } else {
                waitTask(processors[i], task, waitingFor);
                const transfers = getTransfers(processors[i].id, task, waitingFor, taskMatrix, taskDefinitions, systemDefinitions);
                for (let j = 0; j < transfers.length; j++) {
                    const hops = transfers[j].hops;
                    addTransfer(systemDefinitions[hops[0]], transfers[j]);
                }
            }
        }
        runProcessors(taskDefinitions, systemDefinitions);
        runIos(taskDefinitions, systemDefinitions, taskMatrix);
    }

    return getTicks(systemDefinitions);
}

const findFreeProcessors = (k, definitions) => {
    return definitions
        .filter(item => item.status == PROCESSOR_STATUS.PENDING)
        .sort((first, second) => first.pendingTime != second.pendingTime ? second.pendingTime - first.pendingTime : second.connectivity - first.connectivity)
        .slice(0, k);
}

const getTransfers = (processorId, task, waitingFor, taskMatrix, taskDefinitions, systemDefinitions) => {
    const transfers = [];
    for (let i = 0; i < waitingFor.length; i++) {
        const parentTaskId = waitingFor[i];
        const parentTaskProcessorId = taskDefinitions[parentTaskId].runningOn;
        transfers.push({
            status: TRANSFER_STATUS.PENDING,
            parentPriority: taskDefinitions[parentTaskId].priority,
            childPriority: task.priority,
            hops: getNextPath(systemDefinitions, parentTaskProcessorId, processorId),
            parentTask: parentTaskId,
            childTask: task.id,
            ticksCount: taskMatrix[parentTaskId][task.id]
        });
    }
    return transfers;
}
