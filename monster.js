class Monster {
    constructor(monsterId, x, y) {
        const data = MonsterData[monsterId];
        if (!data) {
            console.error("找不到怪物 ID:", monsterId);
            return null;
        }
        this.id = monsterId;
        this.name = data.name;
        this.pos = createVector(x, y);
        this.size = data.size;
        this.color = data.color;

        this.baseStats = { // 基礎屬性
            maxHP: data.hp,
            maxMP: data.mp || 0,
            attack: data.attack,
            defense: data.defense,
            speed: data.speed,
            attackRangeSq: (data.attackRange || TILE_SIZE * 1.5) ** 2,
            aggroRangeSq: (data.aggroRange || TILE_SIZE * 5) ** 2,
        };
         this.currentStats = { ...this.baseStats };
         this.stats = { // 即時屬性
            hp: data.hp,
            mp: data.mp || 0,
        };

        this.xpReward = data.xp;
        this.lootTable = data.lootTable || [];

        this.target = null; // 攻擊目標 (通常是玩家或其他 NPC)
        this.state = 'idle'; // 'idle', 'chasing', 'attacking', 'fleeing', 'dead'
        this.lastAttackTime = 0;
        this.attackCooldown = 1500; // 怪物攻擊間隔 (毫秒)
        this.wanderTarget = null; // 閒逛目標點
        this.lastWanderTime = 0;
        this.wanderCooldown = random(3000, 8000); // 隨機閒逛間隔
    }

    takeDamage(damage, attacker) {
        this.stats.hp -= damage;
        uiManager.addFloatingText(`-${damage}`, this.pos.x, this.pos.y, 'white'); // 怪物受傷用白色數字

        if (this.stats.hp <= 0) {
            this.die(attacker);
        } else {
            // 被攻擊後，鎖定攻擊者
            if (!this.target || attacker === player) { // 優先鎖定玩家
                this.target = attacker;
                this.state = 'chasing';
                 // console.log(`${this.name} 被 ${attacker.name} 攻擊，開始追擊！`);
            }
        }
    }

    die(killer) {
        if (this.state === 'dead') return; // 防止重複觸發
        this.state = 'dead';
        this.stats.hp = 0;
        console.log(`${this.name} 被 ${killer.name} 擊殺！`);

        // 給予擊殺者經驗值
        if (killer && typeof killer.gainXP === 'function') {
            killer.gainXP(this.xpReward);
        }

        // 處理掉落物
        this.dropLoot();
    }

    dropLoot() {
        this.lootTable.forEach(loot => {
            if (random() < loot.chance) {
                const itemInstance = new Item(loot.itemId);
                if (itemInstance) {
                     // 在怪物死亡位置稍微偏移的地方掉落
                    const dropX = this.pos.x + random(-TILE_SIZE*0.3, TILE_SIZE*0.3);
                    const dropY = this.pos.y + random(-TILE_SIZE*0.3, TILE_SIZE*0.3);
                    const droppedItem = new DroppedItem(itemInstance, dropX, dropY);
                    worldItems.push(droppedItem);
                    console.log(`${this.name} 掉落了 ${itemInstance.name}`);
                    uiManager.addMessage(`${UIText.itemDropped}: ${itemInstance.name}`, 'lightblue');
                }
            }
        });
    }

     attack(target) {
        if (!target || target.stats.hp <= 0 || this.state === 'dead') {
            this.target = null;
            this.state = 'idle';
            return;
        }
        const now = millis();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            // console.log(`${this.name} 攻擊 ${target.name}`);
            let damage = max(1, this.currentStats.attack - target.currentStats.defense);
            damage = floor(random(damage * 0.8, damage * 1.2));
            target.takeDamage(damage, this);
            this.lastAttackTime = now;

             // 如果目標死亡，清除目標
            if (target.stats.hp <= 0) {
                this.target = null;
                 this.state = 'idle'; // 回到閒置狀態
            }
        }
    }


    update(player, npcs, obstacles) {
        if (this.state === 'dead') return;

        let potentialTargets = [player, ...npcs.filter(npc => npc.canFight)]; // 怪物會攻擊玩家和能戰鬥的 NPC

        // --- 索敵與狀態切換 ---
        let closestTarget = null;
        let minDistSq = this.currentStats.aggroRangeSq;

        for(let pTarget of potentialTargets){
             if(!pTarget || pTarget.stats.hp <= 0) continue; // 跳過無效或死亡目標
             const dSq = distSq(this.pos.x, this.pos.y, pTarget.pos.x, pTarget.pos.y);
             if (dSq < minDistSq) {
                 minDistSq = dSq;
                 closestTarget = pTarget;
             }
        }


        // 如果當前有目標，檢查是否超出追擊範圍太多 (避免一直追)
        if (this.target) {
             const distToCurrentTargetSq = distSq(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
             if (distToCurrentTargetSq > this.currentStats.aggroRangeSq * 2.0 || this.target.stats.hp <= 0) { // 距離太遠或目標死亡
                  console.log(`${this.name} 失去目標 ${this.target.name}`);
                 this.target = null;
                 this.state = 'idle';
                 this.wanderTarget = null; // 停止遊蕩，準備找新目標或重新遊蕩
             }
        }


        // 如果發現了更近的或新的目標 (且當前不在攻擊狀態，或新目標是玩家)
         if (closestTarget && (!this.target || closestTarget === player || this.state === 'idle' || this.state === 'wandering')) {
            if (this.target !== closestTarget) {
                console.log(`${this.name} 發現目標: ${closestTarget.name}`);
                this.target = closestTarget;
                 this.state = 'chasing';
                 this.wanderTarget = null; // 停止遊蕩
            }
         }


        // --- 行為執行 ---
        let moved = false;
        switch (this.state) {
            case 'idle':
                // 隨機閒逛
                const now = millis();
                if (!this.wanderTarget && now - this.lastWanderTime > this.wanderCooldown) {
                    const angle = random(TWO_PI);
                    const dist = random(TILE_SIZE * 2, TILE_SIZE * 5);
                    this.wanderTarget = createVector(this.pos.x + cos(angle) * dist, this.pos.y + sin(angle) * dist);
                     // 簡單檢查目標點是否在障礙物內 (避免卡住)
                    if(currentMap.isObstacle(this.wanderTarget.x, this.wanderTarget.y) || currentMap.isOutsideBounds(this.wanderTarget.x, this.wanderTarget.y)){
                         this.wanderTarget = null; // 無效目標點，下次再找
                    } else {
                        this.lastWanderTime = now;
                        this.wanderCooldown = random(3000, 8000); // 重設下次閒逛時間
                         // console.log(`${this.name} 開始閒逛`);
                    }
                }
                if (this.wanderTarget) {
                    moved = this.moveTowards(this.wanderTarget, obstacles);
                    if (!moved || distSq(this.pos.x, this.pos.y, this.wanderTarget.x, this.wanderTarget.y) < (this.currentStats.speed * 0.8)**2) {
                        this.wanderTarget = null; // 到達閒逛點或撞牆
                         // console.log(`${this.name} 結束閒逛`);
                    }
                }
                break;

            case 'chasing':
                if (this.target) {
                     const distToTargetSq = distSq(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
                     if (distToTargetSq <= this.currentStats.attackRangeSq) {
                         this.state = 'attacking'; // 進入攻擊範圍
                         moved = false; // 停止移動準備攻擊
                          this.attack(this.target); // 立刻嘗試攻擊一次
                     } else {
                         moved = this.moveTowards(this.target.pos, obstacles);
                         if (!moved) {
                            // 如果移動失敗 (撞牆)，可能需要簡單的繞行邏輯，或者暫時放棄追擊
                            // console.log(`${this.name} 追擊時撞牆`);
                            // 簡單處理：稍微隨機換個方向？或者暫停一下？
                            // this.target = null; this.state = 'idle'; // 暫時放棄
                         }
                     }
                } else {
                     this.state = 'idle'; // 目標丟失
                }
                break;

            case 'attacking':
                 if (this.target) {
                     const distToTargetSq = distSq(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
                      // 檢查目標是否跑出攻擊範圍
                     if (distToTargetSq > this.currentStats.attackRangeSq * 1.1) { // 增加一點緩衝避免頻繁切換
                         this.state = 'chasing';
                         moved = this.moveTowards(this.target.pos, obstacles); // 開始追擊
                     } else {
                         // 在範圍內，持續攻擊
                         this.attack(this.target);
                         moved = false; // 攻擊時不移動
                     }
                 } else {
                      this.state = 'idle'; // 目標丟失
                 }
                break;
             // 可以添加 'fleeing' 狀態 (低血量時逃跑)
        }
    }

     // --- 移動輔助函式 ---
    moveTowards(targetPosVec, obstacles) {
         if (!targetPosVec) return false;
         let moveVec = p5.Vector.sub(targetPosVec, this.pos);
          // 檢查是否已經很接近
         if (moveVec.magSq() < (this.currentStats.speed * 0.1)**2) {
             return false; // 距離夠近，不用移動
         }
         moveVec.setMag(this.currentStats.speed);
         let nextPos = p5.Vector.add(this.pos, moveVec);

         // 碰撞檢測
         if (currentMap.isObstacle(nextPos.x, nextPos.y) || currentMap.isOutsideBounds(nextPos.x, nextPos.y)) {
             // 嘗試稍微繞開 (非常基礎的繞行)
              let angle = moveVec.heading();
              let tryAngle1 = angle + PI / 4; // 嘗試向左 45 度
              let tryAngle2 = angle - PI / 4; // 嘗試向右 45 度

              let nextPos1 = createVector(this.pos.x + cos(tryAngle1) * this.currentStats.speed, this.pos.y + sin(tryAngle1) * this.currentStats.speed);
              let nextPos2 = createVector(this.pos.x + cos(tryAngle2) * this.currentStats.speed, this.pos.y + sin(tryAngle2) * this.currentStats.speed);

              let canMove1 = !currentMap.isObstacle(nextPos1.x, nextPos1.y) && !currentMap.isOutsideBounds(nextPos1.x, nextPos1.y);
              let canMove2 = !currentMap.isObstacle(nextPos2.x, nextPos2.y) && !currentMap.isOutsideBounds(nextPos2.x, nextPos2.y);

              if (canMove1 && canMove2) {
                 // 如果兩邊都能走，選擇離目標更近的方向 (或隨機?)
                 nextPos = (distSq(nextPos1.x, nextPos1.y, targetPosVec.x, targetPosVec.y) < distSq(nextPos2.x, nextPos2.y, targetPosVec.x, targetPosVec.y)) ? nextPos1 : nextPos2;
              } else if (canMove1) {
                 nextPos = nextPos1;
              } else if (canMove2) {
                 nextPos = nextPos2;
              } else {
                 return false; // 兩邊都卡住，移動失敗
              }
         }

         // 檢查與其他怪物/NPC碰撞 (可選)

         this.pos = nextPos;
         return true; // 移動成功
     }


    render(offsetX, offsetY) {
        if (this.state === 'dead') return; // 死亡不繪製 (或繪製屍體)

        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);

        // --- 繪製怪物主體 ---
        fill(this.color);
        noStroke();
        ellipse(0, 0, this.size, this.size);

         // --- 繪製血條 ---
        const barWidth = this.size * 1.2;
        const barHeight = 5;
        const barX = -barWidth / 2;
        const barY = -this.size * 0.8; // 在頭頂上方

        fill(50); // 血條背景
        rect(barX, barY, barWidth, barHeight);
        fill(255, 0, 0); // 紅色血條
        const hpRatio = constrain(this.stats.hp / this.baseStats.maxHP, 0, 1);
        rect(barX, barY, barWidth * hpRatio, barHeight);

        // --- (可選) 繪製目標指示線 ---
        if (this.target && (this.state === 'chasing' || this.state === 'attacking')) {
            stroke(255, 100, 100, 150); // 淡紅色
            strokeWeight(1);
            // 計算目標相對於怪物的偏移量 (因為怪物座標已經 translate)
            let targetScreenX = this.target.pos.x - offsetX;
            let targetScreenY = this.target.pos.y - offsetY;
            let selfScreenX = this.pos.x - offsetX;
            let selfScreenY = this.pos.y - offsetY;
            line(0, 0, targetScreenX - selfScreenX, targetScreenY - selfScreenY);
        }

        pop();
    }
}