
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const eraserBtn = document.getElementById('eraserBtn');
const fillBtn = document.getElementById('fillBtn');

let isDrawing = false;
let isEraser = false;
let isFill = false;
let lastX = 0;
let lastY = 0;
let strokeHistory = [];

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function saveState() {
    if (strokeHistory.length >= 20) strokeHistory.shift();
    strokeHistory.push(canvas.toDataURL());
}

function startDrawing(e) {
    saveState();
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getMousePos(e);

    if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.lineWidth = brushSize.value;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];

}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX || e.touches?.[0]?.clientX) - rect.left,
        (e.clientY || e.touches?.[0]?.clientY) - rect.top
    ];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function undo() {
    if (strokeHistory.length == 0) return;
    const previousState = new Image();
    previousState.src = strokeHistory.pop();
    previousState.onload = () => {
        clearCanvas();
        ctx.drawImage(previousState, 0, 0);
    };
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'my_doodle.png';
    link.href = canvas.toDataURL();
    link.click();
}

function hexToRgba(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
    const bigint = parseInt(hex, 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
        255
    ];
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function floodFill(startX, startY, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;

    const stack = [[startX, startY]];
    const startPos = (startY * width + startX) * 4;
    const startColor = [
        data[startPos],
        data[startPos + 1],
        data[startPos + 2],
        data[startPos + 3]
    ];

    if (colorsMatch(startColor, fillColor)) return;

    while (stack.length) {
        const [x, y] = stack.pop();
        if (x < 0 || y < 0 || x >= width || y >= height) continue;

        const pos = (y * width + x) * 4;
        const currentColor = [
            data[pos],
            data[pos + 1],
            data[pos + 2],
            data[pos + 3]
        ];

        if (colorsMatch(currentColor, startColor)) {
            data[pos] = fillColor[0];
            data[pos + 1] = fillColor[1];
            data[pos + 2] = fillColor[2];
            data[pos + 3] = fillColor[3];

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', () => {
    saveState();
    clearCanvas();
})

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.backgroundColor = isEraser ? '#ddd' : '#fff';
});

fillBtn.addEventListener('click', () => {
    isFill = !isFill;
    isEraser = false;
    fillBtn.style.backgroundColor = isFill ? '#ddd' : '#fff';
    eraserBtn.style.backgroundColor = '#fff';
});

canvas.addEventListener('click', (e) => {
    if (isFill) {
        saveState();
        const [x, y] = getMousePos(e);
        const fillColor = hexToRgba(colorPicker.value);
        floodFill(Math.floor(x), Math.floor(y), fillColor);
    }
});

undoBtn.addEventListener('click', undo);
downloadBtn.addEventListener('click', downloadCanvas);