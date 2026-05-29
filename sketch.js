let bullets = [];
let enemies = [];
let playerX = 200, playerY = 200, playerH = 40, playerW = 40;
let knifeX = 0, knifeY = 0, knifeW = 30, knifeH = 10;
let easing = 0.02;
let attacked, attackedPlayer = false;
let score = 0;
let playerHealth = 100;
let gameOver, wipe, zombieHalfHealth = false;
let bigboyspawned, isChoosing = false;
let normalEnemyHealth = 100, bigBoyHealth = 500, playerDamage = 25;
let upgradeOptions = [];
let justaboolean, playerHeal = false;
let miniBossHealth = 25000, range = 30;
let miniBoss, playerHealFull = false;
let attackedCD = 20;
let knifeCDR = false
let gunDamage = 15
let spawnedMiniBoss, booleanJ = false
let maximumHealth = 100
// Weapon Toggle
let equipped = "knife";
let buff = false
let sac, dmgBuff = false

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0); 

  
  if (isChoosing) {
    drawUpgradeScreen();
    return;
  }
  if (sac) {
    playerDamage *= 2
    playerHealth *= 0.5
    sac = false
  }
  if (knifeCDR) {
    attackedCD = 1
  }
  if (score >= 200 && score % 100 == 0 && !buff && score < 500) {
    normalEnemyHealth *= 10
    miniBossHealth *= 10
    buff = true
  }
    if (score >= 500 && !buff) {
    normalEnemyHealth *= 20
    miniBossHealth *= 20
    bigBoyHealth *= 5
    buff = true
  }
  if (score >= 200 && score % 101) {
    buff = false
  }
  if (playerDamage >= 1000000000 && !dmgBuff) {
    normalEnemyHealth *= 50
    bigBoyHealth *= 10
    miniBossHealth *= 75
    dmgBuff = true
  }
  
  // --- STAT LOGIC ---
  if (zombieHalfHealth) { bigBoyHealth *= 0.5; normalEnemyHealth *= 0.5; miniBossHealth *= 0.75; zombieHalfHealth = false; }

  if (score % 211 == 0 && score != 0) {
    buff = false
  }
  if (justaboolean) { bigBoyHealth *= 3; normalEnemyHealth *= 2; justaboolean = false; booleanJ = true; }

  if (miniBoss && score % 99 == 0 && score != 0) {
    spawnMiniBoss();
    miniBoss = false;
    range += 21;
    bigBoyHealth *= 2;
    spawnedMiniBoss = true
  }
  if (playerHeal) { playerHealth += 20; playerHeal = false; }
  if (playerHealFull) { playerHealth = maximumHealth; playerHealFull = false; }
  if (score % 99 == 0 && score != 0 && !spawnedMiniBoss) { miniBoss = true; miniBossHealth *= 5 }
  if (score % 120 == 0) { range = 30; score++; spawnedMiniBoss = false }
  if (score % 20 == 0 && score != 0 && !booleanJ) { justaboolean = true; }
  if (score % 21 == 0 && booleanJ) {
    booleanJ = false
  }
  if (playerHealth > maximumHealth) {
    playerHealth = maximumHealth
  }
  // --- PLAYER COLOR & DRAW ---
  fill(0, 255, 0); 
  if (playerHealth <= 90 && playerHealth > 75) { fill(154, 205, 25); }
  if (playerHealth <= 75 && playerHealth > 50) { fill(255, 255, 0); }
  if (playerHealth <= 50 && playerHealth > 25) { fill(255, 150, 0); }
  if (playerHealth <= 25 && playerHealth > 10) { fill(255, 75, 0); }
  if (playerHealth <= 10) { fill(255, 0, 0); }

  playerX = constrain(playerX, 0, width);
  playerY = constrain(playerY, 0, height);
  ellipse(playerX, playerY, playerH, playerW);

  textSize(20);
  fill(255);
  text("Health: " + playerHealth, 50, 25);
  text("Score: " + score, 200, 25);

  // --- MOVEMENT ---
  if (keyIsDown(87)) { playerY -= 3; knifeW = 10; knifeH = -30; }
  if (keyIsDown(65)) { playerX -= 3; knifeX = playerX - 40; }
  if (keyIsDown(83)) { playerY += 3; knifeW = 10; knifeH = 30; }
  if (keyIsDown(68)) { playerX += 3; }
  
  // --- WEAPON DISPLAY ---
  if (equipped === "knife") {
    fill(220); 
    if (!keyIsDown(65)) { knifeX = playerX + 10; }
    if (!keyIsDown(87) && !keyIsDown(83)) { knifeW = 30; knifeH = 10; }
    if (keyIsDown(87) && keyIsDown(65)) { knifeX = playerX - 15; }
    if (keyIsDown(83) && keyIsDown(65)) { knifeX = playerX - 15; }
    knifeY = playerY;
    rect(knifeX, knifeY, knifeW, knifeH);
  } else if (equipped === "gun") {
    let angle = atan2(mouseY - playerY, mouseX - playerX);
    push();
    translate(playerX, playerY);
    rotate(angle);         
    fill(220);
    rect(0, 0, 30, 10); 
    rect(0, 0, 10, 20);
    pop();
  }

  // --- BULLET LOGIC ---
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += cos(b.angle) * b.speed;
    b.y += sin(b.angle) * b.speed;
    fill(255, 255, 0);
    ellipse(b.x, b.y, 10, 10);

    for (let j = enemies.length - 1; j >= 0; j--) {
      if (!enemies[j]) continue;
      let d = dist(b.x, b.y, enemies[j].x, enemies[j].y);
      if (d < 5 + (enemies[j].size/2)) { 
        bullets.splice(i, 1);
        enemies[j].health -= gunDamage; 
        break;
      }
    }
  }

  // --- ENEMY SPAWNING ---
  if (frameCount % 90 == 0 && !spawnedMiniBoss) { spawnEnemy(); }
  if (spawnedMiniBoss && frameCount % 270 == 0) {
    spawnEnemy();
  }
  if (score % 10 == 0 && !bigboyspawned && score != 0) { spawnBigBoy(); bigboyspawned = true; }
  if (score % 11 == 0 && score!= 0) { bigboyspawned = false; }
  if (score % 10 == 0 && score != 0) { generateUpgrades(); isChoosing = true; }

  // --- ENEMY LOOP ---
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i]; 
    if (!enemy) continue; // Safety check for Wipe Field

    let dx = playerX - enemy.x;
    let dy = playerY - enemy.y;
    enemy.x += dx * easing;
    enemy.y += dy * easing;

    if (enemy.size == 50) { fill(255, 255, 0); }
    else if (enemy.size == 30) { fill(0, 255, 0); }
    else if (enemy.size == 100) { fill(255, 100, 0); }
    ellipse(enemy.x, enemy.y, enemy.size);
    
    fill(255);
    textAlign(CENTER);
    text(floor(enemy.health), enemy.x, enemy.y - 25);

    if (enemy.health <= 0)  {
      enemies.splice(i, 1);
      score++;
    }

    if (abs(playerX - enemy.x) <= range && abs(playerY - enemy.y) <= range && !attackedPlayer) {
      if (enemy.size == 50) playerHealth -= 10;
      else if (enemy.size == 100) playerHealth -= 20;
      else playerHealth -= 5;
      attackedPlayer = true;
    }
  }

  if (attacked && frameCount % attackedCD == 0) attacked = false;
  if (attackedPlayer && frameCount % 20 == 0) attackedPlayer = false;
  
  if (playerHealth <= 0) {
    textSize(25); fill(255, 0 ,0); text("GAME OVER", 150, 150);
    gameOver = true; noLoop();
  }
}

function keyPressed() {
  if (key === '1') equipped = "knife";
  if (key === '2') equipped = "gun";
}

function mousePressed() {
  if (isChoosing) {
    for (let i = 0; i < upgradeOptions.length; i++) {
      let yPos = 120 + i * 80;
      if (mouseX > width/4 && mouseX < width*3/4 && mouseY > yPos && mouseY < yPos + 60) {
        applyUpgrade(upgradeOptions[i]);
        isChoosing = false;
        score++;
      }
    }
    return;
  }

  if (equipped === "gun") {
    let angle = atan2(mouseY - playerY, mouseX - playerX);
    bullets.push({ x: playerX, y: playerY, speed: 7, angle: angle });
  } else {
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i]; 
      if (abs(playerX - enemy.x) <= 80 && abs(playerY - enemy.y) <= 80 && !attacked) {
        enemy.health -= playerDamage;
        attacked = true;
      }
    }
  }

  if (gameOver) {
    playerHealth = 100; gameOver = false; playerDamage = 25; bigBoyHealth = 500; gunDamage = 15; knifeCDR = false; attackedCD = 20;
    normalEnemyHealth = 100; score = 0; enemies = []; bullets = []; loop();
  }
}

// --- UPGRADE SYSTEM ---

function getWeightedUpgrade(options) {
  let totalWeight = 0;
  for (let item of options) { totalWeight += item.weight; }
  let randomRoll = random(totalWeight);
  for (let item of options) {
    if (randomRoll < item.weight) { return item; }
    randomRoll -= item.weight;
  }
}

function generateUpgrades() {
  let pool = [
    { name: "+5 Damage", type: "power", value: 5, weight: 80, color: [100, 100, 100] },
    { name: "Heal 20 HP", type: "heal", value: 20, weight: 80, color: [100, 100, 100] },
    { name: "+10 Damage", type: "power", value: 10, weight: 60, color: [0, 100, 200] },
    { name: "Half Enemy HP", type: "enemy", value: 0, weight: 45, color: [150, 0, 150] },
    { name: "Wipe Field", type: "wipe", value: 0, weight: 10, color: [0, 255, 200] },
    { name: "Double Damage", type: "mult", value: 2, weight: 25, color: [255, 255, 0] },
    { name: "Full Heal", type: "heal2", value: 100, weight: 25, color: [255, 255, 0] },
    { name: "TRIPLE Damage", type: "mult", value: 3, weight: 10, color: [0, 255, 200] },
    { name: "Knife CoolDown Removed", type: "knife", value: 0, weight: 1, color: [155, 30, 46] },
    { name: "5x Damage...", type: "mult", value: 5, weight: 1, color: [155, 30, 46] },
    { name: "Increase Maximum Health", type: "hp+", value: 2, weight: 10, color: [0, 255, 200]},
    { name: "x2 Damage, Half Health", type: "multiple", value: 0, weight: 35, color: [150, 0, 150]}
  ];
  upgradeOptions = [];
  for(let i=0; i<3; i++){ 
    upgradeOptions.push(getWeightedUpgrade(pool)); 
  }
}

function drawUpgradeScreen() {
  background(20, 20, 20, 200);
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text("PICK AN UPGRADE", width/2, 80);
  for (let i = 0; i < upgradeOptions.length; i++) {
    let yPos = 120 + i * 80;
    let c = upgradeOptions[i].color;
    fill(c[0], c[1], c[2]); 
    rect(width/4, yPos, width/2, 60, 10);
    fill(255);
    textSize(18);
    text(upgradeOptions[i].name, width/2, yPos + 35);
  }
}

function applyUpgrade(upgrade) {
  if (upgrade.type === "power") {
    playerDamage += upgrade.value;
    gunDamage += (upgrade.value * 0.75);
  }
  else if (upgrade.type === "mult") {
    playerDamage *= upgrade.value;
    gunDamage *= (upgrade.value * 0.75);
  }
  else if (upgrade.type === "heal") playerHeal = true;
  else if (upgrade.type === "wipe") { enemies = []; } // Immediate clear
  else if (upgrade.type === "enemy") zombieHalfHealth = true;
  else if (upgrade.type === "heal2") playerHealFull = true;
  else if (upgrade.type === "knife") knifeCDR = true
  else if (upgrade.type === "hp+") maximumHealth *= 
  upgrade.value
  else if (upgrade.type === "multiple") sac = true
}

// --- SPAWNERS ---
function spawnEnemy() { enemies.push({ x: random(0, width), y: -30, health: normalEnemyHealth, size: 30 }); }
function spawnBigBoy() { enemies.push({ x: random(0, width), y: -30, health: bigBoyHealth, size: 50 }); }
function spawnMiniBoss() { enemies.push({ x: random(0, width), y: -30, health: miniBossHealth, size: 100 }); }
