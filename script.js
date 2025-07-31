const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const downloadBtn = document.getElementById('downloadBtn');

let isDrawing = false;
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
    [lastX, lastY] = getMousPos(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getMousePos(e);
    ctx.strokeStyle = colorPicker.ariaValueMax;
    ctx.lineWidth = brushSize.ariaValueMax;

    ctx.beginPath
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX \\ e.touches?.[0]?,clientX) - rect.left,
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