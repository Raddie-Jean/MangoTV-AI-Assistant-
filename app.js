const viewport = document.querySelector("#viewport"),
  screen = document.querySelector("#screen");
const node = (id) => document.querySelector('[data-node-id="' + id + '"]');
const base = screen.firstElementChild;
const hero = node("96:914");
node("23:128").hidden = true;
const scroll = document.createElement("section");
scroll.className = "conversation";
scroll.setAttribute("aria-label", "对话记录");
const welcome = document.createElement("div");
welcome.className = "welcome";
welcome.append(hero);
scroll.append(welcome);
// The history cue belongs to the scrollable welcome content, not the fixed nav.

for (const id of ["113:1272", "128:1869", "113:1274"]) {
  const badge = node(id);
  const top = parseFloat(getComputedStyle(badge).top);
  badge.style.top = top - 185 + "px";
  welcome.append(badge);
}
const messages = document.createElement("div");
messages.className = "messages";
messages.setAttribute("role", "log");
messages.setAttribute("aria-live", "polite");
scroll.append(messages);
screen.append(scroll);
const avatar = node("23:129").cloneNode(true);
avatar.removeAttribute("data-node-id");
avatar.className = "avatar";
avatar.style.cssText =
  "position:relative;left:auto;top:auto;flex:none;width:72px;height:72px";
const footer = node("23:135");
node("23:139").hidden = true;
node("23:138").hidden = true;
const form = document.createElement("form");
form.className = "composer";
form.innerHTML =
  '<img src="assets/v5/img7.png" alt="" class="composer-star"><input aria-label="发送消息给芒小果" placeholder="发送消息给芒小果" autocomplete="off" enterkeyhint="send"><button type="submit" aria-label="发送消息" disabled>↑</button>';
footer.append(form);
const input = form.querySelector("input"),
  send = form.querySelector("button");
let activeTask = null;
let role = "芒小果",
  busy = false,
  timer = null,
  activeText = null,
  activeMessage = null,
  records = [];

function save() {
  try {
    localStorage.setItem("mango-outfit-v3", JSON.stringify({ role, records }));
  } catch {}
}
let fittedScale = 0;
function resize() {
  const visible = window.visualViewport?.height || innerHeight;
  const mobile = innerWidth <= 600;
  const keyboard =
    mobile && document.activeElement === input && visible < innerHeight * 0.82;
  const margin = mobile ? 0 : 48;
  const availableWidth = Math.max(1, innerWidth - (mobile ? 0 : 32));
  const availableHeight = Math.max(1, visible - margin);
  const normalScale = Math.min(
    (mobile ? 430 : 390) / 750,
    availableWidth / 750,
    availableHeight / 1624,
  );
  const scale = keyboard && fittedScale ? fittedScale : normalScale;
  if (!keyboard) fittedScale = scale;
  const h = keyboard ? Math.max(650, visible / scale) : 1624;
  viewport.style.width = 750 * scale + "px";
  viewport.style.height = h * scale + "px";
  screen.style.transform = "scale(" + scale + ")";
  screen.style.height = h + "px";
  base.style.height = h + "px";
  scroll.style.height = Math.max(120, h - 521) + "px";
  footer.style.transform = "translateY(" + (h - 1624) + "px)";
  document.body.classList.toggle("phone-keyboard", keyboard);
}
addEventListener("resize", resize);
window.visualViewport?.addEventListener("resize", resize);
resize();
function bottom() {
  scroll.scrollTop = scroll.scrollHeight;
}
function bubble(message) {
  const row = document.createElement("article");
  row.className = "message " + message.who;
  const portrait = avatar.cloneNode(true);
  if (message.who === "ai" && message.role && message.role !== "芒小果") {
    portrait.replaceChildren();
    const pic = document.createElement("img");
    pic.src =
      message.role === "光屿" ? "assets/v5/img18.png" : "assets/v5/img21.png";
    pic.alt = message.role;
    pic.style.cssText =
      "width:72px;height:72px;object-fit:cover;border-radius:50%;background:#edfaff";
    portrait.append(pic);
  }
  row.append(portrait);
  const body = document.createElement("div");
  body.className = "message-body";
  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = message.text;
  body.append(text);
  if (message.who === "ai") {
    const actions = document.createElement("div");
    actions.className = "message-actions";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "复制";
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(message.text);
        copy.textContent = "已复制";
      } catch {
        toast("请长按消息选择文字复制");
      }
    };
    const like = document.createElement("button");
    like.textContent = message.liked ? "已赞" : "赞";
    like.setAttribute("aria-pressed", String(!!message.liked));
    like.onclick = () => {
      message.liked = !message.liked;
      like.textContent = message.liked ? "已赞" : "赞";
      like.setAttribute("aria-pressed", String(message.liked));
      save();
    };
    actions.append(copy, like);
    body.append(actions);
  }
  row.append(body);
  messages.append(row);
  return text;
}
function append(who, text) {
  const m = { who, text, role: who === "ai" ? role : undefined };
  records.push(m);
  const el = bubble(m);
  save();
  return [m, el];
}
function toast(text) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;
  screen.append(t);
  setTimeout(() => t.remove(), 2300);
}
function response(q) {
  if (/穿搭|衣服|品牌|休闲/.test(q))
    return "想要慵懒又松弛的感觉，可以先从这几个方向找灵感：\n\n• 优衣库：基础 T 恤、宽松衬衫，适合轻松叠穿。\n• MUJI：棉麻和低饱和色，简单自然。\n• COS：偏简洁的廓形，适合喜欢利落感的你。\n\n我的搭配小建议：宽松上衣＋直筒裤＋舒服的运动鞋，点缀一个亮色配件就很有精神。你更喜欢奶油色系，还是黑白灰？";
  if (/心测|测试|心绪|题目/.test(q))
    return "我们可以从一个轻松的小问题开始：\n\n忙碌了一天，你最想去哪里充充电？\nA. 安静的海边，听一会儿浪声\nB. 热闹的小店，和朋友吃点好吃的\nC. 舒服的家里，窝着看一部剧\n\n回我 A、B 或 C 就好，也可以点开「今日心绪」抽张卡。";
  if (/^[ABCabc]$/.test(q.trim()))
    return {
      A: "你现在可能更想要一点安静的空间。给自己留十分钟，暂时放下待办，慢慢呼吸。今天有什么事让你一直惦记着吗？",
      B: "看来和喜欢的人待在一起，就是你的充电方式。要不要约个朋友聊聊最近的小事？你最想把今天的哪件事分享给对方？",
      C: "家的松弛感真是很好的能量补给。给自己找个舒服的角落吧！想看轻松的综艺，还是一部温暖的剧？",
    }[q.toUpperCase()];
  if (/鸭梨|压力|emo|难过|累|烦|焦虑/.test(q))
    return "不用强迫自己马上振作，可以允许自己难过一会儿。我在这儿陪你。\n\n先把肩膀放松，慢慢呼一口气。今天最让你累的是工作里的事，还是和某个人的相处？愿意跟我说说吗？";
  if (/citywalk|散步|出去/i.test(q))
    return "出门走走吧！给你一条不赶时间的 citywalk 小路线：\n\n街角咖啡店 → 有树荫的小路 → 二手书店 → 看得到夕阳的地方。\n\n不用把每一站都走完，喜欢哪里就多停一会儿。你在哪座城市？我可以陪你一起想想路线。";
  if (/治愈|开心|快乐|好事/.test(q))
    return "哇，感觉马上要被你的快乐传染啦 ✨ 快展开说说是什么好事？\n\n想把这份好心情存下来吗？也可以去「心情笔记」记下今天的小小闪光点。";
  if (/无聊|发呆/.test(q))
    return "我昨天花了半小时把便签纸撕成一样大小……跟我说说你最近做的最无聊的一件事吧！或者我们来玩一道心绪小问答？";
  if (/运势|日期|黄历/.test(q))
    return "今日生活小签 · 慢慢来也很好\n\n宜：整理桌面、联系老朋友、给自己做顿好吃的。\n\n今天的小任务：把一件大事拆成三个小步骤，只完成第一步也值得肯定。\n\n给自己一个提示：把注意力放回可以掌握的小事上。你今天最想完成的是什么？";
  if (/剧|综艺|电影/.test(q))
    return "当然可以陪你聊剧综！你现在想看轻松搞笑、温暖治愈，还是悬疑推理？告诉我你最近喜欢的一部作品，我们就从它聊起。";
  return (
    "收到，我在认真听。你说的「" +
    q.slice(0, 70) +
    "」，最想先聊哪一部分？\n\n是想让我陪你一起想办法，还是先听你慢慢说？"
  );
}
function sync() {
  send.disabled = !busy && !input.value.trim();
  send.textContent = busy ? "■" : "↑";
  send.setAttribute("aria-label", busy ? "停止回复" : "发送消息");
  form.classList.toggle("has-value", !!input.value.trim());
  form.classList.toggle("is-busy", busy);
}
function stop() {
  clearInterval(timer);
  if (activeTask) cancelOutfitTask();
  if (activeMessage && activeText)
    activeMessage.text = activeText.textContent || "我们稍后接着聊。";
  busy = false;
  activeText?.closest("article").classList.remove("streaming");
  activeText = null;
  activeMessage = null;
  save();
  sync();
}
function ask(q) {
  if (busy) return;
  const text = q.trim();
  if (!text) return;
  if (/穿搭|衣服|品牌|休闲|换一组/.test(text)) {
    startOutfitTask(text);
    return;
  }
  append("user", text);
  input.value = "";
  input.blur();
  busy = true;
  sync();
  const answer = response(text);
  const [m, el] = append("ai", "");
  activeMessage = m;
  activeText = el;
  el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  el.closest("article").classList.add("streaming");
  bottom();
  let index = 0;
  timer = setInterval(() => {
    if (index === 0) el.textContent = "";
    index = Math.min(answer.length, index + 3);
    el.textContent = answer.slice(0, index);
    bottom();
    if (index === answer.length) {
      m.text = answer;
      stop();
    }
  }, 38);
}
input.addEventListener("input", sync);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (busy) stop();
  else ask(input.value);
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.isComposing) e.preventDefault();
});
function actionable(el, label, fn) {
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", label);
  el.style.cursor = "pointer";
  el.onclick = fn;
  el.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

const layer = document.createElement("div");
layer.className = "modal-layer";
layer.hidden = true;
screen.append(layer);
let previousFocus;
function close() {
  layer.hidden = true;
  layer.replaceChildren();
  previousFocus?.focus({ preventScroll: true });
}
function modal(title, content) {
  previousFocus = document.activeElement;
  layer.hidden = false;
  layer.innerHTML =
    '<div class="modal-shade"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="' +
    title +
    '"><header><h2>' +
    title +
    '</h2><button aria-label="关闭">×</button></header><div class="sheet-content"></div></section>';
  layer.querySelector(".sheet-content").append(content);
  layer.querySelector("header button").onclick = close;
  layer.querySelector(".modal-shade").onclick = close;
  layer.querySelector("header button").focus();
}
layer.addEventListener("keydown", (e) => {
  if (e.key === "Escape") close();
  if (e.key === "Tab") {
    const all = [
      ...layer.querySelectorAll('button,input,textarea,[tabindex="0"]'),
    ];
    const first = all[0],
      last = all.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
function container() {
  return document.createElement("div");
}
function button(text, fn, cls = "sheet-button") {
  const b = document.createElement("button");
  b.className = cls;
  b.textContent = text;
  b.onclick = fn;
  return b;
}
function history() {
  const c = container();
  if (!records.length) c.textContent = "还没有对话，和芒小果打个招呼吧。";
  records
    .filter((m) => m.who === "user")
    .forEach((m) =>
      c.append(
        button(m.text, () => {
          close();
          const rows = [...messages.children];
          const i = records.indexOf(m);
          rows[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
        }),
      ),
    );
  c.append(
    button("开始新对话", () => {
      stop();
      records = [];
      messages.replaceChildren();
      append("ai", "新的对话开始啦，今天有什么想和我分享的？");
      close();
      scroll.scrollTop = 0;
    }),
  );
  modal("历史对话", c);
}
function mood() {
  const c = container();
  c.className = "mood-card";
  c.innerHTML =
    '<img src="assets/v5/imgChatGptImage202611111335486.png" alt="心绪小伙伴"><p class="eyebrow">今日心绪 · 给自己一点时间</p><h3>你的能量，正在慢慢回到身边</h3><p>不用急着变得更好。今天，试着留十分钟给自己，做一件让心情轻盈的小事。</p>';
  c.append(
    button("和芒小果聊聊", () => {
      close();
      ask("我想做一个心绪测试");
    }),
  );
  c.append(button("记下此刻心情", notes));
  modal("今日心绪", c);
}
function notes() {
  const c = container();
  c.innerHTML =
    '<p>把今天的小小闪光点，留给未来的自己。</p><textarea aria-label="心情笔记" placeholder="今天发生了什么？此刻的心情是……"></textarea>';
  const t = c.querySelector("textarea");
  try {
    t.value = localStorage.getItem("mango-note") || "";
  } catch {}
  c.append(
    button("保存笔记", () => {
      try {
        localStorage.setItem("mango-note", t.value);
        toast("已保存心情笔记");
        close();
      } catch {
        toast("当前浏览器无法保存，请复制留存");
      }
    }),
  );
  modal("心情笔记", c);
}
function roles() {
  const c = container();
  [
    ["芒小果", "assets/v5/img15.png", "ENFP · 小太阳 · 脑洞达人"],
    ["光屿", "assets/v5/img18.png", "温柔陪伴 · 认真倾听"],
    ["灵汐", "assets/v5/img21.png", "灵感搭子 · 轻松闲聊"],
  ].forEach(([name, img, desc]) => {
    const b = button(
      "",
      () => {
        role = name;
        updateRoleHero();
        if (role === "芒小果") playEntrance();
        node("23:85").textContent = "对话空间 · " + name;
        input.placeholder = "发送消息给" + name;
        input.setAttribute("aria-label", "发送消息给" + name);
        save();
        close();
        append("ai", "我是" + name + "，很高兴见到你。今天想聊点什么？");
        bottom();
      },
      "role-option",
    );
    b.innerHTML =
      '<img src="' +
      img +
      '" alt=""><span><strong>' +
      name +
      "</strong><small>" +
      desc +
      "</small></span><em>聊一聊</em>";
    c.append(b);
  });
  modal("选择聊天伙伴", c);
}
function desktop() {
  const c = container();
  c.className = "desktop-grid";
  c.append(
    button("✦ 今日心绪\n抽一张心绪卡", mood),
    button("♡ 心情笔记\n留住生活的小确幸", notes),
    button("☷ 历史对话\n找回聊过的话题", history),
    button("☀ 聊天伙伴\n选择同行的人", roles),
  );
  modal("芒果心探 · 桌面", c);
}
["23:89", "23:90", "68:333"].forEach((id) =>
  actionable(node(id), "上桌面", desktop),
);
actionable(node("23:91"), "查看历史对话", history);
actionable(node("88:893"), "返回桌面", desktop);
actionable(node("23:127"), "切换角色", roles);
actionable(node("23:126"), "选择聊天伙伴", roles);
actionable(node("23:115"), "今日心绪", mood);
["23:118", "23:119", "23:121", "80:341"].forEach((id) =>
  actionable(node(id), "今日心绪", mood),
);
let startY = 0;
scroll.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
  },
  { passive: true },
);
scroll.addEventListener(
  "touchend",
  (e) => {
    if (scroll.scrollTop === 0 && e.changedTouches[0].clientY - startY > 90)
      history();
  },
  { passive: true },
);
if (!records.length) {
  records = [
    {
      who: "ai",
      text: "我今天的OOTD是随时准备“乘风”出发的运动风，你呢？快跟我分享下你的穿搭！",
    },
  ];
}
records.forEach(bubble);
node("23:85").textContent = "对话空间 · " + role;
input.placeholder = "发送消息给" + role;
input.setAttribute("aria-label", "发送消息给" + role);
sync();
// One accessible hit target covers the complete desktop capsule.
["23:89", "23:90", "68:333"].forEach((id) => {
  node(id).removeAttribute("role");
  node(id).removeAttribute("tabindex");
  node(id).removeAttribute("aria-label");
});
const desktopButton = button("", desktop, "desktop-hit");
desktopButton.setAttribute("aria-label", "上桌面");
screen.append(desktopButton);

function updateRoleHero() {
  clearTimeout(entranceTimer);
  characterMedia.onload = null;
  characterMedia.onerror = null;
  character.dataset.media = "poster";
  const pic = node("66:317").querySelector("img");
  pic.src =
    role === "光屿"
      ? "assets/v5/img18.png"
      : role === "灵汐"
        ? "assets/v5/img21.png"
        : "assets/v5/img15.png";
  pic.style.objectFit = "contain";
  const greeting = node("58:299");
  greeting.style.fontSize = "28px";
  greeting.replaceChildren();
  const a = document.createElement("p");
  a.textContent = "嘿，我是 " + role + "!";
  const b = document.createElement("p");
  b.textContent = "今天心情咋样，陪你";
  const c = document.createElement("p");
  c.textContent = "唠唠呀~";
  for (const e of [a, b, c]) e.style.lineHeight = "39.2px";
  greeting.append(a, b, c);
  animateWelcomeText();
}
if (role !== "芒小果") updateRoleHero();

// Entrance → topic selection → character response → visible task execution.
const character = node("66:317");
// Share the welcome stacking context with badges; the character paints last.
welcome.append(character);
character.style.left = "358px";
character.style.top = "16px";
character.setAttribute("aria-label", "芒小果欢迎动画");
let entranceTimer = null;
const characterMedia = character.querySelector("img");
character.id = "character-animation-slot";
characterMedia.id = "character-media";
const characterConfig = window.MANGO_CHARACTER_CONFIG || {};
const staticCharacter = characterConfig.poster || "assets/v5/img15.png";
function showCharacterPoster() {
  character.dataset.media = "poster";
  characterMedia.src = staticCharacter;
  characterMedia.alt = "芒小果";
  screen.dataset.phase = "ready";
}
function playEntrance() {
  animateWelcomeText();
  clearTimeout(entranceTimer);
  scroll.scrollTop = 0;
  character.classList.remove("welcome-animate");
  welcome.classList.remove("welcome-playing");
  characterMedia.onload = null;
  characterMedia.onerror = null;
  showCharacterPoster();
  if (!characterConfig.gif) return;
  const frame = characterConfig.gifFrame;
  if (frame?.crop) {
    const c = frame.crop;
    character.style.setProperty(
      "--gif-width",
      (frame.width / c.width) * 100 + "%",
    );
    character.style.setProperty(
      "--gif-height",
      (frame.height / c.height) * 100 + "%",
    );
    character.style.setProperty("--gif-left", (-c.x / c.width) * 100 + "%");
    character.style.setProperty("--gif-top", (-c.y / c.height) * 100 + "%");
  }
  characterMedia.onload = () => {
    characterMedia.onload = null;
    character.dataset.media = frame?.crop ? "gif-cropped" : "gif";
    screen.dataset.phase = characterConfig.loop ? "ready" : "entrance";
    if (characterConfig.loop) return;
    entranceTimer = setTimeout(
      () => {
        characterMedia.onerror = null;
        showCharacterPoster();
      },
      Math.max(3000, Math.min(5000, characterConfig.durationMs || 4000)),
    );
  };
  characterMedia.onerror = () => {
    characterMedia.onload = null;
    characterMedia.onerror = null;
    showCharacterPoster();
  };
  characterMedia.src = characterConfig.gif;
}
node("83:443").hidden = true;
const topics = document.createElement("nav");
topics.className = "topic-strip";
topics.setAttribute("aria-label", "切换对话主题");
const track = document.createElement("div");
track.className = "topic-track";
track.tabIndex = 0;
track.setAttribute("aria-label", "左右滑动切换主题");
const topicItems = [
  ["被治愈了", "imgChatGptImage202611111335486.png", "img11.svg"],
  ["鸭梨大", "imgChatGptImage202611111335483.png", "img9.svg"],
  ["citywalk", "imgChatGptImage202611111335482.png", "img10.svg"],
  ["穿搭推荐", "imgChatGptImage202611111335484.png", "img11.svg"],
];
for (const [label, icon, bg] of topicItems) {
  const b = button(
    "",
    () => {
      if (busy) return;
      track
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      screen.dataset.phase = "dialogue";
      if (label === "穿搭推荐")
        ask("有哪些品牌的服装比较适合慵懒松弛休闲的风格，请帮我推荐");
      else ask(label);
    },
    "topic-chip",
  );
  b.setAttribute("aria-label", label);
  b.setAttribute("aria-pressed", "false");
  b.style.backgroundImage = "url(assets/v5/" + bg + ")";
  b.innerHTML =
    '<img src="assets/v5/' + icon + '" alt=""><span>' + label + "</span>";
  track.append(b);
}
topics.append(track);
footer.append(topics);
track.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  },
  { passive: false },
);
track.addEventListener("keydown", (e) => {
  if (e.target !== track) return;
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    track.scrollBy({
      left: e.key === "ArrowRight" ? 190 : -190,
      behavior: "smooth",
    });
  }
});
let group = 0;
function startOutfitTask(query, resume = false) {
  if (busy) return;
  if (!resume) append("user", query);
  input.value = "";
  input.blur();
  screen.dataset.phase = "dialogue";
  const [intro, el] = append("ai", "");
  const words =
    "收到！慵懒、松弛又休闲的感觉，我懂啦。让我先整理你的风格，再帮你挑品牌和搭配。";
  activeMessage = intro;
  activeText = el;
  el.closest("article").classList.add("streaming");
  busy = true;
  sync();
  let pos = 0;
  bottom();
  timer = setInterval(() => {
    pos += 3;
    el.textContent = words.slice(0, pos);
    bottom();
    if (pos >= words.length) {
      clearInterval(timer);
      intro.text = words;
      el.closest("article").classList.remove("streaming");
      activeMessage = null;
      activeText = null;
      executeOutfit(query);
    }
  }, 45);
}
function executeOutfit(query) {
  screen.dataset.phase = "task";
  const task = document.createElement("section");
  task.className = "outfit-task";
  task.setAttribute("aria-label", "穿搭推荐任务");
  task.innerHTML =
    '<div class="task-heading"><img src="assets/v5/img7.png" alt=""><strong>正在为你寻找松弛感灵感</strong><span class="task-count">0/3</span></div><div class="task-tags"><span>慵懒休闲</span><span>宽松廓形</span><span>日常可穿</span></div><ol><li class="running">理解穿搭偏好 <small>整理风格与适用场景</small></li><li>筛选品牌方向 <small>对比基础款与设计风格</small></li><li>组合搭配建议 <small>生成可参考的日常方案</small></li></ol><p class="task-status" role="status">正在理解你的穿搭需求…</p>';
  messages.append(task);
  activeTask = { element: task, step: 0, query };
  bottom();
  timer = setInterval(() => {
    if (!activeTask) return;
    const t = activeTask;
    t.element.querySelectorAll("li")[t.step].className = "done";
    t.step++;
    t.element.querySelector(".task-count").textContent = t.step + "/3";
    if (t.step < 3) {
      t.element.querySelectorAll("li")[t.step].className = "running";
      t.element.querySelector(".task-status").textContent = [
        "",
        "正在筛选适合的品牌方向…",
        "正在组合你的松弛感搭配…",
      ][t.step];
      bottom();
    } else {
      clearInterval(timer);
      t.element.querySelector(".task-status").textContent =
        "已完成 · 3 套穿搭灵感已准备好";
      t.element.classList.add("completed");
      t.element.querySelector(".task-heading strong").textContent =
        "松弛感穿搭任务已完成";
      activeTask = null;
      busy = false;
      sync();
      renderOutfitResult();
      save();
      screen.dataset.phase = "result";
      bottom();
    }
  }, 1400);
}
function cancelOutfitTask() {
  const t = activeTask;
  activeTask = null;
  t.element.querySelector(".task-status").textContent =
    "任务已暂停，可以继续生成";
  t.element.querySelector(".running")?.classList.remove("running");
  t.element.append(
    button(
      "继续生成",
      () => {
        if (busy) return;
        t.element.remove();
        busy = true;
        sync();
        executeOutfit(t.query);
      },
      "resume-task",
    ),
  );
  screen.dataset.phase = "paused";
  bottom();
}
function renderOutfitResult() {
  group++;
  const sets =
    group % 2
      ? [
          [
            "干净日常",
            "奶油白 × 浅卡其",
            "优衣库 / MUJI",
            "宽松白 T ＋ 卡其直筒裤 ＋ 帆布鞋",
            ["#f4f0e7", "#c5b698", "#deded9"],
          ],
          [
            "自然松弛",
            "燕麦色 × 牛仔蓝",
            "MUJI / 优衣库",
            "棉麻衬衫 ＋ 浅色牛仔裤 ＋ 休闲鞋",
            ["#ded4c1", "#90abc2", "#eee9dd"],
          ],
          [
            "简约有型",
            "雾灰色 × 深炭黑",
            "COS / 优衣库",
            "宽松针织衫 ＋ 垂感长裤 ＋ 运动鞋",
            ["#b8bbc2", "#41474c", "#e9e8e4"],
          ],
        ]
      : [
          [
            "周末散步",
            "米白色 × 鼠尾草绿",
            "MUJI / COS",
            "棉质衬衫 ＋ 绿色休闲裤 ＋ 白色运动鞋",
            ["#eee9df", "#a1ac97", "#e5e5df"],
          ],
          [
            "轻松叠穿",
            "浅灰色 × 靛蓝色",
            "优衣库 / COS",
            "白色内搭 ＋ 轻薄外套 ＋ 直筒牛仔裤",
            ["#c5c8ca", "#607c94", "#efefeb"],
          ],
          [
            "温暖居家",
            "奶咖色 × 燕麦色",
            "MUJI / 优衣库",
            "宽松开衫 ＋ 柔软 T 恤 ＋ 针织长裤",
            ["#bda48e", "#e3d9c7", "#eee7db"],
          ],
        ];
  const [, text] = append(
    "ai",
    "给你整理好了！先从低饱和色和舒服的面料开始，下面这三种方向都很适合日常穿着。",
  );
  const panel = document.createElement("div");
  panel.className = "outfit-results";
  panel.innerHTML =
    '<h3>你的松弛感穿搭灵感</h3><p class="result-caption">3 种风格方向 · 轻松搭配</p>';
  sets.forEach(([title, palette, brands, look, colors], i) => {
    const card = document.createElement("div");
    card.className = "outfit-look";
    const swatches = colors
      .map((color) => '<i style="background:' + color + '"></i>')
      .join("");
    card.innerHTML =
      '<div class="look-palette">' +
      swatches +
      "</div><div><h4>0" +
      (i + 1) +
      " " +
      title +
      "</h4><small>" +
      palette +
      "</small><p>" +
      look +
      "</p><span>品牌参考：" +
      brands +
      "</span></div>";
    panel.append(card);
  });
  const actions = document.createElement("div");
  actions.className = "result-actions";
  actions.append(
    button(
      "换一组搭配",
      () => startOutfitTask("帮我换一组慵懒休闲穿搭"),
      "result-action",
    ),
    button(
      "调整偏好",
      () => {
        const c = container();
        c.innerHTML = "<p>更接近哪一种感觉？</p>";
        ["更简约一点", "更适合周末散步", "更偏舒适居家"].forEach((pref) =>
          c.append(
            button(pref, () => {
              close();
              startOutfitTask("帮我推荐" + pref + "的休闲穿搭");
            }),
          ),
        );
        modal("调整穿搭偏好", c);
      },
      "result-action",
    ),
  );
  panel.append(actions);
  text.closest(".message-body").append(panel);
}
const originalDesktop = desktop;
desktop = function () {
  originalDesktop();
  layer.querySelector(".desktop-grid").append(
    button("↻ 重播欢迎动画", () => {
      close();
      playEntrance();
    }),
  );
};
playEntrance();

// Reviewable entry points for each state on the Figma delivery canvas.
const demoScene = new URLSearchParams(location.search).get("scene");
const outfitQuestion = "有哪些品牌的服装比较适合慵懒松弛休闲的风格，请帮我推荐";
if (demoScene === "sent") {
  append("user", outfitQuestion);
  const continueButton = button(
    "开始执行穿搭推荐",
    () => {
      continueButton.remove();
      startOutfitTask(outfitQuestion, true);
    },
    "result-action",
  );
  const next = document.createElement("div");
  next.className = "scene-next";
  next.append(continueButton);
  messages.append(next);
} else if (demoScene === "outfit")
  setTimeout(() => startOutfitTask(outfitQuestion), 650);
else if (demoScene === "history") history();
else if (demoScene === "roles") roles();
else if (demoScene === "mood") mood();
else if (demoScene === "notes") notes();
else if (demoScene === "desktop") desktop();

function animateWelcomeText() {
  const greeting = node("58:299");
  // Unwrap previous runs so replay never nests wrappers.
  for (const span of [...greeting.querySelectorAll(".greeting-character")])
    span.replaceWith(document.createTextNode(span.textContent));
  greeting.normalize();
  const walker = document.createTreeWalker(greeting, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode())
    if (walker.currentNode.textContent.trim()) texts.push(walker.currentNode);
  greeting.setAttribute("role", "group");
  greeting.setAttribute(
    "aria-label",
    greeting.textContent.replace(/\s+/g, " ").trim(),
  );
  let index = 0;
  for (const text of texts) {
    const frag = document.createDocumentFragment();
    for (const char of text.textContent) {
      if (/\s/.test(char)) {
        frag.append(document.createTextNode(char));
        continue;
      }
      const span = document.createElement("span");
      span.className = "greeting-character";
      span.setAttribute("aria-hidden", "true");
      span.textContent = char;
      span.style.animationDelay = index++ * 65 + "ms";
      frag.append(span);
    }
    text.replaceWith(frag);
  }
  greeting.dataset.typing = "true";
}

// Desktop dragging complements native touch/trackpad horizontal scrolling.
let topicDrag = null,
  topicSuppressClickUntil = 0;
track.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  topicDrag = {
    id: e.pointerId,
    x: e.clientX,
    left: track.scrollLeft,
    moved: false,
  };
});
track.addEventListener("pointermove", (e) => {
  if (!topicDrag || e.pointerId !== topicDrag.id) return;
  const dx = e.clientX - topicDrag.x;
  if (Math.abs(dx) > 5) topicDrag.moved = true;
  if (!topicDrag.moved) return;
  e.preventDefault();
  if (!track.hasPointerCapture(e.pointerId))
    track.setPointerCapture(e.pointerId);
  track.classList.add("is-dragging");
  const scale = track.getBoundingClientRect().width / track.clientWidth;
  track.scrollLeft = topicDrag.left - dx / scale;
});
function finishTopicDrag(e) {
  if (!topicDrag || e.pointerId !== topicDrag.id) return;
  if (topicDrag.moved) topicSuppressClickUntil = performance.now() + 250;
  if (track.hasPointerCapture(e.pointerId))
    track.releasePointerCapture(e.pointerId);
  track.classList.remove("is-dragging");
  topicDrag = null;
}
track.addEventListener("pointerup", finishTopicDrag);
track.addEventListener("pointercancel", finishTopicDrag);
track.addEventListener(
  "click",
  (e) => {
    if (performance.now() < topicSuppressClickUntil) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true,
);
track.addEventListener("dragstart", (e) => e.preventDefault());

// Keep the original 44px navigation gap while the history cue follows scroll.
const historyCue = document.createElement("div");
historyCue.className = "history-cue";
historyCue.append(node("23:91"), node("23:92"));
screen.append(historyCue);
function syncHistoryCue() {
  historyCue.style.setProperty("--history-scroll", -scroll.scrollTop + "px");
}
scroll.addEventListener("scroll", syncHistoryCue, { passive: true });
syncHistoryCue();
