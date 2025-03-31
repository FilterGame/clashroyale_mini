// utils.js
function distSq(x1, y1, x2, y2) {
    // 計算兩點距離的平方 (避免開根號，效能較好)
    let dx = x1 - x2;
    let dy = y1 - y2;
    return dx * dx + dy * dy;
}

function lerpVector(startVec, endVec, amount) {
    // 向量線性插值
    let x = lerp(startVec.x, endVec.x, amount);
    let y = lerp(startVec.y, endVec.y, amount);
    return createVector(x, y);
}

function randomFromArray(arr) {
    // 從陣列隨機選取一個元素
    if (!arr || arr.length === 0) return null;
    return arr[floor(random(arr.length))];
}

// 可以加入更多輔助函式，例如檢查點是否在矩形內、角度計算等
```