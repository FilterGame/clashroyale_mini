class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.targetPos = createVector(x, y); // 滑鼠點擊的目標位置
        this.size = PlayerDefaults.size;
        this.color = PlayerDefaults.color;

        this.baseStats = { // 基礎屬性
            maxHP: PlayerDefaults.hp,
            maxMP: PlayerDefaults.mp,
            attack: PlayerDefaults.attack,
            defense: PlayerDefaults.defense,
            speed: PlayerDefaults.speed,
            attackRangeSq: PlayerDefaults.attackRange ** 2,
        };
        this.currentStats = { ...this.baseStats }; // 當前屬性 (可能受 Buff/Debuff 影響)
        this.stats = { // 即時屬性
            hp: PlayerDefaults.hp,
            mp: PlayerDefaults.mp,
            level: PlayerDefaults.level,
            xp: PlayerDefaults.xp,
            xpToNextLevel: PlayerDefaults.xpToNextLevel,
        };

        this.inventory = new Array(PlayerDefaults.inventorySize).fill(null);
        this.equipment = { // 裝備欄位
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            ring1: null,
            ring2: null,
            amulet: null,
        };

        this.targetEnemy = null; // 攻擊目標
        this.isMoving = false;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 攻擊間隔 (毫秒)

        this.name = "玩家"; // 可以讓玩家自訂名稱

        this.updateCombinedStats(); // 初始化計算裝備加成
    }

    // --- 移動邏輯 ---
    moveTo(targetX, targetY) {
        this.targetPos.set(targetX, targetY);
        this.targetEnemy = null; // 取消攻擊目標
        this.isMoving = true;
        // console.log(`移動到: ${targetX.toFixed(0)}, ${targetY.toFixed(0)}`);
    }

    // --- 攻擊邏輯 ---
    setAttackTarget(enemy) {
        if (enemy && enemy.stats.hp > 0) {
            this.targetEnemy = enemy;
            this.isMoving = true; // 移動到敵人附近
            // console.log(`鎖定目標: ${enemy.name}`);
        } else {
             this.targetEnemy = null;
        }
    }

    attack(target) {
        if (!target || target.stats.hp <= 0) {
            this.targetEnemy = null;
            return;
        }
        const now = millis();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            console.log(`${this.name} 攻擊 ${target.name}`);
            let damage = max(1, this.currentStats.attack - target.currentStats.defense); // 至少造成 1 點傷害
            damage = floor(random(damage * 0.8, damage * 1.2)); // 加入少量隨機性
            target.takeDamage(damage, this);
            this.lastAttackTime = now;
            // 顯示攻擊動畫/特效
            this.playAttackAnimation(target);
             // 如果目標死亡，清除目標
            if (target.stats.hp <= 0) {
                this.targetEnemy = null;
            }
        }
    }

    playAttackAnimation(target){
         // 簡單效果：在玩家和目標之間畫一條線
         stroke(255,0,0);
         strokeWeight(2);
         line(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
         // 短暫延遲後清除線條 (或用粒子效果更好)
         // 實際遊戲中會使用更複雜的動畫系統
    }


    // --- 受傷邏輯 ---
    takeDamage(damage, attacker) {
        this.stats.hp -= damage;
        uiManager.addFloatingText(`-${damage}`, this.pos.x, this.pos.y, 'red');
        console.log(`${this.name} 受到 ${damage} 點傷害，剩餘 ${this.stats.hp} HP`);
        if (this.stats.hp <= 0) {
            this.die();
        }
         // 可以加入受傷音效或畫面效果
    }

    // --- 死亡邏輯 ---
    die() {
        this.stats.hp = 0;
        console.log(`${this.name} 死亡！`);
        // 進入死亡狀態，顯示死亡畫面，可能掉落經驗值或物品
        gameState = 'gameOver';
        // 簡單處理：重置到村莊？
    }

    // --- 經驗與升級 ---
    gainXP(amount) {
        this.stats.xp += amount;
        console.log(`獲得 ${amount} XP，總共 ${this.stats.xp} / ${this.stats.xpToNextLevel}`);
        uiManager.addMessage(`獲得 ${amount} 經驗值`, 'yellow');
        while (this.stats.xp >= this.stats.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        this.stats.xp -= this.stats.xpToNextLevel; // 減去當前等級所需經驗
        this.stats.xpToNextLevel = floor(this.stats.xpToNextLevel * 1.5); // 提高下一級所需經驗

        // 提升基礎屬性
        this.baseStats.maxHP += 10;
        this.baseStats.maxMP += 5;
        this.baseStats.attack += 2;
        this.baseStats.defense += 1;

        // 完全恢復 HP 和 MP
        this.stats.hp = this.baseStats.maxHP;
        this.stats.mp = this.baseStats.maxMP;

        this.updateCombinedStats(); // 重新計算包含裝備的屬性

        console.log(`升級！達到 ${this.stats.level} 級！`);
        uiManager.addMessage(`${UIText.levelUp} (${this.stats.level})`, 'lime', 3000);
        // 播放升級特效/音效
    }

    // --- 物品管理 ---
    pickupItem(droppedItem) {
        if (!droppedItem || !droppedItem.item) return false;
        const item = droppedItem.item;

        // 嘗試堆疊
        if (item.stackable) {
            for (let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] && this.inventory[i].id === item.id && this.inventory[i].quantity < this.inventory[i].maxStack) {
                    let overflow = this.inventory[i].addQuantity(item.quantity);
                     if (overflow === 0) {
                         console.log(`堆疊拾取 ${item.name} x${item.quantity}`);
                         uiManager.addMessage(`${UIText.pickup}: ${item.name} x${item.quantity}`, 'white');
                         return true; // 成功拾取
                     } else {
                         // 如果堆疊後還有剩餘 (理論上拾取單個不會發生，除非修改邏輯)
                         item.quantity = overflow; // 繼續嘗試放入新格子
                     }
                }
            }
        }

        // 尋找空格子
        const emptySlotIndex = this.inventory.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            this.inventory[emptySlotIndex] = item;
            console.log(`拾取 ${item.name} 到背包格子 ${emptySlotIndex}`);
            uiManager.addMessage(`${UIText.pickup}: ${item.name}`, 'white');
            return true; // 成功拾取
        } else {
            console.log("背包已滿！");
            uiManager.addMessage(UIText.inventoryFull, 'orange');
            return false; // 背包滿了
        }
    }

    findEmptyInventorySlot() {
        return this.inventory.findIndex(slot => slot === null);
    }

    // 從背包使用物品
    useItem(inventoryIndex) {
        const item = this.inventory[inventoryIndex];
        if (item && item.type === 'consumable') {
             const itemStillExists = item.use(this); // use 方法返回 true 如果物品還有剩餘
             if (!itemStillExists) {
                 this.inventory[inventoryIndex] = null; // 從背包移除
             }
             uiManager.updateInventory(); // 更新 UI 顯示
        } else {
            console.log("無法使用此物品或格子為空");
        }
    }

    // 裝備物品 (從背包)
    equipItem(inventoryIndex) {
        const item = this.inventory[inventoryIndex];
        if (!item || item.type !== 'equipment') {
            console.log("無法裝備此物品");
            return;
        }
        const slot = item.slot; // 'weapon', 'armor' etc.
        if (!this.equipment.hasOwnProperty(slot)) {
             console.log("無效的裝備部位:", slot);
             return;
        }

        // 如果該部位已有裝備，先卸下
        let previouslyEquipped = null;
        if (this.equipment[slot]) {
            previouslyEquipped = this.unequipItem(slot, false); // 卸下但不立即放入背包
        }

        // 裝備新物品
        this.equipment[slot] = item;
        this.inventory[inventoryIndex] = previouslyEquipped; // 將舊裝備放回原背包格子 (如果格子空)
                                                            // 這裡需要更完善的處理，如果格子不空，需要找到新空格

        console.log(`裝備了 ${item.name} 到 ${slot}`);
        this.updateCombinedStats(); // 重新計算屬性
        uiManager.updateInventory();
        uiManager.updateEquipment();
    }

    // 卸下裝備
    unequipItem(slot, findNewSlot = true) {
        if (!this.equipment[slot]) return null;

        const itemToUnequip = this.equipment[slot];
        this.equipment[slot] = null; // 從裝備欄移除

        let placedInInventory = false;
        if (findNewSlot) {
            const emptySlotIndex = this.findEmptyInventorySlot();
            if (emptySlotIndex !== -1) {
                this.inventory[emptySlotIndex] = itemToUnequip;
                placedInInventory = true;
                 console.log(`卸下了 ${itemToUnequip.name} 到背包格子 ${emptySlotIndex}`);
            } else {
                // 背包滿了，卸下的物品掉地上？或提示？
                console.warn(`背包已滿，無法卸下 ${itemToUnequip.name}！`);
                 // 暫時放回原位，或者強制掉落
                 this.equipment[slot] = itemToUnequip; // 放回去
                 uiManager.addMessage(`${UIText.inventoryFull}, 無法卸下 ${itemToUnequip.name}`, 'orange');
                 return null; // 返回 null 表示卸載失敗
            }
        }


        this.updateCombinedStats(); // 重新計算屬性
         if(placedInInventory) uiManager.updateInventory();
         uiManager.updateEquipment();
         return itemToUnequip; // 返回被卸下的物品實例 (用於 equipItem 中交換)

    }


    // 更新包含裝備加成的總屬性
    updateCombinedStats() {
        // 先重置為基礎屬性
        this.currentStats = { ...this.baseStats };
        this.currentStats.attackRangeSq = this.baseStats.attackRangeSq; // 確保攻擊範圍也重置

        // 遍歷裝備欄，累加屬性
        for (const slot in this.equipment) {
            const item = this.equipment[slot];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    if (this.currentStats.hasOwnProperty(stat)) {
                        this.currentStats[stat] += item.stats[stat];
                    } else if (stat === 'attackRange') { // 特殊處理攻擊範圍
                         // 注意：攻擊範圍通常是覆蓋而不是累加，且應處理平方值
                         this.currentStats.attackRangeSq = max(this.currentStats.attackRangeSq, (item.stats.attackRange * TILE_SIZE)**2);
                    }
                    // 可以擴充處理其他特殊屬性，如暴擊率、吸血等
                }
            }
        }

        // 確保 HP/MP 不超過新的最大值
        this.stats.hp = min(this.stats.hp, this.currentStats.maxHP);
        this.stats.mp = min(this.stats.mp, this.currentStats.maxMP);
         // console.log("更新後屬性:", this.currentStats);
    }


    // --- 主迴圈更新 ---
    update(obstacles, monsters, npcs) {
        let moved = false;

        // --- 行為決策 ---
        // 1. 如果有攻擊目標
        if (this.targetEnemy) {
            if (this.targetEnemy.stats.hp <= 0) { // 目標已死亡
                this.targetEnemy = null;
                this.isMoving = false;
            } else {
                const distToEnemySq = distSq(this.pos.x, this.pos.y, this.targetEnemy.pos.x, this.targetEnemy.pos.y);
                // 如果在攻擊範圍內，停止移動並攻擊
                if (distToEnemySq <= this.currentStats.attackRangeSq) {
                    this.isMoving = false;
                    this.attack(this.targetEnemy);
                } else {
                    // 不在範圍內，朝目標移動
                    this.targetPos.set(this.targetEnemy.pos); // 持續更新目標位置
                    this.isMoving = true;
                }
            }
        }
        // 2. 如果沒有攻擊目標，但在移動中
        else if (this.isMoving) {
             const distToTargetSq = distSq(this.pos.x, this.pos.y, this.targetPos.x, this.targetPos.y);
             if (distToTargetSq < (this.currentStats.speed * 0.5)**2) { // 到達目標點附近
                 this.isMoving = false;
                 this.pos.set(this.targetPos); // 精確到達
             }
        }

        // --- 移動執行 ---
        if (this.isMoving) {
            let moveVec = p5.Vector.sub(this.targetPos, this.pos);
            moveVec.setMag(this.currentStats.speed); // 設定移動速度
            let nextPos = p5.Vector.add(this.pos, moveVec);

            // 簡單碰撞檢測 (未來可優化為更精確的檢測)
            let canMove = true;
            // 檢查地圖邊界
             if (currentMap.isOutsideBounds(nextPos.x, nextPos.y)) {
                 canMove = false;
             }
             // 檢查地圖障礙物
             else if (currentMap.isObstacle(nextPos.x, nextPos.y)) {
                 canMove = false;
                 this.isMoving = false; // 撞牆停止
             }
            // // (可選) 檢查與其他單位碰撞 (避免重疊)
            // for (let monster of monsters) {
            //     if (distSq(nextPos.x, nextPos.y, monster.pos.x, monster.pos.y) < (this.size/2 + monster.size/2)**2) {
            //         canMove = false; break;
            //     }
            // }
             // for (let npc of npcs) {
             //    if (distSq(nextPos.x, nextPos.y, npc.pos.x, npc.pos.y) < (this.size/2 + npc.size/2)**2) {
             //        canMove = false; break;
             //    }
             // }


            if (canMove) {
                this.pos = nextPos;
                moved = true;
            }
        }

        // 回復少量 MP (如果需要)
        // if (frameCount % 120 === 0) { // 每 2 秒回一點 MP
        //     this.stats.mp = min(this.currentStats.maxMP, this.stats.mp + 1);
        // }

        return moved; // 返回是否移動了，用於相機更新
    }

    // --- 繪製 ---
    render(offsetX, offsetY) {
        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);
        fill(this.color);
        noStroke();
        ellipse(0, 0, this.size, this.size);

        // 畫一個簡單的方向指示器 (指向移動方向或目標)
        if (this.isMoving || this.targetEnemy) {
            stroke(255);
            strokeWeight(2);
            let lookAt = this.targetEnemy ? this.targetEnemy.pos : this.targetPos;
            let dir = p5.Vector.sub(lookAt, this.pos);
             // 檢查 dir 是否為零向量
            if (dir.magSq() > 0.001) { // 避免除以零
                 dir.setMag(this.size * 0.6);
                 line(0, 0, dir.x, dir.y);
             }
        }
        pop();
    }
}