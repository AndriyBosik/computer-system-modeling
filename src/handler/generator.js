export const generate = ({count, minVertexWeight, maxVertexWeight, minRibWeight, maxRibWeight, connectivity}) => {
    if (count == 1) {
        return {
            vertexes: [minVertexWeight],
            matrix: [[0]]
        }
    }

    const vertexes = new Array(count).fill(0);

    const minVertex = getRandomInt(0, count - 1);
    let maxVertex = getRandomInt(0, count - 1);
    while (maxVertex == minVertex) {
        maxVertex = getRandomInt(0, count - 1);
    }

    vertexes[minVertex] = minVertexWeight;
    vertexes[maxVertex] = maxVertexWeight;

    for (let i = 0; i < count; i++) {
        if (vertexes[i] != 0) {
            continue;
        }
        vertexes[i] = getRandomInt(minVertexWeight, maxVertexWeight);
    }
    
    const vertexesWeightSum = vertexes.reduce((a, b) => a + b, 0);
    let ribsWeightSum = Math.round(vertexesWeightSum / connectivity - vertexesWeightSum);
    const matrix = generateMatrix(count);
    let possibleRibs = generatePossibleRibs(count);
    
    const ribWeightLowerBound = minRibWeight == null ? 1 : minRibWeight;
    const ribWeightUpperBound = maxRibWeight == null ? (Math.floor(ribsWeightSum / 4) || ribsWeightSum) : maxRibWeight;

    if (ribsWeightSum < ribWeightLowerBound) {
        setRib(ribsWeightSum, possibleRibs, matrix);
        return {vertexes, matrix};
    }

    if (2*ribWeightLowerBound >= ribsWeightSum) {
        setRib(ribWeightLowerBound, possibleRibs, matrix);
        setRib(ribsWeightSum - ribWeightLowerBound, possibleRibs, matrix);
        return {vertexes, matrix};
    }

    if (possibleRibs.length * ribWeightUpperBound <= ribsWeightSum) {
        return {
            vertexes,
            matrix: populateWithOverWeight(possibleRibs, matrix, ribWeightUpperBound, ribsWeightSum)
        }
    }
    const minRibsCount = Math.min(Math.round(ribsWeightSum / ribWeightUpperBound), possibleRibs.length);
    const maxRibsCount = Math.min(Math.round(ribsWeightSum / ribWeightLowerBound), possibleRibs.length);
    const topoRibsCount = getRandomInt(minRibsCount, maxRibsCount);
    const topoRibs = getRandomRibs(possibleRibs, topoRibsCount);

    for (let i = 0; i < topoRibs.length; i++) {
        if (ribsWeightSum == 0) {
            break;
        }
        const [x, y] = topoRibs[i];
        if (i < topoRibs.length - 1) {
            matrix[x][y] = Math.min(ribWeightLowerBound, ribsWeightSum);
            ribsWeightSum -= matrix[x][y];
        } else {
            matrix[x][y] = Math.min(ribWeightUpperBound, ribsWeightSum);
            ribsWeightSum -= matrix[x][y];
        }
    }

    populateRest(ribsWeightSum, matrix, topoRibs, ribWeightUpperBound);

    return {
        vertexes,
        matrix
    };
}

const setRib = (weight, possibleRibs, matrix) => {
    const ribIndex = getRandomInt(0, possibleRibs.length - 1);
    const rib = possibleRibs[ribIndex];
    matrix[rib[0]][rib[1]] += weight;
    
    possibleRibs.splice(ribIndex, 1);
}

const populateRest = (ribsWeightSum, matrix, topoRibs, ribWeightUpperBound) => {
    while (true) {
        let changed = false;
        for (let i = 0; i < topoRibs.length; i++) {
            const [x, y] = topoRibs[i];
            if (matrix[x][y] >= ribWeightUpperBound) {
                continue;
            }
            if (ribsWeightSum == 0) {
                break;
            }
            const additionalWeight = getRandomInt(1, Math.min(ribsWeightSum, Math.max(ribWeightUpperBound - matrix[x][y], 0)));
            matrix[x][y] += additionalWeight;
            ribsWeightSum -= additionalWeight;
            changed = true;
        }
        if (!changed || ribsWeightSum == 0) {
            break;
        }
    }
    if (ribsWeightSum > 0) {
        while (true) {
            for (let i = 0; i < topoRibs.length; i++) {
                const [x, y] = topoRibs[i];
                const additionalWeight = getRandomInt(1, ribsWeightSum);
                matrix[x][y] += additionalWeight;
                ribsWeightSum -= additionalWeight;
                if (ribsWeightSum == 0) {
                    break;
                }
            }
            if (ribsWeightSum == 0) {
                break;
            }
        }
    }
}

const getRandomRibs = (ribs, count) => {
    const answer = [];

    for (let i = 0; i < count; i++) {
        const ribIndex = getRandomInt(0, ribs.length - 1);
        answer.push(ribs[ribIndex]);
        ribs.splice(ribIndex, 1);
    }

    return answer;
}

const populateWithOverWeight = (possibleRibs, matrix, ribWeightUpperBound, ribsWeightSum) => {
    for (let i = 0; i < possibleRibs.length; i++) {
        const rib = possibleRibs[i];
        matrix[rib[0]][rib[1]] = ribWeightUpperBound;
        ribsWeightSum -= ribWeightUpperBound;
    }

    while (ribsWeightSum > 0) {
        const weight = getRandomInt(1, Math.floor(ribsWeightSum / 2) || ribsWeightSum);
        const ribIndex = getRandomInt(0, possibleRibs.length - 1);
        const rib = possibleRibs[ribIndex];
        matrix[rib[0]][rib[1]] += weight;
        ribsWeightSum -= weight;
    }
    return matrix;
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateMatrix = count => {
    const matrix = [];
    for (let i = 0; i < count; i++) {
        const row = [];
        for (let j = 0; j < count; j++) {
            row.push(0);
        }
        matrix.push(row);
    }
    return matrix;
}

const generatePossibleRibs = count => {
    const ribs = [];
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            ribs.push([i, j]);
        }
    }
    return ribs;
}
