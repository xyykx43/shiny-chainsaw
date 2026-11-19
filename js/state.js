// ==================== 全局变量与核心逻辑（完整保留） ====================
let history = [], favorites = [], currentCards = [], currentReverses = [], currentQuestion = "", currentSpread = 3, musicPlaying = false, isDrawing = false;
let lastDrawQuestion = "", lastDrawAt = 0;
let audioCtx = null;
let currentMode = "standard";
let currentSelection = [], currentCandidates = [], selectionNeeded = 3;
let isManualUnlocked = false;
let hasShownUnlockTip = false;

function showToast(msg) { let t=document.getElementById('toastMsg'); t.textContent=msg; t.style.opacity='1'; clearTimeout(t._to); t._to=setTimeout(()=>t.style.opacity='0',2000); }
function vibShort() { if(navigator.vibrate) navigator.vibrate(20); }
async function initAudio() { if(audioCtx) return audioCtx; audioCtx = new (window.AudioContext||window.webkitAudioContext)(); await audioCtx.resume(); return audioCtx; }
async function playShuffleSound() { try { let ctx=await initAudio(); let dur=0.3; let size=ctx.sampleRate*dur; let buf=ctx.createBuffer(1,size,ctx.sampleRate); let data=buf.getChannelData(0); for(let i=0;i<size;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/size,2)*0.3; let src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination); src.start(); } catch(e){} }
