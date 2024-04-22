import { IO_STATUS, PROCESSOR_STATUS, TASK_STATUS, TICK_TYPE, TRANSFER_STATUS } from "../../metadata/const";

export const buildTasksDefinitions = (taskMatrix, queue) => {
    const definitions = buildTasksDeps(taskMatrix).map((deps, index) => ({
        id: index,
        status: deps.length > 0 ? TASK_STATUS.PENDING : TASK_STATUS.PREPARED,
        weight: taskMatrix[index][index],
        priority: 0,
        runningOn: null,
        deps
    }));
    for (let i = 0; i < queue.length; i++) {
        definitions[queue[i].vertex].priority = queue.length - i;
    }
    return definitions;
}

export const buildSystemDefinitions = (systemMatrix, paths) => {
    const definitions = [];

    for (let i = 0; i < systemMatrix.length; i++) {
        definitions.push({
            id: i,
            pendingTime: 0,
            currentTask: null,
            status: PROCESSOR_STATUS.PENDING,
            ticks: [],
            pendingTicks: [],
            paths: findAllPaths(i, systemMatrix.length, paths),
            pathsPointers: new Array(systemMatrix.length).fill(0),
            connectivity: getConnectivity(i, systemMatrix),
            cache: [],
            io: {
                status: IO_STATUS.PENDING,
                details: {
                    parentHop: null,
                    parentTask: null,
                    childTask: null
                },
                queue: [],
                ticks: []
            },
            details: {
                waitingFor: []
            }
        });
    }

    return definitions;
}

export const updateStatusAndPendingTime = systemDefinitions => {
    for (let i = 0; i < systemDefinitions.length; i++) {
        const processor = systemDefinitions[i];
        if (processor.status != PROCESSOR_STATUS.PENDING) {
            if (processor.details.waitingFor.length > 0) {
                processor.status = PROCESSOR_STATUS.WAITING;
            } else if (processor.pendingTicks.length > 0) {
                processor.status = PROCESSOR_STATUS.RUNNING;
            } else {
                processor.status = PROCESSOR_STATUS.PENDING;
            }
            processor.pendingTime = 0;
        }
        if (processor.status == PROCESSOR_STATUS.PENDING) {
            processor.pendingTime += 1;
        } else {
            processor.pendingTime = 0;
        }
    }
}

export const refreshPreparedTasks = definitions => {
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

export const findPreparedTasks = (queue, taskDefinitions) => {
    const tasks = [];
    for (let i = 0; i < queue.length; i++) {
        const task = taskDefinitions[queue[i].vertex];
        if (task.status == TASK_STATUS.PREPARED) {
            tasks.push(queue[i]);
        }
    }
    return tasks;
}

export const getNextPath = (systemDefinitions, from, to) => {
    const processor = systemDefinitions[from];
    const pathPointer = processor.pathsPointers[to];
    const path = processor.paths[to][pathPointer];
    processor.pathsPointers[to] = (pathPointer + 1) % processor.paths[to].length;
    return path;
}

export const assignTask = (processor, task) => {
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

export const waitTask = (processor, task, waitingFor) => {
    processor.currentTask = task.id;
    processor.details.waitingFor = waitingFor;
    processor.status = PROCESSOR_STATUS.WAITING;
    processor.pendingTicks = [];
    task.runningOn = processor.id;
    task.status = TASK_STATUS.RUNNING;
}

export const addTransfer = (processor, transfer) => {
    let insertIndex = 0;
    while (insertIndex < processor.io.queue.length) {
        if (processor.io.queue[insertIndex].status == TRANSFER_STATUS.RUNNING) {
            insertIndex++;
            continue;
        }
        if (processor.io.queue[insertIndex].childPriority < transfer.childPriority || (processor.io.queue[insertIndex].childPriority == transfer.childPriority && processor.io.queue[insertIndex].parentPriority < transfer.parentPriority)) {
            break;
        }
        insertIndex++;
    }
    processor.io.queue.splice(insertIndex, 0, transfer);
}

export const getTicks = systemDefinitions => {
    if (systemDefinitions.length == 0) {
        return [];
    }
    return systemDefinitions[0].ticks.map((_, index) => systemDefinitions.map(item => ({
        execution: item.ticks[index],
        dataTransfer: item.io.ticks[index]
    })));
}

export const runProcessors = (taskDefinitions, systemDefinitions) => {
    for (let i = 0; i < systemDefinitions.length; i++) {
        const completedTask = nextProcessorTick(systemDefinitions[i]);
        if (completedTask != null) {
            taskDefinitions[completedTask].status = TASK_STATUS.COMPLETED
        }
    }
};

export const runIos = (taskDefinitions, systemDefinitions, taskMatrix) => {
    const pendingTransfers = [];
    const completedReceivers = [];
    const completedTransferers = [];
    const empty = [];
    for (let i = 0; i < systemDefinitions.length; i++) {
        const details = nextIoTick(systemDefinitions[i], completedTransferers, systemDefinitions);
        if (details.empty) {
            empty.push(i);
        }
        if (!details.completedTransfer) {
            continue;
        }
        completedTransferers.push(i);
        completedReceivers.push(details.nextHop);
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
    
    for (let emptyOne of empty) {
        continueIo(systemDefinitions[emptyOne]);
    }

    completedReceivers.forEach(index => {
        systemDefinitions[index].io.status = IO_STATUS.PENDING;
        systemDefinitions[index].io.details.parentHop = null;
        systemDefinitions[index].io.details.parentTask = null;
        systemDefinitions[index].io.details.childTask = null;
    });
}

const nextProcessorTick = processor => {
    if (processor.pendingTicks.length > 0) {
        processor.status = PROCESSOR_STATUS.RUNNING;
        const tick = processor.pendingTicks[0];
        processor.pendingTicks.splice(0, 1);
        processor.ticks.push(tick);
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

const nextIoTick = (processor, completedTransferers, systemDefinitions) => {
    if (processor.io.queue.length == 0 && processor.io.status == IO_STATUS.PENDING) {
        return {
            completedTransfer: false,
            empty: true
        };
    }
    if (processor.io.status == IO_STATUS.WAITING) {
        processor.io.ticks.push({
            type: TICK_TYPE.WAITING,
            details: {
                parentHop: processor.io.details.parentHop,
                childTask: processor.io.details.childTask,
                parentTask: processor.io.details.parentTask
            }
        });
        return {
            empty: false,
            completedTransfer: false
        };
    }
    const currentTransfer = processor.io.queue[0];
    const currentHopIndex = currentTransfer.hops.indexOf(processor.id);
    const nextHop = currentTransfer.hops[currentHopIndex + 1];
    if (systemDefinitions[nextHop].io.status == IO_STATUS.WAITING && systemDefinitions[nextHop].io.details.parentHop != processor.id) {
        return {
            empty: true,
            completedTransfer: false
        };
    }
    if (systemDefinitions[nextHop].io.queue.length > 0 && systemDefinitions[nextHop].io.queue[0].status == TRANSFER_STATUS.RUNNING) {
        return {
            empty: true,
            completedTransfer: false
        };
    }

    if (completedTransferers.includes(nextHop)) {
        return {
            empty: true,
            completedTransfer: false
        };
    }

    currentTransfer.status = TRANSFER_STATUS.RUNNING;
    currentTransfer.ticksCount--;

    systemDefinitions[nextHop].io.status = IO_STATUS.WAITING;
    systemDefinitions[nextHop].io.details.parentHop = processor.id;
    systemDefinitions[nextHop].io.details.parentTask = currentTransfer.parentTask;
    systemDefinitions[nextHop].io.details.childTask = currentTransfer.childTask;

    processor.io.ticks.push({
        type: TICK_TYPE.TRANSFER,
        details: {
            parentTask: currentTransfer.parentTask,
            childTask: currentTransfer.childTask,
            nextHop: nextHop
        }
    });
    if (currentTransfer.ticksCount > 0) {
        return {
            empty: false,
            completedTransfer: false
        };
    }
    const answer = {
        completedTransfer: true,
        ...currentTransfer,
        nextHop: nextHop,
        empty: false,
        status: TRANSFER_STATUS.PENDING
    };
    processor.io.queue = processor.io.queue.slice(1);
    return answer;
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

const findAllPaths = (vertex, n, paths) => {
    const answer = [];
    for (let i = 0; i < n; i++) {
        answer.push(i == vertex ? [] : paths[vertex + ":" + i]);
    }
    return answer;
}

const getConnectivity = (vertex, matrix) => {
    let connectivity = 0;
    for (let i = 0; i < matrix.length; i++) {
        if (i == vertex) {
            continue;
        }
        connectivity += matrix[vertex][i] > 0 ? 1 : 0;
    }
    return connectivity;
}

const buildTasksDeps = taskMatrix => {
    const n = taskMatrix.length;
    const deps = [];
    for (let i = 0; i < n; i++) {
        deps.push([]);
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i == j || taskMatrix[i][j] == 0) {
                continue;
            }
            deps[j].push(i);
        }
    }
    return deps;
}

const continueIo = processor => {
    if (processor.io.status == IO_STATUS.WAITING) {
        processor.io.ticks.push({
            type: TICK_TYPE.WAITING,
            details: {
                parentHop: processor.io.details.parentHop,
                childTask: processor.io.details.childTask,
                parentTask: processor.io.details.parentTask
            }
        });
        return;
    }
    processor.io.ticks.push({
        type: TICK_TYPE.EMPTY
    });
}
