import { PROCESSOR_STATUS, TASK_STATUS } from "../../metadata/const";

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