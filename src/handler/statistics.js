import { generate } from "./generator";
import {plan as freeFirstPlan} from "./planer/free.first";
import {plan as neighborModelingPlan} from "./planer/neighbor.modeling";
import { getQueueData } from "./queue";

export const generateStatistics = (
    algorithm,
    generationData,
    systemMatrix,
    paths
) => {
    const data = [];
    let generatedGraphs = 0;
    while (generatedGraphs < generationData.totalGraphs) {
        for (
            let i = generationData.minVertexes;
            generatedGraphs < generationData.totalGraphs && i <= generationData.maxVertexes;
            i += generationData.vertexStep
        ) {
            for (
                let j = generationData.minConnectivity;
                generatedGraphs < generationData.totalGraphs && j - generationData.maxConnectivity < 0.00001;
                j += generationData.connectivityStep
            ) {
                const {vertexes, matrix} = generate({
                    count: i,
                    minVertexWeight: generationData.minVertexWeight,
                    maxVertexWeight: generationData.maxVertexWeight,
                    minRelationWeight: generationData.minRelationWeight,
                    maxRelationWeight: generationData.maxRelationWeight,
                    connectivity: j
                });
        
                const totalWeight = vertexes.reduce((acc, value) => acc + value, 0);
        
                const statistics = getStatistics(vertexes, matrix, algorithm, systemMatrix, paths);
                
                data.push({
                    index: data.length,
                    connectivity: j,
                    vertexCount: i,
                    weightCritical: statistics.weightCritical,
                    queue: {
                        deadline: {
                            ticks: statistics.deadline,
                            ...analyzeAlgorithm(totalWeight, statistics.weightCritical, statistics.deadline, systemMatrix.length)
                        },
                        pathConnectivity: {
                            ticks: statistics.pathConnectivity,
                            ...analyzeAlgorithm(totalWeight, statistics.weightCritical, statistics.pathConnectivity, systemMatrix.length)
                        },
                        connectivityPath: {
                            ticks: statistics.connectivityPath,
                            ...analyzeAlgorithm(totalWeight, statistics.weightCritical, statistics.connectivityPath, systemMatrix.length)
                        }
                    }
                });

                generatedGraphs++;
            }
        }
    }
    return data.map(item => ({
        ...item,
        queue: {
            ...item.queue,
            average: {
                ticks: Math.round((item.queue.deadline.ticks + item.queue.pathConnectivity.ticks + item.queue.connectivityPath.ticks) / 3),
                acceleration: (item.queue.deadline.acceleration + item.queue.pathConnectivity.acceleration + item.queue.connectivityPath.acceleration) / 3,
                systemEfficiency: (item.queue.deadline.systemEfficiency + item.queue.pathConnectivity.systemEfficiency + item.queue.connectivityPath.systemEfficiency) / 3,
                algorithmEfficiency: (item.queue.deadline.algorithmEfficiency + item.queue.pathConnectivity.algorithmEfficiency + item.queue.connectivityPath.algorithmEfficiency) / 3
            }
        }
    }));
}

const analyzeAlgorithm = (totalWeight, weightCritical, ticks, processorsCount) => {
    const acceleration = totalWeight / ticks;
    const systemEfficiency = acceleration / processorsCount;
    const algorithmEfficiency = weightCritical / ticks;
    return {
        acceleration: acceleration.toFixed(2)*1,
        systemEfficiency: systemEfficiency.toFixed(2)*1,
        algorithmEfficiency: algorithmEfficiency.toFixed(2)*1
    };
}

const getStatistics = (
    vertices,
    matrix,
    algorithm,
    systemMatrix,
    paths
) => {
    const normalizedMatrix = matrix.map(row => row.map(item => item == 0 ? null : item));
    const {
        v2,
        v4,
        v11,
        weightCritical
    } = getQueueData(vertices, normalizedMatrix);
    const planningMatrix = matrix.map((row, i) => row.map((item, j) => i == j ? vertices[i] : item));
    const plan = algorithm == "free-first" ? freeFirstPlan : neighborModelingPlan;
    return {
        weightCritical,
        deadline: plan(paths, v2, systemMatrix, planningMatrix).length,
        pathConnectivity: plan(paths, v4, systemMatrix, planningMatrix).length,
        connectivityPath: plan(paths, v11, systemMatrix, planningMatrix).length
    };
}
