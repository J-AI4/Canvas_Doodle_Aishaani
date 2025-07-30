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