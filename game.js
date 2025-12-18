// ================= 全域狀態 =================
let gameState = 0;
let canvas;
let canvasContainer;
let returnToMenuButton;
let restartGame1Button;

// ================= 圖片 =================
let cardImages = {};

// ================= 遊戲一 =================
let cards = [];
let flipped = [];
let matchedCount = 0;
let attempts = 0;
const totalPairs = 5;

const cardConfig = { size: 100, spacing: 20, cols: 4, rows: 3 };

const pairsData = [
  { han: "소주", image: "soju.jpg" },
  { han: "한복", image: "hanbok.jpg" },
  { han: "치킨", image: "bulgogi.jpg" },
  { han: "김치", image: "kimchi.jpg" },
  { han: "비빔밥", image: "bibimbap.jpg" }
];

let cardContent = [];

// ================= 遊戲二 =================
let game2 = {
  letters: [],
  buttons: [],
  score: 0,
  spawnRate: 90,
  frameCounter: 0,
  availableLetters: [
    { hangul: 'ㅏ', roman: 'a' },
    { hangul: 'ㅓ', roman: 'eo' },
    { hangul: 'ㅗ', roman: 'o' },
    { hangul: 'ㅜ', roman: 'u' }
  ]
};

const shooterRomans = ['a', 'eo', 'o', 'u'];

// ================= preload =================
function preload() {
  for (let data of pairsData) {
    loadImage(
      data.image,
      img => cardImages[data.image] = img,
      () => console.warn("圖片載入失敗:", data.image)
    );
  }
}

// ================= setup =================
function setup() {
  canvas = createCanvas(600, 700);
  canvasContainer = select('#p5-canvas-container');

  if (!canvasContainer) {
    console.error('找不到 #p5-canvas-container');
    noLoop();
    return;
  }

  canvas.parent(canvasContainer);
  canvas.hide();
  noLoop();

  returnToMenuButton = createButton('◀ 返回主選單');
  returnToMenuButton.mousePressed(resetGame);
  returnToMenuButton.class('menu-button');
  returnToMenuButton.hide();

  restartGame1Button = createButton('🔄 重新開始 (配對)');
  restartGame1Button.mousePressed(resetGame1);
  restartGame1Button.class('menu-button');
  restartGame1Button.hide();

  initGame1Cards();
  initGame2Buttons();
}

// ================= draw =================
function draw() {
  clear();

  if (gameState === 1) {
    background(255);
    drawGame1();
  } else if (gameState === 2) {
    background(220, 240, 255);
    drawGame2();
  }
}

// ================= 主選單 =================
function startGame(id) {
  gameState = id;
  canvas.show();
  loop();

  select('#main-menu-controls').hide();
  select('#description').html('挑戰中...');
  returnToMenuButton.show();

  if (id === 1) {
    resizeCanvas(600, 450);
    resetGame1();
    restartGame1Button.show();
    hideGame2Elements();
  } else {
    resizeCanvas(600, 700);
    resetGame2();
    showGame2Elements();
    restartGame1Button.hide();
  }

  positionElements();
}

function resetGame() {
  gameState = 0;
  noLoop();
  canvas.hide();

  select('#main-menu-controls').show();
  select('#description').html('歡迎來到韓文小遊戲挑戰，請選擇一個遊戲開始學習吧！');

  returnToMenuButton.hide();
  restartGame1Button.hide();
  hideGame2Elements();
}

// ================= 遊戲一 =================
function initGame1Cards() {
  for (let d of pairsData) {
    cardContent.push({ type: 'image', content: d.image, pairID: d.han });
    cardContent.push({ type: 'text', content: d.han, pairID: d.han });
  }

  let x0 = cardConfig.spacing;
  let y0 = 80;

  for (let i = 0; i < cardContent.length; i++) {
    let x = x0 + (i % cardConfig.cols) * (cardConfig.size + cardConfig.spacing);
    let y = y0 + floor(i / cardConfig.cols) * (cardConfig.size + cardConfig.spacing);
    cards.push(new Card(x, y, cardConfig.size));
  }
}

function resetGame1() {
  matchedCount = 0;
  attempts = 0;
  flipped = [];

  let shuffled = shuffle([...cardContent]);

  cards.forEach((c, i) => {
    c.type = shuffled[i].type;
    c.content = shuffled[i].content;
    c.pairID = shuffled[i].pairID;
    c.isFlipped = false;
    c.isMatched = false;
  });
}

function drawGame1() {
  cards.forEach(c => c.display());

  fill(0);
  textSize(20);
  text(`配對：${matchedCount} / ${totalPairs}`, 10, 10);
}

function handleGame1Click() {
  if (flipped.length >= 2) return;

  for (let i = 0; i < cards.length; i++) {
    let c = cards[i];
    if (c.isClicked(mouseX, mouseY) && !c.isFlipped && !c.isMatched) {
      c.flip();
      flipped.push(i);

      if (flipped.length === 2) {
        attempts++;
        let [a, b] = flipped.map(i => cards[i]);

        if (a.pairID === b.pairID) {
          a.match();
          b.match();
          matchedCount++;
          flipped = [];
        } else {
          setTimeout(() => {
            a.flip();
            b.flip();
            flipped = [];
          }, 800);
        }
      }
      break;
    }
  }
}

class Card {
  constructor(x, y, s) {
    this.x = x; this.y = y; this.size = s;
    this.isFlipped = false;
    this.isMatched = false;
  }

  display() {
    fill(this.isMatched ? '#a5d6a7' : 255);
    rect(this.x, this.y, this.size, this.size, 8);

    if (this.isFlipped || this.isMatched) {
      if (this.type === 'image' && cardImages[this.content]) {
        image(cardImages[this.content], this.x, this.y, this.size, this.size);
      } else {
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.content, this.x + this.size / 2, this.y + this.size / 2);
      }
    } else {
      fill('#c2185b');
      textSize(30);
      textAlign(CENTER, CENTER);
      text("🇰🇷", this.x + this.size / 2, this.y + this.size / 2);
    }
  }

  isClicked(mx, my) {
    return mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size;
  }

  flip() { this.isFlipped = !this.isFlipped; }
  match() { this.isMatched = true; }
}

// ================= 遊戲二 =================
function initGame2Buttons() {
  shooterRomans.forEach(r => {
    let b = createButton(r);
    b.class('shooter-button');
    b.mousePressed(() => checkMatch(r));
    b.hide();
    game2.buttons.push(b);
  });
}

function drawGame2() {
  game2.frameCounter++;
  if (game2.frameCounter % game2.spawnRate === 0) spawnNewLetter();

  for (let i = game2.letters.length - 1; i >= 0; i--) {
    let l = game2.letters[i];
    l.y += 2;
    textSize(40);
    textAlign(CENTER, CENTER);
    text(l.hangul, l.x, l.y);
    if (l.y > height) game2.letters.splice(i, 1);
  }

  textSize(24);
  text(`分數：${game2.score}`, width / 2, 10);
}

function resetGame2() {
  game2.letters = [];
  game2.score = 0;
}

function spawnNewLetter() {
  let l = random(game2.availableLetters);
  game2.letters.push({ hangul: l.hangul, roman: l.roman, x: random(50, width - 50), y: 0 });
}

function checkMatch(r) {
  for (let i = game2.letters.length - 1; i >= 0; i--) {
    if (game2.letters[i].roman === r) {
      game2.score += 10;
      game2.letters.splice(i, 1);
      break;
    }
  }
}

function showGame2Elements() {
  game2.buttons.forEach(b => b.show());
}

function hideGame2Elements() {
  game2.buttons.forEach(b => b.hide());
}

// ================= 工具 =================
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function positionElements() {
  let pos = canvasContainer.position();
  let y = pos.y + height + 15;

  returnToMenuButton.position(pos.x, y);
  restartGame1Button.position(pos.x + 150, y);
}

function mousePressed() {
  if (gameState === 1) handleGame1Click();
}
