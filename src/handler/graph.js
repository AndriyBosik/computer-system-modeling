export const checkConnected = (vertices, ribs) => {
    const n = vertices.length;
    const matrix = [];
    const visited = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(i == j ? 0 : null);
        }
        visited.push(false);
        matrix.push(row);
    }
    for (const rib of ribs) {
        matrix[rib.id1 - 1][rib.id2 - 1] = 1;
        matrix[rib.id2 - 1][rib.id1 - 1] = 1;
    }
    
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (matrix[i][k] != null && matrix[k][j] != null && (matrix[i][j] == null || matrix[i][j] > matrix[i][k] + matrix[k][j])) {
                    matrix[i][j] = matrix[i][k] + matrix[k][j];
                }
            }
        }
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i != j && matrix[i][j] == null && matrix[j][i] == null) {
                return `Vertices ${i + 1} and ${j + 1} aren't connected`;
            }
        }
    }

    return null;
}

export const checkCycle = (vertices, ribs) => {
    const n = vertices.length;
    const matrix = [];
    const visited = [];
    const stack = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        visited.push(false);
        stack.push(false);
        matrix.push(row);
    }
    for (const rib of ribs) {
        matrix[rib.id1 - 1][rib.id2 - 1] = 1;
    }
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            const cycle = findCycleDfs(i, matrix, visited, stack, []);
            if (cycle.length > 0) {
                return "The task has a cycle: " + cycle.map(vertex => vertex + 1).map(String).join(' -> ');
            }
        }
    }
    return null;
}

export const buildPaths = (processes, relations) => {
    const n = processes.length;
    const matrix = [];
    const stack = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        stack.push(false);
        matrix.push(row);
    }
    for (const relation of relations) {
        matrix[relation.id1 - 1][relation.id2 - 1] = 1;
        matrix[relation.id2 - 1][relation.id1 - 1] = 1;
    }

    let paths = {};
    for (let i = 0; i < n; i++) {
        const newPaths = buildPathsDfs(i, i, matrix, stack, []);
        for (const [key, value] of Object.entries(newPaths)) {
            if (paths[key]) {
                paths[key] = [
                    ...paths[key],
                    ...value];
            } else {
                paths[key] = value;
            }
        }
    }
    console.log("All paths:", paths);
    for (const [key, value] of Object.entries(paths)) {
        const shortestPath = Math.min(...value.map(item => item.length));
        paths[key] = value.filter(item => item.length == shortestPath);
    }
    console.log("Shortest paths:", paths);
    return [matrix, paths];
}

const findCycleDfs = (vertex, matrix, visited, stack, order) => {
    const n = visited.length;
    visited[vertex] = true;
    stack[vertex] = true;
    order.push(vertex);

    for (let i = 0; i < n; i++) {
        if (matrix[vertex][i] == 0) {
            continue;
        }
        if (!visited[i]) {
            const cycle = findCycleDfs(i, matrix, visited, stack, order);
            if (cycle.length > 0) {
                return cycle;
            }
        } else if (stack[i]) {
            return buildCycle(order, i);
        }
    }

    order.pop();
    stack[vertex] = false;
    return false;
}

const buildCycle = (order, vertex) => {
    let started = false;
    const cycle = [];
    for (const v of order) {
        if (v == vertex) {
            started = true;
        }
        if (started) {
            cycle.push(v);
        }
    }
    cycle.push(vertex);
    return cycle;
}

const buildPathsDfs = (initialVertex, vertex, matrix, stack, order) => {
    const n = matrix.length;
    stack[vertex] = true;
    order.push(vertex);
    let paths = {};

    for (let i = 0; i < n; i++) {
        if (matrix[vertex][i] == 0) {
            continue;
        }
        if (stack[i]) {
            continue;
        }
        const newPaths = buildPathsDfs(initialVertex, i, matrix, stack, order);
        for (const [key, value] of Object.entries(newPaths)) {
            if (paths[key]) {
                paths[key] = [
                    ...paths[key],
                    ...value];
            } else {
                paths[key] = value;
            }
        }
    }

    if (initialVertex != vertex) {
        paths[initialVertex + ":" + vertex] = [[...order]];
    }
    order.pop();
    stack[vertex] = false;
    return paths;
}
