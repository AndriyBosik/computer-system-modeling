import { MESSAGE_PROCESS_COLOR, PACKET_PROCESS_COLOR, RADIUS, TASK_COLOR } from "../metadata/const";

export const findIntersectionBetweenCircleAndLine = (from, to) => {
    const distance = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    const xLength = RADIUS * Math.abs(from.x - to.x) / distance;
    const yLength = RADIUS * Math.abs(from.y - to.y) / distance;
    return {
        x: to.x > from.x ? (to.x - xLength) : (to.x + xLength),
        y: to.y > from.y ? (to.y - yLength) : (to.y + yLength)
    }
}

export const clearCanvas = canvas => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export const drawTask = (canvas, task) => {
    clearCanvas(canvas);
    const context = canvas.getContext("2d");
    const taskMap = {};
    for (const el of task.tasks) {
        const x = el.x;
        const y = el.y;

        context.globalCompositeOperation = "source-over";
        context.beginPath();
            
        context.arc(x, y, RADIUS, 0, 2 * Math.PI);
        context.fillStyle = TASK_COLOR;
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = "black";
        context.stroke();

        context.font = "15pt Calibri";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(`${el.id} | ${el.weight}`, x, y + 3);
        
        taskMap[el.id] = el;
    }

    for (const el of task.relations) {
        const task1 = taskMap[el.id1];
        const task2 = taskMap[el.id2];
        
        context.globalCompositeOperation = "destination-over";
        context.beginPath();
        context.moveTo(task1.x, task1.y);
        context.lineTo(task2.x, task2.y);
        context.lineWidth = 3;
        context.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context.stroke();
        
        context.globalCompositeOperation = "source-over";
        context.textAlign = "center";
        context.font = "20pt Calibri";
        context.fillStyle = "red";
        context.fillText(`${el.weight}`, (task1.x + task2.x) / 2, (task1.y + task2.y) / 2);

        const intersection = findIntersectionBetweenCircleAndLine(task1, task2);
        drawArrow(canvas, task1, intersection);
    }
}

export const drawSystem = (canvas, system) => {
    clearCanvas(canvas);
    const context = canvas.getContext("2d");
    const processMap = {};
    for (const el of system.processes) {
        const x = el.x;
        const y = el.y;

        context.globalCompositeOperation = "source-over";
        context.beginPath();
            
        context.arc(x, y, RADIUS, 0, 2 * Math.PI);
        context.fillStyle = el.type == "message" ? MESSAGE_PROCESS_COLOR : PACKET_PROCESS_COLOR;
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = "black";
        context.stroke();

        context.font = "15pt Calibri";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(
            el.type == "message" ? el.id : `${el.id} | ${el.packetsSize}`,
            x,
            y + 3);
        
        processMap[el.id] = el;
    }

    for (const el of system.relations) {
        const process1 = processMap[el.id1];
        const process2 = processMap[el.id2];
        
        context.globalCompositeOperation = "destination-over";
        context.beginPath();
        context.moveTo(process1.x, process1.y);
        context.lineTo(process2.x, process2.y);
        context.lineWidth = 3;
        context.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context.stroke();
    }
}

export const drawArrow = (canvas, from, to) => {
    const headlen = 15;
    const context = canvas.getContext("2d");
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    context.moveTo(to.x, to.y);
    context.lineTo(to.x - headlen*Math.cos(angle - Math.PI / 6), to.y - headlen*Math.sin(angle - Math.PI / 6));
    context.moveTo(to.x, to.y);
    context.lineTo(to.x - headlen*Math.cos(angle + Math.PI / 6), to.y - headlen*Math.sin(angle + Math.PI / 6));
    context.stroke();
}

export const doesIntersectsCircleAndLine = (x1, y1, x2, y2, x, y, r) => {
    const m = x2 == x1 ? null : (y2 - y1) / (x2 - x1);
    const b = m == null ? x1 : y1 - m * x1;

    const A = 1 + m*m;
    const B = 2*(m*(b - y) - x);
    const C = x*x + (b - y)*(b - y) - r*r;

    const discriminant = B*B - 4*A*C;

    return discriminant > 0;
}
