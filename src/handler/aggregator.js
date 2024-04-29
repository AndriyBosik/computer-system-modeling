export const aggregate = values => {
    const stats = {};

    for (const item of values) {
        const key = item.vertexCount.toFixed(0) + ":" + item.connectivity.toFixed(2);
        if (stats[key] == null) {
            stats[key] = {
                deadline: {
                    acceleration: [],
                    algorithmEfficiency: [],
                    systemEfficiency: [],
                    ticks: []
                },
                connectivityPath: {
                    acceleration: [],
                    algorithmEfficiency: [],
                    systemEfficiency: [],
                    ticks: []
                },
                pathConnectivity: {
                    acceleration: [],
                    algorithmEfficiency: [],
                    systemEfficiency: [],
                    ticks: []
                },
            };
        }

        stats[key].deadline.acceleration.push(item.queue.deadline.acceleration);
        stats[key].deadline.algorithmEfficiency.push(item.queue.deadline.algorithmEfficiency);
        stats[key].deadline.systemEfficiency.push(item.queue.deadline.systemEfficiency);
        stats[key].deadline.ticks.push(item.queue.deadline.ticks);

        stats[key].connectivityPath.acceleration.push(item.queue.connectivityPath.acceleration);
        stats[key].connectivityPath.algorithmEfficiency.push(item.queue.connectivityPath.algorithmEfficiency);
        stats[key].connectivityPath.systemEfficiency.push(item.queue.connectivityPath.systemEfficiency);
        stats[key].connectivityPath.ticks.push(item.queue.connectivityPath.ticks);

        stats[key].pathConnectivity.acceleration.push(item.queue.pathConnectivity.acceleration);
        stats[key].pathConnectivity.algorithmEfficiency.push(item.queue.pathConnectivity.algorithmEfficiency);
        stats[key].pathConnectivity.systemEfficiency.push(item.queue.pathConnectivity.systemEfficiency);
        stats[key].pathConnectivity.ticks.push(item.queue.pathConnectivity.ticks);
    }

    for (const [key, value] of Object.entries(stats)) {
        stats[key].deadline.acceleration =
            stats[key].deadline.acceleration.length == 0
                ? 0
                : (stats[key].deadline.acceleration.reduce((a, b) => a + b, 0) / stats[key].deadline.acceleration.length);
        stats[key].deadline.algorithmEfficiency =
            stats[key].deadline.algorithmEfficiency.length == 0
                ? 0
                : (stats[key].deadline.algorithmEfficiency.reduce((a, b) => a + b, 0) / stats[key].deadline.algorithmEfficiency.length);
        stats[key].deadline.systemEfficiency =
            stats[key].deadline.systemEfficiency.length == 0
                ? 0
                : (stats[key].deadline.systemEfficiency.reduce((a, b) => a + b, 0) / stats[key].deadline.systemEfficiency.length);
        stats[key].deadline.ticks =
            stats[key].deadline.ticks.length == 0
                ? 0
                : (stats[key].deadline.ticks.reduce((a, b) => a + b, 0) / stats[key].deadline.ticks.length);


        stats[key].connectivityPath.acceleration =
            stats[key].connectivityPath.acceleration.length == 0
                ? 0
                : (stats[key].connectivityPath.acceleration.reduce((a, b) => a + b, 0) / stats[key].connectivityPath.acceleration.length);
        stats[key].connectivityPath.algorithmEfficiency =
            stats[key].connectivityPath.algorithmEfficiency.length == 0
                ? 0
                : (stats[key].connectivityPath.algorithmEfficiency.reduce((a, b) => a + b, 0) / stats[key].connectivityPath.algorithmEfficiency.length);
        stats[key].connectivityPath.systemEfficiency =
            stats[key].connectivityPath.systemEfficiency.length == 0
                ? 0
                : (stats[key].connectivityPath.systemEfficiency.reduce((a, b) => a + b, 0) / stats[key].connectivityPath.systemEfficiency.length);
        stats[key].connectivityPath.ticks =
            stats[key].connectivityPath.ticks.length == 0
                ? 0
                : (stats[key].connectivityPath.ticks.reduce((a, b) => a + b, 0) / stats[key].connectivityPath.ticks.length);
        

        stats[key].pathConnectivity.acceleration =
            stats[key].pathConnectivity.acceleration.length == 0
                ? 0
                : (stats[key].pathConnectivity.acceleration.reduce((a, b) => a + b, 0) / stats[key].pathConnectivity.acceleration.length);
        stats[key].pathConnectivity.algorithmEfficiency =
            stats[key].pathConnectivity.algorithmEfficiency.length == 0
                ? 0
                : (stats[key].pathConnectivity.algorithmEfficiency.reduce((a, b) => a + b, 0) / stats[key].pathConnectivity.algorithmEfficiency.length);
        stats[key].pathConnectivity.systemEfficiency =
            stats[key].pathConnectivity.systemEfficiency.length == 0
                ? 0
                : (stats[key].pathConnectivity.systemEfficiency.reduce((a, b) => a + b, 0) / stats[key].pathConnectivity.systemEfficiency.length);
        stats[key].pathConnectivity.ticks =
            stats[key].pathConnectivity.ticks.length == 0
                ? 0
                : (stats[key].pathConnectivity.ticks.reduce((a, b) => a + b, 0) / stats[key].pathConnectivity.ticks.length);
    }

    return stats;
}