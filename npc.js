class Npc {
    constructor(npcId, x, y) {
        const data = NpcData[npcId];
        if (!data) {
            console.error("找不到 NPC ID:", npcId);
            return null;
        }
        this.id = npcId;
        this.name = data.name;
        this.pos = createVector(x, y);
        this.size = data.size;
        this.color = data.color;
        this.dialogue = data.dialogue || [];
        this.canFight = data.canFight || false;

        this.baseStats = {
            maxHP: data.hp || 50,
            attack: data.attack || 0,
            defense: data.defense || 0,
            attackRangeSq: (data.attackRange || TILE_SIZE * 1.5) ** 2,
            aggroRangeSq: (data.aggroRange || TILE_SIZE * 4) ** 2, // NPC 索敵範圍
        };
        this.currentStats = { ...this.baseStats };
        this.stats = {
            hp: this.baseStats.maxHP,
        };

        this.targetEnemy = null; // 戰鬥目標
        this.state = 'idle'; // 'idle', 'fighting', 'dead'
        this.lastAttackTime = 0;
        this.attackCooldown = 2000; // NPC 攻擊間隔
    }

    interact(player) {
        // 顯示對話框或執行其他互動 (交易、任務等)
        const msg = randomFromArray(this.dialogue) || `我是 ${this.name}`;
        uiManager.addMessage(`${this.name}: ${msg}`, 'cyan');
        // 可以在這裡打開交易介面、任務介面等
    }

     takeDamage(damage, attacker) {
         if (this.stats.hp <= 0) return; // 防止鞭屍
         this.stats.hp -= damage;
         uiManager.addFloatingText(`-${damage}`, this.pos.x, this.pos.y, 'orange'); // NPC 受傷用橘色

         if (this.stats.hp <= 0) {
             this.die(attacker);
         } else {
             // 如果 NPC 能戰鬥，且被怪物攻擊，則反擊
             if (this.canFight && attacker instanceof Monster) {
                 if(!this.targetEnemy){ // 如果沒有目標，鎖定攻擊者
                      console.log(`${this.name} 被 ${attacker.name} 攻擊，開始反擊！`);
                      this.targetEnemy = attacker;
                      this.state = 'fighting';
                 }
             }
         }
     }

    die(killer) {
         if (this.stats.hp <= 0 && this.state === 'dead') return; // 避免重複死亡
         this.stats.hp = 0;
         this.state = 'dead';
         console.log(`${this.name} 被 ${killer.name} 擊殺了...`);
         // NPC 死亡處理：從場景移除？變成無法互動的屍體？一段時間後重生？
         // 簡單處理：暫時原地不動，標記為死亡
    }

    attack(target) {
        if (!target || target.stats.hp <= 0 || this.stats.hp <= 0 || this.state !== 'fighting') {
            this.targetEnemy = null;
            if(this.stats.hp > 0) this.state = 'idle'; // 如果還活著就回到閒置
            return;
        }
        const now = millis();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            // console.log(`NPC ${this.name} 攻擊 ${target.name}`);
            let damage = max(1, this.currentStats.attack - target.currentStats.defense);
            damage = floor(random(damage * 0.9, damage * 1.1));
            target.takeDamage(damage, this);
            this.lastAttackTime = now;

             // 如果目標死亡，清除目標
             if (target.stats.hp <= 0) {
                 console.log(`NPC ${this.name} 擊殺了 ${target.name}`);
                 this.targetEnemy = null;
                 this.state = 'idle';
             }
        }
    }


    update(monsters, player) {
        if (this.state === 'dead') return;

        // --- 行為決策 (僅限於能戰鬥的 NPC) ---
        if (this.canFight) {
            // 1. 尋找附近的怪物
            let closestEnemy = null;
            let minDistSq = this.currentStats.aggroRangeSq;

            for (let monster of monsters) {
                if (monster.state === 'dead') continue;
                const dSq = distSq(this.pos.x, this.pos.y, monster.pos.x, monster.pos.y);
                if (dSq < minDistSq) {
                    minDistSq = dSq;
                    closestEnemy = monster;
                }
            }

             // 如果發現敵人且當前沒有目標，或發現了更近的敵人
            if (closestEnemy && (!this.targetEnemy || closestEnemy !== this.targetEnemy)) {
                 if (!this.targetEnemy) console.log(`NPC ${this.name} 發現敵人 ${closestEnemy.name}`);
                this.targetEnemy = closestEnemy;
                this.state = 'fighting';
            }

            // 2. 處理戰鬥狀態
            if (this.state === 'fighting') {
                if (!this.targetEnemy || this.targetEnemy.state === 'dead') {
                    // 目標消失或死亡
                    this.targetEnemy = null;
                    this.state = 'idle';
                     console.log(`NPC ${this.name} 的目標消失，回到閒置`);
                } else {
                     const distToEnemySq = distSq(this.pos.x, this.pos.y, this.targetEnemy.pos.x, this.targetEnemy.pos.y);
                     // 如果在攻擊範圍內，攻擊
                     if (distToEnemySq <= this.currentStats.attackRangeSq) {
                         this.attack(this.targetEnemy);
                         // 通常 NPC 會原地攻擊，不追擊 (除非特別設計)
                     }
                     // 如果敵人跑遠了 (超出索敵範圍)，放棄追擊
                      else if (distToEnemySq > this.currentStats.aggroRangeSq * 1.2) {
                          console.log(`NPC ${this.name} 的目標 ${this.targetEnemy.name} 跑遠了`);
                          this.targetEnemy = null;
                          this.state = 'idle';
                      }
                      // 可選：如果不在攻擊範圍但在索敵範圍內，可以稍微靠近一點？ (簡單移動邏輯)
                      // else {
                      //    this.moveTowards(this.targetEnemy.pos); // 需要加入 moveTowards 實現
                      // }
                }
            }
        }

        // --- 其他行為 (閒逛、特定動作等，暫不實現) ---
        if (this.state === 'idle') {
             // 可以隨機播放閒置動畫或小幅度移動
        }
    }

    render(offsetX, offsetY) {
        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);
        if (this.state === 'dead') {
            fill(100, 100, 100, 150); // 半透明灰色表示死亡
        } else {
            fill(this.color);
        }
        noStroke();
        // 用矩形代表 NPC
        rectMode(CENTER);
        rect(0, 0, this.size * 0.8, this.size * 1.1); // 稍微高瘦一點

         // --- 繪製血條 (如果 NPC 會受傷) ---
         if (this.baseStats.maxHP > 0 && this.stats.hp < this.baseStats.maxHP) {
             const barWidth = this.size * 1.0;
             const barHeight = 4;
             const barX = -barWidth / 2;
             const barY = -this.size * 0.7;

             fill(50);
             rectMode(CORNER); // 切回預設模式繪製血條
             rect(barX, barY, barWidth, barHeight);
             fill(0, 255, 0); // 綠色血條 (NPC 通常用綠色)
             const hpRatio = constrain(this.stats.hp / this.baseStats.maxHP, 0, 1);
             rect(barX, barY, barWidth * hpRatio, barHeight);
         }

         // --- (可選) 戰鬥目標指示 ---
         if (this.state === 'fighting' && this.targetEnemy) {
            stroke(100, 100, 255, 150); // 淡藍色
            strokeWeight(1);
             let targetScreenX = this.targetEnemy.pos.x - offsetX;
             let targetScreenY = this.targetEnemy.pos.y - offsetY;
             let selfScreenX = this.pos.x - offsetX;
             let selfScreenY = this.pos.y - offsetY;
             line(0, 0, targetScreenX - selfScreenX, targetScreenY - selfScreenY);
         }

        pop();
    }
}