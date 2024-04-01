import { PROCESSOR_STATUS, TASK_STATUS, TICK_TYPE, TRANSFER_TYPE as TRANSFER_STATUS } from "../../metadata/const";
import { buildSystemDefinitions, buildTasksDefinitions } from "./common"

export const plan = (paths, queue, systemMatrix, taskMatrix) => {
    const taskDefinitions = buildTasksDefinitions(taskMatrix, queue);
    const systemDefinitions = buildSystemDefinitions(systemMatrix, paths);
    for (;;) {
        const allCompleted = taskDefinitions.filter(task => task.status != TASK_STATUS.COMPLETED).length == 0;
        if (allCompleted) {
            break;
        }
        updatePendingTime(systemDefinitions);
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
        for (let i = 0; i < systemDefinitions.length; i++) {
            const completedTask = nextProcessorTick(systemDefinitions[i]);
            if (completedTask != null) {
                taskDefinitions[completedTask].status = TASK_STATUS.COMPLETED
            }
        }
        const pendingTransfers = [];
        for (let i = 0; i < systemDefinitions.length; i++) {
            const details = nextIoTick(systemDefinitions[i]);
            if (!details.completedTransfer) {
                continue;
            }
            const currentHopIndex = details.hops.indexOf(systemDefinitions[i].id);
            const hopsLength = details.hops.length;
            if (currentHopIndex == hopsLength - 2) {
                refreshWaitingFor(details.parentTask, taskDefinitions[details.childTask].weight, systemDefinitions[details.hops[hopsLength - 1]])
            } else {
                pendingTransfers.push({
                    processor: systemDefinitions[details.hops[currentHopIndex + 1]],
                    data: {
                        ...details,
                        ticksCount: taskMatrix[details.parentTask][details.childTask]
                    }
                });
            }
        }
        for (let pendingTransfer of pendingTransfers) {
            addTransfer(pendingTransfer.processor, pendingTransfer.data);
        }
    }

    if (systemDefinitions.length == 0) {
        return [];
    }
    return systemDefinitions[0].ticks.map((_, index) => systemDefinitions.map(item => ({
        execution: item.ticks[index],
        dataTransfer: item.io.ticks[index]
    })));
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

const assignTask = (processor, task) => {
    processor.currentTask = task.id;
    processor.pendingTicks = new Array(task.weight).fill(0).map(_ => ({
        type: TICK_TYPE.RUN,
        details: {
            task: task.id,
            taskWeight: task.weight
        }
    }));

    task.status = TASK_STATUS.RUNNING;
    task.runningOn = processor.id
}

const waitTask = (processor, task, waitingFor) => {
    processor.currentTask = task.id;
    processor.details.waitingFor = waitingFor;
    processor.status = PROCESSOR_STATUS.WAITING;
    processor.pendingTicks = [];
    task.runningOn = processor.id;
    task.status = TASK_STATUS.RUNNING;
}

const nextProcessorTick = processor => {
    if (processor.pendingTicks.length > 0) {
        processor.status = PROCESSOR_STATUS.RUNNING;
        const tick = processor.pendingTicks[0];
        processor.pendingTicks.splice(0, 1);
        processor.ticks.push(tick);
        processor.status = processor.pendingTicks.length == 0 ? PROCESSOR_STATUS.PENDING : PROCESSOR_STATUS.RUNNING;
        const completedTask = processor.pendingTicks.length == 0 ? processor.currentTask : null;
        processor.currentTask = processor.pendingTicks.length == 0 ? null : processor.currentTask;
        if (completedTask != null) {
            processor.cache.push(completedTask);
        }
        return completedTask;
    }
    if (processor.pendingTicks.length == 0) {
        if (processor.details.waitingFor.length > 0) {
            processor.status = PROCESSOR_STATUS.WAITING;
        }
        processor.ticks.push({
            type: processor.status == PROCESSOR_STATUS.WAITING ? TICK_TYPE.WAITING : TICK_TYPE.EMPTY,
            details: {
                task: processor.status == PROCESSOR_STATUS.WAITING ? processor.currentTask : null
            }
        });
        if (processor.status == PROCESSOR_STATUS.PENDING) {
            processor.currentTask = null;
        }
    }
    return null;
}

const nextIoTick = processor => {
    if (processor.io.queue.length == 0) {
        processor.io.ticks.push({
            type: TICK_TYPE.EMPTY
        });
        return {
            completedTransfer: false
        };
    }
    const currentTransfer = processor.io.queue[0];
    currentTransfer.status = TRANSFER_STATUS.RUNNING;
    currentTransfer.ticksCount--;
    const currentHopIndex = currentTransfer.hops.indexOf(processor.id);
    processor.io.ticks.push({
        type: TICK_TYPE.TRANSFER,
        details: {
            parentTask: currentTransfer.parentTask,
            childTask: currentTransfer.childTask,
            nextHop: currentTransfer.hops[currentHopIndex + 1]
        }
    });
    if (currentTransfer.ticksCount > 0) {
        return {
            completedTransfer: false
        };
    }
    const answer = {
        completedTransfer: true,
        ...currentTransfer
    };
    processor.io.queue = processor.io.queue.slice(1);
    return answer;
}

const addTransfer = (processor, transfer) => {
    let insertIndex = 0;
    while (insertIndex < processor.io.queue.length) {
        if (processor.io.queue[insertIndex].status == TRANSFER_STATUS.RUNNING) {
            insertIndex++;
            continue;
        }
        if (processor.io.queue[insertIndex].priority < transfer.priority) {
            break;
        }
        insertIndex++;
    }
    processor.io.queue.splice(insertIndex, 0, transfer);
}

const findPreparedTasks = (queue, taskDefinitions) => {
    const tasks = [];
    for (let i = 0; i < queue.length; i++) {
        const task = taskDefinitions[queue[i].vertex];
        if (task.status == TASK_STATUS.PREPARED) {
            tasks.push(queue[i]);
        }
    }
    return tasks;
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
            priority: task.priority,
            hops: getNextPath(systemDefinitions, parentTaskProcessorId, processorId),
            parentTask: parentTaskId,
            childTask: task.id,
            ticksCount: taskMatrix[parentTaskId][task.id]
        });
    }
    return transfers;
}

const getNextPath = (systemDefinitions, from, to) => {
    const processor = systemDefinitions[from];
    const pathPointer = processor.pathsPointers[to];
    const path = processor.paths[to][pathPointer];
    processor.pathsPointers[to] = (pathPointer + 1) % processor.paths[to].length;
    return path;
}

const refreshWaitingFor = (parentTaskId, weight, processor) => {
    const taskIndex = processor.details.waitingFor.indexOf(parentTaskId);
    if (taskIndex == -1) {
        return;
    }
    processor.details.waitingFor.splice(taskIndex, 1);
    if (processor.details.waitingFor.length == 0) {
        processor.pendingTicks = new Array(weight).fill(0).map(_ => ({
            type: TICK_TYPE.RUN,
            details: {
                task: processor.currentTask,
                taskWeight: weight
            }
        }));
    }
}
