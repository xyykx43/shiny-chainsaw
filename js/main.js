document.getElementById('changelogHeader').addEventListener('click', () => { const content = document.getElementById('changelogContent'); content.classList.toggle('open'); const icon = document.querySelector('#changelogHeader span:last-child'); icon.textContent = content.classList.contains('open') ? '▲' : '▼'; });
document.getElementById('enterBtn').onclick = () => {
    const cover = document.getElementById('coverLayer'), pane = document.getElementById('divinationPane');
    if (cover.classList.contains('leaving')) return;
    cover.classList.add('leaving');
    setTimeout(() => {
        cover.style.display = 'none';
        pane.classList.add('active');
        startBgm();
        loadState(); showTodayCard();
    }, 520);
};
document.getElementById('drawBtn').onclick=()=>drawCards(null);
document.getElementById('themeToggleBtn').onclick=()=>{ document.body.classList.toggle('dark'); localStorage.setItem('tarot_dark',document.body.classList.contains('dark')?'1':'0'); };
const bgmBtn = document.getElementById('bgmToggleBtn');
if (bgmBtn) { bgmBtn.textContent = bgmOn ? '🎵 音乐 · 开' : '🔇 音乐 · 关'; bgmBtn.onclick = () => toggleBgm(bgmBtn); }
document.getElementById('clearHistoryBtn').onclick=()=>{ history=[]; localStorage.removeItem('tarot_history'); renderHistory(); showToast("历史清空"); };
document.getElementById('exportBtn').onclick=exportResult;
document.getElementById('shareImageBtn').onclick=generateShareImage;
document.getElementById('favoriteBtn').onclick=()=>{ vibShort(); saveFavorite(); };
document.getElementById('toggleFavBtn').onclick=()=>{ document.getElementById('favoritesPanel').classList.toggle('active'); if(document.getElementById('favoritesPanel').classList.contains('active')) renderFavorites(); };
document.getElementById('clearInputBtn').onclick=()=>{ document.getElementById('questionInput').value=''; };
document.querySelectorAll('.quick-tag').forEach(btn=>btn.onclick=()=>{ document.getElementById('questionInput').value=btn.getAttribute('data-quick'); });
document.getElementById('toggleManualBtn').onclick=()=>{ document.getElementById('manualPanel').classList.toggle('active'); if(document.getElementById('manualPanel').classList.contains('active')) updateManualInputs(); };
const manualDrawBtn = document.getElementById('manualDrawBtn');
manualDrawBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('.manual-input');
    const ids = [];
    for(let inp of inputs){
        let raw = inp.value.trim();
        if(raw === "") continue;
        let v = parseInt(raw, 10);
        if(isNaN(v) || v < 1 || v > 78){ showToast(`编号 ${raw} 无效，请输入1~78的数字`); return; }
        ids.push(v);
    }
    if(ids.length === 0){ showToast("请在输入框中填写卡牌编号（1~78）"); return; }
    if(new Set(ids).size !== ids.length){ showToast("请勿重复输入相同的编号"); return; }
    const cards = ids.map(id => allCards[id-1]);
    if(cards.some(c => !c)){ showToast("无效的卡牌编号，请确认1~78"); return; }
    manualDrawCards(cards);
});
// 背景音乐外链已失效，暂时移除；如需要可换成本地 mp3 再接入
document.getElementById('cardModal').onclick=e=>{ if(e.target===document.getElementById('cardModal')) document.getElementById('cardModal').classList.remove('active'); };
document.getElementById('spreadSelect').onchange=()=>{ vibShort(); updateManualInputs(); };
document.getElementById('historySearch').addEventListener('input',()=>renderHistory());
// 全量备份 / 导入（历史 + 收藏 + 主题）
document.getElementById('backupBtn').onclick = () => {
    const data = { app: '星尘·古牌', version: 2, exportedAt: new Date().toISOString(), history, favorites, dark: document.body.classList.contains('dark') };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星尘古牌_备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("备份已导出");
};
document.getElementById('importBtn').onclick = () => document.getElementById('importFile').click();
document.getElementById('importFile').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const d = JSON.parse(reader.result);
            const seen = new Set(history.map(h => h.time + '|' + h.question + '|' + (h.cards || []).join(',')));
            (Array.isArray(d.history) ? d.history : []).forEach(h => {
                const key = h.time + '|' + h.question + '|' + (h.cards || []).join(',');
                if (!seen.has(key)) { seen.add(key); history.push(h); }
            });
            history = history.slice(0, 200);
            if (Array.isArray(d.favorites)) {
                const fseen = new Set(favorites.map(f => f.time + '|' + f.question));
                d.favorites.forEach(f => { const k = f.time + '|' + f.question; if (!fseen.has(k)) { fseen.add(k); favorites.push(f); } });
                favorites = favorites.slice(-50);
            }
            localStorage.setItem('tarot_history', JSON.stringify(history));
            localStorage.setItem('tarot_favorites', JSON.stringify(favorites));
            renderHistory(); renderFavorites();
            showToast(`已导入 ${history.length} 条历史 / ${favorites.length} 条收藏`);
        } catch (err) { showToast("文件格式不对"); }
        e.target.value = '';
    };
    reader.readAsText(file);
};
document.getElementById('exportFavBtn').onclick=()=>{ let dataStr=JSON.stringify(favorites); let blob=new Blob([dataStr],{type:'application/json'}); let url=URL.createObjectURL(blob); let a=document.createElement('a'); a.href=url; a.download='tarot_favorites.json'; a.click(); URL.revokeObjectURL(url); };
let touchStartX=0; document.getElementById('questionInput').addEventListener('touchstart',e=>{ touchStartX=e.touches[0].clientX; }); document.getElementById('questionInput').addEventListener('touchend',e=>{ let diff=e.changedTouches[0].clientX-touchStartX; if(diff<-50) document.getElementById('questionInput').value=''; });
(function(){ if(localStorage.getItem('tarot_dark')==='1') document.body.classList.add('dark'); updateManualInputs(); loadState(); setInterval(()=>{ if(currentCards.length) saveSession(); },3000); })();
document.getElementById('modeStandardBtn').onclick=()=>setMode('standard');
document.getElementById('ModeSelectBtn').onclick=()=>setMode('select');
const donateBtn = document.getElementById('candyDonateBtn');
const donateModal = document.getElementById('donateModal');
const closeDonate = document.querySelector('.donate-close');
if (donateBtn) donateBtn.onclick = () => { donateModal.style.display = 'flex'; };
if (closeDonate) closeDonate.onclick = () => { donateModal.style.display = 'none'; };
window.onclick = (event) => { if (event.target === donateModal) donateModal.style.display = 'none'; };

// PWA：注册 Service Worker（仅 HTTPS 生效，本地打开自动跳过）
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
