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


/* ===== 背景音乐：本地 mp3 优先，否则 Web Audio 合成星尘氛围音 ===== */
let bgmOn = localStorage.getItem('tarot_bgm') !== '0';
let bgmCtx = null, bgmMaster = null;

function startBgm() {
    if (!bgmOn) return;
    if (bgmCtx) { bgmCtx.resume().catch(()=>{}); return; }
    try {
        bgmCtx = new (window.AudioContext || window.webkitAudioContext)();
        bgmMaster = bgmCtx.createGain();
        bgmMaster.gain.value = 0;
        bgmMaster.connect(bgmCtx.destination);
        bgmMaster.gain.linearRampToValueAtTime(0.05, bgmCtx.currentTime + 2.5);
        const mk = (freq, vol) => {
            const o = bgmCtx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
            const g = bgmCtx.createGain(); g.gain.value = vol;
            o.connect(g); g.connect(bgmMaster); o.start(); return g;
        };
        const g1 = mk(110, 0.5), g2 = mk(164.81, 0.16);
        const lfo = bgmCtx.createOscillator(); lfo.frequency.value = 0.08;
        const lfoG = bgmCtx.createGain(); lfoG.gain.value = 0.02;
        lfo.connect(lfoG); lfoG.connect(g1.gain); lfo.start();
        const notes = [220, 246.94, 261.63, 293.66, 329.63, 392.0];
        const bell = () => {
            if (!bgmCtx || !bgmOn) return;
            const t = bgmCtx.currentTime;
            const o = bgmCtx.createOscillator(); o.type = 'sine';
            o.frequency.value = notes[Math.floor(Math.random() * notes.length)] * 2;
            const g = bgmCtx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.045, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
            o.connect(g); g.connect(bgmMaster);
            o.start(t); o.stop(t + 3);
            setTimeout(bell, 3200 + Math.random() * 5200);
        };
        setTimeout(bell, 1800);
    } catch (e) { bgmCtx = null; }
}

function toggleBgm(btn) {
    bgmOn = !bgmOn;
    localStorage.setItem('tarot_bgm', bgmOn ? '1' : '0');
    if (btn) btn.textContent = bgmOn ? '🎵 音乐 · 开' : '🔇 音乐 · 关';
    if (bgmOn) startBgm();
    else if (bgmCtx) bgmCtx.suspend().catch(()=>{});
    showToast(bgmOn ? '背景音乐已开启' : '背景音乐已关闭');
}
