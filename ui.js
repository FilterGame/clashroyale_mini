// ui.js

// --- 浮動文字類 ---
class FloatingText {
    constructor(text, x, y, color = 'white', duration = 1000) {
        this.text = text;
        this.pos = createVector(x, y);
        this.startY = y;
        this.color = color;
        this.duration = duration;
        this.creationTime = millis();
        this.alpha = 255;
        this.speed = 1.5; // 向上飄的速度
    }

    update() {
        const elapsed = millis() - this.creationTime;
        if (elapsed > this.duration) {
            return false; // 表示已過期，需要移除
        }
        this.pos.y -= this.speed;
        this.alpha = map(elapsed, 0, this.duration, 255, 0); // 淡出效果
        return true;
    }

    render(offsetX, offsetY) {
        push();
        fill(color(this.color), this.alpha);
        textSize(16);
        textAlign(CENTER, BOTTOM);
        textFont('monospace'); // 使用等寬字體顯示數字更好看
        text(this.text, this.pos.x - offsetX, this.pos.y - offsetY);
        pop();
    }
}

// --- 系統訊息類 ---
class SystemMessage {
     constructor(text, color = 'white', duration = 3000){
          this.text = text;
          this.color = color;
          this.duration = duration;
          this.creationTime = millis();
          this.alpha = 255;
     }
     isExpired(){
          return millis() - this.creationTime > this.duration;
     }
     update(){
          const elapsed = millis() - this.creationTime;
          // 在最後 500ms 開始淡出
          if(this.duration - elapsed < 500){
               this.alpha = map(elapsed, this.duration - 500, this.duration, 255, 0);
          } else {
               this.alpha = 255;
          }
     }
     render(x, y){
          push();
          fill(color(this.color), this.alpha);
          textSize(14);
          textAlign(LEFT, BOTTOM);
           textFont('sans-serif'); // 系統訊息用普通字體
          text(this.text, x, y);
          pop();
     }
}


// --- UI 管理器 ---
class UIManager {
    constructor() {
        this.floatingTexts = [];
        this.systemMessages = [];
        this.maxMessages = 5; // 最多顯示幾條系統訊息

        this.showInventory = false;
        this.inventoryPanel = { x: 0, y: 0, w: 0, h: 0, rows: 5, cols: 4, slotSize: 50, padding: 10 };
        this.equipmentPanel = {x: 0, y: 0, w: 0, h: 0};
        this.tooltip = { show: false, text: "", x: 0, y: 0 };

        // 預先計算 UI 位置
        this.calculateLayout();
    }

     calculateLayout() {
         const margin = 20;
         const bottomBarHeight = 100;

         // 背包面板位置和大小
         this.inventoryPanel.cols = 4;
         this.inventoryPanel.rows = floor(PlayerDefaults.inventorySize / this.inventoryPanel.cols);
         this.inventoryPanel.slotSize = 50;
         this.inventoryPanel.padding = 10;
         this.inventoryPanel.w = this.inventoryPanel.cols * (this.inventoryPanel.slotSize + this.inventoryPanel.padding) + this.inventoryPanel.padding;
         this.inventoryPanel.h = this.inventoryPanel.rows * (this.inventoryPanel.slotSize + this.inventoryPanel.padding) + this.inventoryPanel.padding + 40; // 加一點標題高度
         this.inventoryPanel.x = width - this.inventoryPanel.w - margin;
         this.inventoryPanel.y = height / 2 - this.inventoryPanel.h / 2;

         // 裝備面板 (放在背包左邊)
          this.equipmentPanel.slotSize = this.inventoryPanel.slotSize;
          this.equipmentPanel.padding = this.inventoryPanel.padding;
          this.equipmentPanel.w = this.equipmentPanel.slotSize * 2 + this.equipmentPanel.padding * 3; // 大約兩列寬
          this.equipmentPanel.h = this.inventoryPanel.h; // 和背包一樣高
          this.equipmentPanel.x = this.inventoryPanel.x - this.equipmentPanel.w - margin;
          this.equipmentPanel.y = this.inventoryPanel.y;

          // 確保面板不超出螢幕
          this.inventoryPanel.x = max(margin, this.inventoryPanel.x);
          this.inventoryPanel.y = max(margin, this.inventoryPanel.y);
          this.equipmentPanel.x = max(margin, this.equipmentPanel.x);
          this.equipmentPanel.y = max(margin, this.equipmentPanel.y);

     }

    // 添加浮動文字 (傷害、治療數字等)
    addFloatingText(text, worldX, worldY, color = 'white', duration = 1000) {
        this.floatingTexts.push(new FloatingText(text, worldX, worldY, color, duration));
    }

    // 添加系統訊息 (升級、獲得物品等)
    addMessage(text, color = 'white', duration = 3000) {
         this.systemMessages.push(new SystemMessage(text, color, duration));
         // 如果訊息超過最大數量，移除最舊的
         if (this.systemMessages.length > this.maxMessages) {
             this.systemMessages.shift(); // 移除陣列第一個元素
         }
     }

    toggleInventory() {
        this.showInventory = !this.showInventory;
        if (this.showInventory) {
             console.log("打開背包");
             this.updateInventory(); // 打開時更新一次內容
             this.updateEquipment(); // 更新裝備面板
        } else {
             console.log("關閉背包");
              this.tooltip.show = false; // 關閉時隱藏提示
        }
    }

    // 更新背包面板的顯示內容 (當物品變更時呼叫)
    updateInventory() {
        if (!this.showInventory || !player) return;
        // 這裡只是標記需要更新，實際繪製在 renderInventory 中完成
        // 如果有複雜的 UI 元素，可以在這裡重新生成 DOM 或 Canvas 緩存
    }
    // 更新裝備面板
     updateEquipment() {
          if (!this.showInventory || !player) return;
          // 同上，標記更新
     }


    // 處理滑鼠點擊 UI 元素
     handleMouseClick(mx, my) {
         if (this.showInventory) {
             // 檢查是否點擊在背包格子內
              const inv = this.inventoryPanel;
              for (let i = 0; i < player.inventory.length; i++) {
                  const col = i % inv.cols;
                  const row = floor(i / inv.cols);
                  const slotX = inv.x + inv.padding + col * (inv.slotSize + inv.padding);
                  const slotY = inv.y + inv.padding + 40 + row * (inv.slotSize + inv.padding); // +40 for title

                  if (mx > slotX && mx < slotX + inv.slotSize && my > slotY && my < slotY + inv.slotSize) {
                      console.log(`點擊背包格子 ${i}`);
                       const item = player.inventory[i];
                       if (item) {
                           // 右鍵點擊? (p5.js 需要額外處理右鍵事件)
                           if (mouseButton === RIGHT) {
                                if (item.type === 'consumable') {
                                     player.useItem(i);
                                } else if (item.type === 'equipment') {
                                     player.equipItem(i);
                                }
                           } else {
                                // 左鍵點擊：可以考慮拖放功能，或顯示物品選單
                           }
                       }
                      return true; // 表示點擊被 UI 攔截
                  }
              }

              // 檢查是否點擊在裝備格子內
              const eq = this.equipmentPanel;
              const slots = Object.keys(player.equipment); // ['weapon', 'armor', ...]
               let currentY = eq.y + eq.padding + 40; // Start below title
               for(const slotName of slots){
                    // 假設裝備欄簡單垂直排列
                     const slotX = eq.x + eq.padding;
                     const slotW = eq.slotSize; // Use slotSize for consistency
                      // 根據裝備類型定位格子，這裡僅為示例，需要更精確布局
                      // 這裡用一個簡化的垂直布局
                     if (mx > slotX && mx < slotX + slotW && my > currentY && my < currentY + eq.slotSize) {
                          console.log(`點擊裝備欄位 ${slotName}`);
                          if(player.equipment[slotName]){
                               // 右鍵點擊卸下?
                               if(mouseButton === RIGHT){
                                    player.unequipItem(slotName);
                               }
                          }
                          return true; // UI 攔截
                     }
                     currentY += eq.slotSize + eq.padding; // Move to next slot position
               }

             // 檢查是否點擊在面板標題欄或空白處 (用於拖動窗口？)
             // ...

         }
         return false; // 沒有點擊到 UI
     }

     // 處理滑鼠移動以顯示 Tooltip
    handleMouseMove(mx, my) {
        if (!this.showInventory || !player) {
            this.tooltip.show = false;
            return;
        }

        this.tooltip.show = false; // 預設隱藏

        // --- 檢查背包 ---
        const inv = this.inventoryPanel;
        for (let i = 0; i < player.inventory.length; i++) {
            const col = i % inv.cols;
            const row = floor(i / inv.cols);
            const slotX = inv.x + inv.padding + col * (inv.slotSize + inv.padding);
            const slotY = inv.y + inv.padding + 40 + row * (inv.slotSize + inv.padding);

            if (mx > slotX && mx < slotX + inv.slotSize && my > slotY && my < slotY + inv.slotSize) {
                const item = player.inventory[i];
                if (item) {
                     this.tooltip.text = this.generateItemTooltip(item);
                     this.tooltip.x = mx + 15; // 顯示在滑鼠右下方
                     this.tooltip.y = my + 15;
                     this.tooltip.show = true;
                    return; // 找到一個，停止檢查
                }
            }
        }

        // --- 檢查裝備欄 ---
         const eq = this.equipmentPanel;
         const slots = Object.keys(player.equipment);
          let currentY = eq.y + eq.padding + 40;
          for(const slotName of slots){
               const slotX = eq.x + eq.padding;
               const slotW = eq.slotSize;
                if (mx > slotX && mx < slotX + slotW && my > currentY && my < currentY + eq.slotSize) {
                     const item = player.equipment[slotName];
                     if (item) {
                          this.tooltip.text = this.generateItemTooltip(item);
                          this.tooltip.x = mx + 15;
                          this.tooltip.y = my + 15;
                          this.tooltip.show = true;
                          return;
                     }
                }
                currentY += eq.slotSize + eq.padding;
          }
    }

     generateItemTooltip(item) {
         let tip = `[ ${item.name} ]\n`;
         // 添加稀有度顏色標記 (可選)
          switch(item.rarity){
              case 'uncommon': tip = `|cFF00FF00${tip}|r`; break; // Green
              case 'rare': tip = `|cFF0070DD${tip}|r`; break; // Blue
              case 'legendary': tip = `|cFFa335ee${tip}|r`; break; // Purple
              // Add more rarities if needed
          }


         if (item.type === 'equipment') {
             tip += `${UIText.equip} (${item.slot})\n`;
             for (const stat in item.stats) {
                 let sign = item.stats[stat] >= 0 ? '+' : '';
                 tip += `${UIText[stat] || stat}: ${sign}${item.stats[stat]}\n`;
             }
         } else if (item.type === 'consumable') {
             tip += `${UIText.use}\n`;
              for (const effect in item.effect) {
                 tip += `恢復 ${UIText[effect] || effect}: ${item.effect[effect]}\n`;
             }
         } else if (item.type === 'material') {
             tip += `材料\n`;
         }

         if (item.stackable) {
             tip += `數量: ${item.quantity} / ${item.maxStack}\n`;
         }

         tip += `\n"${item.description}"`;
         return tip;
     }


    render() {
        push(); // 保存全局繪製狀態

        // --- 繪製底部狀態欄 ---
        const barHeight = 20;
        const barWidth = width / 4; // 佔螢幕寬度的 1/4
        const bottomMargin = 10;
        const barY = height - bottomMargin - barHeight * 2 - 10; // 計算Y位置，留出兩條bar和間隔的空間

        // HP Bar
        const hpBarX = width / 2 - barWidth - 5; // 在中心左側
        fill(50, 0, 0); // 暗紅色背景
        rect(hpBarX, barY, barWidth, barHeight, 5); // 圓角
        fill(255, 0, 0); // 紅色
        const hpRatio = player ? constrain(player.stats.hp / player.currentStats.maxHP, 0, 1) : 0;
        rect(hpBarX, barY, barWidth * hpRatio, barHeight, 5);
        // HP 文字
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text(`${UIText.hp}: ${player ? player.stats.hp : 0} / ${player ? player.currentStats.maxHP : 0}`, hpBarX + barWidth / 2, barY + barHeight / 2);

        // MP Bar
        const mpBarX = width / 2 + 5; // 在中心右側
        fill(0, 0, 50); // 暗藍色背景
        rect(mpBarX, barY, barWidth, barHeight, 5);
        fill(0, 0, 255); // 藍色
        const mpRatio = player ? constrain(player.stats.mp / player.currentStats.maxMP, 0, 1) : 0;
        rect(mpBarX, barY, barWidth * mpRatio, barHeight, 5);
        // MP 文字
        fill(255);
        text(`${UIText.mp}: ${player ? player.stats.mp : 0} / ${player ? player.currentStats.maxMP : 0}`, mpBarX + barWidth / 2, barY + barHeight / 2);


        // --- 繪製經驗條 ---
        const xpBarY = barY + barHeight + 5;
        const xpBarWidth = barWidth * 2 + 10; // 橫跨 HP/MP Bar
        const xpBarX = hpBarX;
         fill(50, 50, 0); // 暗黃色背景
         rect(xpBarX, xpBarY, xpBarWidth, barHeight * 0.6, 3);
         fill(255, 255, 0); // 黃色
         const xpRatio = player ? constrain(player.stats.xp / player.stats.xpToNextLevel, 0, 1) : 0;
          if (player && player.stats.level > 0) { // 避免除以 0
              rect(xpBarX, xpBarY, xpBarWidth * xpRatio, barHeight * 0.6, 3);
          }
         // XP 文字
          fill(200);
          textSize(10);
          textAlign(CENTER, CENTER);
          text(`${UIText.xp}: ${player ? player.stats.xp : 0} / ${player ? player.stats.xpToNextLevel : 0} (${UIText.level} ${player ? player.stats.level : 0})`, xpBarX + xpBarWidth / 2, xpBarY + barHeight * 0.3);


        // --- 繪製技能欄 (暫時為空) ---
         const skillBarY = height - 50; // 技能欄位置
         const skillSlotSize = 40;
         const skillSlots = 6; // 假設有6個技能槽
         const skillBarWidth = skillSlots * (skillSlotSize + 5) - 5;
         const skillBarX = width / 2 - skillBarWidth / 2;
         fill(50, 50, 50, 180); // 半透明灰色背景
         rect(skillBarX - 5, skillBarY - 5, skillBarWidth + 10, skillSlotSize + 10, 5);
         for (let i = 0; i < skillSlots; i++) {
             let x = skillBarX + i * (skillSlotSize + 5);
             fill(80);
             stroke(120);
             rect(x, skillBarY, skillSlotSize, skillSlotSize, 3);
             // 可以在這裡繪製技能圖示和冷卻時間
              // 示例：第一個格子放主要攻擊 (滑鼠左右鍵?)
              if (i === 0) {
                   fill(200, 0, 0); ellipse(x + skillSlotSize/2, skillBarY+skillSlotSize/2, skillSlotSize*0.6);
                   textAlign(CENTER, CENTER); textSize(10); fill(255); text("攻擊", x+skillSlotSize/2, skillBarY+skillSlotSize-8);
              }
               if (i === 1) {
                   fill(0, 200, 0); ellipse(x + skillSlotSize/2, skillBarY+skillSlotSize/2, skillSlotSize*0.6);
                   textAlign(CENTER, CENTER); textSize(10); fill(255); text("技能2", x+skillSlotSize/2, skillBarY+skillSlotSize-8);
              }

         }


        // --- 繪製浮動文字 ---
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            // 需要傳遞相機偏移量給 render
            this.floatingTexts[i].render(camera.x, camera.y);
            if (!this.floatingTexts[i].update()) {
                this.floatingTexts.splice(i, 1); // 移除過期的文字
            }
        }

        // --- 繪製系統訊息 ---
        const messageStartX = 10;
        let messageStartY = height - bottomMargin - 120; // 從底部狀態欄上方開始顯示
        for (let i = this.systemMessages.length - 1; i >= 0; i--) {
             this.systemMessages[i].update();
             if (this.systemMessages[i].isExpired()) {
                 this.systemMessages.splice(i, 1);
                 continue;
             }
             this.systemMessages[i].render(messageStartX, messageStartY);
             messageStartY -= 18; // 每條訊息向上移動
         }


        // --- 繪製背包和裝備面板 (如果開啟) ---
        if (this.showInventory) {
            this.renderInventoryPanel();
            this.renderEquipmentPanel();
             // --- 繪製 Tooltip (如果需要) ---
             if (this.tooltip.show && this.tooltip.text) {
                 this.renderTooltip();
             }
        }

        // --- 繪製滑鼠指標提示 ---
        this.renderMouseTooltip();


        pop(); // 恢復全局繪製狀態
    }

    renderInventoryPanel() {
        const inv = this.inventoryPanel;
        push();
        // 繪製背景面板
        fill(30, 30, 30, 220); // 深灰色半透明背景
        stroke(150);
        rect(inv.x, inv.y, inv.w, inv.h, 8); // 圓角

        // 繪製標題
        fill(200);
        textSize(18);
        textAlign(CENTER, TOP);
        text(UIText.inventory, inv.x + inv.w / 2, inv.y + inv.padding);

        // 繪製背包格子
        for (let i = 0; i < player.inventory.length; i++) {
            const col = i % inv.cols;
            const row = floor(i / inv.cols);
            const slotX = inv.x + inv.padding + col * (inv.slotSize + inv.padding);
            const slotY = inv.y + inv.padding + 40 + row * (inv.slotSize + inv.padding); // +40 for title

            // 繪製格子背景
            fill(50, 50, 50, 200);
            stroke(100);
            rect(slotX, slotY, inv.slotSize, inv.slotSize, 4);

            // 如果格子裡有物品，繪製物品圖示和數量
            const item = player.inventory[i];
            if (item) {
                // 繪製物品圖示 (暫用顏色代替)
                push();
                translate(slotX + inv.slotSize / 2, slotY + inv.slotSize / 2);
                // 根據物品類型或稀有度選擇顏色
                if (item.type === 'equipment') fill(150, 150, 255); // 淡藍色代表裝備
                else if (item.type === 'consumable') fill(255, 100, 100); // 紅色代表消耗品
                else fill(200); // 其他用灰色
                 if (item.rarity === 'uncommon') stroke(0,255,0); else noStroke(); // 綠色邊框代表uncommon
                 if (item.rarity === 'rare') stroke(0,0,255);
                 if (item.rarity === 'legendary') stroke(163, 53, 238);


                ellipse(0, 0, inv.slotSize * 0.7, inv.slotSize * 0.7);
                 noStroke(); // Reset stroke for text
                pop();

                // 繪製數量 (如果是可堆疊且數量>1)
                if (item.stackable && item.quantity > 1) {
                    fill(255);
                    textSize(12);
                    textAlign(RIGHT, BOTTOM);
                    text(item.quantity, slotX + inv.slotSize - 4, slotY + inv.slotSize - 4);
                }
            }
        }
         pop();
    }

    renderEquipmentPanel() {
         const eq = this.equipmentPanel;
         const slots = [ // 定義顯示順序和標籤
              { key: 'weapon', label: '武器' },
              { key: 'helmet', label: '頭盔' },
              { key: 'armor', label: '胸甲' },
              { key: 'boots', label: '靴子' },
              { key: 'amulet', label: '項鍊' },
              { key: 'ring1', label: '戒指1' },
              { key: 'ring2', label: '戒指2' },
         ];

         push();
         // 繪製背景
         fill(30, 30, 30, 220);
         stroke(150);
         rect(eq.x, eq.y, eq.w, eq.h, 8);

         // 繪製標題
         fill(200);
         textSize(18);
         textAlign(CENTER, TOP);
         text(UIText.equip, eq.x + eq.w / 2, eq.y + eq.padding);


          // 繪製裝備格子
          let currentY = eq.y + eq.padding + 40; // Start below title
          for(const slotInfo of slots){
               const slotName = slotInfo.key;
               const slotLabel = slotInfo.label;
               const slotX = eq.x + eq.padding;

                // 繪製格子背景
                fill(50, 50, 50, 200);
                stroke(100);
                rect(slotX, currentY, eq.slotSize, eq.slotSize, 4);

                 // 繪製格子標籤 (在格子旁邊)
                 fill(180);
                 textSize(12);
                 textAlign(LEFT, CENTER);
                 text(slotLabel, slotX + eq.slotSize + eq.padding / 2, currentY + eq.slotSize / 2);


                 // 如果有裝備物品，繪製圖示
                 const item = player.equipment[slotName];
                 if (item) {
                     push();
                     translate(slotX + eq.slotSize / 2, currentY + eq.slotSize / 2);
                      // 根據物品類型或稀有度選擇顏色
                      fill(150, 150, 255); // Equipment color
                      if (item.rarity === 'uncommon') stroke(0,255,0); else noStroke();
                      if (item.rarity === 'rare') stroke(0,0,255);
                      if (item.rarity === 'legendary') stroke(163, 53, 238);

                     ellipse(0, 0, eq.slotSize * 0.7, eq.slotSize * 0.7);
                      noStroke();
                     pop();
                 }

               currentY += eq.slotSize + eq.padding; // Move to next slot position
                if (currentY + eq.slotSize > eq.y + eq.h - eq.padding) break; // 防止超出面板
          }

         pop();
    }


    renderTooltip() {
         if (!this.tooltip.show || !this.tooltip.text) return;

         push();
         textSize(13);
         textFont('sans-serif');
          let lines = this.tooltip.text.split('\n');
          let maxWidth = 0;
          lines.forEach(line => {
               // 移除顏色代碼計算寬度
               let cleanLine = line.replace(/\|c[0-9A-Fa-f]{8}/g, '').replace(/\|r/g, '');
               maxWidth = max(maxWidth, textWidth(cleanLine));
          });
          let textHeight = lines.length * 15; // 估算高度

         let tipW = maxWidth + 20;
         let tipH = textHeight + 15;
         let tipX = this.tooltip.x;
         let tipY = this.tooltip.y;

         // 防止 Tooltip 超出螢幕邊界
         if (tipX + tipW > width) {
             tipX -= (tipW + 30); // 移到滑鼠左邊
         }
         if (tipY + tipH > height) {
             tipY -= (tipH + 10); // 向上移動
         }
          tipX = max(0, tipX); // 不超出左邊界
          tipY = max(0, tipY); // 不超出上邊界


         // 繪製背景
         fill(10, 10, 10, 230);
         stroke(180, 180, 100); // 金色邊框
         rect(tipX, tipY, tipW, tipH, 5);

         // 繪製文字 (支持顏色代碼)
         let currentY = tipY + 15;
          lines.forEach(line => {
               let currentX = tipX + 10;
               let parts = line.split(/(\|c[0-9A-Fa-f]{8})|(\|r)/g).filter(Boolean); // 分割顏色代碼和文本

               push(); // 保存當前填充色
               textAlign(LEFT, TOP);
               textSize(13);

               parts.forEach(part => {
                    if (part.startsWith('|c')) {
                         let hexColor = '#' + part.substring(2);
                          // p5.js 的 fill 不直接支持 alpha hex，需要轉換或忽略 alpha
                          // 這裡簡單處理，只取 RGB
                          let r = parseInt(hexColor.substring(1, 3), 16);
                          let g = parseInt(hexColor.substring(3, 5), 16);
                          let b = parseInt(hexColor.substring(5, 7), 16);
                          fill(r, g, b);
                    } else if (part === '|r') {
                         fill(255); // 恢復預設白色 (或 Tooltip 的基礎顏色)
                    } else {
                         text(part, currentX, currentY);
                         currentX += textWidth(part);
                    }
               });
               pop(); // 恢復之前的填充色
               currentY += 15; // 下一行
          });

         pop();
     }

      // 繪製滑鼠位置的提示 (移動、攻擊、拾取等)
      renderMouseTooltip() {
          if (this.showInventory) return; // 背包打開時不顯示世界提示

          let worldMx = mouseX + camera.x;
          let worldMy = mouseY + camera.y;
          let hoverText = "";
           let hoverColor = color(255); // Default white

           // 檢查是否懸停在可拾取物品上
           let closestItemDistSq = TILE_SIZE * TILE_SIZE; // 物品拾取範圍
           let hoveredItem = null;
           for (let item of worldItems) {
               let dSq = distSq(worldMx, worldMy, item.pos.x, item.pos.y);
               if (dSq < item.pickupRadiusSq && dSq < closestItemDistSq) {
                   closestItemDistSq = dSq;
                   hoveredItem = item;
               }
           }
           if (hoveredItem) {
                hoverText = `${UIText.pickup}\n${hoveredItem.item.name}`;
                // 可以根據物品稀有度改變提示顏色
                 switch(hoveredItem.item.rarity){
                      case 'uncommon': hoverColor = color(0, 255, 0); break;
                      case 'rare': hoverColor = color(100, 100, 255); break;
                      case 'legendary': hoverColor = color(170, 50, 255); break;
                 }
           } else {
               // 檢查是否懸停在怪物上
               let closestMonsterDistSq = Infinity;
               let hoveredMonster = null;
               for (let monster of monsters) {
                    if(monster.state === 'dead') continue;
                   let dSq = distSq(worldMx, worldMy, monster.pos.x, monster.pos.y);
                   // 檢查是否在怪物圖形範圍內 (粗略)
                   if (dSq < (monster.size / 1.5)**2) {
                       hoveredMonster = monster;
                       break; // 找到第一個即可
                   }
               }
               if (hoveredMonster) {
                   hoverText = `${UIText.attackTarget}\n${hoveredMonster.name}\n${UIText.hp}: ${hoveredMonster.stats.hp}/${hoveredMonster.baseStats.maxHP}`;
                   hoverColor = color(255, 80, 80); // 紅色表示攻擊
               } else {
                    // 檢查是否懸停在 NPC 上
                    let hoveredNpc = null;
                     for(let npc of npcs) {
                          if(npc.state === 'dead') continue;
                          let dSq = distSq(worldMx, worldMy, npc.pos.x, npc.pos.y);
                          if (dSq < (npc.size / 1.5)**2) {
                              hoveredNpc = npc;
                              break;
                          }
                     }
                      if(hoveredNpc){
                           hoverText = `${hoveredNpc.name}\n(點擊互動)`;
                           hoverColor = color(100, 200, 255); // 青色表示互動
                      } else {
                           // 檢查是否懸停在出入口
                           if(currentMap.isOnExit(worldMx, worldMy)){
                                if (currentMap.isVillage) {
                                     hoverText = UIText.leaveVillage;
                                     hoverColor = color(255, 255, 100); // 黃色
                                }
                           } else if (currentMap.isOnVillageEntrance(worldMx, worldMy)) {
                                hoverText = UIText.enterVillage;
                                hoverColor = color(100, 255, 100); // 綠色
                           } else {
                               // 預設顯示 "移動到" (如果不是障礙物)
                               if (!currentMap.isObstacle(worldMx, worldMy) && !currentMap.isOutsideBounds(worldMx, worldMy)) {
                                   // hoverText = `${UIText.moveTo}\n(${floor(worldMx)}, ${floor(worldMy)})`; // 顯示座標
                                   // 或者不顯示文字，只改變滑鼠指標？
                               }
                           }
                      }
               }
           }


           if (hoverText) {
               push();
               fill(hoverColor);
               stroke(0, 180); // 文字加黑色邊框
               strokeWeight(2);
               textSize(14);
               textAlign(CENTER, BOTTOM);
               text(hoverText, mouseX, mouseY - 10); // 顯示在滑鼠指標上方
               pop();
           }
      }

}