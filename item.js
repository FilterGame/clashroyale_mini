// item.js
class Item {
    constructor(itemId, quantity = 1) {
        const data = ItemData[itemId];
        if (!data) {
            console.error("找不到物品 ID:", itemId);
            return null; // 或者拋出錯誤
        }
        this.id = itemId;
        this.name = data.name;
        this.type = data.type; // 'consumable', 'equipment', 'material'
        this.description = data.description;
        this.icon = data.icon; // 之後用來顯示圖示
        this.stackable = data.stackable || false;
        this.maxStack = data.maxStack || 1;
        this.quantity = this.stackable ? quantity : 1;

        if (this.type === 'equipment') {
            this.slot = data.slot; // 'weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'
            this.stats = data.stats || {}; // { attack: 5, defense: 2 }
            this.rarity = data.rarity || 'common'; // 'common', 'uncommon', 'rare', 'legendary'
        } else if (this.type === 'consumable') {
            this.effect = data.effect || {}; // { hp: 50, mp: 30 }
        }
    }

    // 增加物品數量 (用於可堆疊物品)
    addQuantity(amount) {
        if (!this.stackable) return false;
        this.quantity += amount;
        if (this.quantity > this.maxStack) {
            let overflow = this.quantity - this.maxStack;
            this.quantity = this.maxStack;
            return overflow; // 返回溢出的數量
        }
        return 0; // 沒有溢出
    }

    // 使用物品 (由 Player Class 呼叫)
    use(target) {
        if (this.type === 'consumable') {
            console.log(`${target.name} 使用了 ${this.name}`);
            for (const effectKey in this.effect) {
                if (target.stats.hasOwnProperty(effectKey)) {
                     // 應用效果，注意不要超過最大值
                    target.stats[effectKey] = min(target.stats[`max${effectKey.toUpperCase()}`], target.stats[effectKey] + this.effect[effectKey]);
                    // 播放音效或顯示提示
                    uiManager.addMessage(`恢復 ${this.effect[effectKey]} 點 ${UIText[effectKey]}`, 'green');
                }
            }
            this.quantity--; // 消耗一個
            return this.quantity > 0; // 如果還有剩餘，返回 true
        }
        return false; // 不是消耗品或使用失敗
    }
}

// 地圖上掉落的物品
class DroppedItem {
    constructor(item, x, y) {
        this.item = item; // Item 實例
        this.pos = createVector(x, y);
        this.pickupRadiusSq = (TILE_SIZE * 0.8) ** 2; // 拾取範圍的平方
        this.creationTime = millis();
        this.lifespan = 60000; // 物品掉落後 60 秒消失
    }

    isExpired() {
        return millis() - this.creationTime > this.lifespan;
    }

    render(offsetX, offsetY) {
        push();
        translate(this.pos.x - offsetX, this.pos.y - offsetY);
        // 簡單用顏色代表物品稀有度或類型
        if (this.item.type === 'equipment') {
            switch(this.item.rarity) {
                case 'uncommon': fill(0, 255, 0); break; // 綠色
                case 'rare': fill(0, 0, 255); break; // 藍色
                case 'legendary': fill(255, 0, 255); break; // 紫色
                default: fill(255); // 白色 (普通)
            }
        } else if (this.item.type === 'consumable') {
            fill(255, 165, 0); // 橘色
        } else {
            fill(100); // 灰色 (材料等)
        }
        ellipse(0, 0, TILE_SIZE * 0.5, TILE_SIZE * 0.5);
        // 未來可以畫物品圖示 this.item.icon
        pop();
    }
}