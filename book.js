/* ============================================================
   星尘古牌 · 塔罗屋
   独白 → 森林（荆棘/玫瑰）→ 推门 → 玩法 → 发牌 → 飞近 → 变黑
   → 翻牌 → 按牌意起世界 → 解读
   ============================================================ */
const C = {
  ink:'#0A0709', ink2:'#141019', wall:'#201826',
  violet:'#6E5C75', violetD:'#3E3446', violetL:'#8F7C96',
  paper:'#F9EFD7', paperHi:'#FFFCF0', paperMid:'#E8D8B6', paperD:'#C9AC80',
  ochre:'#DE915F', red:'#D93A33'
};
const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const R = s => { let x = s; return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; }; };

/* ============================ 牌库 ============================ */
const MAJOR = ['愚者','魔术师','女祭司','女皇','皇帝','教皇','恋人','战车','力量','隐士','命运之轮',
  '正义','倒吊人','死神','节制','恶魔','高塔','星星','月亮','太阳','审判','世界'];
const SUITS = ['权杖','圣杯','宝剑','星币'];
const RANKS = ['一','二','三','四','五','六','七','八','九','十','侍从','骑士','王后','国王'];
const CARDS = [];
MAJOR.forEach((n, i) => CARDS.push({ id: i + 1, name: n, label: n, suit: '大阿卡纳', rank: 0 }));
SUITS.forEach((s, si) => RANKS.forEach((r, ri) => {
  const num = ri + 1;
  const key = num <= 10 ? s + num : s + '·' + r;   // 与原站牌意表的键一致
  CARDS.push({ id: 23 + si * 14 + ri, name: key, label: s + ' · ' + r, suit: s, rank: num });
}));
const byName = n => CARDS.find(c => c.name === n);

/* 元素：火水风土 → 光、色、浮尘 */
const ELEM = {
  '权杖': { key:'fire', name:'火', tint:'#DE915F', light:1.02, mote:'ember' },
  '圣杯': { key:'water', name:'水', tint:'#8FA6C4', light:.86, mote:'rain' },
  '宝剑': { key:'air', name:'风', tint:'#B9C6CE', light:.94, mote:'wind' },
  '星币': { key:'earth', name:'土', tint:'#C9AC80', light:.92, mote:'dust' },
  '大阿卡纳': { key:'arcana', name:'星', tint:'#C7B3CF', light:1.0, mote:'star' }
};
/* 22 张大牌各自的世界基调：亮度、主色、母题 */
const MAJOR_WORLD = {
  '愚者': { l: 1.08, t:'#E3C88F', m:['cliff','path','moon'] },
  '魔术师': { l: 1.04, t:'#DE915F', m:['gate','wheel','obelisk'] },
  '女祭司': { l: .84, t:'#9FA8C8', m:['veil','moon','pool'] },
  '女皇': { l: 1.10, t:'#A8C49A', m:['garden','rose','tree'] },
  '皇帝': { l: .96, t:'#C9AC80', m:['throne','tower','wall'] },
  '教皇': { l: .90, t:'#C2AE86', m:['arcade','pillar','gate'] },
  '恋人': { l: 1.04, t:'#D8A6A0', m:['twintower','rose','path'] },
  '战车': { l: 1.00, t:'#C7B3CF', m:['bridge','wall','moon'] },
  '力量': { l: 1.02, t:'#DE915F', m:['tree','vine','cliff'] },
  '隐士': { l: .80, t:'#B7A888', m:['lamp','tower','cliff'] },
  '命运之轮': { l: .94, t:'#C7B3CF', m:['wheel','arcade','star'] },
  '正义': { l: .92, t:'#BCC6CE', m:['pillar','scales','gate'] },
  '倒吊人': { l: .86, t:'#B9C6CE', m:['tree','veil','pool'] },
  '死神': { l: .74, t:'#8E7B93', m:['deadwood','gate','moon'] },
  '节制': { l: 1.02, t:'#9FB6C0', m:['pool','path','star'] },
  '恶魔': { l: .72, t:'#C0703F', m:['chain','tower','fire'] },
  '高塔': { l: .78, t:'#8AA0B4', m:['tower','cliff','rain'] },
  '星星': { l: 1.06, t:'#BCCFE0', m:['star','pool','moon'] },
  '月亮': { l: .88, t:'#9FA8C8', m:['moon','pool','ovine'] },
  '太阳': { l: 1.20, t:'#E7B25F', m:['sun','garden','wall'] },
  '审判': { l: .96, t:'#C7B3CF', m:['gate','bell','arcade'] },
  '世界': { l: 1.08, t:'#A8C49A', m:['ring','arcade','star'] }
};

/* ============================ 78 张牌意（原文，未改） ============================ */
const MEANINGS={
"愚者":{u:"天真如初生之犊，脚下是未知的悬崖，心中却是星辰大海。你即将踏上一段全新的旅程，无关经验只关乎勇气。这张牌提醒你：信任内在的冲动，但别忘了带上行囊。",r:"愚者的步伐被迟疑绊倒。你害怕出丑，或者过度依赖他人的意见。真正的危险不是悬崖，而是停在原地假装看不见梦想。请找回那份不计后果的纯真。"},
"魔术师":{u:"四元素齐聚指尖，你拥有创造现实所需的一切工具。清晰的意图+坚定的行动=显化奇迹。现在不是犹豫的时刻，而是将灵感化为物质的黄金瞬间。",r:"牌面倒转，能量错位。你可能在欺骗自己或他人，或者空有才华却无从下手。检查你的动机——是恐惧在操纵你吗？先清空杂念，再重新连接你的力量。"},
"女祭司":{u:"月光下的幕帘之后，藏着所有未说出的真理。你需要的答案不在外界，而在静默的呼吸之间。信任直觉，即使它无法用逻辑解释。",r:"忽视内心的声音，会被表面喧嚣淹没。你可能压抑了灵性的一面，或者过度依赖理性的分析。请给自己一段独处的时间，那扇门并未关闭。"},
"女皇":{u:"大地丰饶，情感绽放。你正处在创造与滋养的高峰——孕育新生命、新项目或新阶段的自我。敞开接受宇宙的馈赠，分享你的温柔力量。",r:"创造力受阻，或过度牺牲自我。你可能在照顾别人时遗忘了自己，或感到情感枯竭。回归大自然，触碰土地，重新连接你内在的女皇能量。"},
"皇帝":{u:"秩序的基石，权威的象征。你需要像皇帝一样制定规则、建立结构。理性控制情绪，长远规划胜过一时冲动。这是建立事业或稳固家庭的好时机。",r:"权威受挑战或变成暴君。你可能过于严苛、固执，或者相反——软弱无力，不敢承担责任。寻找平衡点：温柔而坚定地守护你的疆域。"},
"教皇":{u:"传统与信仰的桥梁。你可能会遇到导师、贵人，或者需要遵循某种既定体系。群体智慧有时比个人冒险更安全。婚礼、教育、精神仪式皆受庇佑。",r:"教条束缚或反叛。你可能在抗拒常规，或遇到了虚伪的权威。不要盲从，也不要为了叛逆而叛逆——聆听自己内在的道德指南针。"},
"恋人":{u:"重大的选择，关于爱与价值观。这张牌不只代表浪漫，更是灵魂的契约。你需要做出忠于本心的决定，天平两端都是礼物，但只能选一个。",r:"关系失衡或自我矛盾。你可能逃避承诺，或者在两个选项之间反复拉扯。回到初心，问问自己：什么才是我真正不后悔的答案？"},
"战车":{u:"意志力驾驭矛盾的对立。黑马白马象征你内在的冲突，但只要紧握缰绳，就能驶向胜利。坚持、自律、不放弃——前方就是荣耀。",r:"失控的马车横冲直撞。你可能被情绪淹没，或目标模糊导致行动无效。停下来，重新校准方向，有时候后退是为了更好的跳跃。"},
"力量":{u:"以柔克刚，驯服内心的野兽。真正的力量不是嘶吼，而是耐心与同理心。你正用温柔化解一场冲突，或者克服某种瘾症。狮子愿意低下头，是因为你值得信赖。",r:"内在的野性失控。你可能压抑愤怒太久，导致突然爆发；或感到软弱无力，被他人掌控。学会设立边界，用自信代替攻击。"},
"隐士":{u:"独行于雪山之巅，手中明灯只为自己照亮。这是退隐、内省、寻找深层智慧的时期。暂时离群索居，答案会在寂静中浮现。",r:"孤独演变成孤僻，或拒绝必要的指引。你可能沉溺于自我怀疑，不愿向他人求助。记住：隐士的灯也能照亮同行者的路。"},
"命运之轮":{u:"轮盘转动，好运将至。你无法控制命运的起伏，但可以调整姿态迎接转变。抓住机遇，接受改变——这是宇宙为你安排的转折点。",r:"轮盘卡滞，阻力重重。你可能在抗拒必然的变化，或被困在坏运气的循环里。接受当下的无常，暴风雨总会过去。"},
"正义":{u:"因果之剑，天平不偏不倚。你种下的因正在结果，无论是奖赏还是教训。诚实面对自己，承担应有的责任，法律事务对你有利。",r:"不公正或逃避责任。你可能在自欺欺人，或遭遇不公平对待。检视过去的决定，修正错误的轨迹，正义终将到来。"},
"倒吊人":{u:"自愿的牺牲，换个角度看世界。你被困住，却因此获得顿悟。有时候，放手、投降、等待是最有力的行动。",r:"无谓的挣扎或牺牲毫无意义。你可能在假装奉献，实则逃避核心问题。重新评估你的付出是否值得。"},
"死神":{u:"终结即新生。旧的模式、关系或身份必须死亡，才能让新的生命扎根。不要惧怕结束，它是蜕变的必经之路。",r:"抗拒结束，紧抓不放。你试图用胶水黏合碎掉的花瓶，却划伤了自己。允许悲伤，然后放手，春天藏在冬天的背后。"},
"节制":{u:"融合对立，调和矛盾。你像炼金术士一样，将水火风土化为金丹。耐心、中庸、艺术创作——平衡带来疗愈。",r:"失衡，极端，情绪过山车。你可能暴饮暴食，或工作与生活严重失调。找回你的中心，从小事开始重新平衡。"},
"恶魔":{u:"物质与欲望的锁链。你被困在金钱、权力或性的执念里，以为那是自由。看清枷锁，才能挣脱。",r:"挣脱束缚，觉醒。你开始意识到什么在控制你，并鼓起勇气斩断链条。重获自由的第一步是承认自己曾经被囚禁。"},
"高塔":{u:"轰然崩塌的旧结构。你以为坚固的城堡，其实地基已腐。突如其来的变故是残酷的恩典——它摧毁假象，让你重见蓝天。",r:"灾难缓和，或死死抓住残骸。你可能勉强维持摇摇欲坠的局面，但最终仍会倒塌。主动拆除比被动毁灭更有尊严。"},
"星星":{u:"希望之水浇灌干涸的大地。经历风暴后，你终于看见了北极星。伤口开始结痂，梦想重新发芽。保持信心，宇宙正在回应你的祈祷。",r:"希望黯淡，或无法信任未来。你可能觉得被命运抛弃，失去方向。抬头看看，星星从未熄灭，只是被乌云暂时遮住。"},
"月亮":{u:"潜意识之潮，梦境与恐惧。你走在迷雾笼罩的森林，看不清是敌是友。信任直觉，夜晚的野兽往往只是你自己的阴影。",r:"恐惧消散，真相浮出。混淆的幻觉渐渐清晰，你开始分辨真实与想象。黎明前的黑暗最浓，但曙光已近。"},
"太阳":{u:"光芒万丈，喜悦满溢。所有阴霾一扫而空，你像孩子一样自由奔跑。成功、健康、婚礼、新生——纯粹的快乐时刻。",r:"短暂的阴云，或过度乐观。你可能暂时感到孤独或受挫，但太阳从未消失。再坚持一下，温暖会回来。"},
"审判":{u:"因果清算，灵魂的觉醒。你听到了内心的召唤，必须回应。过去的功过被揭示，宽恕与重生就在此刻。",r:"抗拒改变，耳聋于召唤。你可能拖延重要的决定，害怕面对真实的自己。静下来，那声音从未停止。"},
"世界":{u:"圆满完成，周期终结。你跳舞于世界之轮的中心，整合了所有碎片。旅行、毕业、目标达成——完美句号，也是新篇章的序曲。",r:"接近终点但差一步。你可能因为小疏忽而延迟成功，或者不愿结束美好时光。完成最后的仪式，然后放手。"},
"权杖1":{u:"火苗初燃，行动的开端。新的热情、机会或灵感正等着你伸手去抓。不要犹豫，迈出第一步。",r:"热情受阻，计划延迟。你可能缺乏动力或信心，先点燃内在的火花再行动。"},
"权杖2":{u:"手握权杖眺望远方，你在计划和选择之间权衡。未来充满可能性，但不必急于决定。",r:"犹豫不决，恐惧未知。过度分析导致瘫痪，相信你的直觉。"},
"权杖3":{u:"火势蔓延，团队合作或事业的初期成功。你看到了努力的成果，继续推动。",r:"进展受阻，小冲突。合作中出现分歧，耐心沟通。"},
"权杖4":{u:"稳固的成果，庆祝与休整。你暂时安全，可以享受劳动的果实。",r:"停滞不前，安逸陷阱。别沉迷现状，寻找新的挑战。"},
"权杖5":{u:"竞争与冲突，为了地盘而战。你可能面临挑战者，需要捍卫立场。",r:"无谓的争斗，或内耗结束。放下骄傲，寻求和解。"},
"权杖6":{u:"胜利的凯旋，获得认可。你的努力被看见，荣誉和地位提升。",r:"失败或骄傲自满。小心从高处跌落，保持谦逊。"},
"权杖7":{u:"勇气面对压力，即使在劣势也不退缩。你像战士一样坚守阵地。",r:"优柔寡断，过度防御。有时候撤退比硬拼更明智。"},
"权杖8":{u:"火之矢急速飞行，行动迅捷。变化来得突然，你需快速反应。",r:"方向错误，或冲突升级。检查你的目标是否值得如此匆忙。"},
"权杖9":{u:"积蓄力量，最后的防御。你疲惫但不愿倒下，再坚持一下就能看到曙光。",r:"崩溃或固执。接受援助，放手让别人分担。"},
"权杖10":{u:"火之重担，被责任压垮。你可能承担太多，需要燃烧殆尽才能重生。",r:"减负后的轻松，或逃避。学会拒绝，保护你的能量。"},
"圣杯1":{u:"爱意满溢，新的情感开始。友谊、爱情或喜悦流入你的生活，敞开接纳。",r:"情绪堵塞，或拒绝付出。你可能害怕受伤而封闭自己，让水流动起来。"},
"圣杯2":{u:"双向奔赴，灵魂的联结。一段关系进入蜜月期，彼此滋养。",r:"关系失衡，或单相思。检视付出与回报是否对等。"},
"圣杯3":{u:"庆祝与友谊，丰收的喜悦。聚会、婚礼、团队欢庆，快乐加倍。",r:"过度放纵，或秘密泄露。小心乐极生悲。"},
"圣杯4":{u:"厌倦与冷漠，对拥有的不满足。你坐在树荫下，却看不见头顶的圣杯。",r:"新视角，重新感恩。尝试转换心态，世界没那么糟。"},
"圣杯5":{u:"悲伤与失落，眼泪流尽后的空旷。你抓着空杯不放，却看不见身后的桥。",r:"疗愈开始，旧路回归。接受失去，未来仍有爱。"},
"圣杯6":{u:"回忆与怀旧，来自过去的礼物。老友、童年或旧情重现，温柔以待。",r:"沉迷过去，或被旧事纠缠。向前看，别让回忆成为枷锁。"},
"圣杯7":{u:"幻象与选择，众多诱惑让你迷失。你以为每个杯子都是真的，其实只有一个是实在的。",r:"清醒，或逃避。脚踏实地，拒绝空想。"},
"圣杯8":{u:"离开不滋养的关系，勇敢走向未知。你背对旧有的圣杯，独自上路。",r:"回头或停滞。确保你不是因为恐惧才离开。"},
"圣杯9":{u:"梦想成真，心灵满足。你独坐彩虹下，一切都刚刚好。",r:"贪心或虚假满足。小心表面的快乐掩盖了真实需求。"},
"圣杯10":{u:"永恒的幸福，家庭和谐。圣杯的彩虹覆盖家园，爱与丰盛代代相传。",r:"家庭纷争或关系破裂。沟通是唯一的解药。"},
"宝剑1":{u:"思维之剑，清晰的决断。你终于看清了真相，哪怕残酷。",r:"混乱或自我欺骗。真相可能伤人，但逃避更糟。"},
"宝剑2":{u:"盲目的选择，心如迷宫。你蒙着眼举着剑，不知该刺向哪边。",r:"犹豫结束，或真相显露。去掉眼罩，选择并不难。"},
"宝剑3":{u:"心碎之痛，言语如刀。一次争吵或背叛让你承受巨大悲伤。",r:"伤口愈合，或原谅。时间会抚平一切。"},
"宝剑4":{u:"休息与冥想，暂时的避风港。你需要从战斗中抽离，给大脑放个假。",r:"焦虑难眠，或逃避现实。适度休息，但别沉溺。"},
"宝剑5":{u:"卑鄙的胜利，赢了一场空。你为了赢不择手段，却失去了更重要的东西。",r:"和解或重新思考。承认错误，有些仗不值得打。"},
"宝剑6":{u:"远行或过渡，离开风暴中心。你乘船驶向平静，告别过去的纠纷。",r:"困在原地，或拒绝离开。即使前路未知，也好过死水。"},
"宝剑7":{u:"隐藏与策略，偷偷拿走别人的剑。你处在暗中，需要智取而非蛮力。",r:"秘密暴露，或良心不安。诚实才是最锋利的剑。"},
"宝剑8":{u:"束缚与无力，被想法困住。你觉得自己无路可逃，其实是心魔作祟。",r:"解脱，或挣脱束缚。你一直都有钥匙。"},
"宝剑9":{u:"噩梦与焦虑，深夜的恐惧。失眠、担忧、自责循环，最黑的黑夜。",r:"希望之光，或求助。别一个人扛，天快亮了。"},
"宝剑10":{u:"毁灭的结局，彻底的失败。一切崩塌，但死亡也是新生。",r:"低谷反弹，或逃避。接受结束才能重新开始。"},
"星币1":{u:"物质基础，新的事业或财富开端。一颗种子，值得培育。",r:"错过机会，或财务不稳。审视你的根基。"},
"星币2":{u:"平衡与调度，玩弄两枚金币。你需要在工作、家庭、金钱之间周旋。",r:"失衡，或压力过大。优先排序，别什么都想要。"},
"星币3":{u:"匠人精神，团队协作。你的技能被认可，作品逐渐成形。",r:"平庸或被低估。再打磨一下细节。"},
"星币4":{u:"守财与固执，紧握金币不放。你害怕失去，因此拒绝分享。",r:"放松控制，或损失。金钱只是工具。"},
"星币5":{u:"贫困与失落，精神与物质的双重匮乏。你感到被世界抛弃。",r:"转机，或求助。总有人愿意拉你一把。"},
"星币6":{u:"慷慨与施舍，分享财富。你给与别人帮助，或接受馈赠。",r:"吝啬，或债务。检查你的付出是否带有条件。"},
"星币7":{u:"评估与等待，看着长出的庄稼。你需要耐心，不是所有种子都立即结果。",r:"急躁，或计划失败。别拔苗助长。"},
"星币8":{u:"学徒与精进，日复一日雕琢。你要么在埋头苦干，要么在精修技能。",r:"无聊，或工作狂。寻找乐趣，劳逸结合。"},
"星币9":{u:"自给自足，物质丰盛。你拥有花园和美酒，独享宁静富足。",r:"依赖他人，或虚假安全。你的安全感应来自于内在。"},
"星币10":{u:"世代财富，家族传承。你站在祖先的肩膀上，也可以成为后人的根基。",r:"破产，或家族纷争。打破恶性循环。"},
"权杖·侍从":{u:"火信使，热情的新消息。你会收到激动人心的邀请或机会，充满好奇心。",r:"延误或幼稚。信息可能不实，再确认一下。"},
"权杖·骑士":{u:"火之骑士，行动如风。他带来快速的进展或旅行，但缺乏持久力。",r:"躁动，或方向错误。小心冲动引起的冲突。"},
"权杖·王后":{u:"火之女王，自信而温暖。她善于激励他人，是团队的精神领袖。",r:"控制欲强，或嫉妒。你的热情可能烫伤别人。"},
"权杖·国王":{u:"火之国王，成熟且富有远见。他建立帝国，但也懂得休息。",r:"独裁，或事业危机。放下权威，多听意见。"},
"圣杯·侍从":{u:"水信使，情感启蒙。你可能会坠入爱河，或收到艺术灵感。",r:"情绪化，或谎言。小心被人利用你的善良。"},
"圣杯·骑士":{u:"水之骑士，浪漫的追求者。他会为了爱情或理想远行，充满诗意。",r:"失望，或逃避。对方可能不靠谱。"},
"圣杯·王后":{u:"水之女王，直觉与慈悲。她像月亮一样滋养他人，是疗愈者。",r:"情绪淹没，或过度敏感。保护你的能量，别当情绪垃圾桶。"},
"圣杯·国王":{u:"水之国王，冷静的情感掌控者。他成熟温柔，善于倾听。",r:"压抑情感，或操控。你可能隐藏真实感受。"},
"宝剑·侍从":{u:"风信使，警觉的哨兵。他会带来真相或监控信息，但可能不够成熟。",r:"流言蜚语，或偷窥。小心口舌之争。"},
"宝剑·骑士":{u:"风之骑士，言辞犀利。他快速辩论或发起攻击，不留余地。",r:"好斗，或伤人。你的话像刀，收一收锋芒。"},
"宝剑·王后":{u:"风之女王，理智而独立。她能看透谎言，是卓越的咨询师。",r:"刻薄，或孤独。你的犀利可能推开关心你的人。"},
"宝剑·国王":{u:"风之国王，权威的智者。他用逻辑统治，公正不阿。",r:"冷酷，或操纵。别忘了人情味。"},
"星币·侍从":{u:"土信使，勤奋的学生。你正在学习新技能或处理财务事务。",r:"懒惰，或错过学习机会。别拖延。"},
"星币·骑士":{u:"土之骑士，稳健的前行者。他脚踏实地，缓慢但坚定地积累财富。",r:"固执，或停滞。你可能太保守。"},
"星币·王后":{u:"土之女王，丰盛与自然。她连接大地，擅长园艺、理财、照顾家庭。",r:"物质主义，或失去根基。别被金钱奴役。"},
"星币·国王":{u:"土之国王，成功的商业领袖。他稳重、可靠，是财富的象征。",r:"贪婪，或破产危机。检查你的资产安全。"},
};

/* ============================ 场景零件 ============================ */
function hatch(id, col, op, rot, gap, w) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})">
    <line x1="0" y1="0" x2="0" y2="${gap}" stroke="${col}" stroke-width="${w}" opacity="${op}"/></pattern>`;
}
function branch(p0, p1, p2, side, seed, w = 5, n = 7) {
  const r = R(seed);
  const pt = t => [(1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0],
                   (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]];
  const tan = t => { const a = pt(Math.max(0,t-.01)), b = pt(Math.min(1,t+.01));
    const dx=b[0]-a[0], dy=b[1]-a[1], l=Math.hypot(dx,dy)||1; return [dx/l, dy/l]; };
  let th = '';
  for (let i = 0; i < n; i++) {
    const t = .07 + i*(.88/n) + r()*.03, [x,y] = pt(t), [tx,ty] = tan(t);
    const nx = -ty*side, ny = tx*side, len = w*2.4 + r()*w*2.6, bw = w*.34;
    const bx = x + nx*w*.35, by = y + ny*w*.35;
    const tipx = x + nx*len + tx*w*.9, tipy = y + ny*len + ty*w*.9;
    th += `M${(bx-tx*bw).toFixed(1)} ${(by-ty*bw).toFixed(1)} L${tipx.toFixed(1)} ${tipy.toFixed(1)} L${(bx+tx*bw).toFixed(1)} ${(by+ty*bw).toFixed(1)} Z `;
  }
  return `<g><path d="M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}" fill="none"
    stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round"/><path d="${th}" fill="${C.ink}"/></g>`;
}
function rose(x, y, s, col) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="9" fill="${col}"/>
    <path d="M-5.6 0 a5.6 5.6 0 1 0 11.2 0 a5.6 5.6 0 1 0 -11.2 0" fill="none" stroke="${C.ink}" stroke-width="1.2"/>
    <path d="M-2.8 0 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0" fill="none" stroke="${C.ink}" stroke-width="1"/>
    <circle cx="0" cy="0" r="1.2" fill="${C.ink}"/>
    <path d="M7.6 3.4 q6 2.4 8.4 7.4 q-7 -.8 -8.4 -7.4 Z" fill="${C.ink}"/>
    <path d="M-7.6 3.4 q-6 2.4 -8.4 7.4 q7 -.8 8.4 -7.4 Z" fill="${C.ink}"/>
    <path d="M3.4 7.6 q4.6 5.6 1.6 9.6 q-5.4 -2.4 -1.6 -9.6 Z" fill="${C.ink}"/>
  </g>`;
}
function tree(x, base, h, w, seed, col = C.ink) {
  const r = R(seed);
  const rim = `stroke="${C.paper}" stroke-width=".8" fill="none" opacity=".34"`;
  let g = `<path d="M${x-w*.14} ${base} L${x-w*.04} ${base-h*.52} L${x+w*.04} ${base-h*.52} L${x+w*.14} ${base} Z" fill="${col}"/>`;
  const blobs = [[0,-h*.55,w*.55,h*.22],[ -w*.3,-h*.72,w*.42,h*.17],[ w*.32,-h*.7,w*.42,h*.17],[0,-h*.86,w*.28,h*.13]];
  blobs.forEach(([ox,oy,rx,ry],i)=>{
    g += `<ellipse cx="${x+ox}" cy="${base+oy}" rx="${rx}" ry="${ry}" fill="${col}"/>`;
    g += `<ellipse cx="${x+ox}" cy="${base+oy}" rx="${rx}" ry="${ry}" ${rim}/>`;
  });
  return g;
}

/* ============================ 一幕：森林与塔罗屋 ============================ */
function sceneForest() {
  const r = R(11);
  let stars = '';
  for (let i = 0; i < 34; i++) {
    const x = r()*390, y = r()*230, rr = .5 + r()*1.1;
    if (Math.hypot(x-306, y-66) < 34) continue;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(2)}" fill="${C.paper}" opacity="${(.15+r()*.5).toFixed(2)}"/>`;
  }
  let far = '';
  for (let i = 0; i < 26; i++) {
    const x = -10 + i*16.5 + r()*8, h = 26 + r()*54;
    far += `<path d="M${x} 330 L${x+7} ${330-h} L${x+14} 330 Z" fill="${C.violetD}" opacity=".8"/>`;
  }
  let mid = '';
  const treesL = [[16,330,190,34,3],[58,330,150,28,5],[104,330,120,24,7],[128,330,150,22,9]];
  const treesR = [[262,330,140,22,15],[300,330,178,30,17],[346,330,210,34,19],[382,330,150,26,21]];
  [...treesL, ...treesR].forEach(([x,b,h,w,s]) => { mid += tree(x,b,h,w,s,C.ink); });

  return `<svg viewBox="0 0 390 546" preserveAspectRatio="xMidYMid slice">
  <defs>
    ${hatch('hf1', C.violet, .20, 46, 6, .9)}
    ${hatch('hf2', C.ink, .10, 58, 7, .9)}
    <radialGradient id="doorGlow" cx="50%" cy="72%" r="52%">
      <stop offset="0%" stop-color="${C.ochre}" stop-opacity=".85"/>
      <stop offset="55%" stop-color="${C.ochre}" stop-opacity=".22"/>
      <stop offset="100%" stop-color="${C.ochre}" stop-opacity="0"/></radialGradient>
    <linearGradient id="skyF" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0709"/><stop offset="60%" stop-color="#171020"/>
      <stop offset="100%" stop-color="#221a2a"/></linearGradient>
  </defs>

  <g class="ly" data-d=".06">
    <rect width="390" height="546" fill="url(#skyF)"/>
    ${stars}
    <circle cx="306" cy="64" r="34" fill="${C.paper}" opacity=".12"/>
    <circle cx="306" cy="64" r="22" fill="${C.paper}"/>
    <path d="M290 58 L320 56" stroke="${C.ink}" stroke-width="1.2" opacity=".7"/>
    <path d="M294 72 L314 70.6" stroke="${C.ink}" stroke-width=".9" opacity=".5"/>
  </g>

  <g class="ly" data-d=".14">
    <path d="M0 254 q46 -16 86 -2 q34 12 70 -6 q40 -20 74 2 q30 20 66 8 q34 -12 94 2 L390 340 L0 340 Z" fill="${C.violetD}" opacity=".55"/>
    ${far}
  </g>

  <g class="ly" data-d=".30">
    <path d="M0 330 L390 330 L390 546 L0 546 Z" fill="#181222"/>
    <rect y="330" width="390" height="216" fill="url(#hf2)"/>
    ${mid}
    <!-- 地面小径 -->
    <path d="M186 330 L210 330 L308 546 L82 546 Z" fill="${C.paperD}" opacity=".30"/>
    <path d="M186 330 L210 330 L308 546 L82 546 Z" fill="url(#hf2)" opacity=".7"/>
  </g>

  <g class="ly" data-d=".55">
    <!-- 塔罗屋 -->
    <path d="M132 330 L132 186 L195 110 L258 186 L258 330 Z" fill="${C.ink}"/>
    <path d="M132 330 L132 186 L195 110 L258 186 L258 330" fill="none" stroke="${C.violet}" stroke-width="2.8"/>
    <path d="M142 330 L142 192 L195 124 L248 192 L248 330" fill="none" stroke="${C.violetD}" stroke-width="1"/>
    <path d="M132 186 L258 186" stroke="${C.violet}" stroke-width="1.6"/>
    <rect x="132" y="182" width="126" height="6" fill="${C.violet}"/>
    <!-- 左塔 -->
    <path d="M104 330 L104 204 L130 162 L156 204 L156 330 Z" fill="${C.ink}"/>
    <path d="M104 330 L104 204 L130 162 L156 204 L156 330" fill="none" stroke="${C.violet}" stroke-width="2"/>
    <!-- 门 + 光 -->
    <ellipse cx="195" cy="310" rx="66" ry="54" fill="url(#doorGlow)"/>
    <path d="M176 330 L176 282 a19 19 0 0 1 38 0 L214 330 Z" fill="${C.ochre}"/>
    <path d="M176 330 L176 282 a19 19 0 0 1 38 0 L214 330" fill="none" stroke="${C.ink}" stroke-width="2.2"/>
    <path d="M195 266 L195 330" stroke="${C.ink}" stroke-width="1.6" opacity=".8"/>
    <!-- 窗 -->
    <path d="M150 220 L150 202 a9 9 0 0 1 18 0 L168 220 Z" fill="${C.ochre}" opacity=".9"/>
    <path d="M222 220 L222 202 a9 9 0 0 1 18 0 L240 220 Z" fill="${C.ochre}" opacity=".9"/>
    <path d="M118 222 L118 208 a7 7 0 0 1 14 0 L132 222 Z" fill="${C.ochre}" opacity=".6"/>
    <!-- 屋顶纹理 -->
    <path d="M132 186 L195 110 L258 186" fill="none" stroke="${C.ink}" stroke-width="1" opacity=".35"/>
  </g>

  <g class="ly" data-d=".72">
    <!-- 玫瑰丛 -->
    ${rose(60, 356, 2.1, C.violet)}${rose(88, 370, 1.6, C.paper)}${rose(40, 376, 1.4, C.violet)}
    ${rose(322, 358, 2.0, C.paper)}${rose(350, 374, 1.5, C.violet)}${rose(296, 378, 1.3, C.paper)}
    <!-- 藤蔓 -->
    <path d="M148 330 q-26 22 -34 54" fill="none" stroke="${C.ink}" stroke-width="2" opacity=".8"/>
    <path d="M242 330 q24 20 32 50" fill="none" stroke="${C.ink}" stroke-width="2" opacity=".8"/>
  </g>

  <g class="ly" data-d="1.0">
    ${branch([-24, 470], [96, 412], [214, 392], -1, 5, 5.6, 7)}
    ${branch([414, 420], [318, 396], [236, 384], 1, 23, 5.0, 6)}
    ${branch([-30, 546], [40, 486], [96, 448], 1, 9, 4.2, 5)}
  </g>

  <g class="ly" data-d=".2">
    <rect width="390" height="546" fill="url(#hf1)" opacity=".5"/>
  </g>
  </svg>`;
}

/* ============================ 二幕：屋内 ============================ */
function sceneRoom(idle) {
  return `<svg viewBox="0 0 390 546" preserveAspectRatio="xMidYMid slice">
  <defs>
    ${hatch('hr1', C.violet, .22, 46, 6, .9)}
    ${hatch('hr2', C.ink, .22, -40, 5, .8)}
    <radialGradient id="cnd" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.ochre}" stop-opacity=".55"/>
      <stop offset="60%" stop-color="${C.ochre}" stop-opacity=".16"/>
      <stop offset="100%" stop-color="${C.ochre}" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="ly" data-d=".08">
    <rect width="390" height="546" fill="#120d16"/>
    <rect width="390" height="360" fill="${C.wall}" opacity=".95"/>
    <rect width="390" height="360" fill="url(#hr1)" opacity=".9"/>
  </g>
  <g class="ly" data-d=".22">
    <path d="M104 360 L104 156 a92 92 0 0 1 184 0 L288 360 Z" fill="${C.ink}"/>
    <path d="M104 360 L104 156 a92 92 0 0 1 184 0 L288 360" fill="none" stroke="${C.violet}" stroke-width="2.8"/>
    <path d="M116 360 L116 158 a80 80 0 0 1 160 0 L276 360" fill="none" stroke="${C.violetD}" stroke-width="1"/>
    <path d="M-70 360 L-70 180 a84 84 0 0 1 168 0 L98 360" fill="none" stroke="${C.violetD}" stroke-width="1.6" opacity=".8"/>
    <path d="M292 360 L292 180 a84 84 0 0 1 168 0 L460 360" fill="none" stroke="${C.violetD}" stroke-width="1.6" opacity=".8"/>
    <path d="M196 120 l6 8 -6 8 -6 -8 Z" fill="${C.ochre}" opacity=".9"/>
    <!-- 拱后的月窗 -->
    <circle cx="196" cy="210" r="30" fill="${C.paper}" opacity=".30"/>
    <circle cx="196" cy="210" r="22" fill="${C.paper}" opacity=".6"/>
    <path d="M104 360 L104 156 a92 92 0 0 1 184 0 L288 360" fill="none" stroke="${C.violetD}" stroke-width="1" opacity=".6"/>
    <path d="M196 156 L196 360" stroke="${C.violetD}" stroke-width="1.4" opacity=".7"/>
    <path d="M104 232 L288 232" stroke="${C.violetD}" stroke-width="1.2" opacity=".6"/>
    <path d="M104 296 L288 296" stroke="${C.violetD}" stroke-width="1.2" opacity=".55"/>
  </g>
  <g class="ly" data-d=".4">
    <ellipse cx="316" cy="304" rx="56" ry="50" fill="url(#cnd)"/>
    <rect x="308" y="264" width="11" height="40" fill="${C.ink}"/>
    <rect x="319" y="264" width="4" height="40" fill="${C.paper}" opacity=".35"/>
    <path d="M308 304 L301 311 L316 311 L331 311 L325 304 Z" fill="${C.ink}"/>
    <path d="M313 254 q6 7 0 12 q-6 -5 0 -12 Z" fill="${C.ochre}"/>
    <path d="M313 256 q2.4 4 0 6 q-2.4 -2.6 0 -6 Z" fill="${C.paperHi}"/>
  </g>
  <g class="ly" data-d=".6">
    <path d="M0 360 L390 360 L390 546 L0 546 Z" fill="${C.ink}"/>
    <!-- 桌面 -->
    <path d="M24 372 L366 372 L390 470 L0 470 Z" fill="#2A2030"/>
    <path d="M24 372 L366 372" stroke="${C.paperD}" stroke-width="1.6" opacity=".55"/>
    <path d="M24 372 L366 372 L390 470 L0 470 Z" fill="url(#hr2)" opacity=".5"/>
    <path d="M0 470 L390 470" stroke="${C.violet}" stroke-width="2.2"/>
    <path d="M0 360 L390 360" stroke="${C.violet}" stroke-width="2"/>
    <path d="M0 386 L390 386" stroke="${C.violetD}" stroke-width="1" opacity=".7"/>
    <rect y="360" width="390" height="186" fill="url(#hr2)" opacity=".55"/>
  </g>
  <g class="ly" data-d="1.0">
    ${branch([-20, 552], [86, 486], [188, 452], -1, 13, 5.4, 6)}
    ${branch([410, 470], [320, 470], [250, 486], 1, 27, 4.6, 6)}
  </g>
  </svg>`;
}

/* ============================ 三幕：舞台剧 ============================ */
/* 每一个建筑都是一张"蒙版剪纸片"：硬边平涂 + 受光侧亮边 + 剪口高光 */
function flat(kind, x, base, s, tint, seed) {
  x = +x; base = +base; s = +s;
  const r = R(seed), h = 104 * s, w = 34 * s;
  const FILL = '#0A0709', RIM = tint;
  const edge = `stroke="${C.paper}" stroke-width="${1.0 * s}" opacity=".42" fill="none"`;
  const rim = `stroke="${C.paper}" stroke-width="${1.0 * s}" fill="none" opacity=".30"`;
  switch (kind) {
    case 'tower':
      return `<g><path d="M${x-w/2} ${base} L${x-w/2} ${base-h} L${x} ${base-h*1.42} L${x+w/2} ${base-h} L${x+w/2} ${base} Z" fill="${FILL}"/>
        <path d="M${x-w/2} ${base} L${x-w/2} ${base-h} L${x} ${base-h*1.42} L${x+w/2} ${base-h} L${x+w/2} ${base}" ${rim}/>
        <path d="M${x-w/2} ${base-h*.55} L${x-w/2} ${base-h*.78}" ${edge}/>
        <path d="M${x} ${base-h*.2} L${x} ${base-h*.34}" stroke="${RIM}" stroke-width="${1.4*s}" opacity=".7"/>
        <path d="M${x-w*.16} ${base-h*.2} L${x-w*.16} ${base-h*.34}" stroke="${RIM}" stroke-width="${1.2*s}" opacity=".5"/></g>`;
    case 'gate':
      return `<g><path d="M${x-w*.85} ${base} L${x-w*.85} ${base-h*.6} a${w*.85} ${w*.7} 0 0 1 ${w*1.7} 0 L${x+w*.85} ${base} Z" fill="${FILL}"/>
        <path d="M${x-w*.85} ${base} L${x-w*.85} ${base-h*.6} a${w*.85} ${w*.7} 0 0 1 ${w*1.7} 0 L${x+w*.85} ${base}" ${rim}/>
        <path d="M${x-w*.5} ${base} L${x-w*.5} ${base-h*.5} a${w*.5} ${w*.42} 0 0 1 ${w} 0 L${x+w*.5} ${base}" fill="${RIM}" opacity=".16"/></g>`;
    case 'obelisk':
      return `<g><path d="M${x-w*.2} ${base} L${x-w*.12} ${base-h} L${x+w*.12} ${base-h} L${x+w*.2} ${base} Z" fill="${FILL}"/>
        <path d="M${x-w*.2} ${base} L${x-w*.12} ${base-h} L${x+w*.12} ${base-h} L${x+w*.2} ${base}" ${rim}/>
        <path d="M${x-w*.12} ${base-h} L${x+w*.12} ${base-h}" ${edge}/></g>`;
    case 'tree':
      return `<g>${tree(x, base, h*1.15, w*.95, seed, FILL)}
        <path d="M${x-w*.5} ${base-h*.72} q${w*.5} ${-h*.18} ${w} 0" ${rim}/></g>`;
    case 'deadwood':
      return `<g><path d="M${x} ${base} L${x} ${base-h*.95}" stroke="${FILL}" stroke-width="${5*s}"/>
        <path d="M${x} ${base-h*.55} l${w*.95} ${-h*.22}" stroke="${FILL}" stroke-width="${3*s}"/>
        <path d="M${x} ${base-h*.74} l${-w*.85} ${-h*.18}" stroke="${FILL}" stroke-width="${2.6*s}"/>
        <path d="M${x} ${base-h*.95} l${w*.4} ${-h*.1}" stroke="${RIM}" stroke-width="${1.2*s}" opacity=".7"/></g>`;
    case 'cliff':
      return `<g><path d="M${x-w*1.8} ${base} L${x-w*.55} ${base-h*.55} L${x} ${base-h*.3} L${x+w*.9} ${base-h*.68} L${x+w*1.8} ${base}" fill="${FILL}"/>
        <path d="M${x-w*1.8} ${base} L${x-w*.55} ${base-h*.55} L${x} ${base-h*.3} L${x+w*.9} ${base-h*.68} L${x+w*1.8} ${base}" ${rim}/></g>`;
    case 'moon':
      return `<g><circle cx="${x}" cy="${base-h*.78}" r="${15*s}" fill="${C.paper}"/>
        <circle cx="${x+6*s}" cy="${base-h*.8}" r="${13*s}" fill="${FILL}"/></g>`;
    case 'sun':
      return `<g><circle cx="${x}" cy="${base-h*.8}" r="${15*s}" fill="${C.ochre}"/>
        ${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<path d="M${x+Math.cos(a)*19*s} ${base-h*.8+Math.sin(a)*19*s} L${x+Math.cos(a)*27*s} ${base-h*.8+Math.sin(a)*27*s}" stroke="${C.ochre}" stroke-width="${1.5*s}" opacity=".75"/>`}).join('')}</g>`;
    case 'star':
      return `<g><path d="M${x} ${base-h*1.0} l${2.6*s} ${6.4*s} l${6.4*s} ${2.6*s} l${-6.4*s} ${2.6*s} l${-2.6*s} ${6.4*s} l${-2.6*s} ${-6.4*s} l${-6.4*s} ${-2.6*s} l${6.4*s} ${-2.6*s} Z" fill="${C.paper}"/></g>`;
    case 'wheel':
      return `<g><circle cx="${x}" cy="${base-h*.52}" r="${w*1.05}" fill="${FILL}" stroke="${RIM}" stroke-width="${1.8*s}"/>
        ${Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return `<path d="M${x} ${base-h*.52} L${x+Math.cos(a)*w*1.05} ${base-h*.52+Math.sin(a)*w*1.05}" stroke="${RIM}" stroke-width="${1.1*s}" opacity=".55"/>`}).join('')}
        <circle cx="${x}" cy="${base-h*.52}" r="${w*.22}" fill="${C.paper}" opacity=".8"/></g>`;
    case 'garden':
      return `<g>${[0,1,2,3,4].map(i=>`<path d="M${x-w+i*w*.5} ${base} q${w*.1} ${-h*.3} 0 ${-h*.46}" stroke="${FILL}" stroke-width="${2.4*s}"/>`).join('')}
        ${[0,1,2,3,4].map(i=>`<circle cx="${x-w+i*w*.5}" cy="${base-h*.5}" r="${3.2*s}" fill="${RIM}"/>`).join('')}</g>`;
    case 'fire':
      return `<g><path d="M${x} ${base} q${8*s} ${-h*.28} 0 ${-h*.52} q${-8*s} ${-h*.22} 0 ${-h*.56}" fill="none" stroke="${C.ochre}" stroke-width="${2.6*s}" opacity=".95"/>
        <path d="M${x} ${base} q${4*s} ${-h*.14} 0 ${-h*.26}" fill="none" stroke="${C.paperHi}" stroke-width="${1.4*s}" opacity=".8"/></g>`;
    case 'rain':
      return `<g>${Array.from({length:14},(_,i)=>{const xx=x-w*.9+i*w*.13, yy=base-h*(.35+r()*.5);return `<path d="M${xx} ${yy} L${xx-4*s} ${yy+18*s}" stroke="${C.paper}" stroke-width="1" opacity=".28"/>`}).join('')}</g>`;
    case 'veil':
      return `<g><path d="M${x-w} ${base-h} L${x+w} ${base-h} L${x+w*.72} ${base} L${x-w*.72} ${base} Z" fill="${FILL}" opacity=".92"/>
        <path d="M${x-w*.25} ${base-h} L${x-w*.25} ${base}" stroke="${RIM}" stroke-width="1.2" opacity=".6"/>
        <path d="M${x+w*.3} ${base-h} L${x+w*.3} ${base}" stroke="${RIM}" stroke-width="1" opacity=".4"/></g>`;
    case 'pillar':
      return `<g><rect x="${x-w*.28}" y="${base-h}" width="${w*.56}" height="${h}" fill="${FILL}"/>
        <rect x="${x-w*.44}" y="${base-h-4*s}" width="${w*.88}" height="${4*s}" fill="${RIM}" opacity=".9"/>
        <rect x="${x-w*.44}" y="${base-4*s}" width="${w*.88}" height="${4*s}" fill="${RIM}" opacity=".9"/>
        <path d="M${x+w*.28} ${base-h} L${x+w*.28} ${base}" stroke="${C.paper}" stroke-width=".9" opacity=".35"/></g>`;
    case 'bridge':
      return `<g><path d="M${x-w*1.6} ${base} q${w*1.6} ${-h*.8} ${w*3.2} 0" fill="none" stroke="${RIM}" stroke-width="${2.6*s}"/>
        ${[-1.2,1.2].map(i=>`<rect x="${x+i*w-.04*w}" y="${base-h*.3}" width="${w*.1}" height="${h*.3}" fill="${FILL}"/>`).join('')}</g>`;
    case 'ring':
      return `<circle cx="${x}" cy="${base-h*.6}" r="${w*1.15}" fill="none" stroke="${RIM}" stroke-width="${2.6*s}" opacity=".9"/>`;
    case 'bell':
      return `<g><path d="M${x-w*.55} ${base-h*.5} a${w*.55} ${w*.75} 0 0 1 ${w*1.1} 0 l${w*.16} ${w*.34} l${-w*1.42} 0 Z" fill="${FILL}"/>
        <path d="M${x-w*.55} ${base-h*.5} a${w*.55} ${w*.75} 0 0 1 ${w*1.1} 0" ${rim}/>
        <circle cx="${x}" cy="${base-h*.1}" r="${2.2*s}" fill="${RIM}"/></g>`;
    case 'scales':
      return `<g><path d="M${x} ${base-h*1.0} L${x} ${base-h*.5}" stroke="${RIM}" stroke-width="${1.8*s}"/>
        <path d="M${x-w*.8} ${base-h*.5} L${x+w*.8} ${base-h*.5}" stroke="${RIM}" stroke-width="${1.5*s}"/>
        ${[-1,1].map(i=>`<path d="M${x+i*w*.8} ${base-h*.5} l${-w*.26} ${h*.22} l${w*.52} 0 Z" fill="${FILL}" stroke="${RIM}" stroke-width="1.1"/>`).join('')}</g>`;
    case 'throne':
      return `<g><path d="M${x-w*.55} ${base} L${x-w*.55} ${base-h*.9} L${x} ${base-h*1.08} L${x+w*.55} ${base-h*.9} L${x+w*.55} ${base} Z" fill="${FILL}"/>
        <path d="M${x-w*.55} ${base} L${x-w*.55} ${base-h*.9} L${x} ${base-h*1.08} L${x+w*.55} ${base-h*.9} L${x+w*.55} ${base}" ${rim}/>
        <path d="M${x-w*.55} ${base-h*.52} L${x+w*.55} ${base-h*.52}" stroke="${RIM}" stroke-width="1.2" opacity=".7"/></g>`;
    case 'arcade':
      return `<g>${[0,1,2].map(i=>`<path d="M${x-w+i*w*.95} ${base} L${x-w+i*w*.95} ${base-h*.52} a${w*.48} ${w*.42} 0 0 1 ${w*.95} 0 L${x-w+i*w*.95+w*.95} ${base}" fill="${FILL}" stroke="${RIM}" stroke-width="${1.4*s}" opacity=".95"/>`).join('')}</g>`;
    case 'lamp':
      return `<g><path d="M${x} ${base} L${x} ${base-h*.78}" stroke="${FILL}" stroke-width="${2.6*s}"/>
        <circle cx="${x}" cy="${base-h*.84}" r="${7*s}" fill="${C.ochre}"/>
        <circle cx="${x}" cy="${base-h*.84}" r="${16*s}" fill="${C.ochre}" opacity=".16"/></g>`;
    case 'vine':
      return `<g><path d="M${x-w*.85} ${base} q${w*.85} ${-h*.55} ${w*1.7} ${-h*.32}" fill="none" stroke="${FILL}" stroke-width="${2.6*s}"/>
        ${[0,1,2,3].map(i=>`<circle cx="${x-w*.6+i*w*.42}" cy="${base-h*(.3+i*.07)}" r="${2.6*s}" fill="${RIM}"/>`).join('')}</g>`;
    case 'wall':
      return `<g><rect x="${x-w*1.5}" y="${base-h*.6}" width="${w*3}" height="${h*.6}" fill="${FILL}"/>
        <path d="M${x-w*1.5} ${base-h*.6} L${x+w*1.5} ${base-h*.6}" ${edge}/>
        ${Array.from({length:7},(_,i)=>`<rect x="${x-w*1.5+i*w*.43}" y="${base-h*.6}" width="${2*s}" height="${h*.6}" fill="${RIM}" opacity=".25"/>`).join('')}</g>`;
    case 'twintower':
      return flat('tower', x-w*.95, base, s*.86, tint, seed) + flat('tower', x+w*.95, base, s*.86, tint, seed+1) +
        `<path d="M${x-w*.95} ${base-h*.55} Q${x} ${base-h*.22} ${x+w*.95} ${base-h*.55}" fill="none" stroke="${RIM}" stroke-width="1.4" opacity=".7"/>`;
    case 'pool':
      return `<g><ellipse cx="${x}" cy="${base}" rx="${w*1.6}" ry="${h*.07}" fill="${RIM}" opacity=".22"/>
        <ellipse cx="${x}" cy="${base}" rx="${w*1.6}" ry="${h*.07}" fill="none" stroke="${RIM}" stroke-width="1.2" opacity=".6"/>
        <ellipse cx="${x}" cy="${base}" rx="${w*.7}" ry="${h*.03}" fill="none" stroke="${C.paper}" stroke-width="1" opacity=".35"/></g>`;
    default:
      return flat('tree', x, base, s, tint, seed);
  }
}

/* ============================ 三幕：舞台剧（台口 + 幕 + 脚灯 + 一层层剪纸片） ============================ */
function sceneWorld(spec, seed = 3) {
  const r = R(seed);
  const tint = spec.tints[0] || C.violet;
  const bright = spec.light > 1.05;
  const skyTop = bright ? '#3B3047' : spec.light > .92 ? '#2E2740' : '#221C2E';
  const GY = 392;                       // 舞台后缘
  const rimL = 26, rimR = 364;           // 台口

  // 远山 / 台后天幕
  let hills = `<path d="M0 ${GY} L0 ${GY-26} q52 -34 104 -10 q44 20 86 -16 q50 -42 100 -2 q38 24 100 -8 L390 ${GY} Z" fill="#171122" opacity=".92"/>`;

  // 剪纸片：远 → 近，按深度排序
  const flats = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const m = spec.motifs[i % Math.max(1, spec.motifs.length)] || 'tree';
    const z = i / (n - 1);                      // 0 远 1 近
    const x = z < .5 ? 44 + r() * 296 : 12 + r() * 366;
    const base = GY + z * 96 + r() * 12;
    const s = .95 + z * 1.45;
    flats.push({ m, x, base, s, z, d: (.20 + z * .66).toFixed(2), delay: (i * .28).toFixed(2) });
  }
  const flatsSVG = flats.map((o, i) => {
    const dur = Math.round(1500 - o.z * 620);          // 远：慢；近：快
    const ty  = Math.round(70 + o.z * 70);             // 远：只抬一点；近：从台下升
    const tx  = (i % 3 === 0 ? (o.x < 195 ? -1 : 1) * (18 + o.z * 26) : 0);  // 部分从侧幕推入
    const sc  = 1 + o.z * 0.05;
    return `<g class="st" data-d="${o.d}" style="--dl:${o.delay}s;--dur:${dur}ms;--ty:${ty}px;--tx:${tx}px;--sc:${sc.toFixed(2)}">
      ${flat(o.m, o.x.toFixed(1), o.base.toFixed(1), o.s.toFixed(2), tint, Math.floor(o.x * 7 + o.s * 13))}
    </g>`;
  }).join('');

  // 浮尘
  let motes = '';
  const mc = spec.motifs.includes('fire') ? C.ochre : spec.motifs.includes('rain') ? '#8FA6C4' : C.paper;
  for (let i = 0; i < 34; i++) {
    const x = 30 + r() * 330, y = 60 + r() * 300, s = .6 + r() * 1.5;
    motes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="${mc}" opacity="${(.12+r()*.45).toFixed(2)}">
      <animate attributeName="opacity" values="${(.08+r()*.3).toFixed(2)};${(.45+r()*.5).toFixed(2)};${(.08+r()*.3).toFixed(2)}" dur="${(4+r()*6).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }

  // 脚灯
  let foot = '';
  for (let i = 0; i < 9; i++) {
    const x = 44 + i * 38;
    foot += `<circle class="fdot" cx="${x}" cy="${GY + 96}" r="2.2" fill="${C.ochre}" opacity="0"/>
      <ellipse cx="${x}" cy="${GY + 96}" rx="9" ry="4" fill="${C.ochre}" opacity=".10"/>`;
  }

  return `<svg viewBox="0 0 390 546" preserveAspectRatio="xMidYMid slice">
  <defs>
    ${hatch('hw1', tint, .16, 46, 6, .9)}
    ${hatch('hw2', C.ink, .16, -42, 5, .9)}
    <linearGradient id="skyW" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/><stop offset="58%" stop-color="#221B2D"/>
      <stop offset="100%" stop-color="#14101B"/></linearGradient>
    <radialGradient id="halo" cx="50%" cy="46%" r="52%">
      <stop offset="0%" stop-color="${tint}" stop-opacity=".34"/>
      <stop offset="46%" stop-color="${tint}" stop-opacity=".12"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0"/></radialGradient>
  </defs>

  <!-- 天幕 -->
  <g class="ly" data-d=".06">
    <rect width="390" height="546" fill="url(#skyW)"/>
    <ellipse cx="195" cy="${GY-96}" rx="176" ry="112" fill="url(#halo)"/>
  </g>
  <!-- 远景 -->
  <g class="ly" data-d=".14">${hills}</g>
  <!-- 剪纸片建筑（一层一层） -->
  <g class="ly" data-d="1">${flatsSVG}</g>
  <!-- 台面 -->
  <g class="ly" data-d=".30">
    <path d="M0 ${GY} L390 ${GY} L390 546 L0 546 Z" fill="#0F0A13"/>
    <path d="M0 ${GY} L390 ${GY}" stroke="${tint}" stroke-width="1.6" opacity=".55"/>
    <rect y="${GY}" width="390" height="${546-GY}" fill="url(#hw2)" opacity=".6"/>
    ${foot}
  </g>
  <!-- 浮尘 -->
  <g class="ly" data-d=".7">${motes}</g>
  <!-- 台口：拱 + 两侧垂幕 + 前沿 -->
  <g class="ly" data-d="1.0">
    <path class="archline" pathLength="1" d="M${rimL} 470 L${rimL} 150 a${(rimR-rimL)/2} ${(rimR-rimL)/2} 0 0 1 ${rimR-rimL} 0 L${rimR} 470"
      fill="none" stroke="${C.violet}" stroke-width="3"/>
    <path d="M${rimL+12} 470 L${rimL+12} 152 a${(rimR-rimL)/2-12} ${(rimR-rimL)/2-12} 0 0 1 ${rimR-rimL-24} 0 L${rimR-12} 470"
      fill="none" stroke="${C.violetD}" stroke-width="1.2"/>
    <!-- 垂幕 -->
    <g class="curtain" data-side="L">
      <path d="M0 0 H46 Q38 120 52 250 Q60 360 44 470 L0 470 Z" fill="${C.ink}"/></g>
    <g class="curtain" data-side="R">
      <path d="M390 0 H344 Q352 120 338 250 Q330 360 346 470 L390 470 Z" fill="${C.ink}"/></g>
    <path d="M46 0 Q38 120 52 250 Q60 360 44 470" fill="none" stroke="${C.violet}" stroke-width="2"/>
    <path d="M344 0 Q352 120 338 250 Q330 360 346 470" fill="none" stroke="${C.violet}" stroke-width="2"/>
    <g class="curtain" data-side="L">
    ${[0,1,2,3].map(i=>`<path d="M${14+i*9} 0 Q${6+i*9} 200 ${16+i*9} 470" fill="none" stroke="${C.violetD}" stroke-width="1" opacity=".5"/>`).join('')}</g>
    <g class="curtain" data-side="R">
    ${[0,1,2,3].map(i=>`<path d="M${376-i*9} 0 Q${384-i*9} 200 ${374-i*9} 470" fill="none" stroke="${C.violetD}" stroke-width="1" opacity=".5"/>`).join('')}</g>
    <!-- 台口前沿（挡板） -->
    <path d="M0 470 L390 470 L390 546 L0 546 Z" fill="${C.ink}"/>
    <path d="M0 470 L390 470" stroke="${C.violet}" stroke-width="2.4"/>
    <path d="M0 480 L390 480" stroke="${C.violetD}" stroke-width="1" opacity=".6"/>
  </g>
  </svg>`;
}

/* 世界 = 牌意 → 亮度/主色/母题 → 立牌升起 */
function worldSpec(cards, revs) {
  let light = 0, tints = [], motifs = [];
  cards.forEach((c, i) => {
    const rev = revs[i];
    if (c.suit === '大阿卡纳' && MAJOR_WORLD[c.name]) {
      const m = MAJOR_WORLD[c.name];
      light += m.l * (rev ? .84 : 1);
      tints.push(m.t);
      motifs.push(...m.m);
    } else {
      const e = ELEM[c.suit];
      const rankBoost = c.rank >= 11 ? 1.04 : 1;
      light += e.light * rankBoost * (rev ? .84 : 1);
      tints.push(e.tint);
      motifs.push(c.suit === '权杖' ? 'fire' : c.suit === '圣杯' ? 'pool'
        : c.suit === '宝剑' ? 'rain' : 'cliff');
    }
  });
  light = light / Math.max(1, cards.length);
  const uniq = [...new Set(motifs)];
  return { light, tints, motifs: uniq.slice(0, 9), rev: revs.filter(Boolean).length };
}

/* ============================ 相机 ============================ */
const cam = { x: 0, y: 0, z: 1 };
function applyCam(ms = 0, ease = 'cubic-bezier(.22,.5,.24,1)') {
  document.querySelectorAll('#art .ly').forEach(g => {
    const d = parseFloat(g.dataset.d || 1);
    const z = 1 + (cam.z - 1) * d;
    g.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none';
    g.style.transform = `translate3d(${(-cam.x * d).toFixed(2)}px, ${(-cam.y * d).toFixed(2)}px,0) scale(${z.toFixed(4)})`;
  });
}
function setScene(svg, fadeIn = true) {
  const art = $('#art');
  art.innerHTML = svg;
  applyCam(0);
  if (!fadeIn) return;
  const el = art.querySelector('svg');
  el.style.opacity = '0';
  el.style.transform = 'scale(1.035)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 900ms ease, transform 2400ms cubic-bezier(.2,.62,.3,1)';
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ============================ 卡面：版画化 ============================ */
const faceCache = {};
function linocut(src, accent) {
  if (faceCache[src]) return Promise.resolve(faceCache[src]);
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const W = 180, H = 288;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d');
      g.drawImage(img, 0, 0, W, H);
      const d = g.getImageData(0, 0, W, H), p = d.data;
      const pal = [[10,7,9],[58,48,66], [accent[0],accent[1],accent[2]], [249,239,215]];
      for (let i = 0; i < p.length; i += 4) {
        let l = (0.2126*p[i] + 0.7152*p[i+1] + 0.0722*p[i+2]) / 255;
        l = Math.pow(l, .78);
        const k = l < .20 ? 0 : l < .46 ? 1 : l < .72 ? 2 : 3;
        const t = pal[k];
        p[i] = t[0]; p[i+1] = t[1]; p[i+2] = t[2];
      }
      g.putImageData(d, 0, 0);
      // 刻线
      g.globalAlpha = .10; g.strokeStyle = C.paperHi; g.lineWidth = 1;
      for (let y = -W; y < H; y += 4.5) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + W); g.stroke(); }
      g.globalAlpha = .07; g.strokeStyle = C.ink;
      for (let y = -W; y < H; y += 5.5) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y - W); g.stroke(); }
      g.globalAlpha = 1;
      const out = cv.toDataURL('image/jpeg', .88);
      faceCache[src] = out;
      res(out);
    };
    img.onerror = () => res('');
    img.src = src;
  });
}
const imgUrl = id => './' + String(id - 1).padStart(2, '0') + '.png';
const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];

/* ============================ 文本工具 ============================ */
const txt = $('#txt');
function clearTxt() { txt.innerHTML = ''; }
function line(s, cls = '', delay = 0) {
  const el = document.createElement('div');
  el.className = 'line ' + cls; el.textContent = s;
  el.style.transitionDelay = delay + 'ms';
  txt.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  return el;
}
function rule() { const d = document.createElement('div'); d.className = 'rule'; txt.appendChild(d); return d; }

/* ============================ 流程 ============================ */
let state = 'idle', spread = 3, drawMode = 'standard', chosen = [], reverses = [], question = '';
const LOG = []; window.LOG = LOG;
window.addEventListener('unhandledrejection', e => LOG.push('REJECT ' + (e.reason && e.reason.message || e.reason)));
window.addEventListener('error', e => LOG.push('ERR ' + e.message));

async function boot() {
  setScene(sceneForest());
  cam.z = 1.04; applyCam(2400);
  await wait(260);
  await intro();
}

async function intro() {
  clearTxt();
  $('#scrim').classList.add('on');
  await wait(500);
  line('很 久 很 久 以 前 ，', 'ochre');
  await wait(700);
  line('森林最深处有一间塔罗屋，', 'big');
  await wait(1250);
  line('它不收钱，只收一个真的想问的问题。', 'big');
  await wait(1500);
  line('今夜，门开着。', 'dim');
  await wait(1100);
  const h = document.createElement('div');
  h.className = 'hint'; h.textContent = '推 门';
  txt.appendChild(h);
  requestAnimationFrame(() => h.classList.add('on'));
  $('#page').addEventListener('click', enterDoor, { once: true });
  state = 'forest';
}

async function enterDoor() {
  if (state !== 'forest') return;
  state = 'pushing';
  clearTxt();
  cam.z = 2.75; cam.y = 96;
  applyCam(1750, 'cubic-bezier(.4,.02,.6,1)');
  await wait(900);
  $('#dimmer').style.background = 'rgba(10,7,9,.96)';
  await wait(760);
  setScene(sceneRoom());
  cam.z = 1.12; cam.y = 0; applyCam(0);
  $('#dimmer').style.background = 'rgba(10,7,9,0)';
  await wait(220);
  cam.z = 1.02; applyCam(1900);
  await wait(420);
  await chooseMode();
}

async function chooseMode() {
  state = 'mode';
  clearTxt();
  line('屋 里 只 有 一 张 桌 子 。', 'dim');
  await wait(600);
  line('你想怎么问？', 'big');
  await wait(320);
  rule();
  const wrap = document.createElement('div'); wrap.id = 'opts';
  const modes = [
    ['三张牌', '过去 · 此刻 · 未至', 3],
    ['两张牌', '一次抉择，两条路', 2],
    ['五张牌', '把一件事拆到底', 5]
  ];
  modes.forEach(([t, d, n], i) => {
    const el = document.createElement('div');
    el.className = 'opt';
    el.innerHTML = `<span class="n">${['壹','贰','叁'][i]}</span><span class="t">${t}</span><span class="d">${d}</span><span class="l"></span>`;
    el.onclick = () => { spread = n; el.classList.add('sel'); startDeal(); };
    wrap.appendChild(el); txt.appendChild(wrap);
    setTimeout(() => el.classList.add('on'), 120 + i * 110);
  });
}

async function startDeal() {
  if (state !== 'mode') return;
  state = 'deal';
  await wait(260);
  clearTxt();
  line('洗 牌 。', 'ochre');
  // 选牌
  const pool = [...CARDS];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  chosen = pool.slice(0, spread);
  reverses = chosen.map(() => Math.random() < .32);
  // 预加载卡面
  chosen.forEach(c => linocut(imgUrl(c.id), hex2rgb(ELEM[c.suit].tint)));

  await wait(420);
  const stage = $('#cards'); stage.innerHTML = '';
  const W = 390, n = spread;
  const cw = n >= 5 ? 56 : 74, ch = cw * 1.59, gap = n >= 5 ? 14 : 25;
  const total = n * cw + (n - 1) * gap, x0 = (W - total) / 2;
  const topY = 168;

  const els = [];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.left = (x0 + i * (cw + gap)) + 'px';
    el.style.top = topY + 'px';
    el.style.width = cw + 'px'; el.style.height = ch + 'px';
    el.innerHTML = `<div class="face back"></div><div class="face front"></div>`;
    el.style.transform = `translate(${W/2 - (x0 + i*(cw+gap) + cw/2)}px, ${420 - topY}px) rotate(${(Math.random()*20-10).toFixed(1)}deg) scale(.62)`;
    el.style.opacity = '0';
    stage.appendChild(el); els.push(el);
  }
  await wait(120);
  for (let i = 0; i < n; i++) {
    els[i].style.opacity = '1';
    els[i].style.transform = 'none';
    await wait(150);
  }
  await wait(280);
  clearTxt();
  line('一 张 一 张 来 。', 'big');
  await wait(420);
  line('点 一 张 。', 'dim');

  LOG.push('pick'); state = 'pick';
  els.forEach((el, i) => { el.onclick = () => pick(el, i, els); });
}

let picked = 0;
async function pick(el, i, els) {
  if (state !== 'pick' || el.dataset.done) return;
  el.dataset.done = '1';
  picked++;
  // 飞近
  el.style.zIndex = 20 + picked;
  el.style.transform = `translateY(-26px) scale(1.22)`;
  el.style.cursor = 'default';
  // 周围变黑（逐张加深）
  $('#dimmer').classList.add('on');
  $('#dimmer').style.background = `rgba(10,7,9,${(.30 + picked * .16).toFixed(2)})`;
  if (picked === 1) { clearTxt(); line('牌 已 经 到 你 手 里 。', 'ochre'); }
  if (picked === spread) {
    LOG.push('flip'); state = 'flip';
    await wait(520);
    clearTxt();
    for (let k = 0; k < els.length; k++) {
      await reveal(els[k], k);
      await wait(k < els.length - 1 ? 420 : 300);
    }
    await wait(380);
    LOG.push('riseWorld>');
    await riseWorld();
  }
}

async function reveal(el, i) {
  const c = chosen[i], rev = reverses[i];
  const front = el.querySelector('.front');
  const url = await linocut(imgUrl(c.id), hex2rgb(ELEM[c.suit].tint));
  front.innerHTML = `<img src="${url}" alt="${c.label || c.name}" style="${rev ? 'transform:rotate(180deg)' : ''}">`;
  el.classList.add('flip');
  el.style.transform = `translateY(-26px) scale(1.22) rotateY(180deg)`;
  await wait(320);
}

async function riseWorld() {
  state = 'world'; LOG.push('riseWorld');
  const spec = worldSpec(chosen, reverses);
  // 全黑 0.55s
  $('#dimmer').style.background = 'rgba(10,7,9,1)';
  clearTxt();
  await wait(620);
  // 换世界；牌保留
  setScene(sceneWorld(spec, chosen[0].id * 7 + 3));
  [...document.querySelectorAll('#cards .card')].forEach(el => { el.onclick = null; });
  $('#dimmer').style.transition = 'background 1100ms ease';
  $('#dimmer').style.background = 'rgba(10,7,9,.22)';
  cam.z = 1.10; applyCam(0);
  playStage();
  cam.z = 1.0; applyCam(3200, 'cubic-bezier(.22,.5,.24,1)');
  $('#scrim').classList.add('on');
  await wait(3600);
  // 世界定型后：硬停 1.2 秒
  await wait(400);
  await readCards();
}

function playStage() {
  const art = $('#art');
  // 幕布从两侧合拢
  art.querySelectorAll('.curtain').forEach((g, i) => {
    g.style.transform = `translateX(${g.dataset.side === 'L' ? -72 : 72}px)`;
    g.style.transition = 'none';
    requestAnimationFrame(() => {
      g.style.transition = `transform ${680 + i * 90}ms cubic-bezier(.18,.72,.24,1) ${i * 90}ms`;
      g.style.transform = 'translateX(0)';
    });
  });
  // 台口拱一笔画出来
  art.querySelectorAll('.archline').forEach(p => {
    p.style.strokeDashoffset = '1';
    p.style.transition = 'none';
    requestAnimationFrame(() => {
      p.style.transition = 'stroke-dashoffset 1000ms cubic-bezier(.3,.7,.3,1) 420ms';
      p.style.strokeDashoffset = '0';
    });
  });
  // 脚灯一盏盏亮
  art.querySelectorAll('.fdot').forEach((c, i) => {
    setTimeout(() => {
      c.style.transition = 'opacity 220ms ease';
      c.style.opacity = '.8';
      setTimeout(() => { c.style.opacity = '.45'; }, 160);
      setTimeout(() => { c.style.opacity = '.75'; }, 300);
    }, 900 + i * 95);
  });
  // 剪纸片：远景先起、近景后起；每片落定后有一记 2px 的顿
  art.querySelectorAll('.st').forEach((g, i) => {
    const dl = parseFloat(g.style.getPropertyValue('--dl')) || 0;
    const dur = parseInt(g.style.getPropertyValue('--dur')) || 1100;
    const base = 1150 + dl * 1000;                     // 等台口与灯
    setTimeout(() => {
      g.style.transition = `transform ${dur}ms cubic-bezier(.16,.78,.24,1), opacity ${Math.round(dur * .62)}ms ease`;
      g.style.transform = 'none';
      g.style.opacity = '1';
      setTimeout(() => {                                // 落定的一记顿
        g.style.transition = 'transform 130ms cubic-bezier(.3,.8,.4,1)';
        g.style.transform = 'translateY(-3px)';
        setTimeout(() => {
          g.style.transition = 'transform 210ms cubic-bezier(.4,.1,.6,1)';
          g.style.transform = 'translateY(0)';
        }, 130);
      }, dur + 40);
    }, base);
  });
}

async function readCards() {
  LOG.push('readCards');
  state = 'read';
  $('#dimmer').style.background = 'rgba(10,7,9,.10)';
  clearTxt();
  const box = document.createElement('div');
  box.id = 'read'; box.className = 'on';
  box.innerHTML = `<div class="rcard"></div><div class="rname"></div><div class="rtext"></div>
    <div id="dots">${chosen.map(() => '<i></i>').join('')}</div>`;
  txt.appendChild(box);
  const elC = box.querySelector('.rcard'), elN = box.querySelector('.rname'), elT = box.querySelector('.rtext');
  const dots = [...box.querySelectorAll('#dots i')];
  const posName = n => n === 3 ? ['过去', '此刻', '未至'] : n === 2 ? ['此路', '彼路'] : ['因', '境', '阻', '路', '果'];
  for (let i = 0; i < chosen.length; i++) {
    const c = chosen[i], rev = reverses[i];
    const m = MEANINGS[c.name] || { u: '', r: '' };
    elC.textContent = `${['壹','贰','叁','肆','伍'][i]} · ${posName(chosen.length)[i]}`;
    elN.textContent = `${c.label || c.name} · ${rev ? '逆位' : '正位'}`;
    elT.textContent = rev ? m.r : m.u;
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    cam.x = (i - (chosen.length - 1) / 2) * -34; cam.z = 1.06;
    requestAnimationFrame(() => applyCam(1100));
    if (i < chosen.length - 1) await wait(6600);
  }
  await wait(600);
  const seal = document.createElement('div');
  seal.className = 'seal on';
  seal.innerHTML = `<span class="box">合</span><span class="cap">合 上 这 本 牌</span>`;
  seal.onclick = reset;
  txt.appendChild(seal);
}

async function reset() {
  state = 'idle'; picked = 0;
  $('#cards').innerHTML = '';
  $('#dimmer').classList.remove('on');
  $('#dimmer').style.background = 'rgba(10,7,9,0)';
  $('#scrim').classList.remove('on');
  setScene(sceneForest());
  cam.x = 0; cam.y = 0; cam.z = 1.04; applyCam(1200);
  clearTxt();
  await wait(500);
  line('门 还 开 着 。', 'dim');
  await wait(900);
  await intro();
}

boot();
