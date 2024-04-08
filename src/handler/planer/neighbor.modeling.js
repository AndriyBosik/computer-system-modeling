import { PROCESSOR_STATUS, TASK_STATUS, TRANSFER_STATUS } from "../../metadata/const";
import { toStr } from "./../debug";
import { 
    addTransfer,
    assignTask, 
    buildSystemDefinitions, 
    buildTasksDefinitions, 
    findPreparedTasks, 
    getNextPath, 
    getTicks,
    refreshPreparedTasks,
    runIos, 
    runProcessors, 
    updateStatusAndPendingTime,
    waitTask } from "./common";

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
        const usedProcessors = [];
        for (let i = 0; i < preparedTasks.length; i++) {
            if (i >= processors.length) {
                break;
            }

            const taskNumber = preparedTasks[i].vertex;
            const task = taskDefinitions[taskNumber];

            const neighbor = processors
                .filter(item => usedProcessors.indexOf(item.id) == -1)
                .map(item => ({
                    connectivity: item.connectivity,
                    pendingTime: item.pendingTime,
                    id: item.id,
                    ...calculateVirtualDistance(item, taskMatrix, taskDefinitions, task.id, systemDefinitions)}))
                .reduce(findRelevantNeighbor);

            usedProcessors.push(neighbor.id);

            if (Object.keys(neighbor.waitingState).length == 0) {
                assignTask(systemDefinitions[neighbor.id], task);
            } else {
                waitTask(systemDefinitions[neighbor.id], task, Object.keys(neighbor.waitingState).map(Number));
                const transfers = getTransfers(neighbor, task, taskMatrix, taskDefinitions);
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

const getTransfers = (neighbor, task, taskMatrix, taskDefinitions) => {
    const transfers = [];
    for (const [key, hops] of Object.entries(neighbor.waitingState)) {
        const parentTaskId = key*1;
        transfers.push({
            status: TRANSFER_STATUS.PENDING,
            parentPriority: taskDefinitions[Number(parentTaskId)].priority,
            childPriority: task.priority,
            hops: hops,
            parentTask: Number(parentTaskId),
            childTask: task.id,
            ticksCount: taskMatrix[parentTaskId][task.id]
        });
    }
    return transfers;
}

const findFreeProcessors = (k, definitions) => {
    return definitions
        .filter(item => item.status == PROCESSOR_STATUS.PENDING);
}

const findRelevantNeighbor = (accumulator, value) => {
    if (value.distance < accumulator.distance) {
        return value;
    } else if (value.distance > accumulator.distance) {
        return accumulator;
    }
    if (value.connectivity < accumulator.connectivity) {
        return accumulator;
    } else if (value.connectivity > accumulator.connectivity) {
        return value;
    }
    return value.pendingTime > accumulator.pendingTime ? value : accumulator;
}

const calculateVirtualDistance = (processor, taskMatrix, taskDefinitions, taskId, systemDefinitions) => {
    const task = taskDefinitions[taskId];
    const waitingFor = task.deps.filter(dep => processor.cache.indexOf(dep) == -1);
    if (waitingFor.length == 0) {
        return {
            distance: 0,
            waitingState: {}
        };
    }
    const waitingState = {};

    const queue = new Array(systemDefinitions.length).fill(0).map(_ => []);
    for (let i = 0; i < waitingFor.length; i++) {
        const parentTaskId = waitingFor[i];
        const parentTaskProcessorId = taskDefinitions[parentTaskId].runningOn;
        const hops = getNextPath(systemDefinitions, parentTaskProcessorId, processor.id);
        const ticksCount = taskMatrix[parentTaskId][taskId];
        addToVirtualQueue(queue[hops[0]], {
            status: TRANSFER_STATUS.PENDING,
            parentPriority: taskDefinitions[parentTaskId].priority,
            childPriority: taskDefinitions[taskId].priority,
            hops,
            ticksCount,
            parentTask: parentTaskId,
            childTask: taskId
        });
        waitingState[waitingFor[i]] = hops;
    }

    let completedTransfers = 0;
    let totalTicks = 0;
    while (completedTransfers < waitingFor.length) {
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].length == 0) {
                continue;
            }
            const transfer = queue[i][0];
            transfer.status = TRANSFER_STATUS.RUNNING;
            transfer.ticksCount--;
            if (transfer.ticksCount == 0) {
                queue[i].splice(0, 1);
                const currentHopIndex = transfer.hops.indexOf(i);
                if (currentHopIndex == transfer.hops.length - 2) {
                    completedTransfers++;
                    continue;
                } 
                
                const ticksCount = taskMatrix[transfer.parentTask][transfer.childTask]
                const nextHop = transfer.hops[currentHopIndex + 1];
                addToVirtualQueue(queue[nextHop], {
                    ...transfer,
                    status: TRANSFER_STATUS.PENDING,
                    ticksCount
                });
            }
        }
        totalTicks++;
    }

    return {
        distance: totalTicks,
        waitingState
    };
}

const addToVirtualQueue = (queue, virtualTransfer) => {
    let insertIndex = 0;
    while (insertIndex < queue.length) {
        const transfer = queue[insertIndex];
        if (transfer.status == TRANSFER_STATUS.RUNNING) {
            insertIndex++;
            continue;
        }
        if (transfer.childPriority < virtualTransfer.childPriority || (transfer.childPriority == virtualTransfer.childPriority && transfer.parentPriority < virtualTransfer.parentPriority)) {
            break;
        }
        insertIndex++;
    }
    queue.splice(insertIndex, 0, virtualTransfer);
}
