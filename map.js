class GameMap {
    constructor(width, height, isVillage = false) {
        this.width = width; // 格子數
        this.height = height;
        this.isVillage = isVillage;
        this.grid = []; // 儲存地圖格子資訊 (0: 地板, 1: 牆壁, 2: 出入口, etc.)
        this.mapWidthPixels = this.width * TILE_SIZE;
        this.mapHeightPixels = this.height * TILE_SIZE;

        this.spawnPoints = []; // 怪物或 NPC 的出生點
        this.exitPoint = null; // 村莊的出入口座標 (像素)
        this.entryPoint = null; // 從野外進入村莊的入口座標 (像素)

        this.generateMap();
    }

    generateMap() {
        // --- 初始化網格 ---
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 0; // 預設為地板
            }
        }

        if (this.isVillage) {
            this.generateVillageLayout();
        } else {
            this.generateWildernessLayout();
        }
    }

    generateVillageLayout() {
        // 簡單村莊：周圍是牆，中間是空地，留一個出口
        const wall = MapSettings.wallThickness;
        const exitSide = floor(random(4)); // 0:上, 1:右, 2:下, 3:左
        let exitX = floor(this.width / 2);
        let exitY = floor(this.height / 2);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 建立外牆
                if (x < wall || x >= this.width - wall || y < wall || y >= this.height - wall) {
                    this.grid[y][x] = 1; // 牆壁
                }
            }
        }

        // 開一個出口
        const exitWidth = 2; // 出口寬度 (格子)
        if (exitSide === 0) { // 上
            exitY = wall -1; // 出口在內牆邊緣
             for(let i = 0; i < exitWidth; i++){
                  let currentX = floor(this.width / 2) - floor(exitWidth / 2) + i;
                  if(this.grid[exitY][currentX] !== undefined) this.grid[exitY][currentX] = 2; // 出口標記
             }
            this.exitPoint = createVector((floor(this.width / 2) + 0.5) * TILE_SIZE, (exitY - 0.5) * TILE_SIZE); // 出口在格子上方中間
            this.entryPoint = createVector((floor(this.width / 2) + 0.5) * TILE_SIZE, (exitY + 1.5) * TILE_SIZE); // 入口在出口下方一格
        } else if (exitSide === 1) { // 右
            exitX = this.width - wall;
             for(let i = 0; i < exitWidth; i++){
                 let currentY = floor(this.height / 2) - floor(exitWidth / 2) + i;
                 if(this.grid[currentY] && this.grid[currentY][exitX] !== undefined) this.grid[currentY][exitX] = 2;
             }
            this.exitPoint = createVector((exitX + 0.5) * TILE_SIZE, (floor(this.height / 2) + 0.5) * TILE_SIZE);
             this.entryPoint = createVector((exitX - 1.5) * TILE_SIZE, (floor(this.height / 2) + 0.5) * TILE_SIZE);
        } else if (exitSide === 2) { // 下
            exitY = this.height - wall;
             for(let i = 0; i < exitWidth; i++){
                  let currentX = floor(this.width / 2) - floor(exitWidth / 2) + i;
                  if(this.grid[exitY] && this.grid[exitY][currentX] !== undefined) this.grid[exitY][currentX] = 2;
             }
             this.exitPoint = createVector((floor(this.width / 2) + 0.5) * TILE_SIZE, (exitY + 0.5) * TILE_SIZE);
             this.entryPoint = createVector((floor(this.width / 2) + 0.5) * TILE_SIZE, (exitY - 1.5) * TILE_SIZE);
        } else { // 左
            exitX = wall - 1;
             for(let i = 0; i < exitWidth; i++){
                  let currentY = floor(this.height / 2) - floor(exitWidth / 2) + i;
                  if(this.grid[currentY] && this.grid[currentY][exitX] !== undefined) this.grid[currentY][exitX] = 2;
             }
             this.exitPoint = createVector((exitX - 0.5) * TILE_SIZE, (floor(this.height / 2) + 0.5) * TILE_SIZE);
             this.entryPoint = createVector((exitX + 1.5) * TILE_SIZE, (floor(this.height / 2) + 0.5) * TILE_SIZE);
        }
         console.log("村莊出口:", this.exitPoint);
          console.log("村莊入口:", this.entryPoint);


        // (可選) 在村莊內部隨機放置一些不可通行的裝飾物 (房子、樹等)
        for (let i = 0; i < 5; i++) {
             let houseX = floor(random(wall + 1, this.width - wall - 2));
             let houseY = floor(random(wall + 1, this.height - wall - 2));
             // 確保不堵住出口路徑 (簡單檢查)
             if (distSq(houseX * TILE_SIZE, houseY*TILE_SIZE, this.entryPoint.x, this.entryPoint.y) > (TILE_SIZE * 3)**2) {
                  this.grid[houseY][houseX] = 1; // 簡單用牆壁表示房子
                  if (this.grid[houseY+1]) this.grid[houseY+1][houseX] = 1; // 房子佔 1x2 格
             }
        }

         // 設定 NPC 出生點 (例如靠近中心或入口)
         this.spawnPoints.push(createVector((floor(this.width/2)+1) * TILE_SIZE, (floor(this.height/2)+1) * TILE_SIZE)); // 村長?
         this.spawnPoints.push(createVector(this.entryPoint.x + TILE_SIZE, this.entryPoint.y)); // 門口守衛?
         this.spawnPoints.push(createVector(this.entryPoint.x - TILE_SIZE, this.entryPoint.y)); // 另一個守衛?
         this.spawnPoints.push(createVector((floor(this.width*0.3)) * TILE_SIZE, (floor(this.height*0.7)) * TILE_SIZE)); // 農夫?

    }

    generateWildernessLayout() {
        // 使用 Perlin Noise 生成基礎地形
        noiseDetail(4, 0.5); // 調整 noise 細節
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let n = noise(x * MapSettings.noiseScale, y * MapSettings.noiseScale);
                if (n < 0.35) { // 低於閾值的是水域或深坑 (不可通行)
                    this.grid[y][x] = 3; // 水域
                } else if (n > 0.65) { // 高於閾值的是山脈或牆壁
                    this.grid[y][x] = 1; // 牆壁/山
                } else {
                    this.grid[y][x] = 0; // 可通行的草地/泥地
                }
            }
        }

        // (重要) 確保有一個區域是連通的，並且有一個入口點
        // 這裡使用簡化的 "Drunkard's Walk" 算法從中心點開始挖掘通道
        let drunkX = floor(this.width / 2);
        let drunkY = floor(this.height / 2);
        let steps = floor(this.width * this.height * 0.3); // 挖掘步數
        this.grid[drunkY][drunkX] = 0; // 起點設為可通行

        for (let i = 0; i < steps; i++) {
            let dir = floor(random(4)); // 0:上, 1:右, 2:下, 3:左
            switch (dir) {
                case 0: drunkY = max(1, drunkY - 1); break;
                case 1: drunkX = min(this.width - 2, drunkX + 1); break;
                case 2: drunkY = min(this.height - 2, drunkY + 1); break;
                case 3: drunkX = max(1, drunkX - 1); break;
            }
             if (this.grid[drunkY]) { // 確保 Y 座標有效
                 this.grid[drunkY][drunkX] = 0; // 挖掘
                 // 稍微加寬通道
                 if (this.grid[drunkY+1]) this.grid[drunkY+1][drunkX] = 0;
                 if (this.grid[drunkY][drunkX+1]) this.grid[drunkY][drunkX+1] = 0;
             } else {
                  // 如果 Y 無效，重置醉漢位置到中心，避免卡死在邊界外
                   drunkX = floor(this.width / 2);
                   drunkY = floor(this.height / 2);
             }

        }

        // 設定野外的入口點 (對應村莊出口) - 這需要全局協調
        // 假設村莊出口在野外地圖的某個邊緣附近
        // 這裡需要一個更好的方式來連接地圖，暫時隨機指定一個靠近中心的點
        let entryX = floor(this.width / 2);
        let entryY = floor(this.height / 2) + 5; // 假設在中心下方一點
        // 確保入口點是可通行的
        while(this.grid[entryY][entryX] !== 0 && entryY < this.height -1) {
            entryY++; // 向下找一個可通行的格子
        }
         if(this.grid[entryY][entryX] !== 0){ // 如果還是找不到
              entryX = floor(this.width / 2);
              entryY = floor(this.height / 2); // 回到中心
              this.grid[entryY][entryX] = 0; // 強制設為可通行
         }
        this.entryPoint = createVector((entryX + 0.5) * TILE_SIZE, (entryY + 0.5) * TILE_SIZE);
        this.exitPoint = this.entryPoint; // 野外的出口就是入口 (返回村莊)
        this.grid[entryY][entryX] = 4; // 特殊標記：返回村莊的入口

        console.log("野外入口:", this.entryPoint);

        // 設定怪物出生點 (在可通行的區域隨機選擇)
        let spawnAttempts = MapSettings.maxMonsters * 5; // 多嘗試幾次以確保足夠的點
         while (this.spawnPoints.length < MapSettings.maxMonsters * 1.5 && spawnAttempts > 0) { // 多生成一些備用
             let sx = floor(random(this.width));
             let sy = floor(random(this.height));
             // 確保出生點可通行，且距離入口有一定距離
             if (this.grid[sy] && this.grid[sy][sx] === 0 && distSq(sx * TILE_SIZE, sy * TILE_SIZE, this.entryPoint.x, this.entryPoint.y) > (TILE_SIZE * 10)**2) {
                 this.spawnPoints.push(createVector((sx + 0.5) * TILE_SIZE, (sy + 0.5) * TILE_SIZE));
             }
             spawnAttempts--;
         }
          console.log(`生成了 ${this.spawnPoints.length} 個野外出生點`);
    }


    // 根據像素座標獲取格子類型
    getTileType(pixelX, pixelY) {
        let gridX = floor(pixelX / TILE_SIZE);
        let gridY = floor(pixelY / TILE_SIZE);

        if (gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
            return this.grid[gridY][gridX];
        }
        return -1; // 超出邊界
    }

    // 檢查像素座標是否為障礙物
    isObstacle(pixelX, pixelY) {
        let tileType = this.getTileType(pixelX, pixelY);
        // 1: 牆壁, 3: 水域 是障礙物
        return tileType === 1 || tileType === 3;
    }

     // 檢查像素座標是否在地圖範圍外
     isOutsideBounds(pixelX, pixelY) {
         return pixelX < 0 || pixelX >= this.mapWidthPixels || pixelY < 0 || pixelY >= this.mapHeightPixels;
     }

     // 檢查是否踩到了出入口
     isOnExit(pixelX, pixelY) {
         if (!this.exitPoint) return false;
         // 使用一個小範圍來檢測，而不是精確點
         const exitRadiusSq = (TILE_SIZE * 1.0)**2;
         return distSq(pixelX, pixelY, this.exitPoint.x, this.exitPoint.y) < exitRadiusSq;
     }

     // 檢查是否踩到了返回村莊的入口 (野外地圖用)
     isOnVillageEntrance(pixelX, pixelY) {
          if (this.isVillage) return false; // 村莊地圖沒有這個
          let gridX = floor(pixelX / TILE_SIZE);
          let gridY = floor(pixelY / TILE_SIZE);
           if (gridY >= 0 && gridY < this.height && gridX >= 0 && gridX < this.width) {
               return this.grid[gridY][gridX] === 4; // 檢查特殊標記
           }
           return false;
     }


    // 獲取一個隨機的、可用的出生點
    getRandomSpawnPoint() {
        return randomFromArray(this.spawnPoints); // 從預先計算好的點中隨機選一個
    }


    render(offsetX, offsetY, screenWidth, screenHeight) {
        // 計算可視範圍的格子索引
        let startX = floor(offsetX / TILE_SIZE);
        let startY = floor(offsetY / TILE_SIZE);
        let endX = ceil((offsetX + screenWidth) / TILE_SIZE);
        let endY = ceil((offsetY + screenHeight) / TILE_SIZE);

        // 限制在邊界內
        startX = max(0, startX);
        startY = max(0, startY);
        endX = min(this.width, endX);
        endY = min(this.height, endY);

        push();
        translate(-offsetX, -offsetY); // 將畫布原點移動到相機左上角
        rectMode(CORNER);
        noStroke();

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                let tileType = this.grid[y][x];
                let tileX = x * TILE_SIZE;
                let tileY = y * TILE_SIZE;

                switch (tileType) {
                    case 0: // 地板 (草地/泥土)
                         if (this.isVillage) {
                             fill(210, 180, 140); // 村莊用棕褐色地板
                         } else {
                             fill(34, 139, 34); // 野外用深綠色草地
                             // 可以用 noise 再加點變化
                             let n = noise(x * 0.2, y * 0.2);
                             if (n > 0.6) fill(107, 142, 35); // 深黃綠色
                         }
                        break;
                    case 1: // 牆壁/山脈/障礙
                         if (this.isVillage) {
                            fill(139, 69, 19); // 村莊用棕色牆 (木頭/土牆?)
                         } else {
                             fill(105, 105, 105); // 野外用灰色石頭
                         }
                        break;
                    case 2: // 出口
                        fill(255, 255, 0, 150); // 半透明黃色標示出口區域
                         // 同時也畫地板
                         if (this.isVillage) fill(210, 180, 140); else fill(34, 139, 34);
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                         // 再疊加標示色
                         fill(255, 255, 0, 80);
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                        break;
                    case 3: // 水域
                        fill(0, 105, 148); // 深藍色
                        break;
                    case 4: // 返回村莊的入口 (野外)
                        fill(0, 255, 255, 150); // 半透明青色標示
                         // 同時畫地板
                         fill(34, 139, 34);
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                         // 疊加標示色
                         fill(0, 255, 255, 80);
                         rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                        break;
                    default: // 未知類型
                        fill(255, 0, 255); // 紫色表示錯誤
                }
                // 如果不是特殊標示色塊，才繪製基礎地形
                if (tileType !== 2 && tileType !== 4) {
                    rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                }

                 // (可選) 繪製格子線，方便除錯
                 // stroke(50, 50);
                 // strokeWeight(0.5);
                 // noFill();
                 // rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                 // noStroke();
            }
        }

        // 繪製地圖邊界 (用於調試)
        // stroke(255,0,0);
        // noFill();
        // rect(0, 0, this.mapWidthPixels, this.mapHeightPixels);

        pop(); // 恢復畫布狀態
    }
}