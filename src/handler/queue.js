export const getQueueData = (vertices, matrix) => {
    const {simplifiedVertices, simplifiedMatrix} = simplify(vertices, matrix);

    const connectivity = getConnectivity(matrix);

    const weightCriticalToBegin = getCriticalToBegin(vertices, matrix);
    const weightCriticalToEnd = getCriticalToEnd(vertices, matrix);

    const weightCritical = Math.max(...weightCriticalToEnd);

    const verticesCriticalToBegin = getCriticalToBegin(simplifiedVertices, simplifiedMatrix);
    const verticesCriticalToEnd = getCriticalToEnd(simplifiedVertices, simplifiedMatrix);

    const v2 = sortByLateAndEarlyDeadlineDifferenceAsc(weightCriticalToBegin, weightCriticalToEnd);
    const v4 = sortByVerticesCriticalToEndDescAndConnectivityDesc(verticesCriticalToEnd, connectivity);
    const v11 = sortByConnectivityDescAndVerticesCriticalToBeginAsc(connectivity, verticesCriticalToBegin);
    
    return {
        weightCriticalToBegin,
        weightCriticalToEnd,
        connectivity,
        weightCritical,
        verticesCriticalToBegin,
        verticesCriticalToEnd,
        v2,
        v4,
        v11
    };
}

export const normalize = graph => {
    const n = Math.max(...graph.vertices.map(item => item.id));
    if (n < 1) {
        return {vertices: [], matrix: []};
    }

    const vertices = Array(n).fill(0);
    for (const vertex of graph.vertices) {
        vertices[vertex.id - 1] = vertex.weight;
    }

    const matrix = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(null);
        }
        matrix.push(row);
    }
    
    for (const rib of graph.ribs) {
        matrix[rib.id1 - 1][rib.id2 - 1] = rib.weight;
    }

    return {vertices, matrix};
}

export const simplify = (vertices, matrix) => {
    const simplifiedMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        simplifiedMatrix.push([]);
        for (let j = 0; j < matrix.length; j++) {
            simplifiedMatrix[i].push(matrix[i][j] == null ? null : 0);
        }
    }

    return {
        simplifiedVertices: Array(vertices.length).fill(1),
        simplifiedMatrix
    };
}

export const getAdjacencyMatrix = graph => {
    const n = Math.max(...graph.vertices.map(item => item.id));
    const matrix = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(null);
        }
        matrix.push(row);
    }
    
    for (const rib of graph.ribs) {
        matrix[rib.id1 - 1][rib.id2 - 1] = rib.weight;
    }

    return matrix;
}

export const getConnectivity = matrix => {
    const result = Array(matrix.length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[i][j] == null) {
                continue;
            }
            result[i]++;
            result[j]++;
        }
    }
    return result;
}

export const getCriticalToBegin = (vertices, matrix) => {
    const n = matrix.length;
    const roots = getRoots(matrix);

    const result = Array(n).fill(null);
    for (const root of roots) {
        result[root] = 0;
        criticalToBeginDfs(result, root, vertices, matrix);
    }

    return result;
}

export const getCriticalToEnd = (vertices, matrix) => {
    matrix = rotate(matrix);

    const n = matrix.length;
    const roots = getRoots(matrix);

    const result = Array(n).fill(null);
    for (const root of roots) {
        result[root] = 0;
        criticalToBeginDfs(result, root, vertices, matrix);
    }

    return result.map((item, index) => item + vertices[index]);
}

export const sortByLateAndEarlyDeadlineDifferenceAsc = (weightCriticalToBegin, weightCriticalToEnd) => {
    const weightCritical = Math.max(...weightCriticalToEnd);
    const items = [];
    for (let i = 0; i < Math.min(weightCriticalToBegin.length, weightCriticalToEnd.length); i++) {
        items.push({
            vertex: i,
            early: weightCriticalToBegin[i] + 1,
            late: weightCritical - weightCriticalToEnd[i] + 1
        });
    }

    return items.sort((first, second) => (first.late - first.early) - (second.late - second.early));
}

export const sortByVerticesCriticalToEndDescAndConnectivityDesc = (verticesCriticalToEnd, connectivity) => {
    const items = [];
    for (let i = 0; i < Math.min(verticesCriticalToEnd.length, connectivity.length); i++) {
        items.push({
            vertex: i,
            connectivity: connectivity[i],
            path: verticesCriticalToEnd[i]
        });
    }

    return items.sort((first, second) => first.path != second.path ? second.path - first.path : second.connectivity - first.connectivity);
}

export const sortByConnectivityDescAndVerticesCriticalToBeginAsc = (connectivity, verticesCriticalToBegin) => {
    const items = [];
    for (let i = 0; i < Math.min(verticesCriticalToBegin.length, connectivity.length); i++) {
        items.push({
            vertex: i,
            connectivity: connectivity[i],
            path: verticesCriticalToBegin[i]
        });
    }

    return items.sort((first, second) => first.connectivity != second.connectivity ? second.connectivity - first.connectivity : first.path - second.path);
}

const getRoots = matrix => {
    const sum = [];
    for (let i = 0; i < matrix.length; i++) {
        sum.push(0);
    }
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            sum[j] += matrix[i][j] == null ? 0 : 1;
        }
    }
    return sum.map((item, index) => ({item, index})).filter(x => x.item == 0).map(x => x.index);
}

const rotate = matrix => {
    const n = matrix.length;
    const result = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(0);
        }
        result.push(row);
    }

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = matrix[j][i];
        }
    }

    return result;
}

const criticalToBeginDfs = (result, vertex, weights, matrix) => {
    const currentWeight = result[vertex] + weights[vertex];
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[vertex][i] == null) {
            continue;
        }
        if (result[i] == null || currentWeight > result[i]) {
            result[i] = currentWeight;
            criticalToBeginDfs(result, i, weights, matrix);
        }
    }
}
