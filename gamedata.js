// gamedata.js
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
    'hp_potion_small': { name: "小型生命藥水", type: 'consumable', effect: { hp: 50 }, stackable: true, maxStack: 10, icon: 'red_potion', description: "恢復少量生命值。" },
    'mp_potion_small': { name: "小型魔力藥水", type: 'consumable', effect: { mp: 30 }, stackable: true, maxStack: 10, icon: 'blue_potion', description: "恢復少量魔力值。" },
    // 裝備 - 武器
    'rusty_sword': { name: "生鏽的劍", type: 'equipment', slot: 'weapon', stats: { attack: 3 }, icon: 'sword1', description: "一把看起來快壞掉的劍。" },
    'short_bow': { name: "短弓", type: 'equipment', slot: 'weapon', stats: { attack: 4 }, icon: 'bow1', description: "適合新手使用的弓。" },
    'sharp_dagger': { name: "鋒利的匕首", type: 'equipment', slot: 'weapon', stats: { attack: 5 }, icon: 'dagger1', description: "輕巧但致命。", rarity: 'common'},
    // 裝備 - 防具
    'leather_armor': { name: "皮甲", type: 'equipment', slot: 'armor', stats: { defense: 2 }, icon: 'armor1', description: "基本的皮革護甲。" },
    'iron_helmet': { name: "鐵盔", type: 'equipment', slot: 'helmet', stats: { defense: 3 }, icon: 'helmet1', description: "提供頭部基本保護。", rarity: 'common'},
    // 材料 (未來可擴充製作系統)
    'goblin_ear': { name: "哥布林耳朵", type: 'material', stackable: true, maxStack: 50, icon: 'monster_part', description: "哥布林的耳朵，或許能賣錢。" },
};

// --- 怪物資料 ---
const MonsterData = {
    'goblin': {
        name: "哥布林", hp: 30, mp: 0, attack: 5, defense: 1, xp: 10, speed: 2,
        attackRange: TILE_SIZE * 1.5, aggroRange: TILE_SIZE * 5,
        color: [0, 150, 0], size: TILE_SIZE * 0.8,
        lootTable: [
            { itemId: 'hp_potion_small', chance: 0.3 },
            { itemId: 'goblin_ear', chance: 0.7 },
            { itemId: 'rusty_sword', chance: 0.05 }
        ]
    },
    'skeleton': {
        name: "骷髏兵", hp: 45, mp: 0, attack: 8, defense: 3, xp: 18, speed: 1.5,
        attackRange: TILE_SIZE * 1.2, aggroRange: TILE_SIZE * 6,
        color: [200, 200, 200], size: TILE_SIZE * 0.9,
        lootTable: [
            { itemId: 'hp_potion_small', chance: 0.2 },
            { itemId: 'mp_potion_small', chance: 0.1 },
            { itemId: 'leather_armor', chance: 0.08 }
        ]
    },
    'bat': {
        name: "蝙蝠", hp: 20, mp: 0, attack: 4, defense: 0, xp: 8, speed: 3,
        attackRange: TILE_SIZE * 1.1, aggroRange: TILE_SIZE * 7,
        color: [50, 50, 50], size: TILE_SIZE * 0.6,
        lootTable: [
             { itemId: 'hp_potion_small', chance: 0.15 },
        ]
    }
    // ... 更多怪物
};

// --- NPC 資料 ---
const NpcData = {
    'villager_elder': {
        name: "村長", hp: 100, attack: 5, defense: 2, // 村長也能稍微打一下
        color: [0, 0, 200], size: TILE_SIZE * 0.9,
        dialogue: ["願聖光指引你。", "村外的世界很危險，小心行事。", "有什麼需要可以找鐵匠或商人。"],
        canFight: true, // 村長會幫忙打怪
        aggroRange: TILE_SIZE * 4,
        attackRange: TILE_SIZE * 1.5
    },
    'villager_guard': {
        name: "衛兵", hp: 150, attack: 15, defense: 5,
        color: [150, 150, 150], size: TILE_SIZE * 0.9,
        dialogue: ["站住！此處是安全的村莊。", "我會保護這裡的。", "看到可疑人物請告訴我。"],
        canFight: true,
        aggroRange: TILE_SIZE * 6,
        attackRange: TILE_SIZE * 1.8
    },
    'villager_farmer': {
        name: "農夫", hp: 80, attack: 3, defense: 1,
        color: [139, 69, 19], size: TILE_SIZE * 0.8,
        dialogue: ["希望今年收成好...", "唉，怪物越來越多了。", "小心點，年輕人。"],
        canFight: false // 農夫不會主動打怪，但可能被打
    }
    // ... 更多 NPC (商人、鐵匠等)
};

// --- 玩家初始設定 ---
const PlayerDefaults = {
    hp: 100,
    mp: 50,
    attack: 5,
    defense: 1,
    speed: 3,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    attackRange: TILE_SIZE * 1.5,
    inventorySize: 20, // 背包大小
    color: [255, 215, 0], // 金色
    size: TILE_SIZE * 0.9
};

// --- 地圖設定 ---
const MapSettings = {
    wildernessWidth: 100, // 野外地圖寬度 (格子數)
    wildernessHeight: 100, // 野外地圖高度 (格子數)
    villageWidth: 20,
    villageHeight: 20,
    wallThickness: 1,
    noiseScale: 0.1, // Perlin Noise 比例
    obstacleDensity: 0.1, // 障礙物密度
    maxMonsters: 50 // 地圖上最大怪物數量
};
