const TOPO_RADIUS = 400;

export const generateTask = (width, height, vertexes, matrix) => {
    const center = {
        x: width / 2,
        y: height / 2
    };
    const relations = [];
    const tasks = [
        {
            id: 1,
            weight: vertexes[0],
            x: center.x,
            y: center.y - TOPO_RADIUS
        }
    ];

    const rotateAngle = 2*Math.PI / vertexes.length;

    for (let i = 1; i < vertexes.length; i++) {
        const x0 = tasks[i - 1].x - center.x;
        const y0 = tasks[i - 1].y - center.y;
        tasks.push({
            id: i + 1,
            weight: vertexes[i],
            x: x0*Math.cos(rotateAngle) - y0*Math.sin(rotateAngle) + center.x,
            y: x0*Math.sin(rotateAngle) + y0*Math.cos(rotateAngle) + center.y
        });
    }

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[i][j] == 0) {
                continue;
            }
            relations.push({
                id1: i + 1,
                id2: j + 1,
                weight: matrix[i][j]
            });
        }
    }

    return {
        tasks,
        relations
    };
}
