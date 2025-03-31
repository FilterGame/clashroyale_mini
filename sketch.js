// sketch.js

let player;
let monsters = [];
let npcs = [];
let worldItems = []; // 儲存地上掉落的物品
let villageMap;
let wildernessMap;
let currentMap; // 指向當前地圖 (villageMap 或 wildernessMap)

let uiManager;

// 相機/視口 控制
let camera = {
    x: 0,
    y: 0,
    targetX: 0, // 相機目標追蹤的 X (通常是玩家中心)
    targetY: 0,
    lerpAmount: 0.1 // 相機平滑移動速度
};

let gameState = 'loading'; // 'loading', 'village', 'wilderness', 'inventory', 'gameOver'
let lastMonsterSpawnTime = 0;
const monsterSpawnInterval = 5000; // 5 秒檢查一次是否生怪 (野外)

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    console.log("遊戲初始化...");

    // --- 初始化管理器 ---
    uiManager = new UIManager();

     // --- 生成地圖 ---
     console.log("生成村莊地圖...");
     villageMap = new GameMap(MapSettings.villageWidth, MapSettings.villageHeight, true);
     console.log("生成野外地圖...");
     wildernessMap = new GameMap(MapSettings.wildernessWidth, MapSettings.wildernessHeight, false);

    // --- 初始化玩家 ---
    // 玩家初始位置在村莊的入口點附近
    let playerStartX = villageMap.entryPoint ? villageMap.entryPoint.x : villageMap.mapWidthPixels / 2;
    let playerStartY = villageMap.entryPoint ? villageMap.entryPoint.y : villageMap.mapHeightPixels / 2;
    player = new Player(playerStartX, playerStartY);

    // --- 初始化村莊 NPC ---
    console.log("放置 NPC...");
    npcs = []; // 清空 NPC 陣列
    const npcIds = Object.keys(NpcData); // 獲取所有 NPC 類型 ID
    villageMap.spawnPoints.forEach((spawnPos, index) => {
         if (spawnPos) {
              // 從 NpcData 隨機選擇或按順序分配 NPC 類型
              let npcId = npcIds[index % npcIds.length]; // 循環使用 NPC ID
              let newNpc = new Npc(npcId, spawnPos.x, spawnPos.y);
              if (newNpc) {
                  npcs.push(newNpc);
                  console.log(`在村莊 (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)}) 放置 ${newNpc.name}`);
              }
         }
     });


    // --- 設定初始狀態 ---
    currentMap = villageMap; // 從村莊開始
    gameState = 'village';
    centerCameraOnPlayer(true); // 立即將相機居中到玩家
    uiManager.addMessage(UIText.welcome, 'yellow', 5000);

     // --- 添加初始物品 (測試用) ---
     player.pickupItem(new DroppedItem(new Item('hp_potion_small', 5),0,0)); // 給5個小紅藥
     player.pickupItem(new DroppedItem(new Item('rusty_sword'),0,0)); // 給一把破劍
     player.pickupItem(new DroppedItem(new Item('leather_armor'),0,0));

    console.log("遊戲設置完成，狀態:", gameState);
     disableRightClickContextMenu(); // 禁用瀏覽器右鍵選單
}

function draw() {
    background(0); // 每幀清除背景為黑色

    // 更新和繪製當前地圖
    if (currentMap) {
        // --- 更新相機 ---
        updateCamera();

        // --- 繪製地圖 (相對於相機) ---
        currentMap.render(camera.x, camera.y, width, height);

        // --- 更新和繪製掉落物品 ---
        for (let i = worldItems.length - 1; i >= 0; i--) {
            worldItems[i].render(camera.x, camera.y);
            if (worldItems[i].isExpired()) {
                 console.log(`${worldItems[i].item.name} 消失了`);
                worldItems.splice(i, 1);
            }
        }

        // --- 更新和繪製 NPC ---
         npcs.forEach(npc => {
              // 只有當前地圖是村莊時才更新和繪製 NPC (或者根據 NPC 所在區域判斷)
              if (currentMap.isVillage && npc) { // 確保 npc 實例存在
                  npc.update(monsters, player); // NPC 會關注怪物和玩家
                  npc.render(camera.x, camera.y);
              }
              // 如果 NPC 在野外？ 暫時不處理
         });


        // --- 更新和繪製怪物 ---
         monsters.forEach(monster => {
             if (monster && monster.state !== 'dead') { // 確保 monster 實例存在且未死亡
                 monster.update(player, npcs.filter(n => n.canFight && n.state !== 'dead'), currentMap.grid); // 怪物關注玩家和能戰鬥的 NPC
                 monster.render(camera.x, camera.y);
             }
             // 可以渲染死亡狀態的怪物屍體
              else if (monster && monster.state === 'dead') {
                  // monster.renderCorpse(camera.x, camera.y); // 實現一個繪製屍體的方法
              }
         });
         // 清理已死亡的怪物 (可以延遲清理，先顯示屍體)
         // monsters = monsters.filter(monster => monster.state !== 'dead');

        // --- 更新和繪製玩家 ---
        if (player && player.stats.hp > 0) {
            let playerMoved = player.update(currentMap.grid, monsters, npcs);
             player.render(camera.x, camera.y);
             if (playerMoved) {
                 // 如果玩家移動了，檢查是否踩到地圖切換點
                 checkMapTransition();
                  // 檢查是否踩到物品
                  checkItemPickup();
             }
        } else if (player && player.stats.hp <= 0 && gameState !== 'gameOver') {
             // 玩家死亡處理
             gameState = 'gameOver';
              uiManager.addMessage("你死了！", 'red', 10000);
              console.log("遊戲結束");
              // 可以在此顯示 GAME OVER 畫面或按鈕
        }

         // --- 野外怪物生成邏輯 ---
         if (gameState === 'wilderness') {
             spawnMonsters();
         }

    } else {
        // 地圖未載入？顯示錯誤或載入畫面
        fill(255);
        textAlign(CENTER, CENTER);
        text("地圖載入中或錯誤...", width / 2, height / 2);
    }


    // --- 繪製 UI (覆蓋在所有遊戲元素之上) ---
    if (uiManager) {
        uiManager.render();
    }

     // --- 繪製 Game Over 畫面 ---
     if (gameState === 'gameOver') {
          push();
          fill(0, 0, 0, 180); // 半透明黑色遮罩
          rect(0, 0, width, height);
          fill(255, 0, 0);
          textSize(64);
          textAlign(CENTER, CENTER);
          text("GAME OVER", width / 2, height / 2);
           textSize(20);
           fill(200);
            text("按 R 鍵重新開始", width / 2, height / 2 + 60);
          pop();
     }
}

// --- 相機控制 ---
function updateCamera() {
    if (!player) return;
    // 設定相機目標為玩家位置
    camera.targetX = player.pos.x - width / 2;
    camera.targetY = player.pos.y - height / 2;

    // 平滑移動相機
    camera.x = lerp(camera.x, camera.targetX, camera.lerpAmount);
    camera.y = lerp(camera.y, camera.targetY, camera.lerpAmount);

    // 限制相機在地圖邊界內
    if (currentMap) {
        camera.x = constrain(camera.x, 0, currentMap.mapWidthPixels - width);
        camera.y = constrain(camera.y, 0, currentMap.mapHeightPixels - height);
    }
}

function centerCameraOnPlayer(immediate = false) {
     if (!player) return;
     camera.targetX = player.pos.x - width / 2;
     camera.targetY = player.pos.y - height / 2;
     if(immediate) {
          camera.x = camera.targetX;
          camera.y = camera.targetY;
           // 限制邊界
           if (currentMap) {
               camera.x = constrain(camera.x, 0, currentMap.mapWidthPixels - width);
               camera.y = constrain(camera.y, 0, currentMap.mapHeightPixels - height);
           }
     }
}

// --- 輸入處理 ---
function mousePressed() {
    if (gameState === 'gameOver') return; // 遊戲結束時不處理點擊

    // 1. 檢查是否點擊在 UI 上
    if (uiManager && uiManager.handleMouseClick(mouseX, mouseY)) {
        return; // UI 優先處理事件
    }

    // 2. 如果背包是開啟的，點擊世界無效 (除非特別設計點擊關閉)
    if (uiManager && uiManager.showInventory){
          // 可以檢查是否點擊背包外部來關閉背包
          if (!isMouseOverPanel(uiManager.inventoryPanel) && !isMouseOverPanel(uiManager.equipmentPanel)){
              uiManager.toggleInventory();
          }
         return;
    }


    // 3. 點擊遊戲世界
    let worldMx = mouseX + camera.x;
    let worldMy = mouseY + camera.y;

     // 檢查是否點擊到可拾取物品
     let clickedItem = null;
     let closestItemDistSq = (TILE_SIZE * 1.0)**2; // 點擊拾取範圍可以比懸停大一點
     for (let item of worldItems) {
         let dSq = distSq(worldMx, worldMy, item.pos.x, item.pos.y);
         if (dSq < closestItemDistSq) {
             clickedItem = item;
             break; // 找到第一個即可
         }
     }
     if (clickedItem) {
          // 走向物品並嘗試拾取 (在 player.update 中處理靠近後的拾取)
           console.log("嘗試走向物品: ", clickedItem.item.name);
           player.moveTo(clickedItem.pos.x, clickedItem.pos.y);
           // 也可以直接拾取，如果距離夠近
          // if (distSq(player.pos.x, player.pos.y, clickedItem.pos.x, clickedItem.pos.y) < player.pickupRadiusSq) {
          //     if (player.pickupItem(clickedItem)) {
          //         worldItems.splice(worldItems.indexOf(clickedItem), 1); // 從世界移除
          //     }
          // }
         return;
     }


    // 檢查是否點擊到怪物
    let clickedMonster = null;
    for (let monster of monsters) {
         if(monster.state === 'dead') continue;
        let dSq = distSq(worldMx, worldMy, monster.pos.x, monster.pos.y);
        if (dSq < (monster.size / 1.5)**2) {
            clickedMonster = monster;
            break;
        }
    }
    if (clickedMonster) {
        player.setAttackTarget(clickedMonster);
        return;
    }

    // 檢查是否點擊到 NPC
     let clickedNpc = null;
     for(let npc of npcs) {
          if(npc.state === 'dead') continue;
           // 只處理村莊內的 NPC 互動
          if (currentMap.isVillage) {
              let dSq = distSq(worldMx, worldMy, npc.pos.x, npc.pos.y);
               if (dSq < (npc.size / 1.5)**2) {
                   clickedNpc = npc;
                   break;
               }
          }
     }
     if(clickedNpc){
          // 檢查距離，太遠則先移動過去
          const interactDistSq = (TILE_SIZE * 2.0)**2;
          if (distSq(player.pos.x, player.pos.y, clickedNpc.pos.x, clickedNpc.pos.y) < interactDistSq){
              clickedNpc.interact(player);
          } else {
              player.moveTo(clickedNpc.pos.x, clickedNpc.pos.y); // 走向 NPC
              // 可以設置一個回調，到達後自動互動？較複雜
               uiManager.addMessage(`走向 ${clickedNpc.name}...`, 'gray');
          }
          return;
     }


    // 如果以上都不是，且點擊位置可通行，則移動
    if (!currentMap.isObstacle(worldMx, worldMy) && !currentMap.isOutsideBounds(worldMx, worldMy)) {
        player.moveTo(worldMx, worldMy);
    }
}

function mouseMoved() {
     if (gameState === 'gameOver') return;
     if (uiManager) {
         uiManager.handleMouseMove(mouseX, mouseY); // 更新 Tooltip 顯示
     }
}


function keyPressed() {
    if (gameState === 'gameOver') {
         if (key === 'r' || key === 'R') {
             restartGame();
         }
         return;
    }

    // --- UI 控制 ---
    if (key === 'i' || key === 'I') { // 按 I 開/關背包
        uiManager.toggleInventory();
    }
    if (key === 'Escape') { // 按 ESC 關閉背包 (如果開啟)
        if (uiManager.showInventory) {
            uiManager.toggleInventory();
        } else {
            // 未來可以打開遊戲選單
        }
    }

    // --- 測試用按鍵 ---
     if (key === 'l' || key === 'L') { // 測試升級
         player.gainXP(player.stats.xpToNextLevel - player.stats.xp + 1);
     }
     if (key === 'h' || key === 'H') { // 測試補血
         player.stats.hp = min(player.currentStats.maxHP, player.stats.hp + 50);
         uiManager.addFloatingText("+50", player.pos.x, player.pos.y, 'lime');
     }
      if (key === 'k' || key === 'K') { // 測試秒殺最近的怪物
          let closestMonster = null;
          let minDistSq = Infinity;
          for(let m of monsters){
               if(m.state !== 'dead'){
                    let dSq = distSq(player.pos.x, player.pos.y, m.pos.x, m.pos.y);
                    if(dSq < minDistSq){
                         minDistSq = dSq;
                         closestMonster = m;
                    }
               }
          }
          if(closestMonster) closestMonster.takeDamage(9999, player);
     }
     if (key === 't' || key === 'T') { // 測試傳送回村莊入口
          if(currentMap !== villageMap) {
               switchMap(villageMap, villageMap.entryPoint);
          } else {
               player.pos.set(villageMap.entryPoint || createVector(villageMap.mapWidthPixels/2, villageMap.mapHeightPixels/2));
               centerCameraOnPlayer(true);
          }
     }
}

// --- 遊戲邏輯輔助函式 ---

function checkMapTransition() {
     if (!player || !currentMap) return;

     if (currentMap.isVillage && currentMap.isOnExit(player.pos.x, player.pos.y)) {
         console.log("離開村莊，進入野外");
         // 切換到野外地圖，將玩家放在野外地圖的入口點
         switchMap(wildernessMap, wildernessMap.entryPoint);
         uiManager.addMessage(UIText.leaveVillage, 'orange');

     } else if (!currentMap.isVillage && currentMap.isOnVillageEntrance(player.pos.x, player.pos.y)) {
          console.log("回到村莊");
          // 切換回村莊地圖，將玩家放在村莊地圖的入口點
          switchMap(villageMap, villageMap.entryPoint);
           uiManager.addMessage(UIText.enterVillage, 'lightblue');
     }
}

function switchMap(newMap, playerSpawnPoint) {
     // 清理當前地圖的臨時狀態 (例如野外的怪物和掉落物)
     if (currentMap === wildernessMap) {
          console.log("清理野外怪物和掉落物");
          monsters = []; // 離開野外時清除所有怪物
          worldItems = []; // 清除所有掉落物 (或者可以設計保留？)
          lastMonsterSpawnTime = 0; // 重置生怪計時器
     } else if (currentMap === villageMap) {
           // 離開村莊時，NPC 回到原位？或保持狀態？
           // 村民可以回到 idle 狀態
           npcs.forEach(npc => {
                npc.targetEnemy = null;
                if(npc.stats.hp > 0) npc.state = 'idle';
           });
     }

     currentMap = newMap;
     gameState = currentMap.isVillage ? 'village' : 'wilderness';

      // 重新生成/放置當前地圖的單位 (如果需要)
      if (currentMap.isVillage && npcs.length === 0) {
           // 如果 NPC 被清空了 (例如遊戲重啟)，重新放置
           console.log("重新放置村莊 NPC");
           npcs = [];
            const npcIds = Object.keys(NpcData);
           villageMap.spawnPoints.forEach((spawnPos, index) => {
             if (spawnPos) {
                  let npcId = npcIds[index % npcIds.length];
                  let newNpc = new Npc(npcId, spawnPos.x, spawnPos.y);
                  if (newNpc) npcs.push(newNpc);
             }
            });
      }


     // 移動玩家到新地圖的指定入口點
     if (player && playerSpawnPoint) {
         player.pos.set(playerSpawnPoint);
         player.targetPos.set(playerSpawnPoint); // 停止移動
         player.isMoving = false;
         player.targetEnemy = null; // 清除目標
     }
     centerCameraOnPlayer(true); // 將相機立即移動到新位置
      console.log(`切換到地圖: ${currentMap.isVillage ? '村莊' : '野外'}, 狀態: ${gameState}`);

      // 重新計算 UI 佈局，以防視窗大小改變
      uiManager.calculateLayout();
}


function spawnMonsters() {
     if (!currentMap || currentMap.isVillage) return; // 只在野外生怪

     const now = millis();
     if (now - lastMonsterSpawnTime > monsterSpawnInterval) {
         lastMonsterSpawnTime = now;

         if (monsters.filter(m => m.state !== 'dead').length < MapSettings.maxMonsters) {
             const spawnPoint = currentMap.getRandomSpawnPoint();
             if (spawnPoint) {
                  // 檢查出生點是否在螢幕內，如果在螢幕內則暫緩生成 (避免刷臉)
                  if (spawnPoint.x > camera.x && spawnPoint.x < camera.x + width &&
                      spawnPoint.y > camera.y && spawnPoint.y < camera.y + height) {
                       // console.log("怪物出生點在螢幕內，暫緩生成");
                       return;
                  }


                 // 根據區域或玩家等級決定生成什麼怪物 (暫時隨機)
                 const monsterIds = Object.keys(MonsterData);
                 const randomMonsterId = randomFromArray(monsterIds);

                 if (randomMonsterId) {
                      // 檢查該點是否已經有怪物 (避免重疊生成)
                      let tooClose = false;
                      for(let m of monsters){
                           if(m.state !== 'dead' && distSq(spawnPoint.x, spawnPoint.y, m.pos.x, m.pos.y) < (TILE_SIZE*2)**2){
                                tooClose = true; break;
                           }
                      }

                      if(!tooClose){
                          let newMonster = new Monster(randomMonsterId, spawnPoint.x, spawnPoint.y);
                          if (newMonster) {
                              monsters.push(newMonster);
                              // console.log(`在野外 (${spawnPoint.x.toFixed(0)}, ${spawnPoint.y.toFixed(0)}) 生成了 ${newMonster.name}`);
                          }
                      }
                 }
             } else {
                  // console.log("沒有可用的怪物出生點?");
             }
         }
     }
}

function checkItemPickup() {
      if (!player || !worldItems || worldItems.length === 0) return;

      const pickupRadiusSq = (player.size * 0.8)**2; // 玩家拾取範圍的平方

      for (let i = worldItems.length - 1; i >= 0; i--) {
          const item = worldItems[i];
          if (distSq(player.pos.x, player.pos.y, item.pos.x, item.pos.y) < pickupRadiusSq) {
              if (player.pickupItem(item)) { // 嘗試拾取
                  worldItems.splice(i, 1); // 如果拾取成功，從世界中移除
              } else {
                  // 背包滿了，物品留在原地
              }
              // 一次只撿一個？或者可以繼續檢查下一個？看設計
              // break; // 撿到一個就停止本次檢查
          }
      }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (uiManager) {
        uiManager.calculateLayout(); // 重新計算 UI 佈局
    }
     centerCameraOnPlayer(true); // 視窗大小改變後重新居中相機
}

function restartGame() {
     console.log("重新開始遊戲...");
     // 清空所有狀態
     monsters = [];
     npcs = [];
     worldItems = [];
     lastMonsterSpawnTime = 0;

      // 重新生成地圖 (為了隨機性)
     console.log("重新生成地圖...");
      villageMap = new GameMap(MapSettings.villageWidth, MapSettings.villageHeight, true);
      wildernessMap = new GameMap(MapSettings.wildernessWidth, MapSettings.wildernessHeight, false);


     // 重新初始化玩家到村莊
     let playerStartX = villageMap.entryPoint ? villageMap.entryPoint.x : villageMap.mapWidthPixels / 2;
     let playerStartY = villageMap.entryPoint ? villageMap.entryPoint.y : villageMap.mapHeightPixels / 2;
     player = new Player(playerStartX, playerStartY);


      // 重新放置 NPC
      console.log("重新放置 NPC...");
       const npcIds = Object.keys(NpcData);
       villageMap.spawnPoints.forEach((spawnPos, index) => {
          if (spawnPos) {
               let npcId = npcIds[index % npcIds.length];
               let newNpc = new Npc(npcId, spawnPos.x, spawnPos.y);
               if (newNpc) npcs.push(newNpc);
          }
      });

     // 重置 UI 和狀態
     uiManager = new UIManager(); // 重新創建 UI 管理器
     currentMap = villageMap;
     gameState = 'village';
     centerCameraOnPlayer(true);
     uiManager.addMessage(UIText.welcome, 'yellow', 5000);

      // 添加初始物品
      player.pickupItem(new DroppedItem(new Item('hp_potion_small', 5),0,0));
      player.pickupItem(new DroppedItem(new Item('rusty_sword'),0,0));
      player.pickupItem(new DroppedItem(new Item('leather_armor'),0,0));

     console.log("遊戲已重新開始。");
}

// 檢查滑鼠是否在 UI 面板上
function isMouseOverPanel(panel) {
    if (!panel) return false;
    return mouseX > panel.x && mouseX < panel.x + panel.w &&
           mouseY > panel.y && mouseY < panel.y + panel.h;
}

// 禁用瀏覽器右鍵選單
function disableRightClickContextMenu(){
     document.addEventListener('contextmenu', event => event.preventDefault());
}