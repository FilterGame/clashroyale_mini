console.log("Loading: gamedata.js");
const TILE_SIZE = 40; // 地圖格子大小

// --- 提示文字 ---
const UIText = {
    hp: "生命",
    mp: "魔力",
    level: "等級",
    xp: "經驗",
    attack: "攻擊",
    defense: "防禦",
    inventory: "背包",
    equip: "裝備",
    use: "使用",
    drop: "丟棄",
    pickup: "拾取",
    moveTo: "移動到",
    attackTarget: "攻擊",
    npcGreeting: ["你好，冒險者！", "村莊很安全，外面很危險。", "需要幫忙嗎？"],
    enemySpotted: "發現敵人!",
    levelUp: "升級了！",
    itemDropped: "掉落了",
    inventoryFull: "背包已滿！",
    welcome: "歡迎來到庇護村",
    leaveVillage: "離開村莊",
    enterVillage: "進入村莊",
    // ... 更多提示
};

// --- 物品資料 ---
const ItemData = {
    // 消耗品
    'hp_potion_small': { name: "小型生命藥水", type: 'consumable', effect: { hp: 50 }, stackable: true, maxStack: 10, icon: 'red_potion', description: "恢復少量生命值。", rarity: 'common'},
    'mp_potion_small': { name: "小型魔力藥水", type: 'consumable', effect: { mp: 30 }, stackable: true, maxStack: 10, icon: 'blue_potion', description: "恢復少量魔力值。", rarity: 'common'},
    // 裝備 - 武器
    'rusty_sword': { name: "生鏽的劍", type: 'equipment', slot: 'weapon', stats: { attack: 3 }, icon: 'sword1', description: "一把看起來快壞掉的劍。", rarity: 'common' },
    'short_bow': { name: "短弓", type: 'equipment', slot: 'weapon', stats: { attack: 4 }, icon: 'bow1', description: "適合新手使用的弓。", rarity: 'common' },
    'sharp_dagger': { name: "鋒利的匕首", type: 'equipment', slot: 'weapon', stats: { attack: 5 }, icon: 'dagger1', description: "輕巧但致命。", rarity: 'uncommon'}, // 改為 uncommon
    'glowing_staff': { name: "發光的法杖", type: 'equipment', slot: 'weapon', stats: { attack: 4, maxMP: 20}, icon: 'staff1', description: "頂端鑲嵌著微光的寶石。", rarity: 'uncommon'},
    // 裝備 - 防具
    'leather_armor': { name: "皮甲", type: 'equipment', slot: 'armor', stats: { defense: 2 }, icon: 'armor1', description: "基本的皮革護甲。", rarity: 'common' },
    'iron_helmet': { name: "鐵盔", type: 'equipment', slot: 'helmet', stats: { defense: 3 }, icon: 'helmet1', description: "提供頭部基本保護。", rarity: 'common'},
    'hardened_leather_boots': { name: "硬皮靴", type: 'equipment', slot: 'boots', stats: { defense: 1, speed: 0.2 }, icon: 'boots1', description: "比普通靴子更耐用。", rarity: 'uncommon'}, // 加了靴子
    'magic_ring': { name: "魔力戒指", type: 'equipment', slot: 'ring', stats: { maxMP: 15 }, icon: 'ring1', description: "一個帶有微弱魔力的戒指。", rarity: 'rare'}, // 加了稀有戒指
    // 材料
    'goblin_ear': { name: "哥布林耳朵", type: 'material', stackable: true, maxStack: 50, icon: 'monster_part', description: "哥布林的耳朵，或許能賣錢。", rarity: 'common' },
};

// --- 怪物資料 ---
const MonsterData = {
    'goblin': {
        name: "哥布林", hp: 25, mp: 0, attack: 5, defense: 1, xp: 10, speed: 2,
        attackType: 'melee', // 近戰
        attackRange: TILE_SIZE * 1.2, // 近戰攻擊距離稍短
        aggroRange: TILE_SIZE * 5,
        color: [0, 150, 0], size: TILE_SIZE * 0.8,
        icon: 'goblin', // 圖示標識
        lootTable: [
            { itemId: 'hp_potion_small', chance: 0.3 },
            { itemId: 'goblin_ear', chance: 0.7 },
            { itemId: 'rusty_sword', chance: 0.05 },
            { itemId: 'sharp_dagger', chance: 0.02} // 有機率掉落匕首
        ]
    },
    'skeleton': {
        name: "骷髏弓箭手", hp: 43, mp: 0, attack: 2, defense: 3, xp: 18, speed: 2.5, // 攻擊力降低一點，因為是遠程
        attackType: 'ranged', // 遠程
        attackRange: TILE_SIZE * 6, // 遠程攻擊距離
        projectileType: 'arrow', // 投射物類型
        projectileSpeed: 7,
        projectileDamage: 6, // 投射物基礎傷害 (可以獨立於怪物攻擊力)
        aggroRange: TILE_SIZE * 8, // 遠程怪索敵範圍更大
        color: [200, 200, 200], size: TILE_SIZE * 0.9,
        icon: 'skeleton', // 圖示標識
        lootTable: [
            { itemId: 'hp_potion_small', chance: 0.2 },
            { itemId: 'mp_potion_small', chance: 0.1 },
            { itemId: 'leather_armor', chance: 0.08 },
            { itemId: 'short_bow', chance: 0.04 } // 有機率掉落弓
        ]
    },
    'bat': {
        name: "巨型蝙蝠", hp: 20, mp: 0, attack: 4, defense: 0, xp: 8, speed: 3.5, // 速度加快
        attackType: 'melee',
        attackRange: TILE_SIZE * 1.0,
        aggroRange: TILE_SIZE * 7,
        color: [50, 50, 50], size: TILE_SIZE * 0.6,
        icon: 'bat',
        lootTable: [
             { itemId: 'hp_potion_small', chance: 0.15 },
        ]
    }
    // ... 更多怪物
};

// --- NPC 資料 ---
const NpcData = {
    'villager_elder': {
        name: "村長", hp: 100, attack: 5, defense: 2,
        color: [0, 0, 200], size: TILE_SIZE * 0.9,
        icon: 'elder',
        dialogue: ["願聖光指引你。", "村外的世界很危險，小心行事。", "有什麼需要可以找鐵匠或商人。"],
        canFight: true,
        aggroRange: TILE_SIZE * 4,
        attackRange: TILE_SIZE * 1.5
    },
    'villager_guard': {
        name: "衛兵", hp: 150, attack: 15, defense: 5,
        color: [150, 150, 150], size: TILE_SIZE * 0.9,
        icon: 'guard',
        dialogue: ["站住！此處是安全的村莊。", "我會保護這裡的。", "看到可疑人物請告訴我。"],
        canFight: true,
        aggroRange: TILE_SIZE * 6,
        attackRange: TILE_SIZE * 1.8,
         pursuitRangeMultiplier: 1.5 // 衛兵會稍微追擊跑遠的敵人
    },
    'villager_farmer': {
        name: "農夫", hp: 80, attack: 3, defense: 1,
        color: [139, 69, 19], size: TILE_SIZE * 0.8,
        icon: 'farmer',
        dialogue: ["希望今年收成好...", "唉，怪物越來越多了。", "小心點，年輕人。"],
        canFight: false
    }
    // ... 更多 NPC (商人、鐵匠等)
};

// --- 玩家初始設定 ---
const PlayerDefaults = {
    hp: 110,
    mp: 50,
    attack: 5,
    defense: 1,
    speed: 3.5, // 稍微提高基礎速度
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    attackRange: TILE_SIZE * 1.5, // 基礎攻擊範圍 (近戰)
    pickupRadiusSq: (TILE_SIZE * 1.2) ** 2, // 拾取範圍平方
    inventorySize: 20,
    color: [255, 215, 0],
    size: TILE_SIZE * 0.9
};

// --- 地圖設定 ---
const MapSettings = {
    wildernessWidth: 100,
    wildernessHeight: 100,
    villageWidth: 25, // 村莊稍微大一點
    villageHeight: 25,
    wallThickness: 1,
    noiseScale: 0.08, // 調整噪聲參數
    obstacleDensity: 0.1,
    maxMonsters: 40, // 稍微降低最大怪物數，提高性能
    monsterSpawnInterval: 3500, // 怪物生成間隔 (ms)
    monsterSpawnCheckRadius: TILE_SIZE * 15, // 玩家周圍多大範圍內不生怪
};

// --- 稀有度顏色 (用於 UI 和 Tooltip) ---
const RarityColors = {
    common: '#FFFFFF',    // 白色
    uncommon: '#00FF00',  // 綠色
    rare: '#0070FF',      // 藍色
    legendary: '#A335EE', // 紫色
     // 可以添加更多...
     default: '#FFFFFF'   // 預設
};


// =============================================
// FILE: utils.js
// =============================================
console.log("Loading: utils.js");
function distSq(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return dx * dx + dy * dy;
}

function lerpVector(startVec, endVec, amount) {
    let x = lerp(startVec.x, endVec.x, amount);
    let y = lerp(startVec.y, endVec.y, amount);
    return createVector(x, y);
}

function randomFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[floor(random(arr.length))];
}

// --- 新增：簡單的繪圖輔助 ---
// (這些也可以放在各自的類別中)
function drawHealthBar(currentHp, maxHp, x, y, w, h, bgColor = color(50,0,0,180), hpColor = color(255,0,0,220)) {
    push();
    rectMode(CORNER);
    fill(bgColor);
    rect(x, y, w, h, 3); // 圓角
    fill(hpColor);
    const hpRatio = constrain(currentHp / maxHp, 0, 1);
    if (hpRatio > 0) {
        rect(x, y, w * hpRatio, h, 3);
    }
    pop();
}

// 獲取稀有度對應的 p5 color 物件
function getRarityP5Color(rarity) {
    const hex = RarityColors[rarity] || RarityColors.default;
    // Make sure color function is available (might not be during initial script load)
    if (typeof color === 'function') {
        return color(hex);
    } else {
        // Fallback or placeholder if color() isn't ready yet
        // This might happen if called very early before p5 fully initializes
        // For combining files, this should generally be okay as setup() runs later.
        console.warn("Attempted to use getRarityP5Color before p5 'color' function was ready. Returning white.");
        return { // Return a placeholder object mimicking p5.Color structure
            levels: [255, 255, 255, 255],
            toString: () => '#FFFFFF',
            setRed: function(r) { this.levels[0] = r; },
            setGreen: function(g) { this.levels[1] = g; },
            setBlue: function(b) { this.levels[2] = b; },
            setAlpha: function(a) { this.levels[3] = a; }
        };
    }
}


// =============================================
// FILE: item.js
// =============================================
console.log("Loading: item.js");
class Item {
    constructor(itemId, quantity = 1) {
        const data = ItemData[itemId];
        if (!data) {
            console.error("找不到物品 ID:", itemId);
            // Instead of returning null, which can cause constructor issues,
            // let's create a dummy 'error' item or throw an error.
            // For simplicity here, we'll log and make an 'invalid' item.
            this.id = 'invalid_item';
            this.name = '錯誤物品';
            this.type = 'error';
            this.description = `找不到 ID: ${itemId}`;
            this.icon = 'error';
            this.stackable = false;
            this.maxStack = 1;
            this.quantity = 0;
            this.rarity = 'common';
            return; // Stop further initialization for this invalid item
        }
        this.id = itemId;
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.icon = data.icon;
        this.stackable = data.stackable || false;
        this.maxStack = data.maxStack || 1;
        this.quantity = this.stackable ? quantity : 1;
        this.rarity = data.rarity || 'common'; // 添加 rarity

        if (this.type === 'equipment') {
            this.slot = data.slot;
            this.stats = data.stats || {};
        } else if (this.type === 'consumable') {
            this.effect = data.effect || {};
        }
    }

    addQuantity(amount) {
        if (!this.stackable) return false;
        this.quantity += amount;
        if (this.quantity > this.maxStack) {
            let overflow = this.quantity - this.maxStack;
            this.quantity = this.maxStack;
            return overflow;
        }
        return 0;
    }

    use(target) {
        if (this.type === 'consumable' && this.quantity > 0) {
            console.log(`${target.name} 使用了 ${this.name}`);
            let effectApplied = false;
            for (const effectKey in this.effect) {
                 // Ensure target has the base stat (e.g., 'hp') and the max stat (e.g., 'maxHP')
                 const maxStatKey = `max${effectKey.toUpperCase()}`;
                if (target.stats.hasOwnProperty(effectKey) && target.currentStats.hasOwnProperty(maxStatKey)) {
                     let healAmount = this.effect[effectKey];
                     let currentVal = target.stats[effectKey];
                     let maxVal = target.currentStats[maxStatKey]; // Use currentStats for max values
                     let newVal = min(maxVal, currentVal + healAmount);
                      let actualHeal = newVal - currentVal; // Calculate actual amount healed

                      if(actualHeal > 0) {
                         target.stats[effectKey] = newVal; // Apply the new value
                         // Check if uiManager exists before using it
                         if (typeof uiManager !== 'undefined' && uiManager) {
                            uiManager.addFloatingText(`+${actualHeal}`, target.pos.x, target.pos.y + random(-5, 5), 'lime');
                         } else {
                             console.log(`Healed ${effectKey} by ${actualHeal}`); // Fallback log
                         }
                         effectApplied = true;
                      }
                } else {
                    console.warn(`Target ${target.name} missing stat '${effectKey}' or '${maxStatKey}' for item use.`);
                }
            }
             if(effectApplied){
                  this.quantity--;
                  // Check if playSound exists before using it
                  if (typeof playSound === 'function') playSound('useItem');
                  return this.quantity > 0;
             }
        }
        return this.quantity > 0; // If unable to use or no effect, but quantity remains, return true
    }
}

class DroppedItem {
    constructor(item, x, y) {
        if (!item || item.type === 'error') {
             console.error("Attempted to create DroppedItem with invalid item:", item);
             // Handle this case, maybe prevent creation or set a flag
             this.item = null; // Mark as invalid
             this.pos = createVector(x, y);
             this.creationTime = millis();
             this.lifespan = 100; // Expire quickly
             this.invalid = true;
             return;
        }
        this.item = item;
        this.pos = createVector(x, y);
        this.pickupRadiusSq = PlayerDefaults.pickupRadiusSq * 0.8; // 拾取判定的範圍可以比玩家定義的小一點
        this.creationTime = millis();
        this.lifespan = 60000; // 60 秒消失
        this.bobbingOffset = 0; // 用於上下浮動效果
        this.bobbingSpeed = random(0.05, 0.1);
        this.invalid = false;
    }

    isExpired() {
        return this.invalid || millis() - this.creationTime > this.lifespan;
    }

    render(offsetX, offsetY) {
         if (this.invalid || !this.item) return; // Don't render invalid items

        this.bobbingOffset = sin(frameCount * this.bobbingSpeed) * 3; // 計算浮動偏移

        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY + this.bobbingOffset); // 加入浮動效果

        const itemSize = TILE_SIZE * 0.4;
        const rarityColor = getRarityP5Color(this.item.rarity);

        // --- 繪製稀有度光暈 ---
        if (this.item.rarity !== 'common') {
            let glowAlpha = map(sin(frameCount * 0.05), -1, 1, 80, 150); // 呼吸效果
            let glowSize = itemSize * 1.8;
            noStroke();
            // 多層疊加模擬光暈
             for(let i = 3; i > 0; i--){
                  // Need to access color components safely
                  let r = (typeof red === 'function') ? red(rarityColor) : 255;
                  let g = (typeof green === 'function') ? green(rarityColor) : 255;
                  let b = (typeof blue === 'function') ? blue(rarityColor) : 255;
                  fill(r, g, b, glowAlpha / (i*1.5));
                  ellipse(0, 0, glowSize * (1 + (3-i)*0.2) , glowSize * (1 + (3-i)*0.2));
             }
        }

        // --- 繪製物品基礎圖示 ---
        noStroke();
        // 根據類型給個基礎顏色/形狀 (未來可替換為真實圖標)
        if (this.item.type === 'equipment') {
            fill(180, 180, 220); // 淡藍紫色代表裝備
            rectMode(CENTER);
            rect(0, 0, itemSize * 0.8, itemSize * 1.2, 2); // 類似裝備形狀
        } else if (this.item.type === 'consumable') {
             if(this.item.effect && this.item.effect.hp) fill(255, 80, 80); // 紅色代表血瓶
             else if(this.item.effect && this.item.effect.mp) fill(80, 80, 255); // 藍色代表藍瓶
             else fill(200, 200, 100); // 其他消耗品黃色
            ellipse(0, 0, itemSize, itemSize); // 圓形代表藥水
        } else {
            fill(150); // 灰色 (材料等)
            ellipse(0, 0, itemSize * 0.9, itemSize * 0.7); // 橢圓代表材料
        }
        // 加一個高光點綴
         fill(255, 255, 255, 180);
         ellipse(-itemSize * 0.2, -itemSize * 0.2, itemSize * 0.2);

        pop();
    }
}


// =============================================
// FILE: projectile.js
// =============================================
console.log("Loading: projectile.js");
class Projectile {
    constructor(startX, startY, targetX, targetY, speed, damage, owner, type = 'arrow') {
        this.pos = createVector(startX, startY);
        this.vel = createVector(targetX - startX, targetY - startY);
        // Prevent zero magnitude vector if start and target are the same
        if (this.vel.magSq() < 0.001) {
            this.vel.set(speed, 0); // Default to moving right if no direction
        } else {
            this.vel.setMag(speed);
        }
        this.damage = damage;
        this.owner = owner; // 發射者 (用於避免打到自己或友軍)
        this.type = type;
        this.size = TILE_SIZE * 0.2;
        this.creationTime = millis();
        this.lifespan = 3000; // 最長存活時間 (ms)
        this.collided = false;
    }

    update(monsters, player, npcs, obstacles) { // `obstacles` here is expected to be the map grid or the GameMap object
        if (this.collided || millis() - this.creationTime > this.lifespan) {
            return false; // 返回 false 表示需要被移除
        }

        this.pos.add(this.vel);

        // --- 碰撞檢測 ---
        // Make sure currentMap is accessible globally or passed in
        const map = (typeof currentMap !== 'undefined') ? currentMap : null;

        // 1. 檢查地圖障礙物或邊界
        if (map && (map.isObstacle(this.pos.x, this.pos.y) || map.isOutsideBounds(this.pos.x, this.pos.y))) {
            this.collided = true;
             // if (typeof playSound === 'function') playSound('projectileHitWall'); // Optional sound
             // 可以產生一個小的擊中效果
             if (typeof visualEffects !== 'undefined') {
                  let effect = { type: 'spark', pos: this.pos.copy(), color: color(180), duration: 100, startTime: millis() };
                  visualEffects.push(effect);
             }
            return false;
        }

        // 2. 檢查是否擊中目標單位
        let targetHit = null;
        // Use a slightly larger radius for hit detection
        const hitRadiusSq = ((this.size > 0 ? this.size : TILE_SIZE * 0.1) * 1.5)**2;

        // 檢查是否擊中玩家 (Make sure player is accessible)
        const globalPlayer = (typeof player !== 'undefined') ? player : null;
        if (this.owner !== globalPlayer && globalPlayer && globalPlayer.stats && globalPlayer.stats.hp > 0) {
            const playerSize = globalPlayer.size || TILE_SIZE * 0.5; // Safer access
            if (distSq(this.pos.x, this.pos.y, globalPlayer.pos.x, globalPlayer.pos.y) < hitRadiusSq + (playerSize/2)**2) {
                targetHit = globalPlayer;
            }
        }

        // 檢查是否擊中怪物 (Make sure monsters is accessible)
        const globalMonsters = (typeof monsters !== 'undefined') ? monsters : [];
         if (!targetHit && !(this.owner instanceof Monster)) { // Check owner type correctly
            for (let monster of globalMonsters) {
                 if (monster !== this.owner && monster.state !== 'dead' && monster.stats && monster.stats.hp > 0) { // Extra checks for safety
                      const monsterSize = monster.size || TILE_SIZE * 0.5;
                     if (distSq(this.pos.x, this.pos.y, monster.pos.x, monster.pos.y) < hitRadiusSq + (monsterSize/2)**2) {
                         targetHit = monster;
                         break;
                     }
                 }
            }
         }

         // 檢查是否擊中 NPC (Make sure npcs is accessible)
         const globalNpcs = (typeof npcs !== 'undefined') ? npcs : [];
         if (!targetHit && !(this.owner instanceof Npc)) { // Check owner type correctly
             for (let npc of globalNpcs) {
                  if (npc !== this.owner && npc.state !== 'dead' && npc.stats && npc.stats.hp > 0) { // Extra checks
                       const npcSize = npc.size || TILE_SIZE * 0.5;
                       if (distSq(this.pos.x, this.pos.y, npc.pos.x, npc.pos.y) < hitRadiusSq + (npcSize/2)**2) {
                           targetHit = npc;
                           break;
                       }
                  }
             }
         }


        if (targetHit) {
            // console.log(`投射物擊中了 ${targetHit.name}`);
            if (typeof targetHit.takeDamage === 'function') {
                 targetHit.takeDamage(this.damage, this.owner);
            } else {
                 console.error("Target hit has no takeDamage method:", targetHit);
            }
            this.collided = true;
             // if (typeof playSound === 'function') playSound('projectileHitTarget');
            return false; // 擊中目標後消失
        }

        return true; // 繼續存在
    }

    render(offsetX, offsetY) {
        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);
        rotate(this.vel.heading()); // 指向移動方向

        if (this.type === 'arrow') {
            fill(139, 69, 19); // 棕色箭桿
            stroke(200);
            strokeWeight(1);
            line(-this.size * 1.5, 0, this.size * 1.5, 0); // 箭桿
            // 箭頭
             triangle(this.size*1.5, 0, this.size*0.8, -this.size*0.5, this.size*0.8, this.size*0.5);
            // 箭羽
             line(-this.size*1.0, -this.size*0.4, -this.size*1.5, 0);
             line(-this.size*1.0, this.size*0.4, -this.size*1.5, 0);

        } else {
            // 其他類型的投射物 (例如魔法彈)
            fill(255, 0, 255, 200); // 紫色魔法彈
            noStroke();
            ellipse(0, 0, this.size * 2, this.size * 2);
        }

        pop();
    }
}


// =============================================
// FILE: map.js
// =============================================
console.log("Loading: map.js");
class GameMap {
    constructor(width, height, isVillage = false) {
        this.width = width;
        this.height = height;
        this.isVillage = isVillage;
        this.grid = [];
        this.mapWidthPixels = this.width * TILE_SIZE;
        this.mapHeightPixels = this.height * TILE_SIZE;

        this.spawnPoints = [];
        this.exitPoint = null;
        this.entryPoint = null;

        this.generateMap();
    }

    generateMap() {
        // Ensure p5 functions are available or use alternatives if needed early
        if (typeof noiseSeed === 'function') noiseSeed(millis()); // Use p5's millis() for seed
        else console.warn("noiseSeed function not available during map generation.");

        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = this.isVillage ? 1 : 3; // 村莊預設牆，野外預設水 (待挖掘)
            }
        }

        if (this.isVillage) {
            this.generateVillageLayout();
        } else {
            this.generateWildernessLayout();
        }
    }

    generateVillageLayout() {
        // Using floor, random - assumes p5 global scope or alternatives provided
        let drunkX = floor(this.width / 2);
        let drunkY = floor(this.height / 2);
        let steps = floor(this.width * this.height * 0.6); // 挖掘更多空間
         let floorTile = 0; // 地板

         // 確保邊界是牆
         for(let y=0; y<this.height; ++y){
              for(let x=0; x<this.width; ++x){
                   if(x==0 || x==this.width-1 || y==0 || y==this.height-1) this.grid[y][x]=1;
                   else this.grid[y][x]=1; // 內部也先填滿牆
              }
         }

         // 開始挖掘 - Ensure grid access is safe
         if (this.grid[drunkY]) this.grid[drunkY][drunkX] = floorTile;

         let wallThickness = MapSettings.wallThickness; // 至少保留的外牆厚度

         for (let i = 0; i < steps; i++) {
             let dir = floor(random(4));
             let nx = drunkX, ny = drunkY;
             switch (dir) {
                 case 0: ny = max(wallThickness, drunkY - 1); break; // using max - p5 global assumed
                 case 1: nx = min(this.width - 1 - wallThickness, drunkX + 1); break; // using min - p5 global assumed
                 case 2: ny = min(this.height - 1 - wallThickness, drunkY + 1); break;
                 case 3: nx = max(wallThickness, drunkX - 1); break;
             }
              // 確保在有效範圍內挖掘
              if (nx >= wallThickness && nx < this.width - wallThickness && ny >= wallThickness && ny < this.height - wallThickness) {
                   drunkX = nx;
                   drunkY = ny;
                   if (this.grid[drunkY]) this.grid[drunkY][drunkX] = floorTile;
                   // 加寬通道
                   if (random() < 0.4) { // 有機率加寬
                       let dx = floor(random(-1, 2));
                       let dy = floor(random(-1, 2));
                        if(abs(dx)+abs(dy) === 1){ // 只加寬相鄰格子 - abs is p5 global assumed
                             let wx = drunkX+dx;
                             let wy = drunkY+dy;
                             if (wx >= wallThickness && wx < this.width - wallThickness && wy >= wallThickness && wy < this.height - wallThickness) {
                                  if (this.grid[wy]) this.grid[wy][wx] = floorTile;
                             }
                        }
                   }
              } else {
                    // 如果走到邊界，跳回中心附近重新開始
                   drunkX = floor(random(this.width * 0.4, this.width * 0.6));
                   drunkY = floor(random(this.height * 0.4, this.height * 0.6));
                    if(this.grid[drunkY] && this.grid[drunkY][drunkX] !== undefined) this.grid[drunkY][drunkX] = floorTile; // 確保新起點是地板
              }
         }


        // 開一個出口
         const exitSide = floor(random(4));
         let exitX = floor(this.width / 2);
         let exitY = floor(this.height / 2);
         const exitWidth = 2;

         // 強制打通出口路徑 (從中心挖到邊緣)
         let pathX = floor(this.width/2);
         let pathY = floor(this.height/2);

         // Ensure createVector is available
         const createVec = (typeof createVector === 'function') ? createVector : (x,y) => ({x:x, y:y}); // Basic fallback

         if (exitSide === 0) { // 上
              exitY = wallThickness - 1;
              while(pathY >= exitY) { if(this.grid[pathY]) this.grid[pathY][pathX] = floorTile; if(this.grid[pathY] && this.grid[pathY][pathX+1]) this.grid[pathY][pathX+1] = floorTile; pathY--; }
              for(let i = 0; i < exitWidth; i++) if(this.grid[exitY] && this.grid[exitY][pathX+i]) this.grid[exitY][pathX+i] = 2;
              this.exitPoint = createVec((pathX + exitWidth/2) * TILE_SIZE, (exitY - 0.5) * TILE_SIZE);
              this.entryPoint = createVec((pathX + exitWidth/2) * TILE_SIZE, (exitY + 1.5) * TILE_SIZE);
         } else if (exitSide === 1) { // 右
              exitX = this.width - wallThickness;
              while(pathX <= exitX) { if(this.grid[pathY]) this.grid[pathY][pathX] = floorTile; if(this.grid[pathY+1] && this.grid[pathY+1][pathX]) this.grid[pathY+1][pathX] = floorTile; pathX++; }
               for(let i = 0; i < exitWidth; i++) if(this.grid[pathY+i] && this.grid[pathY+i][exitX]) this.grid[pathY+i][exitX] = 2;
               this.exitPoint = createVec((exitX + 0.5) * TILE_SIZE, (pathY + exitWidth/2) * TILE_SIZE);
               this.entryPoint = createVec((exitX - 1.5) * TILE_SIZE, (pathY + exitWidth/2) * TILE_SIZE);
         } else if (exitSide === 2) { // 下
              exitY = this.height - wallThickness;
              while(pathY <= exitY) { if(this.grid[pathY]) this.grid[pathY][pathX] = floorTile; if(this.grid[pathY] && this.grid[pathY][pathX+1]) this.grid[pathY][pathX+1] = floorTile; pathY++; }
               for(let i = 0; i < exitWidth; i++) if(this.grid[exitY] && this.grid[exitY][pathX+i]) this.grid[exitY][pathX+i] = 2;
               this.exitPoint = createVec((pathX + exitWidth/2) * TILE_SIZE, (exitY + 0.5) * TILE_SIZE);
               this.entryPoint = createVec((pathX + exitWidth/2) * TILE_SIZE, (exitY - 1.5) * TILE_SIZE);
         } else { // 左
              exitX = wallThickness - 1;
              while(pathX >= exitX) { if(this.grid[pathY]) this.grid[pathY][pathX] = floorTile; if(this.grid[pathY+1] && this.grid[pathY+1][pathX]) this.grid[pathY+1][pathX] = floorTile; pathX--; }
               for(let i = 0; i < exitWidth; i++) if(this.grid[pathY+i] && this.grid[pathY+i][exitX]) this.grid[pathY+i][exitX] = 2;
               this.exitPoint = createVec((exitX - 0.5) * TILE_SIZE, (pathY + exitWidth/2) * TILE_SIZE);
               this.entryPoint = createVec((exitX + 1.5) * TILE_SIZE, (pathY + exitWidth/2) * TILE_SIZE);
         }

         // Ensure entry/exit points are valid if creation failed
         this.exitPoint = this.exitPoint || createVec(this.mapWidthPixels/2, this.mapHeightPixels/2);
         this.entryPoint = this.entryPoint || createVec(this.mapWidthPixels/2, this.mapHeightPixels/2);

        // 放置一些裝飾性障礙物 (房子等)
        for (let i = 0; i < 7; i++) {
             let houseX = floor(random(wallThickness + 1, this.width - wallThickness - 2));
             let houseY = floor(random(wallThickness + 1, this.height - wallThickness - 2));
              // Ensure grid access and distSq are safe
             if (this.grid[houseY] && this.grid[houseY][houseX] === floorTile &&
                  this.entryPoint && this.exitPoint && // Check points exist
                 distSq(houseX * TILE_SIZE, houseY*TILE_SIZE, this.entryPoint.x, this.entryPoint.y) > (TILE_SIZE * 4)**2 &&
                  distSq(houseX * TILE_SIZE, houseY*TILE_SIZE, this.exitPoint.x, this.exitPoint.y) > (TILE_SIZE * 4)**2 )
             {
                  this.grid[houseY][houseX] = 1; // 房子用牆表示
                  if (this.grid[houseY+1] && this.grid[houseY+1][houseX] === floorTile && random()<0.7) this.grid[houseY+1][houseX] = 1; // 隨機擴展
                   if (this.grid[houseY][houseX+1] && this.grid[houseY][houseX+1] === floorTile && random()<0.7) this.grid[houseY][houseX+1] = 1;
             }
        }

        // 設定 NPC 出生點 (在可通行的地板上隨機找點)
        this.spawnPoints = [];
        let npcAttempts = 20;
         while(this.spawnPoints.length < 5 && npcAttempts > 0){
              let sx = floor(random(wallThickness, this.width - wallThickness));
              let sy = floor(random(wallThickness, this.height - wallThickness));
               // Ensure grid access and entryPoint are safe
              if(this.grid[sy] && this.grid[sy][sx] === floorTile && this.entryPoint && distSq(sx*TILE_SIZE, sy*TILE_SIZE, this.entryPoint.x, this.entryPoint.y) > (TILE_SIZE*3)**2){
                   this.spawnPoints.push(createVec((sx + 0.5) * TILE_SIZE, (sy + 0.5) * TILE_SIZE));
              }
              npcAttempts--;
         }
         // 確保至少有一個出生點靠近入口 (例如衛兵)
         if (this.entryPoint) { // Ensure entryPoint exists before using it
              this.spawnPoints.push(createVec(this.entryPoint.x + TILE_SIZE, this.entryPoint.y));
         } else { // Fallback if entryPoint is somehow null
              this.spawnPoints.push(createVec((floor(this.width/2) + 1) * TILE_SIZE, (floor(this.height/2) + 1) * TILE_SIZE));
         }
    }

    generateWildernessLayout() {
         // Ensure p5 noise functions are available
         if (typeof noiseDetail === 'function') noiseDetail(5, 0.55);
         else console.warn("noiseDetail function not available during map generation.");

         const waterLevel = 0.38;
         const mountainLevel = 0.68;
         const noiseFn = (typeof noise === 'function') ? noise : (x,y) => random(); // Fallback noise

         for (let y = 0; y < this.height; y++) {
             for (let x = 0; x < this.width; x++) {
                 let n = noiseFn(x * MapSettings.noiseScale, y * MapSettings.noiseScale);
                 let n2 = noiseFn(x * MapSettings.noiseScale * 2 + 100, y * MapSettings.noiseScale * 2 + 100); // 第二層噪聲增加細節

                  let finalN = (n * 0.7 + n2 * 0.3); // 混合噪聲

                 if (finalN < waterLevel) {
                     this.grid[y][x] = 3; // 水域
                 } else if (finalN > mountainLevel || x < 1 || x > this.width - 2 || y < 1 || y > this.height - 2) { // 山脈或邊界
                     this.grid[y][x] = 1; // 牆壁/山
                 } else {
                     this.grid[y][x] = 0; // 草地/泥地
                 }
             }
         }

        // Drunkard's Walk 保證連通性並創建主要路徑
        let drunkX = floor(this.width / 2);
        let drunkY = floor(this.height / 2);
        let steps = floor(this.width * this.height * 0.4);
        if (this.grid[drunkY]) this.grid[drunkY][drunkX] = 0; // Safe access

        for (let i = 0; i < steps; i++) {
            let dir = floor(random(4));
            let nx = drunkX, ny = drunkY;
             switch (dir) {
                 case 0: ny = max(1, drunkY - 1); break;
                 case 1: nx = min(this.width - 2, drunkX + 1); break;
                 case 2: ny = min(this.height - 2, drunkY + 1); break;
                 case 3: nx = max(1, drunkX - 1); break;
             }
              drunkX = nx; drunkY = ny;
              if (this.grid[drunkY] && this.grid[drunkY][drunkX] !== undefined) {
                  this.grid[drunkY][drunkX] = 0; // 挖掘
                  // 加寬
                   if (random() < 0.5) {
                       let dx = floor(random(-1, 2)); let dy = floor(random(-1, 2));
                       if(abs(dx)+abs(dy) === 1){
                            let wx = drunkX+dx; let wy = drunkY+dy;
                             // Safe grid access and type check
                             if(wx > 0 && wx < this.width-1 && wy > 0 && wy < this.height-1 && this.grid[wy] && this.grid[wy][wx] !== 3){ // 不挖穿水域
                                  this.grid[wy][wx] = 0;
                             }
                       }
                   }
              } else {
                   drunkX = floor(random(this.width*0.4, this.width*0.6));
                   drunkY = floor(random(this.height*0.4, this.height*0.6));
                   if(this.grid[drunkY] && this.grid[drunkY][drunkX] !== undefined) this.grid[drunkY][drunkX] = 0;
              }
        }

        // Ensure createVector is available
        const createVec = (typeof createVector === 'function') ? createVector : (x,y) => ({x:x, y:y});

        // 設定野外入口點 (對應村莊出口 - 需全局協調, 這裡仍用近似)
        // 嘗試在靠近地圖中心下方找一個可通行的點
        let entryX = floor(this.width / 2);
        let entryY = floor(this.height * 0.8); // 靠近底部邊緣
         let attempts = 20;
         // Safer grid checking loop
         while(attempts > 0 && (
                 !this.grid[entryY] || this.grid[entryY][entryX] !== 0 ||
                 !this.grid[entryY+1] || this.grid[entryY+1][entryX] !== 0
             )) {
             entryY--;
              if (entryY <= 1) { entryY = floor(this.height/2); break;} // 防止找不到卡死
              attempts--;
         }
         // If still not found, force it (safer access)
         if (!this.grid[entryY] || this.grid[entryY][entryX] !== 0) {
              entryY = floor(this.height / 2) + 5;
              entryX = floor(this.width/2);
              if (entryY >= this.height) entryY = this.height - 2; // Ensure within bounds
              if (entryY < 0) entryY = 1;
              if (this.grid[entryY]) this.grid[entryY][entryX] = 0;
              if(this.grid[entryY+1]) this.grid[entryY+1][entryX] = 0;
         }

        this.entryPoint = createVec((entryX + 0.5) * TILE_SIZE, (entryY + 0.5) * TILE_SIZE);
        this.exitPoint = this.entryPoint; // 出口即入口
        if(this.grid[entryY]) this.grid[entryY][entryX-1] = 4; // 特殊標記：返回村莊的入口
         // 稍微清理入口周圍的障礙物 (safer access)
         for(let dy = -1; dy <= 1; dy++){
              for(let dx = -1; dx <= 1; dx++){
                   let checkY = entryY + dy;
                   let checkX = entryX + dx;
                   if(this.grid[checkY] && this.grid[checkY][checkX] === 1){
                        this.grid[checkY][checkX] = 0;
                   }
              }
         }

        // 設定怪物出生點
        this.spawnPoints = [];
        let spawnAttempts = MapSettings.maxMonsters * 5;
        // Ensure entryPoint exists before using in distance check
        const entryCheckX = this.entryPoint ? this.entryPoint.x : -1000;
        const entryCheckY = this.entryPoint ? this.entryPoint.y : -1000;

        while (this.spawnPoints.length < MapSettings.maxMonsters * 1.5 && spawnAttempts > 0) {
            let sx = floor(random(1, this.width-1));
            let sy = floor(random(1, this.height-1));
            // Safer grid access and distance check
            if (this.grid[sy] && this.grid[sy][sx] === 0 &&
                distSq(sx * TILE_SIZE, sy * TILE_SIZE, entryCheckX, entryCheckY) > (MapSettings.monsterSpawnCheckRadius * 0.8)**2)
            {
                this.spawnPoints.push(createVec((sx + 0.5) * TILE_SIZE, (sy + 0.5) * TILE_SIZE));
            }
            spawnAttempts--;
        }
    }


    getTileType(pixelX, pixelY) {
        let gridX = floor(pixelX / TILE_SIZE);
        let gridY = floor(pixelY / TILE_SIZE);
        if (this.grid[gridY] && gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
            return this.grid[gridY][gridX];
        } return -1; // Return -1 for out of bounds or invalid access
    }

    isObstacle(pixelX, pixelY) {
        let tileType = this.getTileType(pixelX, pixelY);
        return tileType === 1 || tileType === 3; // 牆和水是障礙
    }

     isOutsideBounds(pixelX, pixelY) {
         return pixelX < 0 || pixelX >= this.mapWidthPixels || pixelY < 0 || pixelY >= this.mapHeightPixels;
     }

     isOnExit(pixelX, pixelY) {
         if (!this.exitPoint) return false;
         const exitRadiusSq = (TILE_SIZE * 1.2)**2; // 範圍稍大
         return distSq(pixelX, pixelY, this.exitPoint.x, this.exitPoint.y) < exitRadiusSq;
     }

     isOnVillageEntrance(pixelX, pixelY) {
          if (this.isVillage) return false;
          let gridX = floor(pixelX / TILE_SIZE);
          let gridY = floor(pixelY / TILE_SIZE);
           if (this.grid[gridY] && gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
               return this.grid[gridY][gridX] === 4;
           } return false;
     }

    getRandomSpawnPoint(referencePos = null, minDistanceSq = 0) {
         if (this.spawnPoints.length === 0) return null;

         let validPoints = this.spawnPoints;
         if (referencePos && minDistanceSq > 0) {
             validPoints = this.spawnPoints.filter(pt => pt && distSq(pt.x, pt.y, referencePos.x, referencePos.y) > minDistanceSq);
         }

         if (validPoints.length === 0) return randomFromArray(this.spawnPoints.filter(pt => pt)); // Filter nulls before random choice
         return randomFromArray(validPoints);
    }


    render(offsetX, offsetY, screenWidth, screenHeight) {
        // Ensure p5 drawing functions are available
        if (typeof push !== 'function' || typeof pop !== 'function' || typeof translate !== 'function' || typeof fill !== 'function' || typeof rect !== 'function' || typeof noStroke !== 'function' || typeof ellipse !== 'function' || typeof sin !== 'function' || typeof noise !== 'function' || typeof color !== 'function' || typeof frameCount === 'undefined') {
            console.error("p5 drawing functions not ready for map rendering.");
            return;
        }

        let startX = floor(offsetX / TILE_SIZE);
        let startY = floor(offsetY / TILE_SIZE);
        let endX = ceil((offsetX + screenWidth) / TILE_SIZE); // ceil ensures covering edge tiles
        let endY = ceil((offsetY + screenHeight) / TILE_SIZE);

        startX = max(0, startX); startY = max(0, startY);
        endX = min(this.width, endX); endY = min(this.height, endY); // Use p5.min/max

        push();
        translate(-offsetX, -offsetY);
        rectMode(CORNER);
        noStroke();

        for (let y = startY; y < endY; y++) {
             if (!this.grid[y]) continue; // Skip if row doesn't exist
            for (let x = startX; x < endX; x++) {
                let tileType = this.grid[y][x];
                 if (tileType === undefined) continue; // Skip if tile doesn't exist

                let tileX = x * TILE_SIZE;
                let tileY = y * TILE_SIZE;
                let tileColor;
                 let noiseVal = noise(x * 0.1, y * 0.1) * 50 - 25; // Calculate noise once

                switch (tileType) {
                    case 0: // 地板
                        let baseCol = this.isVillage ? color(160, 130, 100) : color(50, 100, 50);
                         tileColor = color(red(baseCol)+noiseVal, green(baseCol)+noiseVal, blue(baseCol)+noiseVal);
                         fill(tileColor);
                         rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1); // Overdraw slightly to avoid gaps
                        break;
                    case 1: // 牆壁/山脈
                        let wallCol = this.isVillage ? color(100, 70, 40) : color(90, 90, 90);
                         let nWall = noise(x * 0.1 + 10, y * 0.1 + 10) * 30 - 15;
                         tileColor = color(red(wallCol)+nWall, green(wallCol)+nWall, blue(wallCol)+nWall);
                         fill(tileColor);
                         rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1);
                          // 簡單的陰影效果
                         fill(0, 0, 0, 50);
                         rect(tileX, tileY + TILE_SIZE * 0.7, TILE_SIZE+1, TILE_SIZE * 0.3);
                         rect(tileX + TILE_SIZE * 0.7, tileY, TILE_SIZE * 0.3, TILE_SIZE * 0.7);
                        break;
                    case 2: // 村莊出口
                         let exitFloorCol = color(160, 130, 100);
                         fill(red(exitFloorCol)+noiseVal, green(exitFloorCol)+noiseVal, blue(exitFloorCol)+noiseVal);
                         rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1);
                         // 疊加標示色
                         fill(255, 255, 0, 80 + sin(frameCount*0.1)*30); // 呼吸效果
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE); // Exact size for overlay
                        break;
                    case 3: // 水域
                         let waterBase = color(40, 80, 150);
                          let nWater = noise(x * 0.08 + frameCount * 0.01, y * 0.08 + frameCount * 0.01) * 40 - 20; // 流動效果
                          fill(red(waterBase)+nWater, green(waterBase)+nWater, blue(waterBase)+nWater);
                          rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1);
                           // 水波紋 (簡單)
                          noFill(); stroke(255, 255, 255, 30 + sin(x+frameCount*0.05)*15); strokeWeight(1);
                          ellipse(tileX + TILE_SIZE/2, tileY + TILE_SIZE/2, TILE_SIZE*0.8, TILE_SIZE*0.4);
                           noStroke();
                        break;
                    case 4: // 野外回村入口
                         let wildFloorCol = color(50, 100, 50);
                         fill(red(wildFloorCol)+noiseVal, green(wildFloorCol)+noiseVal, blue(wildFloorCol)+noiseVal);
                         rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1);
                         // 疊加標示色
                         fill(0, 255, 255, 80 + sin(frameCount*0.1 + PI)*30); // 青色呼吸
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                        break;
                    default:
                        fill(255, 0, 255); // 紫色錯誤
                        rect(tileX, tileY, TILE_SIZE+1, TILE_SIZE+1);
                }
            }
        }
        pop();
    }
}


// =============================================
// FILE: ui.js
// =============================================
console.log("Loading: ui.js");
// --- 浮動文字類 ---
class FloatingText {
    constructor(text, x, y, colorVal = 'white', duration = 1000, size = 16) {
        this.text = text;
        this.pos = createVector(x, y);
        this.startY = y;
        // Handle color input being string or p5.Color
        this.color = (typeof colorVal === 'string') ? color(colorVal) : colorVal;
        this.duration = duration;
        this.creationTime = millis();
        this.alpha = 255;
        this.speed = 1.8;
        this.size = size;
    }

    update() {
        const elapsed = millis() - this.creationTime;
        if (elapsed > this.duration) {
            return false;
        }
        this.pos.y -= this.speed * (1 - elapsed / this.duration); // 向上速度減緩
        // Ensure map function is available
        this.alpha = (typeof map === 'function') ? map(elapsed, 0, this.duration, 255, 0) : 255 * (1 - elapsed / this.duration);
        return true;
    }

    render(offsetX, offsetY) {
        // Ensure p5 functions are available
        if (typeof push !== 'function') return;
        push();
        // Set fill color safely, handling potential alpha changes
        let baseColor = this.color;
        fill(red(baseColor), green(baseColor), blue(baseColor), this.alpha);
        textSize(this.size);
        textAlign(CENTER, BOTTOM);
        textFont('monospace');
         stroke(0, this.alpha); // 加黑色描邊更清晰
         strokeWeight(1.5);
        text(this.text, this.pos.x - offsetX, this.pos.y - offsetY);
        pop();
    }
}

// --- 系統訊息類 ---
class SystemMessage {
     constructor(text, p5color = color(255), duration = 3000){ // 接受 p5 color
          this.text = text;
          this.color = p5color;
          this.duration = duration;
          this.creationTime = millis();
          this.alpha = 255;
     }
     isExpired(){ return millis() - this.creationTime > this.duration; }
     update(){
          const elapsed = millis() - this.creationTime;
          const fadeTime = 500;
          if(this.duration - elapsed < fadeTime){
               this.alpha = (typeof map === 'function') ? map(elapsed, this.duration - fadeTime, this.duration, 255, 0) : 255 * (1 - (elapsed - (this.duration - fadeTime))/fadeTime) ;
          } else {
               this.alpha = 255;
          }
          this.alpha = constrain(this.alpha, 0, 255); // Ensure alpha stays in bounds
     }
     render(x, y){
          // Ensure p5 functions are available
          if (typeof push !== 'function') return;
          push();
          fill(red(this.color), green(this.color), blue(this.color), this.alpha);
          textSize(14);
          textAlign(LEFT, BOTTOM);
          textFont('sans-serif');
           // textFont('Georgia'); // 換個字體試試
           stroke(0, this.alpha * 0.7); strokeWeight(1); // 文字陰影
          text(this.text, x, y);
          pop();
     }
}

// --- UI 管理器 ---
class UIManager {
    constructor() {
        this.floatingTexts = [];
        this.systemMessages = [];
        this.maxMessages = 6;

        this.showInventory = false;
        this.inventoryPanel = { x: 0, y: 0, w: 0, h: 0, rows: 5, cols: 4, slotSize: 45, padding: 8 }; // 調整格子大小和間距
        this.equipmentPanel = {x: 0, y: 0, w: 0, h: 0, slotSize: 45, padding: 8}; // Ensure defaults match
        this.tooltip = { show: false, text: "", x: 0, y: 0, w:0, h:0 }; // 加入寬高方便定位

        this.calculateLayout(); // Call layout calculation
    }

     calculateLayout() {
         // Ensure width/height are available (might be 0 during initial load)
         const w = (typeof width !== 'undefined' && width > 0) ? width : 600; // Default fallback
         const h = (typeof height !== 'undefined' && height > 0) ? height : 400;

         const margin = 15;
         const bottomMargin = 10;
         const barHeight = 18;
         this.bottomUIStartY = h - bottomMargin - barHeight * 2 - 40; // 底部 UI 起始 Y

         this.inventoryPanel.cols = 4;
         // Use PlayerDefaults safely
         const invSize = (typeof PlayerDefaults !== 'undefined') ? PlayerDefaults.inventorySize : 20;
         this.inventoryPanel.rows = ceil(invSize / this.inventoryPanel.cols); // 用 ceil 確保格子夠
         this.inventoryPanel.w = this.inventoryPanel.cols * (this.inventoryPanel.slotSize + this.inventoryPanel.padding) + this.inventoryPanel.padding;
         this.inventoryPanel.h = this.inventoryPanel.rows * (this.inventoryPanel.slotSize + this.inventoryPanel.padding) + this.inventoryPanel.padding + 35; // 標題高度
         this.inventoryPanel.x = w - this.inventoryPanel.w - margin;
         this.inventoryPanel.y = h / 2 - this.inventoryPanel.h / 2;

         this.equipmentPanel.slotSize = this.inventoryPanel.slotSize;
         this.equipmentPanel.padding = this.inventoryPanel.padding;
         this.equipmentPanel.h = this.inventoryPanel.h; // 高度一致
         this.equipmentPanel.w = this.equipmentPanel.slotSize * 1 + this.equipmentPanel.padding * 2 + 60; // 1列格子+標籤寬度
         this.equipmentPanel.x = this.inventoryPanel.x - this.equipmentPanel.w - margin;
         this.equipmentPanel.y = this.inventoryPanel.y;

         // Ensure panels stay on screen
         this.inventoryPanel.x = max(margin, this.inventoryPanel.x);
         this.inventoryPanel.y = max(margin, this.inventoryPanel.y);
         this.equipmentPanel.x = max(margin, this.equipmentPanel.x);
         this.equipmentPanel.y = max(margin, this.equipmentPanel.y);
     }

    addFloatingText(text, worldX, worldY, color = 'white', duration = 1000, size = 16) {
        // Make sure FloatingText class is defined
        if (typeof FloatingText !== 'undefined') {
            this.floatingTexts.push(new FloatingText(text, worldX, worldY, color, duration, size));
        }
    }

    addMessage(text, p5color = color(255), duration = 3000) {
        // Make sure SystemMessage class is defined
         if (typeof SystemMessage !== 'undefined') {
            this.systemMessages.push(new SystemMessage(text, p5color, duration));
            if (this.systemMessages.length > this.maxMessages) {
                this.systemMessages.shift();
            }
         }
     }

    toggleInventory() {
        this.showInventory = !this.showInventory;
        if (this.showInventory) {
             if (typeof playSound === 'function') playSound('openInventory');
             this.updateInventory(); // Mark for update
             this.updateEquipment(); // Mark for update
        } else {
             if (typeof playSound === 'function') playSound('closeInventory');
             this.tooltip.show = false; // Hide tooltip when closing
        }
    }

    // These don't need to do anything, they are just flags for potential future use
    // or to be called if specific update logic is needed when inventory/equipment changes.
    updateInventory() { /* console.log("Inventory flagged for update."); */ }
    updateEquipment() { /* console.log("Equipment flagged for update."); */ }

     handleMouseClick(mx, my) {
         // Ensure player is accessible and inventory is shown
         const globalPlayer = (typeof player !== 'undefined') ? player : null;
         if (!globalPlayer || !this.showInventory) return false;

         // Check inventory slots
         const inv = this.inventoryPanel;
         const invSize = globalPlayer.inventory ? globalPlayer.inventory.length : 0;
         for (let i = 0; i < invSize; i++) {
             const { x, y, w, h } = this.getSlotRect(inv, i);
             if (mx > x && mx < x + w && my > y && my < y + h) {
                 const item = globalPlayer.inventory[i];
                 if (item) {
                     if (mouseButton === RIGHT) { // Right-click: Use/Equip
                         if (item.type === 'consumable' && typeof globalPlayer.useItem === 'function') {
                             globalPlayer.useItem(i);
                             return true; // Consumed action
                         } else if (item.type === 'equipment' && typeof globalPlayer.equipItem === 'function') {
                             globalPlayer.equipItem(i);
                             return true; // Consumed action
                         }
                     } else if (mouseButton === LEFT) { // Left-click (potential drag start)
                         console.log(`Left-clicked inventory ${i}: ${item.name}`);
                         // Add drag logic here later if needed
                         return true; // Consumed action
                     }
                 }
             }
         }

         // Check equipment slots
         const eq = this.equipmentPanel;
         const slots = this.getEquipmentSlotLayout(eq);
         for (const slotInfo of slots) {
              const { name, x, y, w, h } = slotInfo;
              if (mx > x && mx < x + w && my > y && my < y + h) {
                   console.log(`Clicked equipment slot ${name}`);
                   if (globalPlayer.equipment && globalPlayer.equipment[name]) { // Check if slot is equipped
                        const equippedItem = globalPlayer.equipment[name];
                        if (mouseButton === RIGHT) { // Right-click: Unequip
                             if (typeof globalPlayer.unequipItem === 'function') {
                                 globalPlayer.unequipItem(name);
                                 return true; // Consumed action
                             }
                        } else if (mouseButton === LEFT) { // Left-click
                             console.log(`Left-clicked equipment ${name}: ${equippedItem.name}`);
                              // Add drag logic here later if needed
                             return true; // Consumed action
                        }
                   }
              }
         }
         return false; // Click was inside UI area but not on an interactive element
     }

     handleMouseMove(mx, my) {
         const globalPlayer = (typeof player !== 'undefined') ? player : null;
         if (!globalPlayer || !this.showInventory) {
             this.tooltip.show = false;
             return;
         }
         this.tooltip.show = false; // Reset tooltip visibility

         // Check Inventory
         const inv = this.inventoryPanel;
         const invSize = globalPlayer.inventory ? globalPlayer.inventory.length : 0;
         for (let i = 0; i < invSize; i++) {
             const { x, y, w, h } = this.getSlotRect(inv, i);
             if (mx > x && mx < x + w && my > y && my < y + h) {
                 const item = globalPlayer.inventory[i];
                 if (item) { this.showTooltip(item, mx, my); return; } // Show tooltip and exit
             }
         }

         // Check Equipment
         const eq = this.equipmentPanel;
         const slots = this.getEquipmentSlotLayout(eq);
         for (const slotInfo of slots) {
              const { name, x, y, w, h } = slotInfo;
              if (mx > x && mx < x + w && my > y && my < y + h) {
                   const item = globalPlayer.equipment ? globalPlayer.equipment[name] : null;
                   if (item) { this.showTooltip(item, mx, my); return; } // Show tooltip and exit
              }
         }
         // If mouse is over UI but not a slot, tooltip remains hidden (already set to false)
     }

     // Helper to get slot rectangle based on panel and index
     getSlotRect(panel, index) {
          // Ensure panel has cols property, default if not
          const cols = panel.cols || 4;
          const col = index % cols;
          const row = floor(index / cols); // Assumes floor is available
          const x = panel.x + panel.padding + col * (panel.slotSize + panel.padding);
          const y = panel.y + panel.padding + 35 + row * (panel.slotSize + panel.padding); // +35 for title height
          return { x: x, y: y, w: panel.slotSize, h: panel.slotSize };
     }

      // Helper to define the layout of equipment slots (could be cached)
      getEquipmentSlotLayout(panel) {
          const slotKeys = ['weapon', 'helmet', 'armor', 'boots', 'amulet', 'ring1', 'ring2'];
          let slots = [];
          let currentY = panel.y + panel.padding + 35; // Start below title area
          for (const key of slotKeys) {
               slots.push({
                    name: key,
                    x: panel.x + panel.padding,
                    y: currentY,
                    w: panel.slotSize,
                    h: panel.slotSize
               });
               currentY += panel.slotSize + panel.padding; // Move down for the next slot
          }
          return slots;
      }

     showTooltip(item, mx, my) {
          if (!item) { this.tooltip.show = false; return; } // Don't show for null item

          this.tooltip.text = this.generateItemTooltip(item);

          // Pre-calculate tooltip size (ensure p5 text functions are ready)
          if (typeof textSize === 'function' && typeof textWidth === 'function') {
              push();
              textSize(13); textFont('sans-serif');
              let lines = this.tooltip.text.split('\n');
              let maxWidth = 0;
              lines.forEach(line => {
                  // Basic removal of color codes for width calculation
                  let cleanLine = line.replace(/\|c[0-9A-Fa-f]{6,8}/g, '').replace(/\|r/g, '');
                  maxWidth = max(maxWidth, textWidth(cleanLine)); // use p5.max
              });
              this.tooltip.w = maxWidth + 20; // Add horizontal padding
              this.tooltip.h = lines.length * 15 + 15; // Estimate height based on line height + padding
              pop();
          } else {
              // Fallback size calculation if p5 text functions aren't ready
              this.tooltip.w = 150;
              this.tooltip.h = 100;
              console.warn("p5 text functions not ready for tooltip size calculation.");
          }


          // Position tooltip relative to mouse
          this.tooltip.x = mx + 15;
          this.tooltip.y = my + 15;

          // Adjust position to keep tooltip on screen
          const screenW = (typeof width !== 'undefined') ? width : 600;
          const screenH = (typeof height !== 'undefined') ? height : 400;
          if (this.tooltip.x + this.tooltip.w > screenW) {
              this.tooltip.x = mx - this.tooltip.w - 15; // Move to the left of the cursor
          }
          if (this.tooltip.y + this.tooltip.h > screenH) {
              this.tooltip.y = my - this.tooltip.h - 15; // Move above the cursor
          }
          // Ensure it doesn't go off the top-left
          this.tooltip.x = max(0, this.tooltip.x);
          this.tooltip.y = max(0, this.tooltip.y);

          this.tooltip.show = true; // Mark tooltip to be shown
     }


     generateItemTooltip(item) {
          // Use RarityColors safely, providing a default
          const rarityCol = (typeof RarityColors !== 'undefined' && RarityColors[item.rarity]) ? RarityColors[item.rarity] : '#FFFFFF';
          let rarityColorHex = rarityCol.substring(1); // Remove '#'

          let tip = `|c${rarityColorHex}${item.name}|r\n`; // Item name in rarity color

          // Use UIText safely, providing fallbacks
          const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;

          if (item.type === 'equipment') {
               const slotText = uiTextGet(item.slot, item.slot || 'Unknown Slot'); // Translate slot name
               tip += `${uiTextGet('equip', 'Equipment')} (${slotText})\n`;
               if (item.stats) {
                   for (const stat in item.stats) {
                        let sign = item.stats[stat] >= 0 ? '+' : '';
                        let statText = uiTextGet(stat, stat); // Translate stat name
                        tip += `|cFFFFFFA0${statText}: ${sign}${item.stats[stat]}|r\n`; // Dim yellow for stats
                   }
               }
          } else if (item.type === 'consumable') {
               tip += `|cFFDDA0DD${uiTextGet('use', 'Use')}|r\n`; // Light purple for Use
               if (item.effect) {
                   for (const effect in item.effect) {
                        let effectText = uiTextGet(effect, effect);
                        tip += `Restore ${effectText}: ${item.effect[effect]}\n`;
                   }
               }
          } else if (item.type === 'material') {
               tip += `|cFFB0B0B0Material|r\n`; // Gray for Material
          }

          if (item.stackable) {
               tip += `Quantity: ${item.quantity} / ${item.maxStack}\n`;
          }

          tip += `\n|cFFB0B0B0"${item.description || ''}"|r`; // Gray description, ensure exists
          return tip;
      }


    render() {
        // Ensure p5 functions and global variables (like player, camera) are available
        if (typeof push !== 'undefined') {
            push(); // Save global draw state
        } else {
            console.error("p5 'push' function not available for UI rendering.");
            return;
        }

        const globalPlayer = (typeof player !== 'undefined') ? player : null;
        const screenW = (typeof width !== 'undefined') ? width : 600;
        const screenH = (typeof height !== 'undefined') ? height : 400;


        // --- Bottom HUD ---
        if (globalPlayer && typeof drawHealthBar === 'function') { // Check dependencies
            const barHeight = 18;
            const barWidth = screenW / 4.5;
            const barY = this.bottomUIStartY; // Calculated in calculateLayout
            const hpBarX = screenW / 2 - barWidth - 5;
            const mpBarX = screenW / 2 + 5;

             // Safe access to player stats
             const currentHP = globalPlayer.stats ? globalPlayer.stats.hp : 0;
             const maxHP = globalPlayer.currentStats ? globalPlayer.currentStats.maxHP : 1;
             const currentMP = globalPlayer.stats ? globalPlayer.stats.mp : 0;
             const maxMP = globalPlayer.currentStats ? globalPlayer.currentStats.maxMP : 1;
             const currentXP = globalPlayer.stats ? globalPlayer.stats.xp : 0;
             const nextXP = globalPlayer.stats ? globalPlayer.stats.xpToNextLevel : 1;
             const currentLvl = globalPlayer.stats ? globalPlayer.stats.level : 0;

             const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;


            // HP Bar
             drawHealthBar(currentHP, maxHP, hpBarX, barY, barWidth, barHeight, color(80,0,0,190), color(255,40,40,230));
             fill(255); textSize(12); textAlign(CENTER, CENTER);textFont('monospace');
             text(`${currentHP}/${maxHP}`, hpBarX + barWidth / 2, barY + barHeight / 2);
             fill(255,220,220); textAlign(RIGHT, CENTER); textFont('sans-serif'); textSize(11);
             text(uiTextGet('hp', 'HP'), hpBarX - 8, barY + barHeight / 2); // Label

            // MP Bar
             drawHealthBar(currentMP, maxMP, mpBarX, barY, barWidth, barHeight, color(0,0,80,190), color(80,80,255,230));
             fill(255); textSize(12); textAlign(CENTER, CENTER); textFont('monospace');
             text(`${currentMP}/${maxMP}`, mpBarX + barWidth / 2, barY + barHeight / 2);
              fill(220,220,255); textAlign(LEFT, CENTER); textFont('sans-serif'); textSize(11);
              text(uiTextGet('mp', 'MP'), mpBarX + barWidth + 8, barY + barHeight / 2); // Label

            // XP Bar
            const xpBarY = barY + barHeight + 5;
            const xpBarWidth = barWidth * 2 + 10;
            const xpBarX = hpBarX;
            const xpBarHeight = barHeight * 0.5;
            fill(80, 80, 0, 180); rect(xpBarX, xpBarY, xpBarWidth, xpBarHeight, 3);
            fill(255, 255, 100, 220);
            const xpRatio = (nextXP > 0) ? constrain(currentXP / nextXP, 0, 1) : 0;
            if (xpRatio > 0) {
                 rect(xpBarX, xpBarY, xpBarWidth * xpRatio, xpBarHeight, 3);
            }
             fill(230); textSize(10); textAlign(CENTER, CENTER); textFont('monospace');
              stroke(0,150); strokeWeight(1);
             text(`Lvl ${currentLvl} (${currentXP}/${nextXP})`, xpBarX + xpBarWidth / 2, xpBarY + xpBarHeight / 2);
              noStroke();
        }

        // Skill Bar (Placeholder)
        const skillBarY = screenH - 55;
        const skillSlotSize = 40;
        const skillSlots = 6;
        const skillBarWidth = skillSlots * (skillSlotSize + 5) - 5;
        const skillBarX = screenW / 2 - skillBarWidth / 2;
        fill(30, 30, 30, 180); stroke(80); strokeWeight(1);
        rect(skillBarX - 5, skillBarY - 5, skillBarWidth + 10, skillSlotSize + 10, 5);
        for (let i = 0; i < skillSlots; i++) {
            let x = skillBarX + i * (skillSlotSize + 5);
            fill(50, 50, 50, 200); stroke(100);
            rect(x, skillBarY, skillSlotSize, skillSlotSize, 3);
            // Placeholder icons/text
            fill(200); textSize(10); textAlign(CENTER, CENTER);
            if (i === 0) text("[LMB]", x + skillSlotSize/2, skillBarY + skillSlotSize/2); // Left Mouse
            if (i === 1) text("[RMB]", x + skillSlotSize/2, skillBarY + skillSlotSize/2); // Right Mouse
             if (i > 1) text(`[${i-1}]`, x + skillSlotSize/2, skillBarY + skillSlotSize/2); // Number keys
        }


        // --- Floating Texts ---
        const camX = (typeof camera !== 'undefined') ? camera.x : 0;
        const camY = (typeof camera !== 'undefined') ? camera.y : 0;
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            // FloatingText render/update methods should handle p5 function checks internally
            this.floatingTexts[i].render(camX, camY);
            if (!this.floatingTexts[i].update()) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // --- System Messages ---
        const messageStartX = 15;
        let messageStartY = this.bottomUIStartY - 25; // Position above HUD
        for (let i = this.systemMessages.length - 1; i >= 0; i--) {
             this.systemMessages[i].update(); // Should check p5 functions if needed
             if (this.systemMessages[i].isExpired()) {
                 this.systemMessages.splice(i, 1);
                 continue;
             }
             this.systemMessages[i].render(messageStartX, messageStartY); // Should check p5 functions
             messageStartY -= 18; // Move upwards for next message
         }


        // --- Inventory/Equipment Panels ---
        if (this.showInventory) {
            this.renderInventoryPanel();
            this.renderEquipmentPanel();
            // Tooltip rendering relies on showTooltip setting the flag
            if (this.tooltip.show && this.tooltip.text) {
                 this.renderTooltip();
            }
        } else {
             // Only render mouse hover tooltips when inventory is closed
             this.renderMouseTooltip();
        }

        if (typeof pop === 'function') {
            pop(); // Restore global draw state
        }
    }

    renderInventoryPanel() {
        // Ensure player and PlayerDefaults are accessible
        const globalPlayer = (typeof player !== 'undefined') ? player : null;
        const pDefaults = (typeof PlayerDefaults !== 'undefined') ? PlayerDefaults : { inventorySize: 20 };
        if (!globalPlayer) return;

        const inv = this.inventoryPanel;
        push(); // Use p5 push/pop
        fill(25, 25, 25, 235); stroke(180, 150, 100); strokeWeight(1.5);
        rect(inv.x, inv.y, inv.w, inv.h, 8); // Panel background

        fill(220, 200, 180); textSize(16); textAlign(CENTER, TOP); textFont('Georgia');
        const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;
        text(uiTextGet('inventory', 'Inventory'), inv.x + inv.w / 2, inv.y + inv.padding); // Title

        for (let i = 0; i < pDefaults.inventorySize; i++) { // Iterate up to max size
            const { x, y, w, h } = this.getSlotRect(inv, i); // Uses helper
            fill(40, 40, 40, 200); stroke(80); strokeWeight(1);
            rect(x, y, w, h, 4); // Slot background

            // Safely access inventory item
            const item = (globalPlayer.inventory && i < globalPlayer.inventory.length) ? globalPlayer.inventory[i] : null;
            if (item) {
                 this.drawItemInSlot(item, x, y, w, h); // Use helper function
            }
        }
         pop();
    }

    renderEquipmentPanel() {
         const globalPlayer = (typeof player !== 'undefined') ? player : null;
         if (!globalPlayer) return;

         const eq = this.equipmentPanel;
          const slots = this.getEquipmentSlotLayout(eq); // Uses helper
          const slotLabels = { weapon: '武器', helmet: '頭盔', armor: '胸甲', boots: '靴子', amulet: '項鍊', ring1: '戒指1', ring2: '戒指2' };

         push();
         fill(25, 25, 25, 235); stroke(180, 150, 100); strokeWeight(1.5);
         rect(eq.x, eq.y, eq.w, eq.h, 8); // Panel background

         const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;
         fill(220, 200, 180); textSize(16); textAlign(CENTER, TOP); textFont('Georgia');
         text(uiTextGet('equip', 'Equipment'), eq.x + eq.w / 2, eq.y + eq.padding); // Title

         for(const slotInfo of slots){
               const { name, x, y, w, h } = slotInfo;
                fill(40, 40, 40, 200); stroke(80); strokeWeight(1);
                rect(x, y, w, h, 4); // Slot background

                // Slot label
                 fill(160); textSize(10); textAlign(LEFT, CENTER); textFont('sans-serif');
                 text(slotLabels[name] || name, x + w + eq.padding / 2, y + h / 2);

                 // Safely access equipment item
                 const item = (globalPlayer.equipment && globalPlayer.equipment[name]) ? globalPlayer.equipment[name] : null;
                 if (item) {
                      this.drawItemInSlot(item, x, y, w, h); // Use helper function
                 }
         }
         pop();
    }

     // Helper to draw item icon in UI slot
     drawItemInSlot(item, x, y, w, h){
          if (!item) return; // Don't draw null items
          push();
          translate(x + w / 2, y + h / 2);
           const itemSize = w * 0.7;
           // Use getRarityP5Color safely
           const rarityColorFunc = (typeof getRarityP5Color === 'function') ? getRarityP5Color : () => color(255);
           const rarityColor = rarityColorFunc(item.rarity);

           // Background glow based on rarity
            if (item.rarity !== 'common') {
                 let glowAlpha = 100;
                 noStroke(); fill(red(rarityColor), green(rarityColor), blue(rarityColor), glowAlpha * 0.5);
                 ellipse(0, 0, w * 0.9, h * 0.9);
                 fill(red(rarityColor), green(rarityColor), blue(rarityColor), glowAlpha);
                 ellipse(0, 0, w * 0.8, h * 0.8);
            }

            // Simple icon representation
            noStroke();
           if (item.type === 'equipment') {
               fill(180, 180, 220); rectMode(CENTER);
                // Simple shapes per slot maybe?
                 if(item.slot === 'weapon') rect(0,0, itemSize*0.3, itemSize*1.1);
                 else if(item.slot === 'helmet') ellipse(0,-itemSize*0.1, itemSize*0.8, itemSize*0.7);
                 else if(item.slot === 'armor') rect(0,0, itemSize*0.9, itemSize*0.9);
                 else if(item.slot === 'boots') rect(0, itemSize*0.2, itemSize*0.6, itemSize*0.5);
                 else ellipse(0,0, itemSize); // Default ellipse
           } else if (item.type === 'consumable') {
                if(item.effect && item.effect.hp) fill(255, 80, 80); else if(item.effect && item.effect.mp) fill(80, 80, 255); else fill(200, 200, 100);
                ellipse(0, 0, itemSize, itemSize);
           } else {
               fill(150); ellipse(0, 0, itemSize * 0.9, itemSize * 0.7);
           }
            // Highlight
            fill(255, 255, 255, 180); ellipse(-itemSize * 0.2, -itemSize * 0.2, itemSize * 0.15);

           pop();

          // Quantity text
           if (item.stackable && item.quantity > 1) {
                push();
                fill(255); textSize(11); textAlign(RIGHT, BOTTOM); textFont('monospace');
                 stroke(0, 180); strokeWeight(1.5);
                text(item.quantity, x + w - 3, y + h - 3);
                pop();
           }
     }


    renderTooltip() {
         if (!this.tooltip.show || !this.tooltip.text) return;
         const tipX = this.tooltip.x; const tipY = this.tooltip.y;
         const tipW = this.tooltip.w; const tipH = this.tooltip.h;

         push();
         // Background Panel
         fill(15, 15, 15, 240);
         stroke(180, 180, 120); // Gold border
         strokeWeight(1);
         rect(tipX, tipY, tipW, tipH, 4);

         // Text content with color parsing
         let currentY = tipY + 10 + 2; // Line height adjustment
         let lines = this.tooltip.text.split('\n');
         textFont('sans-serif');
         textSize(13);
         let defaultColor = color(210, 210, 210); // Default tooltip text color (off-white)

         lines.forEach(line => {
             let currentX = tipX + 10;
             fill(defaultColor); // Start line with default color

              // Basic color code parsing: |cRRGGBBText|r or |cAARRGGBBText|r or |c#HEXCODEText|r
              // Regex to find color codes and the reset code
              let parts = line.split(/(\|c(?:[0-9A-Fa-f]{6,8}|#[0-9A-Fa-f]{6}))|(\|r)/g).filter(Boolean);

              parts.forEach(part => {
                   if (part.startsWith('|c')) {
                        let hexColorString = part.substring(2);
                        if (hexColorString.startsWith('#')) hexColorString = hexColorString.substring(1);

                        try {
                             let parsedColor = color('#' + hexColorString); // Use p5's color parsing
                             fill(parsedColor); // Apply parsed color
                        } catch (e) {
                             console.warn("Invalid hex code in tooltip:", part);
                             fill(defaultColor); // Fallback to default if parsing fails
                        }

                   } else if (part === '|r') {
                        fill(defaultColor); // Reset to default color
                   } else {
                        // Draw the actual text part
                         text(part, currentX, currentY);
                         currentX += textWidth(part); // Move cursor for next part
                   }
              });
             currentY += 15; // Move to next line (adjust line height as needed)
         });
         pop();
     }

      renderMouseTooltip() {
          if (this.showInventory) return; // Don't show world tooltips if inventory is open

          // Ensure global variables and p5 functions are available
          const camX = (typeof camera !== 'undefined') ? camera.x : 0;
          const camY = (typeof camera !== 'undefined') ? camera.y : 0;
          const mx = (typeof mouseX !== 'undefined') ? mouseX : 0;
          const my = (typeof mouseY !== 'undefined') ? mouseY : 0;
          const globalWorldItems = (typeof worldItems !== 'undefined') ? worldItems : [];
          const globalMonsters = (typeof monsters !== 'undefined') ? monsters : [];
          const globalNpcs = (typeof npcs !== 'undefined') ? npcs : [];
          const map = (typeof currentMap !== 'undefined') ? currentMap : null;
          const pDefaults = (typeof PlayerDefaults !== 'undefined') ? PlayerDefaults : { pickupRadiusSq: (TILE_SIZE * 1.2)**2 };
          const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;
          const rarityColorFunc = (typeof getRarityP5Color === 'function') ? getRarityP5Color : () => color(255);


          let worldMx = mx + camX;
          let worldMy = my + camY;
          let hoverText = "";
          let hoverP5Color = color(255);
          let targetObject = null; // What the mouse is hovering over

           // 1. Check Dropped Items
           let closestItemDistSq = pDefaults.pickupRadiusSq * 0.9; // Use player's pickup range
           let hoveredItem = null;
           for (let item of globalWorldItems) {
                if (!item || !item.pos) continue; // Skip invalid items
               let dSq = distSq(worldMx, worldMy, item.pos.x, item.pos.y);
               if (dSq < closestItemDistSq) {
                   hoveredItem = item;
                   closestItemDistSq = dSq; // Update closest distance
               }
           }
           if (hoveredItem && hoveredItem.item) { // Check item exists
                targetObject = hoveredItem;
                hoverText = `${uiTextGet('pickup','Pickup')}\n${hoveredItem.item.name}`;
                hoverP5Color = rarityColorFunc(hoveredItem.item.rarity);
           } else {
               // 2. Check Monsters
               let hoveredMonster = null;
               for (let monster of globalMonsters) {
                    if(!monster || monster.state === 'dead' || !monster.pos || !monster.size) continue;
                    // Use point-in-rectangle check (or ellipse)
                   if (abs(worldMx - monster.pos.x) < monster.size/2 && abs(worldMy - monster.pos.y) < monster.size/2) {
                       hoveredMonster = monster;
                       break;
                   }
               }
               if (hoveredMonster) {
                    targetObject = hoveredMonster;
                    hoverText = `${uiTextGet('attackTarget','Attack')}\n${hoveredMonster.name} (${hoveredMonster.stats.hp}/${hoveredMonster.baseStats.maxHP})`;
                    hoverP5Color = color(255, 90, 90); // Attack Red
               } else {
                    // 3. Check NPCs (only in village)
                    if (map && map.isVillage) {
                        let hoveredNpc = null;
                         for(let npc of globalNpcs) {
                              if(!npc || npc.state === 'dead' || !npc.pos || !npc.size) continue;
                               if (abs(worldMx - npc.pos.x) < npc.size/2 && abs(worldMy - npc.pos.y) < npc.size/2) {
                                   hoveredNpc = npc;
                                   break;
                               }
                         }
                          if(hoveredNpc){
                               targetObject = hoveredNpc;
                               hoverText = `${hoveredNpc.name}\n(Click to Interact)`; // Hardcoded text, maybe add to UIText
                               hoverP5Color = color(120, 180, 255); // Interact Blue
                          }
                    }
                     // 4. Check Map Transitions (if nothing else hovered)
                     if(!targetObject && map){ // Check map exists
                          if(map.isOnExit(worldMx, worldMy)){
                                hoverText = uiTextGet('leaveVillage', 'Leave Area');
                                hoverP5Color = color(255, 255, 120); // Exit Yellow
                          } else if (map.isOnVillageEntrance(worldMx, worldMy)) {
                                hoverText = uiTextGet('enterVillage', 'Enter Area');
                                hoverP5Color = color(120, 255, 120); // Enter Green
                          }
                     }
               }
           }


           if (hoverText) {
               push();
               fill(hoverP5Color);
               stroke(0, 200); // Black outline
               strokeWeight(2);
               textSize(13);
               textAlign(CENTER, BOTTOM);
               textFont('sans-serif');
               text(hoverText, mx, my - 15); // Position relative to screen mouse pos
               pop();
           }

           // Change mouse cursor based on hover target? (Needs DOM manipulation or CSS)
           // Example (conceptual - won't work directly in p5 canvas without extra setup):
           // let cursorStyle = 'default';
           // if (targetObject instanceof Monster) cursorStyle = 'crosshair';
           // else if (targetObject instanceof DroppedItem || targetObject instanceof Npc) cursorStyle = 'pointer';
           // document.body.style.cursor = cursorStyle;
      }

}


// =============================================
// FILE: player.js
// =============================================
console.log("Loading: player.js");
class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.targetPos = createVector(x, y);
        this.size = PlayerDefaults.size;
        this.color = PlayerDefaults.color;
        this.name = "玩家";

        // Deep copy defaults to avoid modifying the original objects
        this.baseStats = JSON.parse(JSON.stringify({
            maxHP: PlayerDefaults.hp,
            maxMP: PlayerDefaults.mp,
            attack: PlayerDefaults.attack,
            defense: PlayerDefaults.defense,
            speed: PlayerDefaults.speed,
            attackRangeSq: PlayerDefaults.attackRange ** 2, // Use squared value internally
        }));
        this.currentStats = { ...this.baseStats }; // Shallow copy is okay here as values are primitive (or re-calculated)
        this.stats = {
            hp: PlayerDefaults.hp,
            mp: PlayerDefaults.mp,
            level: PlayerDefaults.level,
            xp: PlayerDefaults.xp,
            xpToNextLevel: PlayerDefaults.xpToNextLevel,
        };

        // Initialize inventory with nulls
        this.inventory = new Array(PlayerDefaults.inventorySize).fill(null);
        // Initialize equipment slots with null
        this.equipment = {
            weapon: null, helmet: null, armor: null, boots: null,
            amulet: null, ring1: null, ring2: null,
        };

        this.targetEnemy = null;
        this.isMoving = false;
        this.lastAttackTime = 0;
        this.attackCooldown = 800; // Milliseconds
        this.pickupRadiusSq = PlayerDefaults.pickupRadiusSq; // Use squared value

        this.lastStepSoundTime = 0; // For controlling step sound frequency

        this.updateCombinedStats(); // Initial stat calculation
    }

    moveTo(targetX, targetY) {
        const map = (typeof currentMap !== 'undefined') ? currentMap : null;
        // Check if the target point is valid
        if (!map || map.isObstacle(targetX, targetY) || map.isOutsideBounds(targetX, targetY)){
             console.log("Target point unreachable");
             if (typeof playSound === 'function') playSound('invalidAction'); // Play sound if function exists
             return; // Don't set target or move
        }
        this.targetPos.set(targetX, targetY);
        this.targetEnemy = null; // Clear enemy target when moving manually
        this.isMoving = true;
    }

    setAttackTarget(enemy) {
        if (enemy && enemy.stats && enemy.stats.hp > 0) { // Check enemy and its stats exist
            this.targetEnemy = enemy;
            this.isMoving = true; // Start moving towards the enemy
            // if (typeof playSound === 'function') playSound('targetEnemy'); // Optional targeting sound
        } else {
            this.targetEnemy = null; // Clear target if invalid or dead
        }
    }

    attack(target) {
        // Basic checks
        if (!target || !target.stats || target.stats.hp <= 0) {
            this.targetEnemy = null;
            return;
        }
        const now = millis(); // Assumes millis() is available
        if (now - this.lastAttackTime >= this.attackCooldown) {
            console.log(`${this.name} attacks ${target.name}`);
            // Calculate damage safely
            const targetDefense = (target.currentStats && target.currentStats.defense !== undefined) ? target.currentStats.defense : 0;
            let damage = max(1, this.currentStats.attack - targetDefense); // Assumes max() is available
            damage = floor(random(damage * 0.85, damage * 1.15)); // Assumes floor() and random() are available

             if (typeof playSound === 'function') playSound('playerAttack'); // Play sound

            // Ensure target has takeDamage method
            if (typeof target.takeDamage === 'function') {
                target.takeDamage(damage, this);
            } else {
                console.error("Target has no takeDamage method:", target);
            }

            this.lastAttackTime = now;
            this.playAttackAnimation(target); // Play visual effect

            // Clear target if it died from this attack
            if (target.stats.hp <= 0) {
                this.targetEnemy = null;
            }
        }
    }

    playAttackAnimation(target){
         // Add visual effect if visualEffects array exists
         if (typeof visualEffects !== 'undefined' && target && target.pos) {
             let effect = {
                  type: 'line',
                  start: this.pos.copy(), // Assumes copy() method exists
                  end: target.pos.copy(),
                  color: color(255, 200, 0, 200), // Assumes color() exists
                  duration: 150, // Milliseconds
                  startTime: millis() // Assumes millis() exists
             };
              visualEffects.push(effect);
         }
    }


    takeDamage(damage, attacker) {
         if (!this.stats) return; // Safety check

        this.stats.hp -= damage;
        // Use uiManager safely
        if (typeof uiManager !== 'undefined' && typeof uiManager.addFloatingText === 'function') {
             uiManager.addFloatingText(`-${damage}`, this.pos.x + random(-5, 5), this.pos.y + random(-10, 0), 'red', 1200);
        } else {
             console.log(`Player took ${damage} damage`);
        }

         if (typeof playSound === 'function') playSound('playerHit'); // Play sound

        if (this.stats.hp <= 0) {
            this.die(attacker);
        }

         // Add flash effect safely
         if (typeof visualEffects !== 'undefined') {
             let effect = {
                   type: 'flash', target: this, color: color(255, 0, 0, 150),
                   duration: 200, startTime: millis()
             };
              visualEffects.push(effect);
         }
    }

    die(killer) {
        if (!this.stats) return; // Safety check
        if (this.stats.hp > 0) this.stats.hp = 0; // Ensure HP is 0

        // Check gameState existence before modifying
        if (typeof gameState !== 'undefined' && gameState === 'gameOver') return; // Prevent double trigger

        const killerName = (killer && killer.name) ? killer.name : 'unknown causes';
        console.log(`${this.name} was slain by ${killerName}!`);
         if (typeof playSound === 'function') playSound('playerDeath');

        // Set gameState if it exists
        if (typeof gameState !== 'undefined') gameState = 'gameOver';
    }

    gainXP(amount) {
        if (!this.stats || amount <= 0) return; // Safety check

        this.stats.xp += amount;
         // Use uiManager safely
        if (typeof uiManager !== 'undefined' && typeof uiManager.addMessage === 'function') {
             const xpText = (typeof UIText !== 'undefined' && UIText.xp) ? UIText.xp : 'XP';
             uiManager.addMessage(`+${amount} ${xpText}`, 'yellow', 2000);
        } else {
             console.log(`Player gained ${amount} XP`);
        }

        // Level up logic
        while (this.stats.xp >= this.stats.xpToNextLevel) {
             let xpRequiredForLevel = this.stats.xpToNextLevel; // Store needed XP before level up changes it
             this.stats.xp -= xpRequiredForLevel; // Subtract needed XP *before* leveling up
             if (this.stats.xp < 0) this.stats.xp = 0; // Prevent negative XP
            this.levelUp(); // This will update xpToNextLevel
            // No need to handle remaining XP here, it's already correct
        }
    }

    levelUp() {
         if (!this.stats || !this.baseStats) return; // Safety check

        this.stats.level++;
        // Adjust level up curve
        this.stats.xpToNextLevel = floor(this.baseStats.xpToNextLevel * 1.6 + 50 + this.stats.level * 10); // Use base for scaling, add level bonus

        const hpGain = 10 + floor(this.stats.level / 2);
        const mpGain = 5 + floor(this.stats.level / 3);
        const attackGain = 1 + floor(random(1, 3)); // Random gain between 1 and 2
        const defenseGain = 1;

        // Increase base stats
        this.baseStats.maxHP += hpGain;
        this.baseStats.maxMP += mpGain;
        this.baseStats.attack += attackGain;
        this.baseStats.defense += defenseGain;

        // Full heal on level up
        this.stats.hp = this.baseStats.maxHP;
        this.stats.mp = this.baseStats.maxMP;

        this.updateCombinedStats(); // Recalculate current stats

        console.log(`Level Up! Reached level ${this.stats.level}!`);
        // Use uiManager safely
        if (typeof uiManager !== 'undefined' && typeof uiManager.addMessage === 'function') {
             const levelUpText = (typeof UIText !== 'undefined' && UIText.levelUp) ? UIText.levelUp : 'Level Up';
            uiManager.addMessage(`${levelUpText}! (${this.stats.level})`, 'lime', 3500);
        }
         if (typeof playSound === 'function') playSound('levelUp');

          // Add level up visual effect safely
          if (typeof visualEffects !== 'undefined') {
              let effect = {
                    type: 'circleExpand', target: this, color: color(255, 255, 100, 180),
                    duration: 500, startTime: millis(), maxRadius: this.size * 2
              };
               visualEffects.push(effect);
          }
    }

    pickupItem(droppedItem) {
        if (!droppedItem || !droppedItem.item || droppedItem.invalid) return false; // Check validity
        const item = droppedItem.item;
        if (!this.inventory) return false; // Check inventory exists

        // Use uiManager and playSound safely
        const canPlaySound = typeof playSound === 'function';
        const canShowMessage = typeof uiManager !== 'undefined' && typeof uiManager.addMessage === 'function';
        const uiTextGet = (key, fallback) => (typeof UIText !== 'undefined' && UIText[key]) ? UIText[key] : fallback;
        const rarityColorFunc = (typeof getRarityP5Color === 'function') ? getRarityP5Color : () => color(255);


        // Try stacking first
        if (item.stackable) {
            for (let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] && this.inventory[i].id === item.id && this.inventory[i].quantity < this.inventory[i].maxStack) {
                    let overflow = this.inventory[i].addQuantity(item.quantity); // addQuantity returns overflow
                     if (overflow === 0) { // Fully stacked
                          if (canShowMessage) uiManager.addMessage(`${uiTextGet('pickup','Pickup')}: ${item.name} x${item.quantity}`, rarityColorFunc(item.rarity), 2000);
                          if (canPlaySound) playSound('pickupItem');
                         return true; // Item picked up and stacked
                     } else {
                         // Partially stacked, update quantity for finding empty slot
                         item.quantity = overflow;
                         // Don't return yet, need to find a new slot for the remainder
                     }
                }
            }
        }

        // Find empty slot if not fully stacked or not stackable
        const emptySlotIndex = this.findEmptyInventorySlot();
        if (emptySlotIndex !== -1) {
            this.inventory[emptySlotIndex] = item; // Place item (or remaining stack)
            const qtySuffix = item.stackable ? ` x${item.quantity}` : ''; // Show quantity only if stackable
             if (canShowMessage) uiManager.addMessage(`${uiTextGet('pickup','Pickup')}: ${item.name}${qtySuffix}`, rarityColorFunc(item.rarity), 2000);
             if (canPlaySound) playSound('pickupItem');
            return true; // Item picked up into empty slot
        } else {
            // No empty slot found
            if (canShowMessage) uiManager.addMessage(uiTextGet('inventoryFull', 'Inventory Full!'), 'orange');
            if (canPlaySound) playSound('invalidAction');
            return false; // Pickup failed
        }
    }

    findEmptyInventorySlot() {
        if (!this.inventory) return -1;
        return this.inventory.findIndex(slot => slot === null);
    }

    useItem(inventoryIndex) {
         if (!this.inventory || inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return; // Bounds check

        const item = this.inventory[inventoryIndex];
        // Check if item exists and is consumable
        if (item && item.type === 'consumable') {
             // item.use(this) returns true if item still exists (quantity > 0), false otherwise
             const itemStillExists = item.use(this); // 'use' handles sound and floating text
             if (!itemStillExists) {
                 this.inventory[inventoryIndex] = null; // Remove item if used up
             }
             // Update UI safely
             if (typeof uiManager !== 'undefined' && typeof uiManager.updateInventory === 'function') uiManager.updateInventory();
        } else {
            console.log("Cannot use this item or slot is empty.");
            if (typeof playSound === 'function') playSound('invalidAction');
        }
    }

    equipItem(inventoryIndex) {
         if (!this.inventory || !this.equipment || inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return; // Safety checks

        const item = this.inventory[inventoryIndex];
        if (!item || item.type !== 'equipment') {
            console.log("Cannot equip this item.");
            if (typeof playSound === 'function') playSound('invalidAction');
            return;
        }

        let targetSlot = item.slot; // The intended slot (e.g., 'weapon', 'ring')

         // Handle special case for rings
         if (targetSlot === 'ring') {
              if (!this.equipment['ring1']) targetSlot = 'ring1'; // Equip to ring1 if empty
              else if (!this.equipment['ring2']) targetSlot = 'ring2'; // Equip to ring2 if empty
              else targetSlot = 'ring1'; // Default replace ring1 if both are full
         }

        // Check if the target slot exists in the equipment object
        if (!this.equipment.hasOwnProperty(targetSlot)) {
             console.log("Invalid equipment slot:", targetSlot);
             if (typeof playSound === 'function') playSound('invalidAction');
             return;
        }

        // Swap items: Put current equipped item (if any) back into the inventory slot
        let previouslyEquipped = this.equipment[targetSlot]; // Store the item currently in the slot (can be null)
        this.equipment[targetSlot] = item; // Equip the new item
        this.inventory[inventoryIndex] = previouslyEquipped; // Place the old item back (or null if slot was empty)

        console.log(`Equipped ${item.name} to ${targetSlot}`);
        if (typeof playSound === 'function') playSound('equipItem'); // Equip sound

        this.updateCombinedStats(); // Recalculate stats

        // Update UI safely
        if (typeof uiManager !== 'undefined') {
            if (typeof uiManager.updateInventory === 'function') uiManager.updateInventory();
            if (typeof uiManager.updateEquipment === 'function') uiManager.updateEquipment();
        }
    }

    unequipItem(slot) { // Removed findNewSlot complexity for simplicity
        if (!this.equipment || !this.equipment[slot]) return; // Nothing to unequip

        const itemToUnequip = this.equipment[slot];

        // Find an empty inventory slot
        const emptySlotIndex = this.findEmptyInventorySlot();

        if (emptySlotIndex !== -1) {
            // Move item to inventory
            this.inventory[emptySlotIndex] = itemToUnequip;
            this.equipment[slot] = null; // Clear equipment slot

            console.log(`Unequipped ${itemToUnequip.name} to inventory slot ${emptySlotIndex}`);
            if (typeof playSound === 'function') playSound('equipItem'); // Use equip sound for unequip too

            this.updateCombinedStats(); // Recalculate stats

            // Update UI safely
            if (typeof uiManager !== 'undefined') {
                if (typeof uiManager.updateInventory === 'function') uiManager.updateInventory();
                if (typeof uiManager.updateEquipment === 'function') uiManager.updateEquipment();
            }
        } else {
            // Inventory full
             const invFullText = (typeof UIText !== 'undefined' && UIText.inventoryFull) ? UIText.inventoryFull : 'Inventory Full';
            console.warn(`Inventory full, cannot unequip ${itemToUnequip.name}!`);
             if (typeof uiManager !== 'undefined' && typeof uiManager.addMessage === 'function') {
                uiManager.addMessage(`${invFullText}, cannot unequip ${itemToUnequip.name}`, 'orange');
             }
             if (typeof playSound === 'function') playSound('invalidAction');
        }
    }


    updateCombinedStats() {
         if (!this.baseStats || !this.currentStats || !this.equipment || !this.stats) return; // Safety check

        // Reset current stats to base stats (deep copy base if it contains objects/arrays)
        // For this structure, a shallow copy is probably fine as baseStats values are primitive
        this.currentStats = { ...this.baseStats };
        // Ensure attackRangeSq is initialized correctly
        this.currentStats.attackRangeSq = this.baseStats.attackRangeSq || (PlayerDefaults.attackRange ** 2);

        // Apply stats from equipment
        for (const slot in this.equipment) {
            const item = this.equipment[slot];
            if (item && item.stats) { // Check item and stats exist
                for (const stat in item.stats) {
                    // Check if the stat exists in currentStats or baseStats
                     const value = item.stats[stat];
                     if (value === undefined || value === null) continue; // Skip invalid stat values

                    if (stat === 'maxHP' || stat === 'maxMP') {
                         // Add to max stats
                         this.currentStats[stat] = (this.currentStats[stat] || this.baseStats[stat] || 0) + value;
                    } else if (stat === 'attackRange') {
                         // Special handling for attack range (use max of base and equipped)
                         // We store squared range, so square the item's range if provided in linear units
                         const itemRangeSq = (value * TILE_SIZE)**2; // Assuming item range is in tiles
                         this.currentStats.attackRangeSq = max(this.currentStats.attackRangeSq, itemRangeSq);
                    } else if (this.currentStats.hasOwnProperty(stat)) {
                        // Add to other existing stats (attack, defense, speed, etc.)
                        this.currentStats[stat] += value;
                    } else {
                         // Potentially add new stats if defined in item but not base
                         // this.currentStats[stat] = value; // Or handle specific cases
                         console.warn(`Item ${item.name} has unhandled stat: ${stat}`);
                    }
                }
            }
        }

        // Ensure HP/MP don't exceed new max values
        this.stats.hp = min(this.stats.hp, this.currentStats.maxHP);
        this.stats.mp = min(this.stats.mp, this.currentStats.maxMP);
        // Ensure stats don't go below certain minimums (e.g., speed > 0)
        this.currentStats.speed = max(0.5, this.currentStats.speed); // Minimum speed
    }


    update(obstacles, monsters, npcs) { // obstacles expected to be map grid or GameMap object
        if (!this.stats || this.stats.hp <= 0) return false; // Don't update if dead

        let moved = false;
        let isTryingToMove = false; // Flag to indicate movement intent this frame

        // --- Behavior Logic ---
        if (this.targetEnemy) {
            // Check if target is still valid
            if (!this.targetEnemy.stats || this.targetEnemy.stats.hp <= 0) {
                this.targetEnemy = null;
                this.isMoving = false; // Stop moving if target died
            } else {
                const distToEnemySq = distSq(this.pos.x, this.pos.y, this.targetEnemy.pos.x, this.targetEnemy.pos.y);
                let currentAttackRangeSq = this.currentStats.attackRangeSq; // Already squared

                if (distToEnemySq <= currentAttackRangeSq) {
                    // In attack range
                    this.isMoving = false; // Stop moving to attack
                    this.attack(this.targetEnemy); // Attempt attack
                    isTryingToMove = false; // Not trying to move closer
                } else {
                     // Out of range, move towards target
                    this.targetPos.set(this.targetEnemy.pos); // Update target position
                    this.isMoving = true;
                    isTryingToMove = true; // Intent is to move closer
                }
            }
        } else if (this.isMoving) {
            // Moving towards a point (not an enemy)
            isTryingToMove = true; // Intent is to move to targetPos
             const distToTargetSq = distSq(this.pos.x, this.pos.y, this.targetPos.x, this.targetPos.y);
             // Check if close enough to target destination
             if (distToTargetSq < (this.currentStats.speed * 0.8)**2) {
                 this.isMoving = false; // Stop moving
                 this.pos.set(this.targetPos); // Snap to final position
                 isTryingToMove = false; // Reached destination
             }
        }

        // --- Movement Execution ---
        if (this.isMoving) {
            // Ensure p5.Vector methods are available
             if (typeof p5 !== 'undefined' && typeof p5.Vector !== 'undefined') {
                let moveVec = p5.Vector.sub(this.targetPos, this.pos);
                if (moveVec.magSq() > 1) { // Check magnitude to avoid NaN with setMag
                    moveVec.setMag(this.currentStats.speed); // Set length to current speed
                    let nextPos = p5.Vector.add(this.pos, moveVec);

                    // Collision detection (needs currentMap)
                    const map = (typeof currentMap !== 'undefined') ? currentMap : null;
                    let canMove = true;
                     if (map && (map.isOutsideBounds(nextPos.x, nextPos.y) || map.isObstacle(nextPos.x, nextPos.y))) {
                         canMove = false;
                         this.isMoving = false; // Stop if hit obstacle
                         // Maybe play a bump sound?
                     }
                    // Add collision with other units if necessary...

                    if (canMove) {
                        this.pos = nextPos; // Update position
                        moved = true;
                         // Play step sound periodically
                         const now = millis();
                         if (now - this.lastStepSoundTime > 350) {
                              // if (typeof playSound === 'function') playSound('step'); // Optional step sound
                              this.lastStepSoundTime = now;
                         }
                    }
                } else {
                     this.isMoving = false; // Very close, stop moving
                }
             } else {
                 console.error("p5.Vector not available for player movement.");
                 this.isMoving = false;
             }
        }

        // --- Passive Updates ---
        // MP Regen (ensure frameCount is available)
        if (typeof frameCount !== 'undefined' && frameCount % 180 === 0) { // Every 3 seconds (at 60fps)
            if (this.stats.mp < this.currentStats.maxMP) {
                 this.stats.mp = min(this.currentStats.maxMP, this.stats.mp + 1);
            }
        }

        return moved; // Return true if player position changed this frame
    }

    render(offsetX, offsetY) {
        // Ensure p5 drawing functions are available
        if (typeof push !== 'function') return;

        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);

        // Draw the player icon
        this.drawPlayerIcon();

        // Optional: Selection indicator or health bar over player?
        // drawHealthBar(this.stats.hp, this.currentStats.maxHP, -this.size/2, -this.size*0.7, this.size, 5);

        pop();
    }

    // Method to draw the player's visual representation
    drawPlayerIcon() {
         // Ensure p5 drawing functions are available
        if (typeof push !== 'function') return;

        push();
        // Rotate player to face movement direction (or mouse?)
        // Simplified: No rotation for now, or face targetPos if moving
        if (this.isMoving && typeof atan2 === 'function') {
             rotate(atan2(this.targetPos.y - this.pos.y, this.targetPos.x - this.pos.x) + HALF_PI); // Add HALF_PI so top points forward
        } else {
             rotate(PI + HALF_PI); // Default facing down
        }


        fill(this.color); // Main color (gold-ish)
        stroke(40);
        strokeWeight(1);
        ellipse(0, 0, this.size * 0.8, this.size); // Main body (ellipse)

        // Simple details (shoulders/arms)
        fill(180); // Grey for details
        rectMode(CENTER); // Use center mode for easier positioning
        rect(-this.size * 0.3, 0, this.size * 0.2, this.size * 0.5, 2); // Left shoulder/arm
        rect(this.size * 0.3, 0, this.size * 0.2, this.size * 0.5, 2); // Right shoulder/arm

        // Simple "face" or front indicator
        fill(0);
        ellipse(0, -this.size * 0.2, this.size * 0.1, this.size * 0.15); // Small "eye" area

        pop();
    }
}


// =============================================
// FILE: monster.js
// =============================================
console.log("Loading: monster.js");
class Monster {
    constructor(monsterId, x, y) {
        const data = (typeof MonsterData !== 'undefined') ? MonsterData[monsterId] : null;
        if (!data) {
            console.error("Cannot find MonsterData for ID:", monsterId);
            // Create a placeholder/invalid monster state?
            this.id = 'invalid_monster';
            this.name = 'Error Monster';
            this.pos = createVector(x, y);
            this.size = TILE_SIZE;
            this.color = [255,0,255]; // Magenta for error
            this.state = 'dead'; // Mark as dead immediately
            this.stats = { hp: 0 };
            this.baseStats = { maxHP: 0 };
            this.currentStats = { attackRangeSq: 0, aggroRangeSq: 0 };
            this.invalid = true;
            return;
        }
        this.id = monsterId;
        this.name = data.name;
        this.pos = createVector(x, y);
        this.size = data.size || TILE_SIZE * 0.8;
        this.color = data.color || [255, 0, 0];
        this.icon = data.icon || 'default_monster';
        this.attackType = data.attackType || 'melee';
        this.invalid = false;

        // Deep copy base stats if they might contain nested objects/arrays
        this.baseStats = JSON.parse(JSON.stringify({
            maxHP: data.hp || 10,
            maxMP: data.mp || 0,
            attack: data.attack || 1,
            defense: data.defense || 0,
            speed: data.speed || 1,
            attackRangeSq: (data.attackRange || TILE_SIZE * 1.5) ** 2, // Store squared
            aggroRangeSq: (data.aggroRange || TILE_SIZE * 5) ** 2,   // Store squared
            projectileType: data.projectileType,
            projectileSpeed: data.projectileSpeed,
            projectileDamage: data.projectileDamage || data.attack || 1 // Default projectile damage
        }));
        // Current stats can be shallow copy, recalculated as needed
        this.currentStats = { ...this.baseStats };
        this.stats = { hp: this.baseStats.maxHP, mp: this.baseStats.maxMP };

        this.xpReward = data.xp || 0;
        this.lootTable = data.lootTable || [];

        this.target = null;
        this.state = 'idle'; // Possible states: 'idle', 'wandering', 'chasing', 'attacking_melee', 'attacking_ranged', 'dead'
        this.lastAttackTime = 0;
        this.attackCooldown = (this.attackType === 'ranged' ? 2500 : 1500) + random(-200, 200); // Add some variance
        this.wanderTarget = null;
        this.lastWanderTime = 0;
        this.wanderCooldown = random(3000, 8000); // Time between wander attempts
    }

    takeDamage(damage, attacker) {
        if (this.state === 'dead' || this.invalid) return;

        // Ensure stats exist
        if (!this.stats) { this.stats = { hp: 0 }; }
        if (!this.baseStats) { this.baseStats = { maxHP: 0 }; }

        this.stats.hp -= damage;
        // Use uiManager safely
        if (typeof uiManager !== 'undefined' && typeof uiManager.addFloatingText === 'function') {
            uiManager.addFloatingText(`-${damage}`, this.pos.x + random(-5, 5), this.pos.y + random(-10, 0), 'yellow', 1000);
        } else {
            console.log(`${this.name} took ${damage} damage.`);
        }

         // Add flash effect safely
         if (typeof visualEffects !== 'undefined') {
             let effect = { type: 'flash', target: this, color: color(255, 255, 255, 100), duration: 150, startTime: millis() };
              visualEffects.push(effect);
         }
          // if (typeof playSound === 'function') playSound('monsterHit'); // Optional sound

        if (this.stats.hp <= 0) {
            this.die(attacker);
        } else {
             // Aggro logic: Target the attacker if not already targeting someone,
             // or switch to player if attacked by player.
             const globalPlayer = (typeof player !== 'undefined') ? player : null;
             if (!this.target || (attacker === globalPlayer && this.target !== globalPlayer)) {
                 // If idle/wandering, start chasing immediately
                 if (this.state === 'idle' || this.state === 'wandering') {
                      this.target = attacker;
                      this.state = 'chasing';
                      this.wanderTarget = null; // Stop wandering
                 }
                 // If already chasing/attacking someone else but player hit us, switch target to player
                 else if (attacker === globalPlayer) {
                      this.target = attacker;
                      this.state = 'chasing'; // Re-evaluate distance/state
                 }
                 // Otherwise, keep current target unless specifically hit by player
             }
        }
    }

    die(killer) {
        if (this.state === 'dead' || this.invalid) return;
        this.state = 'dead';
        this.stats.hp = 0; // Ensure HP is zero
        const killerName = (killer && killer.name) ? killer.name : 'the environment';
        console.log(`${this.name} was slain by ${killerName}!`);
        // if (typeof playSound === 'function') playSound('monsterDeath');

        // Grant XP to killer if it has gainXP method
        if (killer && typeof killer.gainXP === 'function') {
            killer.gainXP(this.xpReward);
        }
        this.dropLoot(); // Drop items
    }

    dropLoot() {
        // Ensure Item, DroppedItem, worldItems exist
        if (typeof Item === 'undefined' || typeof DroppedItem === 'undefined' || typeof worldItems === 'undefined') {
             console.error("Cannot drop loot: Required classes or arrays missing.");
             return;
        }

        this.lootTable.forEach(loot => {
            if (random() < loot.chance) { // Assumes random() exists
                const itemInstance = new Item(loot.itemId); // Item constructor handles invalid IDs
                if (itemInstance && !itemInstance.invalid) {
                    // Add slight random offset to drop position
                    const dropX = this.pos.x + random(-TILE_SIZE*0.2, TILE_SIZE*0.2);
                    const dropY = this.pos.y + random(-TILE_SIZE*0.2, TILE_SIZE*0.2);
                    const droppedItem = new DroppedItem(itemInstance, dropX, dropY);
                    if (droppedItem && !droppedItem.invalid) {
                        worldItems.push(droppedItem);
                        // Optional message (can get spammy)
                        // if (typeof uiManager !== 'undefined') uiManager.addMessage(`${UIText.itemDropped}: ${itemInstance.name}`, 'lightblue');
                    }
                }
            }
        });
    }

     attack(target) {
          // Basic checks
          if (!target || !target.stats || target.stats.hp <= 0 || this.state === 'dead' || this.invalid) {
              this.target = null;
              this.state = 'idle'; // Go back to idle if target is invalid/dead
              return;
          }
          const now = millis();
          if (now - this.lastAttackTime >= this.attackCooldown) {
              if (this.attackType === 'melee') {
                  // Melee attack logic
                  const targetDefense = (target.currentStats && target.currentStats.defense !== undefined) ? target.currentStats.defense : 0;
                  let damage = max(1, this.currentStats.attack - targetDefense);
                  damage = floor(random(damage * 0.9, damage * 1.1));

                   // Target take damage safely
                   if (typeof target.takeDamage === 'function') target.takeDamage(damage, this);
                   // Add melee visual effect safely
                   if (typeof visualEffects !== 'undefined') {
                        let effect = { type: 'line', start: this.pos.copy(), end: target.pos.copy(), color: color(200,200,200, 180), duration: 100, startTime: now };
                        visualEffects.push(effect);
                   }
                    // if (typeof playSound === 'function') playSound('monsterAttackMelee');

              } else if (this.attackType === 'ranged') {
                   // Ranged attack - create projectile
                   // Ensure Projectile class and projectiles array exist
                   if (typeof Projectile !== 'undefined' && typeof projectiles !== 'undefined') {
                       let proj = new Projectile(
                            this.pos.x, this.pos.y,
                            target.pos.x, target.pos.y, // Target current position
                            this.currentStats.projectileSpeed || 5,
                            this.currentStats.projectileDamage || this.currentStats.attack, // Use specific or fallback damage
                            this, // Owner
                            this.currentStats.projectileType || 'arrow' // Type
                       );
                       projectiles.push(proj);
                        // if (typeof playSound === 'function') playSound('monsterAttackRanged');
                   } else {
                       console.error("Cannot fire projectile: Projectile class or array missing.");
                   }
              }

              this.lastAttackTime = now; // Reset cooldown timer

              // Check if target died after attack
              if (target.stats.hp <= 0) {
                  this.target = null;
                  this.state = 'idle';
              }
          }
     }


    update(player, npcs, obstacles) { // obstacles is likely the map or grid
        if (this.state === 'dead' || this.invalid) return;

        // Ensure player and npcs are valid arrays/objects
        const globalPlayer = (typeof player !== 'undefined' && player.stats && player.stats.hp > 0) ? player : null;
        const validNpcs = ((typeof npcs !== 'undefined') ? npcs : []).filter(npc => npc && npc.canFight && npc.state !== 'dead' && npc.stats && npc.stats.hp > 0);

        let potentialTargets = [];
        if (globalPlayer) potentialTargets.push(globalPlayer);
        potentialTargets = potentialTargets.concat(validNpcs);

        // --- Target Acquisition & State ---
        let closestTarget = null;
        let minDistSq = Infinity; // Start with infinity to find the true closest

         // 1. Check current target validity and distance
         if (this.target) {
             // Ensure target is still valid (alive, exists)
              const targetStillValid = potentialTargets.includes(this.target);
              if (!targetStillValid || !this.target.stats || this.target.stats.hp <= 0) {
                  this.target = null; // Target died or became invalid
                  this.state = 'idle';
              } else {
                  // Target is still valid, check distance
                   minDistSq = distSq(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
                   closestTarget = this.target; // Assume current target is still the closest for now

                   // Check if target moved too far away (lost aggro)
                   // Use aggroRangeSq * multiplier (e.g., 1.5*1.5 = 2.25)
                   if (minDistSq > this.currentStats.aggroRangeSq * 2.25) {
                       this.target = null;
                       this.state = 'idle';
                        closestTarget = null; // Reset closest target
                        minDistSq = Infinity; // Reset min distance for re-scan
                   }
              }
         }

         // 2. Scan for new/closer targets within aggro range
         for (let pTarget of potentialTargets) {
             const dSq = distSq(this.pos.x, this.pos.y, pTarget.pos.x, pTarget.pos.y);
             // Check if within aggro range AND closer than current target (or if no current target)
             if (dSq < this.currentStats.aggroRangeSq && dSq < minDistSq) {
                 minDistSq = dSq;
                 closestTarget = pTarget;
             }
         }

        // 3. Update target and state based on findings
        if (closestTarget) {
             if (this.target !== closestTarget) {
                 this.target = closestTarget; // Found a new or closer target
                  // Switch to chasing if not already attacking/chasing
                  if (this.state === 'idle' || this.state === 'wandering') {
                       this.state = 'chasing';
                       this.wanderTarget = null; // Stop wandering
                  }
             }
              // If we have a target, determine state based on distance
              if (minDistSq <= this.currentStats.attackRangeSq) {
                   // Within attack range
                   this.state = this.attackType === 'ranged' ? 'attacking_ranged' : 'attacking_melee';
              } else {
                   // Outside attack range, but within aggro range
                   this.state = 'chasing';
              }

        } else {
            // No target found or lost target
             if (this.state !== 'idle' && this.state !== 'wandering') {
                  this.state = 'idle'; // Switch back to idle if not already idle/wandering
             }
             this.target = null;
        }


        // --- Action Execution ---
        let moved = false;
        switch (this.state) {
            case 'idle':
                 // Transition to wandering after cooldown
                 const nowWander = millis();
                 if (nowWander - this.lastWanderTime > this.wanderCooldown) {
                      this.state = 'wandering'; // Start wandering process
                      this.lastWanderTime = nowWander; // Reset timer even if wander fails
                      this.wanderCooldown = random(4000, 9000); // Reset cooldown duration
                 }
                break;
            case 'wandering':
                if (!this.wanderTarget) {
                    // Choose a wander target
                    const angle = random(TWO_PI);
                    const distWander = random(TILE_SIZE * 1.5, TILE_SIZE * 4);
                    let tryX = this.pos.x + cos(angle) * distWander;
                    let tryY = this.pos.y + sin(angle) * distWander;

                    // Check if target is valid (needs currentMap)
                    const map = (typeof currentMap !== 'undefined') ? currentMap : null;
                    if (map && !map.isObstacle(tryX, tryY) && !map.isOutsideBounds(tryX, tryY)) {
                        this.wanderTarget = createVector(tryX, tryY);
                    } else {
                         // Failed to find wander target, reset state to idle to try again later
                         this.state = 'idle';
                    }
                }

                if (this.wanderTarget) {
                     // Move towards wander target (pass monsters array for collision)
                     const globalMonsters = (typeof monsters !== 'undefined') ? monsters : [];
                    moved = this.moveTowards(this.wanderTarget, obstacles, globalMonsters);
                    // Check if reached destination or got stuck
                    if (!moved || distSq(this.pos.x, this.pos.y, this.wanderTarget.x, this.wanderTarget.y) < (this.currentStats.speed * 0.8)**2) {
                        this.wanderTarget = null; // Clear target
                        this.state = 'idle'; // Return to idle after wandering completes/fails
                    }
                } else {
                     this.state = 'idle'; // If no target could be set, go back to idle
                }
                break;

            case 'chasing':
                if (this.target) {
                    const globalMonsters = (typeof monsters !== 'undefined') ? monsters : [];
                    moved = this.moveTowards(this.target.pos, obstacles, globalMonsters);
                     // If movement failed (e.g., stuck), maybe transition back to idle temporarily?
                     // if (!moved) { this.state = 'idle'; this.lastWanderTime = millis(); } // Simple stuck logic
                } else {
                     this.state = 'idle'; // Should not happen if target finding logic is correct
                }
                break;

             case 'attacking_melee':
             case 'attacking_ranged': // Combine attack states slightly
                  if (this.target) {
                       // Check if target moved out of attack range
                       const distToTargetSq = distSq(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
                       // Use a small buffer for melee, strict for ranged
                       const effectiveAttackRangeSq = this.attackType === 'melee' ? this.currentStats.attackRangeSq * 1.44 : this.currentStats.attackRangeSq;

                       if (distToTargetSq > effectiveAttackRangeSq) {
                           this.state = 'chasing'; // Target moved away, chase again
                       } else {
                           // In range, attack!
                            this.attack(this.target); // Attack method handles cooldown
                            moved = false; // Usually don't move while attacking

                            // Optional: Ranged units might try to maintain distance (kiting)
                            // if (this.attackType === 'ranged' && distToTargetSq < (TILE_SIZE * 2)**2) {
                            //    // Move away from target slightly? Complex.
                            // }
                       }
                  } else {
                       this.state = 'idle'; // Target lost/died
                  }
                 break;
        }
    }

    moveTowards(targetPosVec, obstacles, otherMonsters) {
         if (!targetPosVec || this.invalid) return false; // Safety check
         // Ensure p5.Vector is available
         if (typeof p5 === 'undefined' || typeof p5.Vector === 'undefined') return false;

         let moveVec = p5.Vector.sub(targetPosVec, this.pos);
         if (moveVec.magSq() < (this.currentStats.speed * 0.1)**2) return false; // Already close enough

         moveVec.setMag(this.currentStats.speed);
         let nextPos = p5.Vector.add(this.pos, moveVec);

         // --- Collision Detection ---
         let blocked = false;
         const map = (typeof currentMap !== 'undefined') ? currentMap : null;

         // 1. Map obstacles and bounds
         if (map && (map.isObstacle(nextPos.x, nextPos.y) || map.isOutsideBounds(nextPos.x, nextPos.y))) {
              blocked = true;
         }

         // 2. Other monsters (basic circle collision avoidance)
          if (!blocked) {
               // Ensure otherMonsters is an array
               const others = Array.isArray(otherMonsters) ? otherMonsters : [];
               for (let other of others) {
                    // Check if other is valid, not self, and not dead
                    if (other && other !== this && other.state !== 'dead' && other.pos && other.size) {
                         // Simple distance check between centers
                          const minDistSq = ((this.size / 2 + other.size / 2) * 0.8)**2; // Use 80% of combined radii
                          if (distSq(nextPos.x, nextPos.y, other.pos.x, other.pos.y) < minDistSq) {
                              blocked = true;
                              break; // Blocked by one monster is enough
                          }
                    }
               }
          }

         // --- Movement Execution or Avoidance ---
         if (!blocked) {
              // No collision, move normally
              this.pos = nextPos;
              return true;
         } else {
              // Blocked, try simple avoidance (slide along obstacle/monster)
              // This is basic: Try moving only horizontally or only vertically towards the target
              let moveX = createVector(moveVec.x, 0);
              let moveY = createVector(0, moveVec.y);
              let nextPosX = p5.Vector.add(this.pos, moveX.setMag(this.currentStats.speed));
              let nextPosY = p5.Vector.add(this.pos, moveY.setMag(this.currentStats.speed));

               let canMoveX = map && !map.isObstacle(nextPosX.x, nextPosX.y) && !map.isOutsideBounds(nextPosX.x, nextPosX.y);
               let canMoveY = map && !map.isObstacle(nextPosY.x, nextPosY.y) && !map.isOutsideBounds(nextPosY.x, nextPosY.y);

               // Simplistic: Prefer Y movement if both are possible? Or prioritize the direction closer to the target?
               // Let's try moving in the axis that wasn't the primary cause of the blockage (guesswork)
               // Or, just try Y first, then X.
               if (canMoveY && abs(moveVec.y) > abs(moveVec.x) * 0.5) { // Prioritize if Y component is significant
                     // Check Y move against monsters
                     let blockedY = false;
                     const others = Array.isArray(otherMonsters) ? otherMonsters : [];
                     for(let other of others) { if (other && other !== this && other.state !== 'dead' && other.pos && other.size && distSq(nextPosY.x, nextPosY.y, other.pos.x, other.pos.y) < ((this.size / 2 + other.size / 2) * 0.8)**2) { blockedY = true; break; } }
                     if (!blockedY) { this.pos = nextPosY; return true; }
               }
               if (canMoveX && abs(moveVec.x) > abs(moveVec.y) * 0.5) { // Then try X if Y failed or wasn't suitable
                    let blockedX = false;
                    const others = Array.isArray(otherMonsters) ? otherMonsters : [];
                     for(let other of others) { if (other && other !== this && other.state !== 'dead' && other.pos && other.size && distSq(nextPosX.x, nextPosX.y, other.pos.x, other.pos.y) < ((this.size / 2 + other.size / 2) * 0.8)**2) { blockedX = true; break; } }
                    if (!blockedX) { this.pos = nextPosX; return true; }
               }

               // If both simple slides fail, return false (stuck)
               return false;
         }
     }


    render(offsetX, offsetY) {
         if (this.invalid) return; // Don't render invalid monsters
         // Ensure p5 drawing functions are available
         if (typeof push !== 'function') return;

        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);

        if (this.state === 'dead') {
             // Draw dead state (e.g., rotated, tinted grey)
             push();
              if (typeof tint === 'function') tint(150, 150); // Apply grey tint
               // Optional: Rotate to show fallen state
              rotate(PI / 2 + random(-0.1, 0.1)); // Rotate 90 degrees + slight variance
              this.drawMonsterIcon(); // Draw the icon (will be tinted)
              if (typeof noTint === 'function') noTint(); // Remove tint for subsequent drawings
             pop();
        } else {
            // Draw alive state
            this.drawMonsterIcon(); // Draw the standard icon

            // Draw health bar if HP < MaxHP
            if (this.stats && this.baseStats && this.stats.hp < this.baseStats.maxHP && typeof drawHealthBar === 'function') {
                const barWidth = this.size * 1.1;
                const barHeight = 5;
                const barY = -this.size * 0.7; // Position above the icon
                drawHealthBar(this.stats.hp, this.baseStats.maxHP, -barWidth / 2, barY, barWidth, barHeight); // Use default colors
            }

            // Optional: Draw state indicator (e.g., '!' if chasing)
            // if(this.state === 'chasing') { fill(255,0,0); textSize(16); text('!', 0, -this.size * 0.8); }
        }

        pop(); // Restore global drawing state
    }

     // --- Method to draw specific monster icon ---
     drawMonsterIcon() {
         // Ensure p5 drawing functions are available
        if (typeof push !== 'function') return;

         push();
         noStroke();
         rectMode(CENTER); // Set rectMode for consistency within this method

         switch (this.icon) {
             case 'goblin':
                 fill(34, 139, 34); // Dark green skin
                 ellipse(0, 0, this.size * 0.9, this.size); // Body
                 fill(255, 255, 0); // Yellow eyes
                 ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.15, this.size * 0.15); // Left eye
                 ellipse(this.size * 0.2, -this.size * 0.1, this.size * 0.15, this.size * 0.15); // Right eye
                 fill(139, 69, 19); // Brown club
                 rect(this.size * 0.35, 0, this.size * 0.15, this.size * 0.6, 2); // Simple club shape
                 break;
             case 'skeleton':
                 fill(220); // Bone white
                 rect(0, this.size * 0.1, this.size * 0.3, this.size * 0.6, 1); // Torso
                 ellipse(0, -this.size * 0.25, this.size * 0.4, this.size * 0.4); // Head
                 fill(0); // Black eye sockets
                 ellipse(-this.size * 0.1, -this.size * 0.25, this.size * 0.1, this.size * 0.1);
                 ellipse(this.size * 0.1, -this.size * 0.25, this.size * 0.1, this.size * 0.1);
                 // Simple arms (lines)
                 stroke(200); strokeWeight(max(1, this.size * 0.05)); // Scale stroke weight
                 line(-this.size * 0.15, 0, -this.size * 0.4, -this.size * 0.1); // Left arm
                 line(this.size * 0.15, 0, this.size * 0.4, -this.size * 0.1); // Right arm (holding bow implied)
                 noStroke(); // Reset stroke
                 break;
             case 'bat':
                 fill(60); // Dark grey
                 ellipse(0, 0, this.size, this.size * 0.6); // Body
                 // Simple triangular wings
                 triangle(-this.size * 0.1, -this.size * 0.1, -this.size * 0.5, -this.size * 0.5, -this.size * 0.8, this.size * 0.1);
                 triangle(this.size * 0.1, -this.size * 0.1, this.size * 0.5, -this.size * 0.5, this.size * 0.8, this.size * 0.1);
                 fill(255, 0, 0); // Red eye
                 ellipse(0, -this.size * 0.1, this.size * 0.1, this.size * 0.1);
                 break;
             default: // Default fallback icon
                 fill(this.color || color(128)); // Use monster color or grey
                 ellipse(0, 0, this.size, this.size);
                 fill(0);
                 ellipse(0, 0, this.size * 0.1, this.size * 0.1); // Simple dot
         }
         pop(); // Restore drawing state
     }
}


// =============================================
// FILE: npc.js
// =============================================
console.log("Loading: npc.js");
class Npc {
    constructor(npcId, x, y) {
        const data = (typeof NpcData !== 'undefined') ? NpcData[npcId] : null;
        if (!data) {
            console.error("Cannot find NpcData for ID:", npcId);
            this.id = 'invalid_npc';
            this.name = 'Error NPC';
            this.pos = createVector(x, y);
            this.size = TILE_SIZE;
            this.color = [255,0,255];
            this.state = 'dead';
            this.stats = { hp: 0 };
            this.baseStats = { maxHP: 0 };
            this.invalid = true;
            return;
        }
        this.id = npcId;
        this.name = data.name;
        this.pos = createVector(x, y);
        this.size = data.size || TILE_SIZE * 0.9;
        this.color = data.color || [0, 0, 255];
        this.icon = data.icon || 'default_npc';
        this.dialogue = data.dialogue || [`Greetings from ${this.name}.`];
        this.canFight = data.canFight || false;
        this.invalid = false;

        this.baseStats = JSON.parse(JSON.stringify({
            maxHP: data.hp || 50,
            attack: data.attack || 0,
            defense: data.defense || 0,
            speed: data.speed || 1, // NPC movement speed
            attackRangeSq: (data.attackRange || TILE_SIZE * 1.5) ** 2,
            aggroRangeSq: (data.aggroRange || TILE_SIZE * 4) ** 2,
        }));
         this.pursuitRangeMultiplier = data.pursuitRangeMultiplier || 1.0; // How far beyond aggro range they pursue
        this.currentStats = { ...this.baseStats }; // Shallow copy ok
        this.stats = { hp: this.baseStats.maxHP };

        this.targetEnemy = null;
        this.state = 'idle'; // 'idle', 'fighting', 'moving_to_interact', 'dead'
        this.lastAttackTime = 0;
        this.attackCooldown = (data.attackCooldown || 2000) + random(-100, 100); // Attack speed
    }

    interact(player) { // player is the one interacting
         // Use uiManager safely
         if (typeof uiManager !== 'undefined' && typeof uiManager.addMessage === 'function') {
             // Select random dialogue safely
             const msg = randomFromArray(this.dialogue) || `Hello, I am ${this.name}.`;
             uiManager.addMessage(`${this.name}: "${msg}"`, 'cyan', 4000);
         } else {
             console.log(`${this.name} interacts with ${player.name}`);
         }
        // if (typeof playSound === 'function') playSound('npcInteract'); // Optional sound

        // Future: Open trade window, quest dialog, etc.
        // Example: if(this.id === 'merchant') { uiManager.openTradeWindow(this); }
    }

     takeDamage(damage, attacker) {
         if (this.state === 'dead' || this.invalid) return;
         if (!this.stats) { this.stats = { hp: 0 }; } // Safety init

         this.stats.hp -= damage;
         // Use uiManager safely
        if (typeof uiManager !== 'undefined' && typeof uiManager.addFloatingText === 'function') {
            uiManager.addFloatingText(`-${damage}`, this.pos.x + random(-5, 5), this.pos.y + random(-10, 0), 'orange', 1000);
         } else {
             console.log(`${this.name} took ${damage} damage.`);
         }

         // Add flash effect safely
          if (typeof visualEffects !== 'undefined') {
               let effect = { type: 'flash', target: this, color: color(200, 100, 0, 100), duration: 150, startTime: millis() };
               visualEffects.push(effect);
          }
           // if (typeof playSound === 'function') playSound('npcHit'); // Optional sound

         if (this.stats.hp <= 0) {
             this.die(attacker);
         } else {
             // If NPC can fight and was attacked by a Monster
             if (this.canFight && attacker instanceof Monster) {
                 // Target the attacker if no current target, or prioritize attacker if it's closer?
                 // Simple: always target the last monster that hit us if we can fight.
                 this.targetEnemy = attacker;
                 if (this.state !== 'fighting') { // Switch to fighting state if not already
                      this.state = 'fighting';
                      console.log(`${this.name} is now fighting ${attacker.name}!`);
                 }
             }
         }
     }

    die(killer) {
         if (this.state === 'dead' || this.invalid) return;
         this.stats.hp = 0; // Ensure HP is 0
         this.state = 'dead';
         const killerName = (killer && killer.name) ? killer.name : 'causes unknown';
         console.log(`NPC ${this.name} was slain by ${killerName}...`);
         // if (typeof playSound === 'function') playSound('npcDeath');

         // NPCs might respawn after a timer, or stay dead? For now, just mark dead.
         // Maybe drop something?
    }

    attack(target) {
        // Basic checks
        if (!target || !target.stats || target.stats.hp <= 0 || this.state !== 'fighting' || this.invalid) {
            this.targetEnemy = null;
            if(this.stats.hp > 0) this.state = 'idle'; // Revert to idle if target is invalid but NPC is alive
            return;
        }
        const now = millis();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            const targetDefense = (target.currentStats && target.currentStats.defense !== undefined) ? target.currentStats.defense : 0;
            let damage = max(1, this.currentStats.attack - targetDefense);
            damage = floor(random(damage * 0.9, damage * 1.1));

            if (typeof target.takeDamage === 'function') target.takeDamage(damage, this);

            this.lastAttackTime = now;
             // if (typeof playSound === 'function') playSound('npcAttack');

             // Add attack visual effect safely
             if (typeof visualEffects !== 'undefined') {
                  let effect = { type: 'line', start: this.pos.copy(), end: target.pos.copy(), color: color(100,100,255, 180), duration: 100, startTime: now };
                  visualEffects.push(effect);
             }

            // Check if target died
            if (target.stats.hp <= 0) {
                 console.log(`NPC ${this.name} defeated ${target.name}`);
                 this.targetEnemy = null;
                 this.state = 'idle'; // Go back to idle
            }
        }
    }


    update(monsters, player) { // monsters and player objects from sketch.js
        if (this.state === 'dead' || this.invalid) return;

        // Ensure monsters is an array
        const validMonsters = (Array.isArray(monsters) ? monsters : []).filter(m => m && m.state !== 'dead' && m.stats && m.stats.hp > 0);

        if (this.canFight) {
            let closestEnemy = null;
            let minDistSq = Infinity; // Find the absolute closest

            // 1. Check current target validity
             if(this.targetEnemy){
                  // Check if target is still in the monsters list and alive
                  const targetStillValid = validMonsters.includes(this.targetEnemy);
                  if(!targetStillValid || !this.targetEnemy.stats || this.targetEnemy.stats.hp <= 0){
                       this.targetEnemy = null;
                       this.state = 'idle'; // Go idle if target invalid
                  } else {
                       // Target still valid, check distance
                       minDistSq = distSq(this.pos.x, this.pos.y, this.targetEnemy.pos.x, this.targetEnemy.pos.y);
                       closestEnemy = this.targetEnemy; // Assume current is closest initially

                        // Check if target ran too far away (beyond pursuit range)
                       const maxPursuitDistSq = this.currentStats.aggroRangeSq * (this.pursuitRangeMultiplier**2);
                       if(minDistSq > maxPursuitDistSq){
                            console.log(`${this.name} lost target ${this.targetEnemy.name} (too far).`);
                            this.targetEnemy = null;
                            this.state = 'idle';
                            closestEnemy = null; // Reset for scan
                             minDistSq = Infinity; // Reset for scan
                       }
                  }
             }

             // 2. Scan for new/closer enemies within aggro range
            for (let monster of validMonsters) {
                const dSq = distSq(this.pos.x, this.pos.y, monster.pos.x, monster.pos.y);
                if (dSq < this.currentStats.aggroRangeSq && dSq < minDistSq) {
                    minDistSq = dSq;
                    closestEnemy = monster;
                }
            }

            // 3. Update target and state
            if (closestEnemy) {
                 if (this.targetEnemy !== closestEnemy) {
                      this.targetEnemy = closestEnemy;
                      if(this.state !== 'fighting'){
                           console.log(`NPC ${this.name} targets ${closestEnemy.name}.`);
                           this.state = 'fighting';
                      }
                 }
                 // Determine action based on distance
                  if (minDistSq <= this.currentStats.attackRangeSq) {
                       this.state = 'fighting'; // Ensure state is fighting
                       this.attack(this.targetEnemy); // Attack if in range
                  } else {
                       // Out of attack range, but within pursuit range
                       // Move towards enemy if pursuit is enabled
                       if (this.pursuitRangeMultiplier > 1.0) {
                            this.state = 'fighting'; // Still considered fighting (chasing)
                            this.moveTowards(this.targetEnemy.pos);
                       } else {
                            // If not pursuing, maybe just stand ground or go idle?
                            // Let's keep state as fighting but don't move. Attack check will fail.
                       }
                  }

            } else {
                 // No closest enemy found or current target lost
                 if(this.state === 'fighting'){
                      console.log(`${this.name} has no target, returning to idle.`);
                      this.state = 'idle';
                      this.targetEnemy = null;
                 }
            }
        }

        // --- Non-fighting behavior ---
        if (this.state === 'idle') {
            // Optional: Random small movements or pathing
            // if (random() < 0.01) { // Very low chance per frame
            //    this.wanderSlightly();
            // }
        }
    }

    // Simple movement towards a target vector (no collision avoidance here)
    moveTowards(targetPosVec) {
         if (!targetPosVec || this.invalid) return;
         // Ensure p5.Vector and currentMap exist
         if (typeof p5 === 'undefined' || typeof p5.Vector === 'undefined' || typeof currentMap === 'undefined') return;

         let moveVec = p5.Vector.sub(targetPosVec, this.pos);
         // Check distance to avoid jittering when close
         if (moveVec.magSq() > (this.currentStats.speed * 0.5)**2) {
             moveVec.setMag(this.currentStats.speed);
             let nextPos = p5.Vector.add(this.pos, moveVec);
             // Basic check against map obstacles
             if(!currentMap.isObstacle(nextPos.x, nextPos.y) && !currentMap.isOutsideBounds(nextPos.x, nextPos.y)){
                  this.pos = nextPos;
             }
         }
    }

    render(offsetX, offsetY) {
         if (this.invalid) return;
         if (typeof push !== 'function') return; // Ensure p5 render functions ready

        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);

        if (this.state === 'dead') {
             // Draw dead state (tinted grey, maybe rotated)
             push();
             if (typeof tint === 'function') tint(150, 150); // Grey tint
              // rotate(PI/2); // Optional rotation
              this.drawNpcIcon(); // Draw tinted icon
             if (typeof noTint === 'function') noTint(); // Remove tint
             pop();
        } else {
            // Draw alive state
            this.drawNpcIcon(); // Draw standard icon

            // Draw health bar if can fight and is damaged
            if (this.canFight && this.stats && this.baseStats && this.stats.hp < this.baseStats.maxHP) {
                 if (typeof drawHealthBar === 'function') {
                    const barWidth = this.size * 1.0;
                    const barHeight = 4;
                    const barY = -this.size * 0.6; // Above icon
                     // Use green for NPC health
                     drawHealthBar(this.stats.hp, this.baseStats.maxHP, -barWidth / 2, barY, barWidth, barHeight, color(50,50,50,180), color(0,200,0,220));
                 }
            }

            // Optional: Draw name on hover or permanently?
            // fill(240); textSize(10); textAlign(CENTER, BOTTOM);
            // text(this.name, 0, -this.size * 0.8);
        }

        pop(); // Restore global drawing state
    }

     // --- Method to draw specific NPC icon ---
     drawNpcIcon() {
          if (typeof push !== 'function') return; // Ensure p5 render functions ready

          push();
          noStroke();
          rectMode(CENTER); // Consistent rect mode

          // Base body shape
          fill(this.color || color(0,0,200)); // Use NPC color or default blue
          rect(0, 0, this.size * 0.7, this.size, 3); // Rounded body rectangle

          // Add details based on icon ID
          switch (this.icon) {
              case 'elder':
                  fill(240); // White beard/hair
                  rect(0, -this.size * 0.35, this.size * 0.6, this.size * 0.3, 2); // Hair/Top
                  rect(0, this.size * 0.15, this.size * 0.4, this.size * 0.5, 3); // Beard
                  fill(100, 60, 20); // Brown staff
                  rect(this.size * 0.4, 0, this.size * 0.1, this.size * 0.9, 1); // Staff to the side
                  break;
              case 'guard':
                  fill(180); // Silver/grey armor
                  ellipse(0, -this.size * 0.4, this.size * 0.5, this.size * 0.4); // Helmet top
                  rect(-this.size * 0.3, -this.size * 0.05, this.size * 0.25, this.size * 0.5, 2); // Left pauldron
                  rect(this.size * 0.3, -this.size * 0.05, this.size * 0.25, this.size * 0.5, 2); // Right pauldron
                  fill(80); // Dark weapon hilt?
                  rect(this.size * 0.35, this.size * 0.2, this.size * 0.1, this.size * 0.6, 1); // Weapon at side
                  break;
              case 'farmer':
                   fill(222, 184, 135); // Straw hat color
                   ellipse(0, -this.size * 0.45, this.size * 0.8, this.size * 0.3); // Hat brim
                    ellipse(0, -this.size*0.5, this.size*0.5, this.size*0.2); // Hat top
                   fill(0, 100, 0); // Green apron/shirt
                   rect(0, this.size*0.15, this.size*0.6, this.size*0.5, 2);
                  break;
              default:
                  // Draw nothing extra for default
                  break;
          }

           // Simple face dots (optional)
           fill(50);
           ellipse(-this.size*0.12, -this.size*0.25, this.size*0.08, this.size*0.08);
           ellipse(this.size*0.12, -this.size*0.25, this.size*0.08, this.size*0.08);

          pop(); // Restore drawing state
      }
}


// =============================================
// FILE: sketch.js
// =============================================
console.log("Loading: sketch.js");
// --- Global Variables ---
let player;
let monsters = [];
let npcs = [];
let worldItems = [];
let projectiles = []; // Stores active projectiles
let visualEffects = []; // Stores temporary visual effects

let villageMap;
let wildernessMap;
let currentMap; // Reference to the currently active map object

let uiManager; // Instance of UIManager

// Camera object to handle scrolling
let camera = {
    x: 0, y: 0,                // Top-left corner of the camera view in world coordinates
    targetX: 0, targetY: 0,    // Target position for the camera (usually player centered)
    lerpAmount: 0.08           // Smoothing factor for camera movement (lower = smoother)
};

// Game state management
let gameState = 'loading'; // Possible states: 'loading', 'village', 'wilderness', 'gameOver', 'paused' ?
let lastMonsterSpawnTime = 0; // Timer for monster spawning

// --- Sound Variables ---
let sounds = {};        // Object to hold loaded sound files or oscillators
let masterVolume = 0.3; // Global volume control (0.0 to 1.0)
let audioInitialized = false; // Flag to track if user interaction has enabled audio

// --- p5.js Preload Function ---
// Used to load assets like images, sounds, fonts before setup() runs
function preload() {
    console.log("Preloading assets...");
    // Example: Load actual sound files (replace oscillator setup if using files)
    // sounds.playerAttack = loadSound('assets/sounds/player_attack.wav');
    // sounds.playerHit = loadSound('assets/sounds/player_hit.wav');
    // sounds.pickupItem = loadSound('assets/sounds/pickup.wav');
    // sounds.levelUp = loadSound('assets/sounds/level_up.wav');
    // ... etc.

    // --- Fallback: Create Oscillators for basic sound feedback ---
    // Check if p5.sound library (and p5.Oscillator) is loaded
    if (typeof p5 !== 'undefined' && p5.Oscillator) {
        sounds.playerAttack = new p5.Oscillator('sine');
        sounds.playerHit = new p5.Oscillator('sawtooth');
        sounds.monsterHit = new p5.Oscillator('square');
        sounds.pickupItem = new p5.Oscillator('triangle');
        sounds.levelUp = new p5.Oscillator('sine');
        sounds.equipItem = new p5.Oscillator('sine');
        sounds.useItem = new p5.Oscillator('triangle');
        sounds.openInventory = new p5.Oscillator('sine');
        sounds.closeInventory = new p5.Oscillator('sine');
        sounds.invalidAction = new p5.Oscillator('sawtooth');
        sounds.playerDeath = new p5.Oscillator('sawtooth');
        sounds.monsterAttackRanged = new p5.Oscillator('square');

        // Initialize oscillators (set frequency, amplitude to 0, start)
        Object.values(sounds).forEach((osc, index) => {
            if (osc instanceof p5.Oscillator) {
                 // Assign somewhat distinct frequencies
                 osc.freq(220 + index * 55); // Start at A3 and go up in approx fourths
                 osc.amp(0); // Start silent
                 osc.start();
            }
        });

         // Fine-tune specific sounds
         if (sounds.pickupItem) sounds.pickupItem.freq(880); // Higher pitch for pickup
         if (sounds.levelUp) sounds.levelUp.freq(660); // Pleasant interval for level up
         if (sounds.playerHit) sounds.playerHit.freq(165); // Lower pitch for player hit
         if (sounds.playerDeath) sounds.playerDeath.freq(82); // Very low for death
         if (sounds.invalidAction) sounds.invalidAction.freq(110);

    } else {
        console.warn("p5.sound or p5.Oscillator not available. Sound effects disabled.");
    }

    console.log("Preload complete.");
}

// --- Play Sound Helper Function ---
// Safely plays a sound oscillator for a short duration
function playSound(soundName, duration = 0.1, volume = 0.8) {
     // Check if sound exists, audio context is running, and it's an oscillator
     if (sounds[soundName] && audioInitialized && sounds[soundName] instanceof p5.Oscillator && typeof sounds[soundName].amp === 'function') {
         // Ramp amplitude up quickly, then ramp down after duration
         sounds[soundName].amp(volume * masterVolume, 0.01); // Attack time 0.01s
         // Schedule the amplitude ramp down
         sounds[soundName].amp(0, 0.1, duration); // Release time 0.1s, start after 'duration' seconds
     } else if (!audioInitialized) {
         // console.log("Audio not initialized, skipping sound:", soundName); // Avoid spamming console
     }
}

// --- Initialize Audio Context ---
// Must be called after user interaction (e.g., mouse press)
function initializeAudio() {
    if (!audioInitialized && typeof getAudioContext === 'function') {
        const context = getAudioContext();
        if (context.state !== 'running') {
            context.resume().then(() => {
                console.log("AudioContext resumed successfully.");
                audioInitialized = true;
                // Maybe play a confirmation sound?
                 if (sounds.pickupItem) playSound('pickupItem', 0.05, 0.5); // Play a gentle sound
                 // Remove the 'click to enable' message if uiManager exists
                 if(uiManager && uiManager.systemMessages) {
                      uiManager.systemMessages = uiManager.systemMessages.filter(msg => !msg.text.includes("enable sound"));
                 }
            }).catch(e => console.error("Error resuming AudioContext:", e));
        } else {
            audioInitialized = true; // Already running
        }
    }
}


// --- p5.js Setup Function ---
// Runs once at the beginning of the sketch
function setup() {
    createCanvas(windowWidth, windowHeight); // Create canvas filling window
    frameRate(60); // Target 60 frames per second
    console.log("Game setup starting...");

    // Instantiate UI Manager first, as other objects might use it
    uiManager = new UIManager(); // Assumes UIManager class is defined

    console.log("Generating maps...");
    // Instantiate map classes (ensure GameMap class is defined)
    villageMap = new GameMap(MapSettings.villageWidth, MapSettings.villageHeight, true);
    wildernessMap = new GameMap(MapSettings.wildernessWidth, MapSettings.wildernessHeight, false);

    console.log("Creating player...");
    // Determine start position safely
    let startPos = (villageMap && villageMap.entryPoint) ? villageMap.entryPoint : createVector(TILE_SIZE * 5, TILE_SIZE * 5); // Fallback position
    player = new Player(startPos.x, startPos.y); // Assumes Player class is defined

    console.log("Spawning initial NPCs...");
    spawnInitialNpcs(); // Place NPCs on the village map

    currentMap = villageMap; // Start in the village
    gameState = 'village';
    centerCameraOnPlayer(true); // Center camera immediately

     if (uiManager) {
        const welcomeText = (typeof UIText !== 'undefined' && UIText.welcome) ? UIText.welcome : "Welcome!";
        const rareColor = (typeof getRarityP5Color === 'function') ? getRarityP5Color('rare') : color(0, 112, 255);
        uiManager.addMessage(welcomeText, rareColor, 5000);

        // Add prompt to enable audio
        uiManager.addMessage("Click screen to enable sound", color(200, 200, 100), 10000);
     }


    // Give player starting items safely
    if (player && typeof player.pickupItem === 'function' && typeof DroppedItem !== 'undefined' && typeof Item !== 'undefined') {
        player.pickupItem(new DroppedItem(new Item('hp_potion_small', 5), 0, 0)); // Create dummy DroppedItem to add
        player.pickupItem(new DroppedItem(new Item('rusty_sword'), 0, 0));
        player.pickupItem(new DroppedItem(new Item('leather_armor'), 0, 0));
        // player.pickupItem(new DroppedItem(new Item('short_bow'),0,0)); // For testing bow drops
    }

    console.log("Game setup complete. Initial state:", gameState);
    disableRightClickContextMenu(); // Prevent browser context menu
}

// --- Spawn Initial NPCs ---
// Places NPCs based on spawn points defined in the village map
function spawnInitialNpcs(){
     npcs = []; // Clear existing NPCs
     // Ensure NpcData, villageMap, and Npc class exist
     if (typeof NpcData === 'undefined' || !villageMap || typeof Npc === 'undefined') {
          console.error("Cannot spawn NPCs: NpcData, villageMap, or Npc class missing.");
          return;
     }
     const npcIds = Object.keys(NpcData);
     if (npcIds.length === 0) {
          console.warn("No NPC types defined in NpcData.");
          return;
     }
     let npcIndex = 0;
     if (villageMap.spawnPoints && Array.isArray(villageMap.spawnPoints)) {
          villageMap.spawnPoints.forEach((spawnPos) => {
              if (spawnPos) { // Ensure spawn point is valid
                   let npcId = npcIds[npcIndex % npcIds.length]; // Cycle through available NPC types
                   let newNpc = new Npc(npcId, spawnPos.x, spawnPos.y);
                   if (newNpc && !newNpc.invalid) { // Check if NPC was created successfully
                       npcs.push(newNpc);
                       npcIndex++;
                   }
              }
          });
     }
      console.log(`Spawned ${npcs.length} NPCs.`);
}


// --- p5.js Draw Function ---
// Runs repeatedly, drawing each frame
function draw() {
    background(10, 10, 15); // Dark background color

    // Handle loading state
    if (gameState === 'loading') {
        fill(200); textAlign(CENTER, CENTER); textSize(20);
        text("Loading...", width / 2, height / 2);
        return; // Don't draw or update anything else
    }

    // Ensure essential elements exist before proceeding
    if (!currentMap || !player || !uiManager) {
         fill(255, 0, 0); textAlign(CENTER, CENTER); textSize(25);
         text("ERROR: Game components missing!", width / 2, height / 2);
         return;
    }

    // --- Update ---
    updateCamera(); // Update camera position based on player

    // Update game objects only if not paused or game over
    if (gameState !== 'gameOver' && gameState !== 'paused') { // Add paused state if needed
         // Update player if alive
         let playerMoved = false;
        if (player.stats.hp > 0) {
            playerMoved = player.update(currentMap, monsters, npcs); // Pass necessary objects
            if (playerMoved) {
                checkMapTransition(); // Check if player moved onto an exit
                checkItemPickup();    // Check if player moved near an item
            }
        } else if (gameState !== 'gameOver') {
            // Player died this frame, trigger game over logic if not already triggered
            player.die(null); // die() method now handles setting gameState
        }

         // Update Monsters (filter out very old dead ones eventually?)
         monsters = monsters.filter(monster => {
              if (monster && monster.state !== 'dead') {
                   monster.update(player, npcs, monsters); // Update alive monsters
                   return true; // Keep monster
              } else if (monster && monster.state === 'dead') {
                    // Optional: Remove dead monsters after a certain time?
                    // if (millis() - (monster.deathTime || 0) < 30000) return true; // Keep for 30s
                    return true; // Keep dead monsters for now
              }
              return false; // Remove invalid monsters
         });

         // Update NPCs (only if in the village)
         if (currentMap.isVillage) {
             npcs.forEach(npc => {
                 if (npc && npc.state !== 'dead') {
                     npc.update(monsters, player); // Pass monsters and player
                 }
             });
         }

        // Update Projectiles (filter returns false for projectiles to remove)
        projectiles = projectiles.filter(proj => proj && proj.update(monsters, player, npcs, currentMap));

        // Update Visual Effects (filter removes expired effects)
         updateVisualEffects();

        // Spawn new monsters in the wilderness
        if (gameState === 'wilderness') {
            spawnMonsters();
        }
    } // End of game update block


    // --- Rendering --- (Order matters for layering)
    // 1. Render Map (background)
    currentMap.render(camera.x, camera.y, width, height);

    // 2. Render World Items (on the ground)
    worldItems.forEach(item => { if(item && !item.invalid) item.render(camera.x, camera.y); });

    // 3. Render Projectiles
    projectiles.forEach(proj => { if(proj) proj.render(camera.x, camera.y); });

    // 4. Render Units (Player, Monsters, NPCs) - Sorted by Y for pseudo-depth
     let unitsToRender = [];
     if (player && player.stats.hp > 0) unitsToRender.push(player);
     unitsToRender = unitsToRender.concat(monsters.filter(m => m && m.state !== 'dead'));
     if (currentMap.isVillage) { // Only render NPCs in the village
         unitsToRender = unitsToRender.concat(npcs.filter(n => n && n.state !== 'dead'));
     }
     // Sort by Y position (higher Y drawn later, appears in front)
     unitsToRender.sort((a, b) => a.pos.y - b.pos.y);
     unitsToRender.forEach(unit => { if(unit) unit.render(camera.x, camera.y); });

    // 5. Render Dead Units (drawn over living units' feet, but under effects)
     monsters.forEach(m => { if(m && m.state === 'dead') m.render(camera.x, camera.y); });
     npcs.forEach(n => { if(n && n.state === 'dead') n.render(camera.x, camera.y); });
     // Render dead player? Maybe handled by game over screen

    // 6. Render Visual Effects (explosions, attack lines, etc.)
     renderVisualEffects(camera.x, camera.y);

    // 7. Render UI (always on top)
    uiManager.render();

    // --- Game Over Screen ---
    if (gameState === 'gameOver') {
        push();
        fill(0, 0, 0, 200); rect(0, 0, width, height); // Dark overlay
        fill(200, 30, 30); textSize(72); textAlign(CENTER, CENTER); textFont('Georgia');
        text("YOU DIED", width / 2, height / 2 - 40); // Classic message
        fill(200); textSize(24); textFont('sans-serif');
        text("Press [R] to Restart", width / 2, height / 2 + 40);
        pop();
    }

     // --- Debug Info (Optional) ---
     /*
     push();
     fill(255); textSize(10); textAlign(LEFT, TOP); noStroke(); textFont('monospace');
     const fr = frameRate();
     text(`FPS: ${fr ? fr.toFixed(1) : 'N/A'}`, 10, 10);
     const aliveMonsters = monsters.filter(m=>m && m.state !== 'dead').length;
     text(`Monsters: ${aliveMonsters}/${monsters.length}`, 10, 25);
     text(`Items: ${worldItems.length}`, 10, 40);
     text(`Projectiles: ${projectiles.length}`, 10, 55);
     text(`Effects: ${visualEffects.length}`, 10, 70);
     text(`State: ${gameState}`, 10, 85);
     if(player && player.pos) text(`Player Pos: ${player.pos.x.toFixed(0)}, ${player.pos.y.toFixed(0)}`, 10, 100);
     text(`Audio: ${audioInitialized ? 'On' : 'Off'}`, 10, 115);
     pop();
     //*/
} // End Draw Loop

// --- Camera Control Functions ---
function updateCamera() {
    if (!player || !player.pos) return; // Safety check
    // Target the center of the screen on the player
    camera.targetX = player.pos.x - width / 2;
    camera.targetY = player.pos.y - height / 2;

    // Smoothly interpolate camera position towards the target
    camera.x = lerp(camera.x, camera.targetX, camera.lerpAmount);
    camera.y = lerp(camera.y, camera.targetY, camera.lerpAmount);

    // Constrain camera to map boundaries
    if (currentMap) {
        // Ensure map dimensions are positive
        const mapW = max(0, currentMap.mapWidthPixels);
        const mapH = max(0, currentMap.mapHeightPixels);
        // Ensure camera doesn't scroll beyond map edges
        camera.x = constrain(camera.x, 0, max(0, mapW - width)); // Use max(0, ...) to handle maps smaller than screen
        camera.y = constrain(camera.y, 0, max(0, mapH - height));
    } else {
         // If no map, constrain to 0,0 ?
         camera.x = max(0, camera.x);
         camera.y = max(0, camera.y);
    }
}
// Immediately center camera on player (e.g., after map change)
function centerCameraOnPlayer(immediate = false) {
     if (!player || !player.pos) return;
     camera.targetX = player.pos.x - width / 2;
     camera.targetY = player.pos.y - height / 2;
     if(immediate) {
          camera.x = camera.targetX;
          camera.y = camera.targetY;
           // Apply constraints immediately
           if (currentMap) {
               const mapW = max(0, currentMap.mapWidthPixels);
               const mapH = max(0, currentMap.mapHeightPixels);
                camera.x = constrain(camera.x, 0, max(0, mapW - width));
                camera.y = constrain(camera.y, 0, max(0, mapH - height));
           }
     }
}

// --- Input Handling Functions ---

function mousePressed() {
    // --- Attempt to initialize audio on first click ---
     if (!audioInitialized) {
         initializeAudio();
         // Don't process game clicks on the same press that enables audio
         // return; // Uncomment this line if you want the first click ONLY for audio
     }

    // Ignore clicks if game is over
    if (gameState === 'gameOver') return;

    // Prioritize UI clicks (inventory, equipment panels)
    // uiManager.handleMouseClick returns true if it handled the click
    if (uiManager && uiManager.handleMouseClick(mouseX, mouseY)) {
         return; // UI consumed the click
    }

    // If inventory is open, clicking outside panels should close it
    if (uiManager && uiManager.showInventory){
          // Check if click is outside both panels
          if (!isMouseOverPanel(uiManager.inventoryPanel) && !isMouseOverPanel(uiManager.equipmentPanel)){
              uiManager.toggleInventory(); // Close inventory
          }
         return; // Don't process world clicks if inventory was open
    }

    // --- World Click Logic (if not handled by UI) ---
    let worldMx = mouseX + camera.x;
    let worldMy = mouseY + camera.y;

    // 1. Click on Dropped Item?
    // Check items first as they might be small and overlay monsters/npcs
     let clickedItem = null;
     // Increase click radius slightly compared to automatic pickup radius
     let clickRadiusSq = PlayerDefaults.pickupRadiusSq * 1.5;
     for (let i = worldItems.length - 1; i >= 0; i--) { // Iterate backwards for safe removal
          let item = worldItems[i];
          if (!item || !item.pos || item.invalid) continue;
         if (distSq(worldMx, worldMy, item.pos.x, item.pos.y) < clickRadiusSq) {
              // Check if already in pickup range
              if (distSq(player.pos.x, player.pos.y, item.pos.x, item.pos.y) < player.pickupRadiusSq) {
                   if (player.pickupItem(item)) { // Try direct pickup
                       worldItems.splice(i, 1); // Remove if successful
                   }
              } else {
                   player.moveTo(item.pos.x, item.pos.y); // Move towards item if too far
              }
             clickedItem = item; // Mark that an item was clicked
             break; // Handle only one item click per press
         }
     }
     if (clickedItem) return; // Item click handled

    // 2. Click on Monster?
    let clickedMonster = null;
    for (let monster of monsters) {
         if(!monster || monster.state === 'dead' || !monster.pos || !monster.size) continue;
         // Use size for click check (more generous than exact pixel)
         if (abs(worldMx - monster.pos.x) < monster.size/1.5 && abs(worldMy - monster.pos.y) < monster.size/1.5) {
            clickedMonster = monster; break;
         }
    }
    if (clickedMonster) {
        player.setAttackTarget(clickedMonster); // Target the clicked monster
        return; // Monster click handled
    }

    // 3. Click on NPC? (Only in village)
     if(currentMap && currentMap.isVillage){
         let clickedNpc = null;
         for(let npc of npcs) {
              if(!npc || npc.state === 'dead' || !npc.pos || !npc.size) continue;
               if (abs(worldMx - npc.pos.x) < npc.size/1.5 && abs(worldMy - npc.pos.y) < npc.size/1.5) {
                   clickedNpc = npc; break;
               }
         }
         if(clickedNpc){
              // Check distance for interaction
              const interactDistSq = (TILE_SIZE * 2.5)**2; // Interaction range
              if (distSq(player.pos.x, player.pos.y, clickedNpc.pos.x, clickedNpc.pos.y) < interactDistSq){
                  clickedNpc.interact(player); // Interact directly if close enough
              } else {
                  player.moveTo(clickedNpc.pos.x, clickedNpc.pos.y); // Move towards NPC to interact
                  // Could set an interaction target: player.interactionTarget = clickedNpc;
              }
              return; // NPC click handled
         }
     }

    // 4. Click on Ground (Move)
    // Check if the target point is walkable before initiating move
    if (currentMap && !currentMap.isObstacle(worldMx, worldMy) && !currentMap.isOutsideBounds(worldMx, worldMy)) {
        player.moveTo(worldMx, worldMy);
    } else {
         // Clicked on unwalkable terrain
         if (typeof playSound === 'function') playSound('invalidAction');
    }
}

// Handle mouse movement (primarily for tooltips)
function mouseMoved() {
     if (gameState === 'gameOver') return;
     // Update UI tooltips based on mouse position
     if (uiManager && typeof uiManager.handleMouseMove === 'function') {
          uiManager.handleMouseMove(mouseX, mouseY);
     }
}

// Handle key presses
function keyPressed() {
    // Restart game on 'R' if game is over
    if (gameState === 'gameOver') {
         if (key === 'r' || key === 'R') {
              restartGame();
         }
         return;
    }

    // --- In-Game Keybinds ---
    // Toggle Inventory
    if (key === 'i' || key === 'I') {
        if (uiManager) uiManager.toggleInventory();
    }
    // Close Inventory with Escape
    if (keyCode === ESCAPE) { // Use keyCode for Escape
        if (uiManager && uiManager.showInventory) {
             uiManager.toggleInventory();
        }
        // Could add pause menu toggle here later
    }

    // --- Debug Keys ---
     if (key === 'l' || key === 'L') { // Level Up cheat
          if (player && player.stats) player.gainXP(player.stats.xpToNextLevel - player.stats.xp + 1);
     }
     if (key === 'h' || key === 'H') { // Heal cheat
          if (player && player.stats && player.currentStats) {
              player.stats.hp = player.currentStats.maxHP;
               if (uiManager) uiManager.addFloatingText("+MAX HP", player.pos.x, player.pos.y, 'lime', 1000, 18);
          }
     }
     if (key === 'k' || key === 'K') { // Kill nearest monster cheat
          let nearestMonster = monsters.filter(m=>m && m.state!=='dead' && m.pos)
                                       .sort((a,b)=>distSq(player.pos.x,player.pos.y,a.pos.x,a.pos.y)-distSq(player.pos.x,player.pos.y,b.pos.x,b.pos.y))[0];
          if(nearestMonster && typeof nearestMonster.takeDamage === 'function') nearestMonster.takeDamage(99999, player);
     }
     if (key === 't' || key === 'T') { // Teleport to village entrance cheat
          if(villageMap && villageMap.entryPoint) {
               if(currentMap !== villageMap) {
                    switchMap(villageMap, villageMap.entryPoint);
               } else {
                    player.pos.set(villageMap.entryPoint); player.targetPos.set(villageMap.entryPoint); player.isMoving = false;
                    centerCameraOnPlayer(true);
               }
          }
     }
     if (key === 'g' || key === 'G') { // Give random item cheat
          if (player && typeof ItemData !== 'undefined' && typeof Item !== 'undefined' && typeof DroppedItem !== 'undefined') {
              const itemIds = Object.keys(ItemData);
              if (itemIds.length > 0) {
                  const randomId = randomFromArray(itemIds); // Use utility function
                  if(randomId){
                       player.pickupItem(new DroppedItem(new Item(randomId, 1),0,0));
                  }
              }
          }
     }
} // End keyPressed

// --- Game Logic Helper Functions ---

// Check if player is on a map transition point
function checkMapTransition() {
     if (!player || !player.pos || !currentMap) return; // Safety checks

     // Leaving Village
     if (currentMap.isVillage && currentMap.isOnExit(player.pos.x, player.pos.y)) {
          if (wildernessMap && wildernessMap.entryPoint) { // Ensure destination exists
              switchMap(wildernessMap, wildernessMap.entryPoint);
              if (uiManager) uiManager.addMessage(UIText.leaveVillage || "Leaving village...", color(255, 180, 100), 3000);
          } else { console.error("Cannot switch to wilderness: Map or entry point missing."); }
     }
     // Entering Village (from Wilderness)
     else if (!currentMap.isVillage && currentMap.isOnVillageEntrance(player.pos.x, player.pos.y)) {
          if (villageMap && villageMap.entryPoint) { // Ensure destination exists
               switchMap(villageMap, villageMap.entryPoint);
                if (uiManager) uiManager.addMessage(UIText.enterVillage || "Entering village...", color(150, 200, 255), 3000);
          } else { console.error("Cannot switch to village: Map or entry point missing."); }
     }
}

// Switch the current map and reposition the player
function switchMap(newMap, playerSpawnPoint) {
     if (!newMap || !playerSpawnPoint) {
          console.error("SwitchMap failed: Invalid new map or spawn point.");
          return;
     }
     console.log(`Switching map to ${newMap.isVillage ? 'Village' : 'Wilderness'}`);

     // Clear dynamic objects relevant to the outgoing map
     projectiles = []; // Clear projectiles on any transition
     visualEffects = []; // Clear visual effects
     if (currentMap === wildernessMap) {
          monsters = []; // Clear monsters when leaving wilderness
          worldItems = []; // Clear ground items when leaving wilderness
          lastMonsterSpawnTime = 0; // Reset spawn timer
     } else if (currentMap === villageMap) {
          // Reset NPC states when leaving village? Or let them persist?
           npcs.forEach(npc => {
                if(npc && npc.state !== 'dead') {
                     npc.targetEnemy = null;
                     npc.state = 'idle';
                }
           });
           worldItems = []; // Also clear village ground items? Or keep them? Let's clear for now.
     }

     currentMap = newMap; // Set the new map
     gameState = currentMap.isVillage ? 'village' : 'wilderness'; // Update game state

     // Respawn NPCs if entering the village and they aren't there
     if (currentMap.isVillage && (!npcs || npcs.length === 0)) {
         console.log("Respawning NPCs for village entry.");
         spawnInitialNpcs();
     }

     // Reposition player
     if (player && player.pos && player.targetPos) {
         player.pos.set(playerSpawnPoint);
         player.targetPos.set(playerSpawnPoint); // Stop any previous movement command
         player.isMoving = false;
         player.targetEnemy = null; // Clear attack target
     }

     centerCameraOnPlayer(true); // Snap camera to new position
     if (uiManager && typeof uiManager.calculateLayout === 'function') {
          uiManager.calculateLayout(); // Recalculate UI in case window size changed
     }
}


// Spawn monsters periodically in the wilderness
function spawnMonsters() {
     // Ensure we are in the right state and map exists
     if (!currentMap || currentMap.isVillage || gameState !== 'wilderness' || !player || !player.pos) return;
     // Ensure MonsterData and Monster class exist
     if (typeof MonsterData === 'undefined' || typeof Monster === 'undefined') return;

     const now = millis();
     if (now - lastMonsterSpawnTime > MapSettings.monsterSpawnInterval) {
         lastMonsterSpawnTime = now;
          // Count only alive monsters
          let aliveMonsters = monsters.filter(m => m && m.state !== 'dead').length;

         if (aliveMonsters < MapSettings.maxMonsters) {
              // Find a spawn point far enough from the player
             const spawnPoint = currentMap.getRandomSpawnPoint(player.pos, MapSettings.monsterSpawnCheckRadius**2);

             if (spawnPoint) {
                  // Optional: Check if spawn point is too crowded by existing monsters
                  let tooClose = false;
                  for(let m of monsters){
                       if(m && m.state !== 'dead' && m.pos && distSq(spawnPoint.x, spawnPoint.y, m.pos.x, m.pos.y) < (TILE_SIZE*2)**2){ // Check within 2 tiles
                            tooClose = true; break;
                       }
                  }

                  if(!tooClose){
                      // Select a random monster type
                      const monsterIds = Object.keys(MonsterData);
                      if (monsterIds.length > 0) {
                          const randomMonsterId = randomFromArray(monsterIds);
                          if (randomMonsterId) {
                              let newMonster = new Monster(randomMonsterId, spawnPoint.x, spawnPoint.y);
                              if (newMonster && !newMonster.invalid) {
                                   monsters.push(newMonster);
                              }
                          }
                      }
                  } else {
                       // console.log("Spawn point too crowded, skipping spawn.");
                  }
             } else {
                  // console.log("Could not find suitable spawn point.");
             }
         }
     }
}

// Check if the player is close enough to automatically pick up items
function checkItemPickup() {
      if (!player || !player.pos || !worldItems || worldItems.length === 0) return; // Safety checks
      const pickupCheckRadiusSq = player.pickupRadiusSq;

      // Iterate backwards for safe removal while iterating
      for (let i = worldItems.length - 1; i >= 0; i--) {
          const item = worldItems[i];
          // Ensure item is valid and has a position
          if (!item || !item.pos || item.invalid) continue;

          if (distSq(player.pos.x, player.pos.y, item.pos.x, item.pos.y) < pickupCheckRadiusSq) {
              if (player.pickupItem(item)) { // pickupItem returns true if successful
                  worldItems.splice(i, 1); // Remove item from the world
              } else {
                  // Pickup failed (likely inventory full), leave item on ground
                  // Maybe add a small visual/audio cue that pickup failed?
              }
              // Consider breaking after one successful pickup attempt per frame?
              // break; // Uncomment to only try picking up one item per frame
          }
      }
}

// --- Visual Effects Management ---
function renderVisualEffects(offsetX, offsetY) {
     // Ensure visualEffects array and p5 functions exist
     if (typeof visualEffects === 'undefined' || typeof push !== 'function') return;

     push();
     for (let effect of visualEffects) {
          if (!effect || !effect.startTime || !effect.duration) continue; // Skip invalid effects

          const elapsed = millis() - effect.startTime;
          let progress = constrain(elapsed / effect.duration, 0, 1);
          if (progress >= 1) continue; // Effect finished

          // Determine position: use target's position if available, else use effect's stored pos
          let effectX = effect.pos ? effect.pos.x : 0;
          let effectY = effect.pos ? effect.pos.y : 0;
          if (effect.target && effect.target.pos) {
               effectX = effect.target.pos.x;
               effectY = effect.target.pos.y;
          }

          push();
          translate(effectX - offsetX, effectY - offsetY);

          // Calculate fading alpha
          let currentAlpha = 255 * (1 - progress); // Simple linear fade out

           // Render based on effect type
           switch(effect.type) {
                case 'line': // Attack line (player, monster, npc)
                     if (effect.start && effect.end && effect.color) {
                        stroke(red(effect.color), green(effect.color), blue(effect.color), currentAlpha * 0.8);
                        strokeWeight(max(1, map(progress, 0, 1, 4, 1))); // Line gets thinner
                        // Calculate end relative to start (which is now 0,0 due to translate)
                         let endX = effect.end.x - effect.start.x;
                         let endY = effect.end.y - effect.start.y;
                         // Shorten line as it progresses?
                         line(0,0, endX * (1 - progress * 0.3), endY * (1 - progress * 0.3));
                     }
                     break;
                case 'flash': // Damage flash on target
                     if (effect.target && effect.color) {
                          fill(red(effect.color), green(effect.color), blue(effect.color), currentAlpha * 0.6);
                          noStroke();
                           let size = effect.target.size || TILE_SIZE; // Use target size or default
                           ellipse(0, 0, size * (1 + progress * 0.5), size * (1 + progress * 0.5)); // Expanding flash
                     }
                      break;
                case 'circleExpand': // Level up effect
                     if (effect.target && effect.color && effect.maxRadius) {
                          noFill();
                          strokeWeight(max(1, map(progress, 0, 1, 6, 1))); // Ring gets thinner
                          stroke(red(effect.color), green(effect.color), blue(effect.color), currentAlpha);
                          ellipse(0, 0, effect.maxRadius * progress, effect.maxRadius * progress); // Circle expands outwards
                     }
                     break;
                 case 'spark': // Projectile impact spark
                      if (effect.pos && effect.color) {
                           stroke(red(effect.color), green(effect.color), blue(effect.color), currentAlpha);
                           strokeWeight(random(1,3));
                           let len = 10 * (1-progress); // Sparks shrink
                            for(let i=0; i<5; ++i){ // Draw a few short lines radiating out
                                 let angle = random(TWO_PI);
                                 line(0,0, cos(angle)*len, sin(angle)*len);
                            }
                      }
                      break;
               // Add more effect types here...
           }
          pop(); // Restore transform matrix for this effect
     }
     pop(); // Restore global drawing state
}
// Update visual effects array, removing expired ones
function updateVisualEffects(){
     if (typeof visualEffects === 'undefined') return;
     const now = millis();
     // Filter: keep effects where current time is before start time + duration
      visualEffects = visualEffects.filter(effect => effect && effect.startTime && effect.duration && (now < effect.startTime + effect.duration));
}


// --- Utility and Event Functions ---

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight); // Adjust canvas size
    // Recalculate UI layout based on new dimensions
    if (uiManager && typeof uiManager.calculateLayout === 'function') {
         uiManager.calculateLayout();
    }
    // Recenter camera if needed (optional, might be disorienting)
    // if(player) centerCameraOnPlayer(true);
}

// Restart the game from the beginning
function restartGame() {
     console.log("Restarting game...");

     // Reset game state variables
     monsters = [];
     npcs = [];
     worldItems = [];
     projectiles = [];
     visualEffects = [];
     lastMonsterSpawnTime = 0;
     audioInitialized = false; // Requires new interaction to enable audio

     // Re-generate maps (this also resets spawn points)
     console.log("Re-generating maps...");
     villageMap = new GameMap(MapSettings.villageWidth, MapSettings.villageHeight, true);
     wildernessMap = new GameMap(MapSettings.wildernessWidth, MapSettings.wildernessHeight, false);

     // Re-create player at the start location
     console.log("Re-creating player...");
     let startPos = (villageMap && villageMap.entryPoint) ? villageMap.entryPoint : createVector(TILE_SIZE * 5, TILE_SIZE * 5);
     player = new Player(startPos.x, startPos.y);

     // Re-spawn NPCs
     console.log("Re-spawning NPCs...");
     spawnInitialNpcs();

     // Re-create UI Manager
     uiManager = new UIManager();

     // Reset map and game state
     currentMap = villageMap;
     gameState = 'village';
     centerCameraOnPlayer(true); // Center camera immediately

     // Add welcome message and audio prompt again
     if (uiManager) {
         const welcomeText = (typeof UIText !== 'undefined' && UIText.welcome) ? UIText.welcome : "Welcome!";
         const rareColor = (typeof getRarityP5Color === 'function') ? getRarityP5Color('rare') : color(0, 112, 255);
         uiManager.addMessage(welcomeText, rareColor, 5000);
         uiManager.addMessage("Click screen to enable sound", color(200, 200, 100), 10000);
      }

     // Give starting items again
     if (player && typeof player.pickupItem === 'function') {
         player.pickupItem(new DroppedItem(new Item('hp_potion_small', 5), 0, 0));
         player.pickupItem(new DroppedItem(new Item('rusty_sword'), 0, 0));
         player.pickupItem(new DroppedItem(new Item('leather_armor'), 0, 0));
     }

     console.log("Game restart complete.");
}

// Helper function to check if mouse is over a UI panel rectangle
function isMouseOverPanel(panel) {
    if (!panel) return false;
    return mouseX > panel.x && mouseX < panel.x + panel.w &&
           mouseY > panel.y && mouseY < panel.y + panel.h;
}

// Disable browser's right-click context menu on the canvas
function disableRightClickContextMenu(){
    // Check if running in a browser environment
    if (typeof document !== 'undefined') {
         document.addEventListener('contextmenu', event => {
             // Prevent default only if the target is the canvas or related elements
             // For simplicity, preventing everywhere for now.
             event.preventDefault();
         });
    }
}
