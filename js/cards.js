// ==================== 牌库 78张 ====================
const allCards = [];
const majorNames = ["愚者","魔术师","女祭司","女皇","皇帝","教皇","恋人","战车","力量","隐士","命运之轮","正义","倒吊人","死神","节制","恶魔","高塔","星星","月亮","太阳","审判","世界"];
for (let i=0; i<22; i++) allCards.push({ id: i+1, name: majorNames[i], suit: "大阿卡纳", type: "major" });
const suits = ["权杖","圣杯","宝剑","星币"];
for (let s of suits) {
    for (let i=1; i<=10; i++) allCards.push({ id: allCards.length+1, name: `${s}${i}`, suit: s, type: "minor" });
    ["侍从","骑士","王后","国王"].forEach(court => allCards.push({ id: allCards.length+1, name: `${s}·${court}`, suit: s, type: "court" }));
}
