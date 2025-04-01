/*
  戰場生存遊戲 - 最終改良版（包含瞄準框與虛線輔助）
  
  說明：
  1. 遊戲開始前會出現說明畫面，說明遊戲規則與操作方式，按任意鍵後開始遊戲。
  2. 玩家（藍色圓形）使用方向鍵/WASD移動，
     射擊方式：按空白鍵或滑鼠左鍵射擊（按住左鍵可持續射擊，依據武器冷卻）。
  3. 子彈會留下尾巴軌跡，射擊方向以滑鼠位置決定。
  4. 預警分為兩種：
     - 敵人預警（70% 機率）：畫面左右出現鮮紅色區塊（上下僅限文字區域）；預警結束後從畫面邊緣產生敵人，
       而且每次敵人預警後，下次產生的敵人數量會比上一次多一個。
     - 攻擊預警（30% 機率）：畫面左右出現較淡紅色區塊；預警結束後會有數顆子彈從畫面外射向玩家。
  5. 夥伴救援：每 3 回合（預警週期）結束時會有機率出現一位被綁住的夥伴，
     該夥伴固定出現在畫面中心，玩家碰觸後即可解綁；解綁後夥伴會圍繞玩家跟隨並自動射擊，
     每 0.5 秒會隨機更換跟隨的目標位置（以固定半徑環繞玩家）。
  6. 武器選擇、補給、強化敵人等功能與之前相同（詳見下述說明）。
  7. 畫面左上角顯示存活時間與擊殺數；左下角顯示目前武器與彈藥數量。
  8. 當使用機槍或散彈槍彈藥不足時，按射擊鍵玩家上方會跳出「彈藥不足!」提示（持續約 1 秒）。
  9. 新增瞄準輔助：在滑鼠位置會出現一個白色瞄準框，並有一條虛線連接玩家與該瞄準框。
  10. 按 F5 可重新整理頁面重新開始遊戲。
*/

let gameStarted = false; // 是否已開始遊戲（說明畫面）
let player;
let bullets = [];
let enemies = [];
let attackBullets = []; // 攻擊預警產生的子彈
let partners = []; // 夥伴陣列
let pickups = [];    // 補給道具

// 預警相關
let warningActive = false;
let warningTimer = 0;    // 預警持續幀數
let warningInterval = 200; // 兩次預警間隔（以 frame 計）
let lastWarningFrame = 0;
let warningType = "enemy"; // "enemy" 或 "attack"
let roundCount = 0;  // 預警週期數

let enemySpawnCount = 1; // 每次敵人預警產生的敵人數量，每次累加

// 分數與開始時間
let score = 0;
let startTime;
let gameOver = false;

// 彈藥不足提示 (顯示 60 幀約 1 秒)
let ammoWarningTimer = 0;

function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  // 遊戲開始前先建立玩家，初始位置放在畫面中心
  player = new Player(width/2, height/2);
}

function draw() {
  background(30);
  
  // 當未開始遊戲時顯示說明畫面
  if (!gameStarted) {
    showStartScreen();
    return;
  }
  
  if (gameOver) {
    gameOverScreen();
    return;
  }
  
  // 顯示存活時間與擊殺數
  let survivalTime = ((millis() - startTime) / 1000).toFixed(1);
  fill(255);
  textSize(16);
  text("存活時間: " + survivalTime + " 秒", 10, 20);
  text("擊殺數: " + score, 10, 40);
  
  // 顯示武器資訊（左下角）
  push();
  textSize(16);
  fill(255);
  let weaponName = "";
  let ammoText = "";
  if (player.weapon === 1) {
    weaponName = "手槍";
    ammoText = "∞";
  } else if (player.weapon === 2) {
    weaponName = "機槍";
    ammoText = player.ammoMachine;
  } else if (player.weapon === 3) {
    weaponName = "散彈槍";
    ammoText = player.ammoShotgun;
  }
  text("武器: " + weaponName + "  彈藥: " + ammoText, 10, height - 20);
  pop();
  
  // 更新玩家並繪製
  player.update();
  player.show();
  
  // 若滑鼠持續按下左鍵則持續射擊
  if (mouseIsPressed && mouseButton === LEFT) {
    player.shoot();
  }
  
  // 顯示彈藥不足提示 (顯示在玩家上方)
  if (ammoWarningTimer > 0) {
    push();
    textAlign(CENTER, BOTTOM);
    textSize(20);
    fill(255, 0, 0);
    text("彈藥不足!", player.x, player.y - player.size - 10);
    pop();
    ammoWarningTimer--;
  }
  
  // 更新夥伴
  for (let partner of partners) {
    partner.update();
    partner.show();
  }
  
  // 更新並繪製子彈 (由玩家及夥伴發射)
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
      continue;
    }
    // 檢查子彈是否命中敵人
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i].hits(enemies[j])) {
        let ex = enemies[j].x;
        let ey = enemies[j].y;
        enemies.splice(j, 1);
        score++;
        // 掉落補給：1/10 機率掉落機槍或散彈槍補給
        if (random() < 0.1) {
          let dropType = random() < 0.5 ? 2 : 3;
          pickups.push(new Pickup(ex, ey, dropType));
        }
        bullets.splice(i, 1);
        break;
      }
    }
  }
  
  // 更新攻擊預警產生的子彈
  for (let i = attackBullets.length - 1; i >= 0; i--) {
    attackBullets[i].update();
    attackBullets[i].show();
    if (attackBullets[i].offscreen()) {
      attackBullets.splice(i, 1);
      continue;
    }
    if (attackBullets[i].hits(player)) {
      player.health -= 10;
      attackBullets.splice(i, 1);
    }
  }
  
  // 更新敵人（普通與強化）
  for (let enemy of enemies) {
    enemy.update();
    enemy.show();
    if (enemy.hits(player)) {
      player.health -= 1;
    }
    for (let partner of partners) {
      if (!partner.bound && enemy.hits(partner)) {
        partner.health -= 1;
      }
    }
  }
  enemies = enemies.filter(enemy => enemy.health > 0);
  
  // 更新補給道具
  for (let i = pickups.length - 1; i >= 0; i--) {
    pickups[i].show();
    if (dist(pickups[i].x, pickups[i].y, player.x, player.y) < (player.size / 2 + pickups[i].size / 2)) {
      if (pickups[i].type === 2) {
        player.ammoMachine += 30;
      } else if (pickups[i].type === 3) {
        player.ammoShotgun += 30;
      }
      pickups.splice(i, 1);
    }
  }
  
  // 玩家死亡判斷
  if (player.health <= 0) {
    gameOver = true;
  }
  
  // 處理預警
  if (!warningActive && frameCount - lastWarningFrame > warningInterval) {
    warningActive = true;
    warningTimer = 60;
    if (random() < 0.7) {
      warningType = "enemy";
    } else {
      warningType = "attack";
    }
  }
  
  if (warningActive) {
    showWarning(warningType);
    warningTimer--;
    if (warningTimer <= 0) {
      roundCount++;
      if (warningType === "enemy") {
        for (let i = 0; i < enemySpawnCount; i++) {
          spawnEnemy();
        }
        enemySpawnCount++;
      } else if (warningType === "attack") {
        spawnAttackBullets();
      }
      warningActive = false;
      lastWarningFrame = frameCount;
      
      // 每 3 回合產生夥伴
      if (roundCount % 3 === 0 && roundCount > 0) {
        let alreadyBound = partners.some(p => p.bound);
        if (roundCount === 3 || (!alreadyBound && random() < 0.5)) {
          spawnPartner();
        }
      }
    }
  }
  
  // --------------------------
  // 新增：繪製瞄準輔助
  // 在滑鼠位置畫一個白色瞄準框
  push();
  stroke(255);
  noFill();
  rectMode(CENTER);
  rect(mouseX, mouseY, 20, 20);
  pop();
  
  // 繪製從玩家到瞄準框之間的虛線連線
  push();
  stroke(255);
  strokeWeight(1);
  drawingContext.setLineDash([5, 5]);  // 設定虛線模式：5像素線段、5像素間隔
  line(player.x, player.y, mouseX, mouseY);
  drawingContext.setLineDash([]);      // 清除虛線設定
  pop();
  // --------------------------
}

// ===== 說明/開始畫面 =====
function showStartScreen() {
  background(50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("戰場生存遊戲", width / 2, height / 2 - 160);
  
  textSize(16);
  let instructions =
    "操作方式：\n" +
    "  移動：方向鍵 / WASD\n" +
    "  射擊：空白鍵 或 滑鼠左鍵（按住持續射擊）\n" +
    "  切換武器：數字鍵 1 (手槍)、2 (機槍)、3 (散彈槍)\n\n" +
    "武器說明：\n" +
    "  手槍：每秒 2 發，無限彈藥\n" +
    "  機槍：初始 100 發，每秒約 10 發\n" +
    "  散彈槍：每次發射 7 顆子彈，扣 7 發彈藥\n\n" +
    "其他：\n" +
    "  預警後會有敵人或攻擊子彈出現，敵人數量逐次增加。\n" +
    "  每 3 回合可能有夥伴被救援，夥伴固定出現在畫面中心，顯示「救我!」。\n" +
    "  敵人被打死時有機率掉落補給道具（補給上會有提示），撿到後增加 30 發彈藥。\n" +
    "  強化敵人移動更快，並有紅色拖尾，登場時喊「去死吧!」。\n\n" +
    "新增瞄準輔助：\n" +
    "  滑鼠位置會出現白色瞄準框，並以虛線連接玩家與瞄準框。\n\n" +
    "按任意鍵開始遊戲";
    
  text(instructions, width / 2, height / 2 - 60);
}

// 按任意鍵開始遊戲
function keyPressed() {
  if (!gameStarted) {
    gameStarted = true;
    startTime = millis();
    return;
  }
  if (key === ' ') {
    player.shoot();
  }
  if (key === '1') {
    player.weapon = 1;
  } else if (key === '2') {
    player.weapon = 2;
  } else if (key === '3') {
    player.weapon = 3;
  }
}

// ===== 產生各物件 =====

// 預警繪製
function showWarning(type) {
  push();
  noStroke();
  let textHeight = 50;
  if (type === "enemy") {
    fill(255, 0, 0, 150);
  } else if (type === "attack") {
    fill(255, 100, 100, 150);
  }
  rect(0, 0, width * 0.2, height);
  rect(width * 0.8, 0, width * 0.2, height);
  rect(0, 0, width, textHeight);
  rect(0, height - textHeight, width, textHeight);
  
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  if (type === "enemy") {
    text("敵人即將出現！", width / 2, height / 2);
  } else if (type === "attack") {
    text("攻擊預警！", width / 2, height / 2);
  }
  pop();
}

// 產生敵人 — 保證從畫面外出現
function spawnEnemy() {
  let side = floor(random(4));
  let x, y;
  let margin = 30;
  if (side === 0) { // 上
    x = random(0, width);
    y = -margin;
  } else if (side === 1) { // 右
    x = width + margin;
    y = random(0, height);
  } else if (side === 2) { // 下
    x = random(0, width);
    y = height + margin;
  } else { // 左
    x = -margin;
    y = random(0, height);
  }
  if (random() < 0.2) {
    enemies.push(new StrongEnemy(x, y));
  } else {
    enemies.push(new Enemy(x, y));
  }
}

// 產生攻擊預警的子彈
function spawnAttackBullets() {
  let count = 5;
  for (let i = 0; i < count; i++) {
    let side = floor(random(4));
    let x, y;
    if (side === 0) { x = random(width); y = -10; }
    else if (side === 1) { x = width + 10; y = random(height); }
    else if (side === 2) { x = random(width); y = height + 10; }
    else { x = -10; y = random(height); }
    attackBullets.push(new AttackBullet(x, y, player.x, player.y));
  }
}

// 產生被綁住的夥伴 — 固定出現在畫面中心
function spawnPartner() {
  partners.push(new Partner(width / 2, height / 2));
}

// ===== 各物件類別 =====

// --- 玩家 ---
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 3;
    this.health = 100;
    this.cooldown = 0;
    // 武器：1-手槍、2-機槍、3-散彈槍
    this.weapon = 1;
    this.ammoMachine = 100;
    this.ammoShotgun = 100;
  }
  
  update() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { this.x -= this.speed; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { this.x += this.speed; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { this.y -= this.speed; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { this.y += this.speed; }
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, height - this.size / 2);
    if (this.cooldown > 0) this.cooldown--;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    fill(0, 0, 255);
    noStroke();
    ellipse(0, 0, this.size);
    pop();
    push();
    noStroke();
    fill(0, 255, 0);
    rect(this.x - this.size / 2, this.y - this.size, map(this.health, 0, 100, 0, this.size), 5);
    pop();
  }
  
  shoot() {
    if (this.cooldown > 0) return;
    let angle = atan2(mouseY - this.y, mouseX - this.x);
    if (this.weapon === 1) {
      // 手槍：每次一發，冷卻 30 幀
      bullets.push(new Bullet(this.x, this.y, angle));
      this.cooldown = 30;
    } else if (this.weapon === 2) {
      // 機槍：需彈藥，冷卻 6 幀
      if (this.ammoMachine > 0) {
        bullets.push(new Bullet(this.x, this.y, angle));
        this.cooldown = 6;
        this.ammoMachine--;
      } else {
        ammoWarningTimer = 60;
      }
    } else if (this.weapon === 3) {
      // 散彈槍：每次發射 7 顆子彈，扣 7 發彈藥，冷卻 20 幀
      if (this.ammoShotgun >= 7) {
        let baseAngle = angle;
        for (let i = 0; i < 7; i++) {
          let spread = map(i, 0, 6, -15, 15);
          bullets.push(new Bullet(this.x, this.y, baseAngle + spread));
        }
        this.cooldown = 20;
        this.ammoShotgun -= 7;
      } else {
        ammoWarningTimer = 60;
      }
    }
  }
}

// --- 夥伴 ---
class Partner {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 25;
    this.speed = 2;
    this.health = 50;
    this.cooldown = 0;
    this.bound = true;
    // 跟隨相關：固定距離與目標角度，每 30 幀更新一次
    this.followTimer = 0;
    this.offsetAngle = random(360);
    this.radius = 50;
  }
  
  update() {
    if (this.bound) {
      let d = dist(this.x, this.y, player.x, player.y);
      if (d < (this.size / 2 + player.size / 2)) {
        this.bound = false;
      }
    } else {
      this.followTimer--;
      if (this.followTimer <= 0) {
        this.offsetAngle = random(360);
        this.followTimer = 30;
      }
      let targetX = player.x + this.radius * cos(this.offsetAngle);
      let targetY = player.y + this.radius * sin(this.offsetAngle);
      // 緩慢移動到目標點
      this.x = lerp(this.x, targetX, 0.05);
      this.y = lerp(this.y, targetY, 0.05);
      
      if (this.cooldown > 0) this.cooldown--;
      else this.shoot();
    }
  }
  
  show() {
    push();
    translate(this.x, this.y);
    fill(this.bound ? 150 : 0, this.bound ? 150 : 255, this.bound ? 150 : 0);
    noStroke();
    ellipse(0, 0, this.size);
    pop();
    push();
    noStroke();
    fill(255, 255, 0);
    rect(this.x - this.size / 2, this.y - this.size, map(this.health, 0, 50, 0, this.size), 4);
    pop();
    if (this.bound) {
      push();
      textAlign(CENTER, BOTTOM);
      textSize(16);
      fill(255);
      text("救我!", this.x, this.y - this.size / 2 - 5);
      pop();
    }
  }
  
  shoot() {
    if (enemies.length === 0) return;
    let nearest = enemies[0];
    let nearestD = dist(this.x, this.y, nearest.x, nearest.y);
    for (let enemy of enemies) {
      let d = dist(this.x, this.y, enemy.x, enemy.y);
      if (d < nearestD) {
        nearest = enemy;
        nearestD = d;
      }
    }
    let angle = atan2(nearest.y - this.y, nearest.x - this.x);
    bullets.push(new Bullet(this.x, this.y, angle));
    this.cooldown = 30;
  }
}

// --- 子彈 ---
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.speed = 7;
    this.angle = angle;
    this.trail = [];
  }
  
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) {
      this.trail.shift();
    }
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }
  
  show() {
    push();
    noFill();
    stroke(255, 255, 0, 100);
    beginShape();
    for (let pos of this.trail) {
      vertex(pos.x, pos.y);
    }
    endShape();
    pop();
    push();
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
    pop();
  }
  
  offscreen() {
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < this.r + target.size / 2;
  }
}

// --- 攻擊預警產生的子彈 ---
class AttackBullet {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.r = 6;
    this.speed = 5;
    this.angle = atan2(targetY - this.y, targetX - this.x);
  }
  
  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }
  
  show() {
    push();
    fill(255, 150, 0);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
    pop();
  }
  
  offscreen() {
    return (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20);
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < this.r + target.size / 2;
  }
}

// --- 普通敵人 ---
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 1.5;
    this.health = 1;
  }
  
  update() {
    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += this.speed * cos(angle);
    this.y += this.speed * sin(angle);
  }
  
  show() {
    push();
    translate(this.x, this.y);
    fill(255, 0, 0);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    pop();
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < (this.size / 2 + target.size / 2);
  }
}

// --- 強化敵人 ---
class StrongEnemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 3;
    this.health = 1;
    this.speechTimer = 60; // 顯示對話 1 秒 (60 幀)
    this.trail = [];
  }
  
  update() {
    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += this.speed * cos(angle);
    this.y += this.speed * sin(angle);
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 15) {
      this.trail.shift();
    }
    if (this.speechTimer > 0) this.speechTimer--;
  }
  
  show() {
    push();
    noFill();
    stroke(255, 0, 0, 100);
    beginShape();
    for (let pos of this.trail) {
      vertex(pos.x, pos.y);
    }
    endShape();
    pop();
    
    push();
    translate(this.x, this.y);
    fill(255, 0, 0);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    pop();
    
    if (this.speechTimer > 0) {
      push();
      textAlign(CENTER, BOTTOM);
      textSize(14);
      fill(255);
      text("去死吧!", this.x, this.y - this.size / 2 - 5);
      pop();
    }
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < (this.size / 2 + target.size / 2);
  }
}

// --- 補給道具 ---
class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 2: 機槍, 3: 散彈槍
    this.size = 20;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    if (this.type === 2) {
      fill(0, 255, 255);
      textAlign(CENTER, BOTTOM);
      textSize(12);
      text("機槍彈藥", 0, -this.size / 2 - 2);
    } else if (this.type === 3) {
      fill(255, 0, 255);
      textAlign(CENTER, BOTTOM);
      textSize(12);
      text("散彈槍彈藥", 0, -this.size / 2 - 2);
    }
    noStroke();
    ellipse(0, 0, this.size);
    pop();
  }
}

// --- 遊戲結束畫面 ---
function gameOverScreen() {
  background(0);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("遊戲結束", width / 2, height / 2 - 40);
  textSize(32);
  let survivalTime = ((millis() - startTime) / 1000).toFixed(1);
  text("存活時間: " + survivalTime + " 秒", width / 2, height / 2);
  text("擊殺數: " + score, width / 2, height / 2 + 40);
  textSize(20);
  text("按 F5 重新開始", width / 2, height / 2 + 80);
}
