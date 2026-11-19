function standardDraw(manualCards) {
    let q = document.getElementById('questionInput').value.trim();
    if(!q) { showToast("请写下问题"); return; }
    if(isDrawing) return;
    const nowTs = Date.now();
    if (q === lastDrawQuestion && nowTs - lastDrawAt < 30000) showToast("同一问题刚抽过，先让牌意沉淀一下");
    lastDrawQuestion = q; lastDrawAt = nowTs;
    isDrawing=true; setTimeout(()=>isDrawing=false,1200);
    vibShort(); playShuffleSound();
    let spread = parseInt(document.getElementById('spreadSelect').value);
    currentSpread = spread;
    let cards, revs;
    if(manualCards) { cards=manualCards; revs=cards.map(()=>Math.random()<0.5); }
    else {
        // 洗牌后取前 N 张，避免同一牌阵出现重复牌
        const pool = allCards.slice();
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        cards = pool.slice(0, spread);
        revs = cards.map(() => Math.random() < 0.5);
    }
    currentCards=cards; currentReverses=revs; currentQuestion=q;
    let area = document.getElementById('resultArea');
    area.style.opacity='0';
    let html = `<div class="spread-area" id="spreadArea">`;
    for(let i=0;i<spread;i++) {
        html += `<div class="card-container" data-idx="${i}" data-flipped="false">
            <div class="card-inner">
                <div class="card-front">
                    <img src="${getCardImageUrl(cards[i].id)}" loading="lazy" onerror="this.style.display='none'">
                    <div class="card-name">${cards[i].name}</div>
                    <div class="card-orient">${revs[i]?'逆位':'正位'}</div>
                    <div class="card-short">${(cardMeanings[cards[i].name]? (revs[i]?cardMeanings[cards[i].name].rev:cardMeanings[cards[i].name].up):"").substring(0,80)}...</div>
                </div>
                <div class="card-back"><img src="${getBackImageUrl()}" alt="牌背"></div>
            </div>
        </div>`;
    }
    html += `</div><div style="text-align:center;margin:16px 0;"><button id="flipAllBtn" class="btn-draw" style="font-size:0.8rem;">✦ 全部翻开 ✦</button></div><div id="fullInterpretation" style="display:none;"></div>`;
    area.innerHTML = html;
    area.style.opacity='1';
    const flipAllBtn = document.getElementById('flipAllBtn');
    if (flipAllBtn) flipAllBtn.onclick = () => { document.querySelectorAll('.card-container:not(.flipped)').forEach(c => c.click()); flipAllBtn.style.display = 'none'; };
    document.querySelectorAll('.card-container').forEach(container => {
        container.addEventListener('click', function(e) {
            if(this.classList.contains('flipped')) return;
            this.classList.add('flipped');
            vibShort();
            const allContainers = document.querySelectorAll('.card-container');
            const allFlipped = Array.from(allContainers).every(c => c.classList.contains('flipped'));
            if(allFlipped) {
                const interp = generateFullInterpretation(cards, revs, q, spread);
                const interpDiv = document.getElementById('fullInterpretation');
                interpDiv.innerHTML = `<div class="reading-block">${interp.replace(/\n/g,'<br>')}</div>`;
                interpDiv.style.display = 'block';
                history.unshift({question:q, cards:cards.map(c=>c.id), reverses:revs, spread:spread, interp:interp, time:new Date().toLocaleString()});
                if(history.length>30) history.pop();
                localStorage.setItem('tarot_history', JSON.stringify(history));
                renderHistory();
            }
        });
    });
    if(!isManualUnlocked) {
        isManualUnlocked = true;
        if(!hasShownUnlockTip) { showToast("🔓 自选编号已解锁"); hasShownUnlockTip = true; }
    }
}

function startSelectMode() {
    const q = document.getElementById('questionInput').value.trim();
    if(!q) { showToast("请写下问题"); return; }
    if(isDrawing) return;
    const nowTs = Date.now();
    if (q === lastDrawQuestion && nowTs - lastDrawAt < 30000) showToast("同一问题刚抽过，先让牌意沉淀一下");
    lastDrawQuestion = q; lastDrawAt = nowTs;
    isDrawing=true; setTimeout(()=>isDrawing=false,1200);
    vibShort(); playShuffleSound();
    const spread = parseInt(document.getElementById('spreadSelect').value);
    selectionNeeded = spread;
    currentSpread = spread;
    currentQuestion = q;
    const candidateCount = 20;
    currentCandidates = [];
    const usedIds = new Set();
    while(currentCandidates.length < candidateCount && usedIds.size < allCards.length) {
        let card = allCards[Math.floor(Math.random() * allCards.length)];
        if(!usedIds.has(card.id)) {
            usedIds.add(card.id);
            currentCandidates.push(card);
        }
    }
    currentSelection = [];
    const area = document.getElementById('resultArea');
    area.style.opacity='0';
    let html = `<div class="select-area" id="selectArea">`;
    for(let i=0; i<currentCandidates.length; i++) {
        html += `<div class="select-card" data-idx="${i}"><img src="${getBackImageUrl()}" alt="牌背"></div>`;
    }
    html += `</div><div style="text-align:center; margin-top:10px;"><span id="selectionCount">已选 0 / ${spread}</span> <button id="resetSelectionBtn" class="btn-draw" style="font-size:0.8rem;">重置选择</button></div>`;
    area.innerHTML = html;
    area.style.opacity='1';
    const cardsDiv = document.querySelectorAll('.select-card');
    cardsDiv.forEach((el, idx) => {
        el.addEventListener('click', () => {
            if(currentSelection.length >= spread && !el.classList.contains('selected')) {
                showToast(`最多只能选 ${spread} 张牌`);
                return;
            }
            if(el.classList.contains('selected')) {
                const selectedIdx = currentSelection.findIndex(s => s.candidateIdx === idx);
                if(selectedIdx !== -1) {
                    currentSelection.splice(selectedIdx, 1);
                    el.classList.remove('selected');
                }
            } else {
                const card = currentCandidates[idx];
                const rev = Math.random() < 0.5;
                currentSelection.push({ card, rev, candidateIdx: idx });
                el.classList.add('selected');
            }
            document.getElementById('selectionCount').innerText = `已选 ${currentSelection.length} / ${spread}`;
            if(currentSelection.length === spread) {
                revealSelectedCards();
                if(!isManualUnlocked) {
                    isManualUnlocked = true;
                    if(!hasShownUnlockTip) { showToast("🔓 自选编号已解锁"); hasShownUnlockTip = true; }
                }
            }
        });
    });
    document.getElementById('resetSelectionBtn').addEventListener('click', () => {
        document.querySelectorAll('.select-card').forEach(el => el.classList.remove('selected'));
        currentSelection = [];
        document.getElementById('selectionCount').innerText = `已选 0 / ${spread}`;
    });
}

function revealSelectedCards() {
    if(currentSelection.length !== selectionNeeded) return;
    const cards = currentSelection.map(s => s.card);
    const revs = currentSelection.map(s => s.rev);
    currentCards = cards;
    currentReverses = revs;
    const interp = generateFullInterpretation(currentCards, currentReverses, currentQuestion, currentSpread);
    const area = document.getElementById('resultArea');
    let html = `<div class="revealed-area">`;
    for(let i=0; i<cards.length; i++) {
        const imgUrl = getCardImageUrl(cards[i].id);
        const meaningShort = (cardMeanings[cards[i].name]? (revs[i]?cardMeanings[cards[i].name].rev:cardMeanings[cards[i].name].up):"").substring(0,80);
        html += `<div class="card-result">
            <img src="${imgUrl}" onerror="this.style.display='none'">
            <div class="card-name">${cards[i].name}</div>
            <div class="card-orient">${revs[i]?'逆位':'正位'}</div>
            <div class="card-short">${meaningShort}...</div>
        </div>`;
    }
    html += `</div><div class="reading-block">${interp.replace(/\n/g,'<br>')}</div>`;
    area.innerHTML = html;
    history.unshift({question:currentQuestion, cards:cards.map(c=>c.id), reverses:revs, spread:currentSpread, interp:interp, time:new Date().toLocaleString()});
    if(history.length>30) history.pop();
    localStorage.setItem('tarot_history', JSON.stringify(history));
    renderHistory();
}

function manualDrawCards(manualCards) {
    if(!isManualUnlocked) { showToast("🔒 请先点击「开始翻牌」解锁自选编号功能。"); return; }
    if(!manualCards || manualCards.length === 0) { showToast("请至少输入一个编号"); return; }
    let q = document.getElementById('questionInput').value.trim();
    if(!q) { showToast("请先写下问题"); return; }
    if(isDrawing) return;
    isDrawing=true; setTimeout(()=>isDrawing=false,1200);
    vibShort(); playShuffleSound();
    let spread = parseInt(document.getElementById('spreadSelect').value);
    currentSpread = spread;
    let cards = manualCards;
    let revs = cards.map(()=>Math.random()<0.5);
    currentCards=cards; currentReverses=revs; currentQuestion=q;
    let interp = generateFullInterpretation(cards, revs, q, spread);
    let area = document.getElementById('resultArea');
    let html = `<div class="revealed-area">`;
    for(let i=0;i<cards.length;i++) {
        const imgUrl = getCardImageUrl(cards[i].id);
        const meaningShort = (cardMeanings[cards[i].name]? (revs[i]?cardMeanings[cards[i].name].rev:cardMeanings[cards[i].name].up):"").substring(0,80);
        html += `<div class="card-result">
            <img src="${imgUrl}" onerror="this.style.display='none'">
            <div class="card-name">${cards[i].name}</div>
            <div class="card-orient">${revs[i]?'逆位':'正位'}</div>
            <div class="card-short">${meaningShort}...</div>
        </div>`;
    }
    html += `</div><div class="reading-block">${interp.replace(/\n/g,'<br>')}</div>`;
    area.innerHTML = html;
    history.unshift({question:q, cards:cards.map(c=>c.id), reverses:revs, spread:spread, interp:interp, time:new Date().toLocaleString()});
    if(history.length>30) history.pop();
    localStorage.setItem('tarot_history', JSON.stringify(history));
    renderHistory();
}

function drawCards(manualCards) {
    if(currentMode === "standard") standardDraw(manualCards);
    else startSelectMode();
}
function setMode(mode) {
    currentMode = mode;
    if(mode === "standard") { document.getElementById('modeStandardBtn').classList.add('active'); document.getElementById('ModeSelectBtn').classList.remove('active'); }
    else { document.getElementById('modeStandardBtn').classList.remove('active'); document.getElementById('ModeSelectBtn').classList.add('active'); }
}
