// game.js - 게임의 핵심 로직을 담당합니다.

console.log("게임 로직이 시작되었습니다!");

// Zone 데이터 정의
const zones = {
    forest: { name: '시작의 숲', material: 'slimeCore', dropChance: 0.5, monsterIconKey: 'slime', monsterHp: 10, unlockCondition: () => true },
    cave: { name: '어두운 동굴', material: 'goblinEar', dropChance: 0.3, monsterIconKey: 'goblin', monsterHp: 100, unlockCondition: (state) => state.materials.monsterKillsByZone.forest >= 100 * (state.prestigeLevel + 1), unlockText: (state) => `시작의 숲 몬스터 ${100 * (state.prestigeLevel + 1)}마리 처치` },
    ruins: { name: '저주받은 폐허', material: 'cursedBone', dropChance: 0.2, monsterIconKey: 'skeleton', monsterHp: 600, unlockCondition: (state) => state.bosses.giantSpider.isDefeated, unlockText: "보스 '거대 거미' 처치" },
    volcano: { name: '화산 지대', material: 'fireEssence', dropChance: 0.15, monsterIconKey: 'fireGolem', monsterHp: 2500, unlockCondition: (state) => state.bosses.skeletonKing.isDefeated, unlockText: "보스 '해골 왕' 처치" },
    mountain: { name: '혹한의 설산', material: 'frostCrystal', dropChance: 0.1, monsterIconKey: 'iceGolem', monsterHp: 15000, unlockCondition: (state) => state.bosses.cursedKing.isDefeated, unlockText: "'저주받은 왕' 처치" },
    rift: { name: '차원의 균열', material: 'dimensionalFragment', dropChance: 0.1, monsterIconKey: 'dimensionalShadow', monsterHp: 50000, unlockCondition: (state) => state.materials.ancientMapPiece >= 4, unlockText: "고대의 지도 조각 4개 수집" }
};

// Boss 데이터 정의
const bosses = {
    skeletonKing: {
        name: '해골 왕',
        hp: 2500000,
        zone: 'ruins',
        iconKey: 'skeletonKing',
        reward: {
            soulShards: 1000000,
            materials: { ancientCore: 1, ancientMapPiece: 1 }
        }
    },
    giantSpider: {
        name: '거대 거미',
        hp: 1000000,
        zone: 'cave',
        iconKey: 'giantSpider',
        reward: {
            soulShards: 500000,
            materials: { venomGland: 1, ancientMapPiece: 1 }
        }
    }, 
    cursedKing: {
        name: '저주받은 왕',
        hp: 10000000,
        zone: 'volcano', // 화산 지대에서 소환
        iconKey: 'cursedKing',
        reward: {
            soulShards: 5000000,            
            materials: { ancientMapPiece: 1, cursedSoul: 1 }
        }
    },
    frostQueen: {
        name: '서리 여왕',
        hp: 25000000,
        zone: 'mountain',
        iconKey: 'frostQueen',
        reward: {
            soulShards: 25000000,
            materials: { queensHeart: 1, ancientMapPiece: 1 }
        }
    },
    dimensionEater: {
        name: '차원 포식자',
        hp: 1000000000,
        zone: 'rift',
        iconKey: 'dimensionEater',
        reward: {
            soulShards: 100000000
        }
    }
};

// 유물 데이터 정의
const artifacts = {
    ancientRunestone: {
        name: '고대의 룬스톤',
        description: '모든 패시브 스킬(연쇄 번개, 지옥불 일격)의 피해량이 25% 증가합니다.',
        unlockLevel: 2,
        iconKey: 'ancientRunestone'
    },
    chaliceOfLife: {
        name: '생명의 성배',
        description: '10초마다 현재 초당 공격력의 5배에 해당하는 영혼의 파편을 추가로 획득합니다.',
        unlockLevel: 5,
        iconKey: 'chaliceOfLife'
    },
    hourglassOfTime: {
        name: '시간의 모래시계',
        description: '가속 물약의 공격 속도 증가 효과가 2배에서 4배로 증폭됩니다.',
        unlockLevel: 8,
        iconKey: 'hourglassOfTime'
    },
    tomeOfSecrets: {
        name: '비밀의 고서',
        description: '치명타 피해량이 영구적으로 50% 증가합니다.',
        unlockLevel: 10,
        iconKey: 'tomeOfSecrets'
    },
    blacksmithsWhetstone: {
        name: '대장장이의 숫돌',
        description: "'공격력 강화'로 올린 모든 공격력의 10%만큼 추가 공격력을 얻습니다.",
        unlockLevel: 15,
        iconKey: 'blacksmithsWhetstone'
    },
    luckyHorseshoe: {
        name: '행운의 편자',
        description: '모든 재료 아이템의 기본 획득 확률이 5% 증가합니다.',
        unlockLevel: 20,
        iconKey: 'luckyHorseshoe'
    }
};

// 스킨 보너스 데이터 정의
const skinBonuses = {
    bloodSword: { attacksPerSecond: 1 },
    obsidianSword: { attacksPerSecond: 3 },
    holySword: { attacksPerSecond: 5 },
    corruptedSword: { attacksPerSecond: 7 },
    dimensionalSword: { attacksPerSecond: 10 }
};


// 도전 과제 데이터 정의
const achievements = {
    reach100Atk: {
        name: '첫걸음',
        description: '초당 공격력 300 달성',
        isCompleted: () => calculateDps() >= 300,
        reward: { permanentAtk: 10 },
        rewardText: '영구 공격력 +10'
    },
    attack100: {
        name: '백번의 칼날',
        description: '총 100회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 100,
        reward: { permanentAtk: 100 },
        rewardText: '영구 공격력 +100'
    },
    attack1000: {
        name: '천번의 단련',
        description: '총 1,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 1000,
        reward: { permanentAtk: 1000 },
        rewardText: '영구 공격력 +1k'
    },
    attack10000: {
        name: '만 번의 숙련',
        description: '총 10,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 10000,
        reward: { permanentAtk: 10000 },
        rewardText: '영구 공격력 +10k'
    },
    attack100000: {
        name: '십만 번의 경지',
        description: '총 100,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 100000,
        reward: { permanentAtk: 100000 },
        rewardText: '영구 공격력 +100k'
    },
    attack1000000: {
        name: '백만 번의 전설',
        description: '총 1,000,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 1000000,
        reward: { permanentAtk: 1000000 },
        rewardText: '영구 공격력 +1M'
    },
    firstEvolution: {
        name: '진화의 시작',
        description: '1차 진화 달성',
        isCompleted: (state) => state.evolutionLevel >= 1,
        reward: { permanentAtk: 100 },
        rewardText: '영구 공격력 +100'
    },
    defeatGiantSpider: {
        name: '거미 공포증',
        description: '보스 거대 거미 처치',
        isCompleted: (state) => state.bosses.giantSpider.isDefeated,
        reward: { permanentAtk: 200 },
        rewardText: '영구 공격력 +200'
    },
    reachPrestige1: {
        name: '최초의 계승자',
        description: '계승자의 증표 1레벨 달성',
        isCompleted: (state) => state.prestigeLevel >= 1,
        reward: { skin: 'bloodSword' },
        rewardText: '스킨: 피의 검'
    },
    reachPrestige5: {
        name: '계승의 길',
        description: '계승자의 증표 5레벨 달성',
        isCompleted: (state) => state.prestigeLevel >= 5,
        reward: { skin: 'obsidianSword' },
        rewardText: '스킨: 흑요석 검'
    },
    poisonMaster: {
        name: '독의 대가',
        description: '독 레벨 50 달성',
        isCompleted: () => calculatePassiveStats().currentStats.poisonLevel >= 50,
        reward: { permanentAtk: 500 },
        rewardText: '영구 공격력 +500'
    },
    reach1kAtk: {
        name: '숙련된 검사',
        description: '초당 공격력 3,000 달성',
        isCompleted: () => calculateDps() >= 30000,
        reward: { permanentAtk: 1000 },
        rewardText: '영구 공격력 +1k'
    },
    secondEvolution: {
        name: '힘의 폭주',
        description: '2차 진화 달성',
        isCompleted: (state) => state.evolutionLevel >= 2,
        reward: { permanentAtk: 2000 },
        rewardText: '영구 공격력 +2k'
    },
    defeatSkeletonKing: {
        name: '왕의 자격',
        description: '보스 해골 왕 처치',
        isCompleted: (state) => state.bosses.skeletonKing.isDefeated,
        reward: { permanentAtk: 3000 },
        rewardText: '영구 공격력 +3k'
    },
    defeatCursedKing: {
        name: '저주를 끊은 자',
        description: '보스 저주받은 왕 처치',
        isCompleted: (state) => state.bosses.cursedKing.isDefeated,
        reward: { permanentAtk: 5000 },
        rewardText: '영구 공격력 +5k'
    },
    reachPrestige10: {
        name: '시간의 여행자',
        description: '계승자의 증표 10레벨 달성',
        isCompleted: (state) => state.prestigeLevel >= 10,
        reward: { skin: 'holySword' },
        rewardText: '스킨: 신성한 검'
    },
    thirdEvolution: {
        name: '궁극의 경지',
        description: '3차 진화 달성',
        isCompleted: (state) => state.evolutionLevel >= 3,
        reward: { permanentAtk: 10000 },
        rewardText: '영구 공격력 +10k'
    },
    reachPrestige15: {
        name: '차원의 방랑자',
        description: '계승자의 증표 15레벨 달성',
        isCompleted: (state) => state.prestigeLevel >= 15,
        reward: { skin: 'corruptedSword' },
        rewardText: '스킨: 타락한 검'
    },
    defeatFrostQueen: {
        name: '얼음 심장',
        description: '보스 서리 여왕 처치',
        isCompleted: (state) => state.bosses.frostQueen.isDefeated,
        reward: { permanentAtk: 20000 },
        rewardText: '영구 공격력 +20k'
    },
    reachPrestige20: {
        name: '전설의 계승자',
        description: '계승자의 증표 20레벨 달성',
        isCompleted: (state) => state.prestigeLevel >= 20,
        reward: { skin: 'dimensionalSword' },
        rewardText: '스킨: 차원의 검'
    },
    defeatDimensionEater: {
        name: '차원의 수호자',
        description: '궁극의 보스 차원 포식자 처치',
        isCompleted: (state) => state.bosses.dimensionEater.isDefeated || state.prestigeLevel >= 1,
        reward: { permanentAtk: 500000 },
        rewardText: '영구 공격력 +500k'
    },
    reachSoulReap10: {
        name: '영혼의 탐식가',
        description: '영혼 수확 10레벨 달성',
        isCompleted: () => calculatePassiveStats().currentStats.soulReapLevel >= 10,
        reward: { permanentAtk: 1000 },
        rewardText: '영구 공격력 +1k'
    }
};

// 게임 상태 초기값을 별도의 객체로 분리하여 재사용성을 높입니다.
const initialGameState = {
    soulShards: 0,
    attackPower: 1,
    attackInterval: 1000, // ms per attack
    attackSpeedUpgradeCost: 500,
    attackUpgradeCost: 10,
    materials: {
        slimeCore: 0,
        goblinEar: 0,
        cursedBone: 0,
        ancientCore: 0,
        venomGland: 0,
        fireEssence: 0,
        cursedSoul: 0,
        frostCrystal: 0,
        monsterKillsByZone: {
            forest: 0,
            cave: 0,
            ruins: 0,
            volcano: 0,
            mountain: 0,
            rift: 0
        },
        dimensionalFragment: 0,
        queensHeart: 0,
        ancientMapPiece: 0
    },
    soulReapLevel: 0,
    soulReapUpgradeCost: 1000,
    poisonLevel: 0,
    critChance: 0,
    curseDamage: 0,
    fireLevel: 0,
    frostLevel: 0,
    critDamage: 1.5,
    potions: {
        swiftness: 0,
        luck: 0
    },
    isPotionActive: false,
    isLuckPotionActive: false,
    currentZone: 'forest',
    evolutionLevel: 0,
    totalAttacks: 0,
    attackCountForPassive: 0,
    bosses: {
        skeletonKing: { isDefeated: false },
        giantSpider: { isDefeated: false },
        cursedKing: { isDefeated: false },
        frostQueen: { isDefeated: false },
        dimensionEater: { isDefeated: false }
    },
    currentBoss: null,
    isGameFinished: false,
    prestigeLevel: 0,
    artifacts: {
        ancientRunestone: false,
        chaliceOfLife: false,
        hourglassOfTime: false,
        tomeOfSecrets: false,
        blacksmithsWhetstone: false,
        luckyHorseshoe: false
    },
    completedAchievements: {
        reach100Atk: false,
        attack100: false,
        attack1000: false,
        attack10000: false,
        attack100000: false,
        attack1000000: false,
        reachPrestige1: false,
        firstEvolution: false,
        defeatGiantSpider: false,
        reachPrestige5: false,
        poisonMaster: false,
        reach1kAtk: false,
        secondEvolution: false,
        defeatSkeletonKing: false,
        defeatCursedKing: false,
        reachPrestige10: false,
        thirdEvolution: false,
        reachPrestige15: false,
        defeatFrostQueen: false,
        reachPrestige20: false,
        defeatDimensionEater: false,
        reachSoulReap10: false
    },
    unlockedSkins: {
        bloodSword: false,
        obsidianSword: false,
        holySword: false,
        corruptedSword: false,
        dimensionalSword: false
    },
    currentSkin: 'default',
    showToastPopups: true,
    offeredMaterials: {
        ancientCore: false,
        venomGland: false,
        queensHeart: false,
        cursedSoul: false
    }
};

let currentMonster = {
    hp: 100
};

// 1. 게임 데이터(상태) 관리
let gameState = JSON.parse(JSON.stringify(initialGameState)); // Deep copy
let gameLoopIntervalId = null;
let isSwiftnessPotionChainActive = false;
let isLuckPotionChainActive = false;
let bossTimeLeft = 60;
let isResetting = false; // 회차 전환 중 루프 실행을 막기 위한 플래그
let chaliceIntervalId = null;
let lastAttackTime = 0; // 마지막 공격 시간을 기록하여 정확한 공격 속도를 보장합니다.
let swiftnessPotionTimeoutId = null;
let luckPotionTimeoutId = null; // 물약 타이머 ID
let totalDamage = 0; // 데미지 계산을 위한 전역 변수

// --- 전투 로그 기능 ---
function addLogMessage(message, type = 'normal') {
    if (!gameState.showToastPopups) return; // 토스트 팝업이 꺼져있으면 함수 종료

    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.createElement('div');
    toastMessage.className = `toast-message ${type}`;
    toastMessage.textContent = message;

    toastContainer.appendChild(toastMessage);

    // 최대 4개의 로그만 유지
    if (toastContainer.children.length > 4) {
        toastContainer.removeChild(toastContainer.firstChild);
    }

    // 애니메이션 시간(4초)이 지나면 DOM에서 제거
    setTimeout(() => {
        // 요소가 여전히 부모를 가지고 있는지 확인 후 제거 (중복 제거 방지)
        if (toastMessage.parentElement === toastContainer) {
            toastContainer.removeChild(toastMessage);
        }
    }, 4000);
}

// --- 애니메이션 기능 ---
function triggerAnimation(elementId, animationClass) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add(animationClass);
        // 애니메이션이 끝나면 클래스 제거
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }
}

// --- 시각 효과(VFX) 기능 ---
function showVfx(effectClass) {
    const vfxContainer = document.getElementById('vfx-container');
    const vfxElement = document.createElement('div');
    vfxElement.className = `vfx ${effectClass}`;
    vfxContainer.appendChild(vfxElement);

    vfxElement.addEventListener('animationend', () => {
        vfxElement.remove();
    }, { once: true });
}

// --- 플로팅 데미지 텍스트 기능 ---
function showDamageText(damage, type = 'normal') {
    const container = document.getElementById('damage-text-container');
    if (!container) return;

    const damageEl = document.createElement('div');
    damageEl.className = `damage-text ${type}`;

    // 타입에 따라 아이콘 추가
    const iconKey = gameIcons[type];
    if (iconKey) {
        damageEl.innerHTML = `<span class="icon">${iconKey}</span>` + formatNumber(damage);
    } else {
        damageEl.textContent = formatNumber(damage);
    }
    container.appendChild(damageEl);

    damageEl.addEventListener('animationend', () => {
        damageEl.remove();
    });
}

// --- 숫자 포맷팅 기능 ---
function formatNumber(num) {
    if (num >= 1e12) { // 1조 (Trillion)
        return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
    }
    if (num >= 1e9) { // 10억 (Billion)
        return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1e6) { // 100만 (Million)
        return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1e3) { // 1천 (Kilo)
        return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.round(num);
}

// --- 저장/불러오기 기능 ---
const saveKey = 'legendSwordSaveData';

function saveGame() {
    gameState.lastSaveTime = Date.now();
    localStorage.setItem(saveKey, JSON.stringify(gameState));
    console.log("게임 데이터가 저장되었습니다.");
}

function loadGame() {
    const savedData = localStorage.getItem(saveKey);
    if (savedData) {
        // 불러오기 전에 모든 타이머와 전역 변수를 초기화합니다.
        fullReset();

        try {
            const loadedState = JSON.parse(savedData);

            // Deep merge to ensure new properties are not lost
            // This handles nested objects like 'materials' and 'potions'
            for (const key in loadedState) {
                if (Object.prototype.hasOwnProperty.call(loadedState, key)) {
                    if (typeof loadedState[key] === 'object' && loadedState[key] !== null && !Array.isArray(loadedState[key])) {
                        // 'bosses', 'artifacts', 'completedAchievements', 'unlockedSkins' 같은 중첩 객체를 안전하게 병합합니다.
                        if (['bosses', 'artifacts', 'completedAchievements'].includes(key)) {
                            if (gameState[key]) { // gameState에 해당 키가 존재하는지 확인
                                Object.assign(gameState[key], loadedState[key]);
                            }
                        } else if (key === 'unlockedSkins' || key === 'offeredMaterials') {
                             // unlockedSkins는 initialGameState의 모든 키를 포함하도록 보장합니다.
                             if (initialGameState[key]) {
                                gameState[key] = Object.assign({}, initialGameState[key], loadedState[key]);
                             } else {
                                gameState[key] = loadedState[key];
                             }
                        }else {
                            gameState[key] = Object.assign({}, gameState[key] || {}, loadedState[key]);
                        }
                    } else {
                        gameState[key] = loadedState[key];
                    }
                }
            }

            // 이전 버전 저장 데이터와의 호환성을 위해, 새로 추가된 숫자 속성이 undefined이면 0으로 초기화합니다.
            if (typeof gameState.totalAttacks !== 'number') {
                gameState.totalAttacks = 0;
            }

            console.log("저장된 데이터를 불러왔습니다.");
        } catch (e) {
            console.error("저장된 데이터를 불러오는 중 오류가 발생했습니다. 새 게임을 시작합니다.", e);
        }
    } else {
        console.log("저장된 데이터가 없습니다. 새 게임을 시작합니다.");
    }
}

function fullReset() {
    // 1. 모든 활성 게임 루프 및 타이머 중지
    stopGameLoop();
    if (chaliceIntervalId) {
        clearInterval(chaliceIntervalId);
        chaliceIntervalId = null;
    }
    if (swiftnessPotionTimeoutId) {
        clearTimeout(swiftnessPotionTimeoutId);
        swiftnessPotionTimeoutId = null;
    }
    if (luckPotionTimeoutId) {
        clearTimeout(luckPotionTimeoutId);
        luckPotionTimeoutId = null;
    }

    // 보스전 타이머가 활성화되어 있다면 중지
    if (gameState.currentBoss) {
        if (gameState.currentBoss.timerId) clearTimeout(gameState.currentBoss.timerId);
        if (gameState.currentBoss.intervalId) clearInterval(gameState.currentBoss.intervalId);
    }

    // 2. 모든 관련 전역 변수 초기화
    lastAttackTime = 0;
    isSwiftnessPotionChainActive = false;
    isLuckPotionChainActive = false;
    bossTimeLeft = 60;
    isResetting = false;
    totalDamage = 0;
    currentMonster = {
        hp: zones[initialGameState.currentZone].monsterHp
    };
}

function resetGame() {
    if (confirm("정말로 모든 진행 상황을 초기화하시겠습니까?")) {
        localStorage.removeItem(saveKey);
        // 데이터를 삭제한 후 페이지를 새로고침하여
        // 오프닝 화면부터 다시 시작하도록 합니다.
        window.location.reload();
    }
}

function toggleToastPopups() {
    gameState.showToastPopups = !gameState.showToastPopups;
    const button = document.getElementById('toast-toggle-button');
    button.textContent = gameState.showToastPopups ? '토스트 팝업 끄기' : '토스트 팝업 켜기';
    addLogMessage(`토스트 팝업이 ${gameState.showToastPopups ? '활성화' : '비활성화'}되었습니다.`, 'special');
}

function runFromBoss() {
    if (!gameState.currentBoss) {
        return;
    }
 
    // 타이머를 먼저 정리합니다.
    // 보스 타이머 중지
    if (gameState.currentBoss.timerId) {
        clearTimeout(gameState.currentBoss.timerId);
    }
    // 보스 타이머 인터벌도 중지
    if (gameState.currentBoss.intervalId) {
        clearInterval(gameState.currentBoss.intervalId);
    }

    const bossName = bosses[gameState.currentBoss.id].name;
    addLogMessage(`😱 ${bossName}에게서 도망쳤습니다...`, 'error');

    gameState.currentBoss = null;

    // 일반 몬스터로 다시 전환
    const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    currentMonster.hp = monsterMaxHp;
    updateDisplay();
}
// --- 오버레이 메뉴 기능 ---
function openOverlay(overlayId) {
    closeAllOverlays();
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function closeAllOverlays() {
    document.getElementById('status-overlay').style.display = 'none';
    document.getElementById('shop-overlay').style.display = 'none';
    document.getElementById('achievements-overlay').style.display = 'none';
    document.getElementById('settings-overlay').style.display = 'none';
    document.getElementById('guide-overlay').style.display = 'none';
    document.getElementById('offline-reward-overlay').style.display = 'none';
}

// 2. 화면에 데이터를 업데이트하는 함수
function updateDisplay() {
    // 모든 능력치 계산을 함수 시작 부분에서 한 번만 수행하여 데이터 일관성을 보장합니다.    
    let { currentStats, attackInterval, attacksPerSecond } = calculatePassiveStats();

    // 가속 물약 효과를 여기서도 반영하여 UI에 즉시 표시되도록 합니다.
    if (gameState.isPotionActive) {
        const speedMultiplier = gameState.artifacts.hourglassOfTime ? 4 : 2; // 모래시계 유물 효과
        attackInterval /= speedMultiplier;
        // 화면 표시용 attacksPerSecond도 다시 계산합니다.
        attacksPerSecond = (parseFloat(attacksPerSecond) * speedMultiplier).toFixed(2);
    }

    const totalDps = calculateDps(currentStats, attackInterval, parseFloat(attacksPerSecond)); // 수정된 attackInterval을 전달

    document.getElementById('soul-shards-count').textContent = formatNumber(gameState.soulShards);

    // 회차 보너스 표시
    const prestigeBonusDisplay = document.getElementById('prestige-bonus-display');
    if (gameState.prestigeLevel > 0) {
        prestigeBonusDisplay.style.display = 'block';
        document.getElementById('prestige-damage-bonus').textContent = (gameState.prestigeLevel * 1).toFixed(1); // 이 부분은 DPS 계산과 별개로 순수 보너스만 표시
        document.getElementById('prestige-luck-bonus').textContent = (gameState.prestigeLevel * 0.5).toFixed(1);
    } else {
        prestigeBonusDisplay.style.display = 'none';
    }

    document.getElementById('prestige-level-display').textContent = gameState.prestigeLevel;

    document.getElementById('slime-core-count').textContent = formatNumber(gameState.materials.slimeCore);
    document.getElementById('goblin-ear-count').textContent = formatNumber(gameState.materials.goblinEar);
    document.getElementById('cursed-bone-count').textContent = formatNumber(gameState.materials.cursedBone);
    document.getElementById('ancient-core-count').textContent = formatNumber(gameState.materials.ancientCore);
    document.getElementById('venom-gland-count').textContent = formatNumber(gameState.materials.venomGland);
    document.getElementById('cursed-soul-count').textContent = formatNumber(gameState.materials.cursedSoul);
    document.getElementById('fire-essence-count').textContent = formatNumber(gameState.materials.fireEssence);
    document.getElementById('frost-crystal-count').textContent = formatNumber(gameState.materials.frostCrystal);
    document.getElementById('queens-heart-count').textContent = formatNumber(gameState.materials.queensHeart);
    document.getElementById('dimensional-fragment-count').textContent = formatNumber(gameState.materials.dimensionalFragment);
    document.getElementById('map-piece-count').textContent = formatNumber(gameState.materials.ancientMapPiece);
    document.getElementById('swiftness-potion-count').textContent = gameState.potions.swiftness;
    document.getElementById('luck-potion-count').textContent = gameState.potions.luck;
    
    // 물약 버튼 활성/비활성 상태 업데이트
    const swiftnessBtn = document.getElementById('swiftness-potion-button');
    const swiftnessCooldownEl = swiftnessBtn.querySelector('.potion-cooldown');
    const luckBtn = document.getElementById('luck-potion-button');
    const luckCooldownEl = luckBtn.querySelector('.potion-cooldown');

    // .active 클래스는 이제 사용하지 않으므로 제거합니다.
    swiftnessBtn.classList.remove('active');
    luckBtn.classList.remove('active');
    // 물약 개수 실시간 표시
    document.getElementById('swiftness-potion-btn-count').textContent = gameState.potions.swiftness;
    document.getElementById('luck-potion-btn-count').textContent = gameState.potions.luck;

    document.getElementById('current-zone-display').textContent = zones[gameState.currentZone].name;
    
    // 현재 지역 몬스터 처치 횟수 표시
    const currentZoneId = gameState.currentZone;
    const killsInCurrentZone = gameState.materials.monsterKillsByZone[currentZoneId] || 0;
    const killCountDisplay = document.getElementById('zone-kill-count-display');
    killCountDisplay.textContent = `(해당 지역 처치 수: ${formatNumber(killsInCurrentZone)})`;

    document.getElementById('current-zone-display').textContent = zones[gameState.currentZone].name;

    // 상세 능력치 및 속성 레벨 업데이트 (계산된 값 사용)
    document.getElementById('total-dps-display').textContent = formatNumber(totalDps);
    document.getElementById('permanent-atk-display').textContent = formatNumber(gameState.attackPower);
    document.getElementById('total-attacks-display').textContent = formatNumber(gameState.totalAttacks);
    document.getElementById('crit-chance-display').textContent = (currentStats.critChance * 100).toFixed(2);
    document.getElementById('crit-damage-display').textContent = currentStats.critDamage.toFixed(2);
    document.getElementById('attack-speed-display').textContent = attacksPerSecond;

    document.getElementById('poison-level-display').textContent = formatNumber(currentStats.poisonLevel);
    document.getElementById('poison-dps-display').textContent = formatNumber(currentStats.poisonLevel * 2);
    document.getElementById('fire-level-display').textContent = formatNumber(currentStats.fireLevel);
    document.getElementById('fire-damage-display').textContent = formatNumber((currentStats.attackPower * 0.2) * currentStats.fireLevel);
    document.getElementById('frost-level-display').textContent = formatNumber(currentStats.frostLevel);
    document.getElementById('frost-damage-display').textContent = formatNumber((currentStats.attackPower * 0.1) * currentStats.frostLevel);
    const curseLevel = Math.floor(Math.log2(gameState.materials.cursedBone + 1));
    document.getElementById('curse-level-display').textContent = formatNumber(curseLevel);
    document.getElementById('curse-dps-display').textContent = formatNumber(currentStats.curseDamage);

    // 지역 정복 현황 업데이트
    const conquestStatusEl = document.getElementById('conquest-status');
    conquestStatusEl.innerHTML = ''; // 기존 내용 초기화
    for (const zoneId in gameState.materials.monsterKillsByZone) {
        const kills = gameState.materials.monsterKillsByZone[zoneId];
        const requiredKills = 100 * (gameState.prestigeLevel + 1);
        const zoneName = zones[zoneId].name;
        const isMastered = kills >= requiredKills;
        const conquestDiv = document.createElement('div');
        conquestDiv.className = `conquest-item ${isMastered ? 'mastered' : ''}`;
        conquestDiv.innerHTML = `
            <span>${zoneName}: ${kills} / ${requiredKills} 마리</span>
            ${isMastered ? '<span class="mastery-badge">정복 완료</span>' : ''}`;
        conquestStatusEl.appendChild(conquestDiv);
    }

    document.getElementById('soul-reap-level-display').textContent = formatNumber(currentStats.soulReapLevel);
    document.getElementById('soul-reap-bonus-display').textContent = (currentStats.soulReapLevel * 5).toFixed(0);

    // 요약 바 상세 능력치
    document.getElementById('summary-crit-chance-display').textContent = `${(currentStats.critChance * 100).toFixed(1)}%`;
    document.getElementById('summary-attack-speed-display').textContent = attacksPerSecond;
    document.getElementById('summary-total-attacks-display').textContent = formatNumber(gameState.totalAttacks);

    // 유물 UI 업데이트
    const artifactZone = document.getElementById('artifact-zone');
    const artifactList = document.getElementById('artifact-list');
    artifactList.innerHTML = '';
    let hasArtifact = false;
    for (const artifactId in gameState.artifacts) {
        if (gameState.artifacts[artifactId]) {
            hasArtifact = true;
            const artifactData = artifacts[artifactId];
            const artifactIcon = `<span class="icon" data-tooltip='${artifactData.name}: ${artifactData.description}'>${gameIcons[artifactData.iconKey]}</span>`;
            artifactList.innerHTML += artifactIcon;
        }
    }
    artifactZone.style.display = hasArtifact ? 'block' : 'none';

    // 상태창 제물 UI 업데이트 (이제 사용 안함)
    const offeredSacrificesZone = document.getElementById('offered-sacrifices-zone');
    const offeredSacrificesList = document.getElementById('offered-sacrifices-list');
    offeredSacrificesZone.style.display = 'none'; // 상태창에서는 숨김

    // 전투화면 하단 제물 요약 UI 업데이트
    const sacrificesSummaryZone = document.getElementById('sacrifices-summary-zone');
    const sacrificesSummaryList = document.getElementById('sacrifices-summary-list');
    sacrificesSummaryList.innerHTML = '';
    let hasOffered = false;
    if (gameState.offeredMaterials) {
        for (const materialId in gameState.offeredMaterials) {
            if (gameState.offeredMaterials[materialId]) {
                hasOffered = true;
                const materialName = { ancientCore: '고대의 핵', venomGland: '맹독 주머니', queensHeart: '여왕의 심장', cursedSoul: '저주받은 영혼' }[materialId];
                const materialIcon = `<span class="icon" data-tooltip='${materialName} 바침 (영구 공격력 x2)'>${gameIcons[materialId]}</span>`;
                sacrificesSummaryList.innerHTML += materialIcon;
            }
        }
    }
    sacrificesSummaryZone.style.display = hasOffered ? 'flex' : 'none';

    // 도전 과제 UI 업데이트
    const achievementPanel = document.getElementById('achievement-panel');
    achievementPanel.innerHTML = '';
    let hasClaimableAchievement = false;
    if (!gameState.completedAchievements) {
        // 만약 불러온 데이터에 completedAchievements가 없다면, 오류를 방지하기 위해 함수를 여기서 중단합니다.
        // loadGame이 완료되면 이 문제는 해결됩니다.
        return;
    }
    for (const achievementId in achievements) {
        const achievementData = achievements[achievementId];
        const isCompleted = achievementData.isCompleted(gameState);
        const isClaimed = gameState.completedAchievements[achievementId];

        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        if (isClaimed) {
            achievementDiv.classList.add('completed');
        }

        let buttonHtml = '';
        if (isCompleted && !isClaimed) {
            // 과제 완료 시 '보상 받기' 버튼 대신 즉시 보상을 지급합니다.
            claimAchievementReward(achievementId);
            buttonHtml = `<span>완료</span>`;
        } else if (isClaimed) {
            buttonHtml = `<span>완료</span>`;
        }

        achievementDiv.innerHTML = `
            <div class="achievement-info">
                <h4>${achievementData.name}</h4>
                <p>${achievementData.description} (보상: ${achievementData.rewardText})</p>
            </div>
            ${buttonHtml}
        `;
        achievementPanel.appendChild(achievementDiv);
    }

    // 수령할 과제가 있으면 버튼에 표시
    const achievementsButton = document.querySelector('#nav-bar button[onclick="openOverlay(\'achievements-overlay\')"]');
    // 자동 보상 시스템으로 변경되었으므로, 더 이상 알림이 필요하지 않습니다.
    if (achievementsButton) achievementsButton.classList.remove('has-reward');

    // 검 외형 및 진화 UI 업데이트
    updateSwordAppearance();
    updateEvolutionButton();

    // 사냥터 버튼 상태 업데이트
    const zoneButtons = document.querySelectorAll('#zone-buttons button');
    zoneButtons.forEach(button => {
        const zoneId = button.dataset.zone;
        const zoneData = zones[zoneId];
        const isLocked = zoneData && !zoneData.unlockCondition(gameState);
        if (isLocked) {
            button.disabled = true;
            const newTooltip = `해금 조건: ${typeof zoneData.unlockText === 'function' ? zoneData.unlockText(gameState) : zoneData.unlockText}`;
            if (button.getAttribute('data-tooltip') !== newTooltip) {
                button.setAttribute('data-tooltip', newTooltip);
            }
        } else {
            button.disabled = false;
            button.removeAttribute('data-tooltip');
        }
        // 현재 활성화된 사냥터 버튼 강조
        if (zoneId === gameState.currentZone) {
            button.classList.add('active-zone');
        } else {
            button.classList.remove('active-zone');
        }
    });

    // 보스전 UI 업데이트
    const bossSummonButton = document.getElementById('boss-summon-button');
    const runFromBossButton = document.getElementById('run-from-boss-button');
    let bossAvailableInZone = null;
    
    // 현재 지역에서 소환 가능한, 아직 처치하지 않은 보스를 찾습니다.
    for (const bossId in bosses) {
        if (bosses[bossId].zone === gameState.currentZone && !gameState.bosses[bossId].isDefeated) {
            bossAvailableInZone = bossId;
            break; // 첫 번째로 찾은 보스를 대상으로 설정
        }
    }

    if (bossAvailableInZone && !gameState.currentBoss) { // 보스전 중이 아닐 때만 소환 버튼 표시
        runFromBossButton.style.display = 'none';
        const bossZone = bosses[bossAvailableInZone].zone;
        const killsInZone = gameState.materials.monsterKillsByZone[bossZone];
        const requiredKills = 100 * (gameState.prestigeLevel + 1);

        bossSummonButton.style.display = 'inline-block';
        if (killsInZone >= requiredKills) {
            bossSummonButton.disabled = false;
            bossSummonButton.textContent = `보스 소환: ${bosses[bossAvailableInZone].name}`;
            bossSummonButton.onclick = () => startBossFight(bossAvailableInZone);
        } else {
            bossSummonButton.disabled = true;
            bossSummonButton.textContent = `보스 소환 (${killsInZone}/${requiredKills})`;
            bossSummonButton.onclick = null;
        }
    } else {
        runFromBossButton.style.display = gameState.currentBoss ? 'inline-block' : 'none';
        bossSummonButton.style.display = 'none';
    }
    
    // 토스트 팝업 버튼 텍스트 업데이트
    const toastToggleButton = document.getElementById('toast-toggle-button');
    toastToggleButton.textContent = gameState.showToastPopups ? '토스트 팝업 끄기' : '토스트 팝업 켜기';

    if (gameState.isGameFinished) {
        showEnding();
    }

    // 스킨 변경 버튼 표시 여부
    document.getElementById('change-skin-button').style.display = Object.values(gameState.unlockedSkins).some(unlocked => unlocked) ? 'inline-block' : 'none';

    if (gameState.currentBoss) {
        runFromBossButton.style.display = 'inline-block';
        document.getElementById('monster-container').innerHTML = gameIcons[bosses[gameState.currentBoss.id].iconKey];
        const bossHpBar = document.getElementById('boss-hp-bar');
        const bossData = bosses[gameState.currentBoss.id];
        const hpPercent = (gameState.currentBoss.hp / gameState.currentBoss.maxHp) * 100;
        document.getElementById('boss-hp-bar-container').style.display = 'block';
        bossHpBar.style.width = `${hpPercent}%`;

        // HP 비율에 따라 클래스 변경
        bossHpBar.classList.remove('boss-hp-high', 'boss-hp-medium', 'boss-hp-low');
        if (hpPercent > 70) {
            bossHpBar.classList.add('boss-hp-high');
        } else if (hpPercent > 30) {
            bossHpBar.classList.add('boss-hp-medium');
        } else {
            bossHpBar.classList.add('boss-hp-low');
        }

        document.getElementById('boss-hp-text').textContent = `${bossData.name} HP: ${formatNumber(gameState.currentBoss.hp)} / ${formatNumber(gameState.currentBoss.maxHp)}`;
        document.getElementById('boss-timer').style.display = 'block';
        document.getElementById('boss-time-left').textContent = bossTimeLeft;
    } else {
        document.getElementById('monster-container').innerHTML = gameIcons[zones[gameState.currentZone].monsterIconKey];
        document.getElementById('boss-hp-bar-container').style.display = 'none';
        document.getElementById('boss-timer').style.display = 'none';
    }

    // 요약 바 업데이트
    document.getElementById('summary-shards-count').textContent = formatNumber(gameState.soulShards);
    document.getElementById('summary-dps-count').textContent = formatNumber(totalDps);
    document.getElementById('summary-slime-core-count').textContent = formatNumber(gameState.materials.slimeCore);
    document.getElementById('summary-goblin-ear-count').textContent = formatNumber(gameState.materials.goblinEar);
    document.getElementById('summary-cursed-bone-count').textContent = formatNumber(gameState.materials.cursedBone);
    document.getElementById('summary-fire-essence-count').textContent = formatNumber(gameState.materials.fireEssence);
    document.getElementById('summary-frost-crystal-count').textContent = formatNumber(gameState.materials.frostCrystal);
    document.getElementById('summary-map-piece-count').textContent = formatNumber(gameState.materials.ancientMapPiece);
    document.getElementById('summary-dimensional-fragment-count').textContent = formatNumber(gameState.materials.dimensionalFragment);

    // 일반 몬스터 HP 바 업데이트
    const monsterHpBarContainer = document.querySelector('.monster-hp-bar-container');
    if (gameState.currentBoss) {
        monsterHpBarContainer.style.display = 'none';
    } else {
        monsterHpBarContainer.style.display = 'block';
        const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 2));
        const monsterHpPercent = (Math.max(0, currentMonster.hp) / monsterMaxHp) * 100;
        document.getElementById('monster-hp-bar').style.width = `${monsterHpPercent}%`;
    }
}

// --- 아이콘 초기화 ---
function initializeIcons() {
    document.getElementById('icon-shards').innerHTML = gameIcons.coin;
    document.getElementById('icon-slime-core').innerHTML = gameIcons.slime;
    document.getElementById('icon-goblin-ear').innerHTML = gameIcons.goblin;
    document.getElementById('icon-cursed-bone').innerHTML = gameIcons.bone;
    document.getElementById('icon-ancient-core').innerHTML = gameIcons.ancientCore;
    document.getElementById('icon-venom-gland').innerHTML = gameIcons.venomGland;
    document.getElementById('icon-cursed-soul').innerHTML = gameIcons.cursedSoul;
    document.getElementById('icon-fire-essence').innerHTML = gameIcons.fireEssence;
    document.getElementById('icon-frost-crystal').innerHTML = gameIcons.frostCrystal;
    document.getElementById('icon-queens-heart').innerHTML = gameIcons.queensHeart;
    document.getElementById('icon-dimensional-fragment').innerHTML = gameIcons.dimensionalFragment;
    document.getElementById('icon-prestige').innerHTML = gameIcons.prestige;    
    document.getElementById('icon-potion').innerHTML = gameIcons.swiftnessPotion;
    document.getElementById('icon-map-piece').innerHTML = gameIcons.ancientMapPiece;
    document.getElementById('icon-permanent-atk').innerHTML = gameIcons.dps; // dps 아이콘 재사용
    document.getElementById('icon-stats-details').innerHTML = gameIcons.settings;
    document.getElementById('icon-total-attacks').innerHTML = gameIcons.dps; // dps 아이콘 재사용
    document.getElementById('icon-crit-chance').innerHTML = gameIcons.critChance;
    document.getElementById('icon-crit-damage').innerHTML = gameIcons.critDamage;
    document.getElementById('icon-attack-speed').innerHTML = gameIcons.attackSpeed;
    document.getElementById('icon-skill-levels').innerHTML = gameIcons.book;
    document.getElementById('icon-poison-level').innerHTML = gameIcons.venomGland;
    document.getElementById('icon-fire-level').innerHTML = gameIcons.fireEssence;
    document.getElementById('icon-frost-level').innerHTML = gameIcons.frostCrystal;
    document.getElementById('icon-curse-level').innerHTML = gameIcons.curseDamage;
    document.getElementById('icon-soul-reap-level').innerHTML = gameIcons.soulReaper;
    document.getElementById('nav-icon-status').innerHTML = gameIcons.upgrade;
    document.getElementById('nav-icon-shop').innerHTML = gameIcons.cart;
    document.getElementById('nav-icon-achievements').innerHTML = gameIcons.achievement;
    document.getElementById('summary-icon-shards').innerHTML = gameIcons.coin;
    document.getElementById('nav-icon-settings').innerHTML = gameIcons.settings;
    document.getElementById('icon-settings').innerHTML = gameIcons.settings;
    document.getElementById('icon-guide').innerHTML = gameIcons.book;
    document.getElementById('summary-icon-dps').innerHTML = gameIcons.dps;
    document.getElementById('summary-icon-slime-core').innerHTML = gameIcons.slime;
    document.getElementById('summary-icon-goblin-ear').innerHTML = gameIcons.goblin;
    document.getElementById('summary-icon-cursed-bone').innerHTML = gameIcons.bone;
    document.getElementById('summary-icon-fire-essence').innerHTML = gameIcons.fireEssence;
    document.getElementById('summary-icon-frost-crystal').innerHTML = gameIcons.frostCrystal;
    document.getElementById('summary-icon-crit-chance').innerHTML = gameIcons.critChance;
    document.getElementById('summary-icon-total-attacks').innerHTML = gameIcons.dps; // dps 아이콘 재사용
    document.getElementById('summary-icon-dimensional-fragment').innerHTML = gameIcons.dimensionalFragment;
    document.getElementById('summary-icon-attack-speed').innerHTML = gameIcons.attackSpeed;
    document.getElementById('summary-icon-map-piece').innerHTML = gameIcons.ancientMapPiece;    
    document.getElementById('icon-swiftness-potion').innerHTML = gameIcons.swiftnessPotion;
    document.getElementById('icon-luck-potion-btn').innerHTML = gameIcons.luckPotion;
    document.getElementById('icon-achievement').innerHTML = gameIcons.achievement;
    document.getElementById('icon-artifact').innerHTML = gameIcons.prestige;
    document.getElementById('icon-luck-potion').innerHTML = gameIcons.luckPotion;
    document.getElementById('icon-dps').innerHTML = gameIcons.dps;
    document.getElementById('icon-shop').innerHTML = gameIcons.cart;
    document.getElementById('icon-evolution-trigger').innerHTML = gameIcons.upgrade;
    document.getElementById('zone-icon-forest').innerHTML = gameIcons.zoneForest;
    document.getElementById('icon-offline-reward').innerHTML = gameIcons.hourglassOfTime;
    document.getElementById('zone-icon-cave').innerHTML = gameIcons.zoneCave;
    document.getElementById('zone-icon-ruins').innerHTML = gameIcons.zoneRuins;
    document.getElementById('zone-icon-volcano').innerHTML = gameIcons.zoneVolcano;
    document.getElementById('zone-icon-mountain').innerHTML = gameIcons.zoneMountain;
    document.getElementById('zone-icon-rift').innerHTML = gameIcons.dimensionalShadow;
    document.getElementById('icon-sacrifices').innerHTML = gameIcons.offering;
}


// --- 게임 시작 ---

function claimAchievementReward(achievementId, isAuto = false) {
    if (!achievements[achievementId]) return;
    const achievementData = achievements[achievementId];
    if (!achievementData || gameState.completedAchievements[achievementId] || !achievementData.isCompleted(gameState)) {
        return;
    }

    // 자동 보상 지급이 아니고, 수동으로 클릭했을 때만 로그를 남깁니다.
    if (!isAuto) {
        addLogMessage(`도전 과제 완료: [${achievementData.name}]! 보상을 획득했습니다.`, 'special');
    }
    // 보상 지급
    const reward = achievementData.reward;
    if (reward.permanentAtk) {
        gameState.attackPower += reward.permanentAtk;
    }
    if (reward.skin) {
        gameState.unlockedSkins[reward.skin] = true;
        addLogMessage(`새로운 스킨 [${reward.skin}]을 획득했습니다!`, 'special');
    }
    gameState.completedAchievements[achievementId] = true;
}

// 4. 상점 기능
const materialPrices = {
    slimeCore: { sell: 5, buy: 25 },
    goblinEar: { sell: 15, buy: 75 },
    cursedBone: { sell: 40, buy: 200 },
    fireEssence: { sell: 100, buy: 500 },
    frostCrystal: { sell: 250, buy: 1250 }
};

function sellMaterial(material, quantity) {
    if (!materialPrices[material]) {
        addLogMessage("판매할 수 없는 아이템입니다.", 'error');
        return;
    }

    let sellCount = 0;
    if (quantity === 'max') {
        sellCount = gameState.materials[material];
    } else {
        sellCount = Math.min(quantity, gameState.materials[material]);
    }

    if (sellCount > 0) {
        gameState.materials[material] -= sellCount;
        gameState.soulShards += materialPrices[material].sell * sellCount;
        updateDisplay();
        triggerAnimation('soul-shards-count', 'pulse-animation');
    } else {
        addLogMessage(`판매할 ${material}이(가) 없습니다.`, 'error');
    }
}

const potionCosts = {
    swiftness: 100,
    luck: 200
};

function buyItem(item, quantity) {
    let baseCost;
    let isPotion = false;

    if (potionCosts[item]) {
        baseCost = potionCosts[item];
        isPotion = true;
    } else if (materialPrices[item]?.buy) {
        baseCost = materialPrices[item].buy;
    } else {
        addLogMessage("구매할 수 없는 아이템입니다.", 'error');
        return;
    }

    const singleItemCost = Math.max(1, Math.round(baseCost));
    let buyQuantity = quantity;

    if (quantity === 'max') {
        if (singleItemCost <= 0) return; // 0으로 나누는 오류 방지
        buyQuantity = Math.floor(gameState.soulShards / singleItemCost);
    }

    if (buyQuantity <= 0) {
        addLogMessage("영혼의 파편이 부족합니다.", 'error');
        return;
    }

    const totalCost = singleItemCost * buyQuantity;

    if (gameState.soulShards >= totalCost) {
        gameState.soulShards -= totalCost;
        if (isPotion) {
            gameState.potions[item] += buyQuantity;
        } else {
            gameState.materials[item] += buyQuantity;
        }
        updateDisplay();
    } else {
        addLogMessage(`영혼의 파편이 부족합니다! (필요: ${formatNumber(totalCost)})`, 'error');
    }
}

function useSwiftnessPotion() {
    if (isSwiftnessPotionChainActive) {
        isSwiftnessPotionChainActive = false;
        addLogMessage("가속 물약 자동 사용을 중단합니다.", 'special');
        return;
    }
    if (gameState.potions.swiftness > 0) {
        isSwiftnessPotionChainActive = true;
        consumeNextSwiftnessPotion();
    } else {
        addLogMessage("가속 물약이 없습니다.", 'error');
    }
}

function consumeNextSwiftnessPotion() {
    if (!isSwiftnessPotionChainActive || gameState.potions.swiftness <= 0) {
        isSwiftnessPotionChainActive = false;
        gameState.isPotionActive = false;
        document.querySelector('#swiftness-potion-button .potion-cooldown').style.height = '0%';
        updateDisplay();
        return;
    }

    gameState.isPotionActive = true;
    gameState.potions.swiftness--;
    updateDisplay();

    const duration = 10000; // 10초

    // 쿨다운 시각 효과 시작
    const cooldownEl = document.querySelector('#swiftness-potion-button .potion-cooldown');
    if (cooldownEl) {
        cooldownEl.classList.remove('cooldown-animation');
        void cooldownEl.offsetWidth; // Reflow to restart animation
        cooldownEl.style.animationDuration = `${duration / 1000}s`;
        cooldownEl.classList.add('cooldown-animation');
    }

    swiftnessPotionTimeoutId = setTimeout(consumeNextSwiftnessPotion, duration);
}

function useLuckPotion() {
    if (isLuckPotionChainActive) {
        isLuckPotionChainActive = false;
        addLogMessage("행운 물약 자동 사용을 중단합니다.", 'special');
        return;
    }
    if (gameState.potions.luck > 0) {
        isLuckPotionChainActive = true;
        consumeNextLuckPotion();
    } else {
        addLogMessage("행운 물약이 없습니다.", 'error');
    }
}

function consumeNextLuckPotion() {
    if (!isLuckPotionChainActive || gameState.potions.luck <= 0) {
        isLuckPotionChainActive = false;
        gameState.isLuckPotionActive = false;
        document.querySelector('#luck-potion-button .potion-cooldown').style.height = '0%';
        updateDisplay();
        return;
    }

    gameState.isLuckPotionActive = true;
    gameState.potions.luck--;
    updateDisplay();

    const duration = 10000; // 10초
    // 쿨다운 시각 효과 시작
    const cooldownEl = document.querySelector('#luck-potion-button .potion-cooldown');
    if (cooldownEl) {
        cooldownEl.classList.remove('cooldown-animation');
        void cooldownEl.offsetWidth; // Reflow to restart animation
        cooldownEl.style.animationDuration = `${duration / 1000}s`;
        cooldownEl.classList.add('cooldown-animation');
    }

    luckPotionTimeoutId = setTimeout(consumeNextLuckPotion, duration);
}


// 5-1. 보스전 기능
function startBossFight(bossId) {
    const bossData = bosses[bossId];
    if (gameState.currentZone !== bossData.zone) {
        addLogMessage("이 지역에서는 해당 보스를 소환할 수 없습니다.", 'error');
        return;
    }
    if (gameState.bosses[bossId] && gameState.bosses[bossId].isDefeated) {
        addLogMessage("이미 처치한 보스입니다.", 'error');
        return;
    }
    if (gameState.currentBoss) {
        addLogMessage("이미 다른 보스와 전투 중입니다.", 'error');
        return;
    }

    // 회차에 따라 보스 체력 및 보상 조정
    // 보스 체력 증가율을 완화합니다. (예: 2배 -> 1.5배)
    let prestigeMultiplier = 1 + (gameState.prestigeLevel * 20.0); // 회차당 체력 증가율

    // 5회차부터 보스 체력 추가로 2배 증가
    if (gameState.prestigeLevel >= 5) {
        prestigeMultiplier *= 2;
    }

    // '시간의 모래시계' 유물 획득 시 보스 체력 추가로 10배 증가
    if (gameState.artifacts.hourglassOfTime) {
        prestigeMultiplier *= 10;
    }
    const bossHp = Math.round(bossData.hp * prestigeMultiplier);

    // 타이머 시작 (회차에 따라 제한 시간 감소, 최소 10초)
    const timeLimit = Math.max(10, 60 - (gameState.prestigeLevel * 2));
    bossTimeLeft = Math.ceil(timeLimit);
    const { intervalId, timerId } = startBossTimer(bossId, timeLimit);

    gameState.currentBoss = { id: bossId, hp: bossHp, maxHp: bossHp, startTime: Date.now(), intervalId: intervalId, timerId: timerId };
    addLogMessage(`💀 ${bossData.name}이(가) 모습을 드러냈습니다!`, 'special');
    updateDisplay();
}

// 5. 사냥터 변경
function changeZone(zoneName) {
    if (gameState.isGameFinished) return; // 게임 종료 시 지역 변경 불가

    // 해금 조건 확인
    if (zones[zoneName] && !zones[zoneName].unlockCondition(gameState)) {
        addLogMessage("아직 이 지역으로 이동할 수 없습니다.", 'error');
        return;
    }

    if (zones[zoneName]) {
        gameState.currentZone = zoneName;
        // 지역 변경 시 새로운 몬스터 생성
        // 일반 몬스터 체력 증가율을 완화합니다. (예: 100% -> 50%)
        const monsterMaxHp = zones[zoneName].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
        currentMonster.hp = monsterMaxHp;
        triggerAnimation('monster-container', 'monster-spawn-animation');
        closeAllOverlays();
        updateDisplay();
    } else {
        console.error("존재하지 않는 지역입니다: " + zoneName);
    }
}

// 6. 게임 루프 (핵심 동작)
function runGameLoop() {
    if (gameState.isGameFinished || isResetting) return;

    const now = Date.now();    
    let { currentStats, attackInterval: baseAttackInterval, attacksPerSecond } = calculatePassiveStats(); // Get base values

    // 가속 물약 효과
    if (gameState.isPotionActive) {
        const speedMultiplier = gameState.artifacts.hourglassOfTime ? 4 : 2;
        baseAttackInterval /= speedMultiplier; // Apply potion effect to the base interval
    }

    // 마지막 공격 시간으로부터 attackInterval만큼 지났는지 확인
    if (now - lastAttackTime < baseAttackInterval) { // Use the potentially modified interval
        return; // 아직 공격할 시간이 아니면 함수 종료
    }
    // 루프 지연이 너무 길어져(예: 백그라운드 탭) 공격이 한번에 몰아서 실행되는 것을 방지합니다.
    // lastAttackTime이 현재 시간보다 너무 과거이면 현재 시간으로 재설정합니다.
    if (now > lastAttackTime + baseAttackInterval * 2) {
        lastAttackTime = now;
    }
    lastAttackTime += baseAttackInterval; // 다음 공격 시간을 예약합니다.
    
    // 총 공격 횟수 증가
    gameState.totalAttacks++;

    // 공격 속도에 맞춰 애니메이션 속도 조절
    const swordContainer = document.getElementById('sword-container');
    // 애니메이션이 공격 간격보다 약간 빠르게 끝나도록 설정 (최소 0.05초)
    const animationDuration = Math.max(0.05, (baseAttackInterval / 1000) * 0.8); // Use the potentially modified interval
    swordContainer.style.animationDuration = `${animationDuration}s`;

    // --- 데미지 계산 ---
    let currentAttackPower = currentStats.attackPower; // 이 변수는 이 함수 내에서만 사용됩니다.
    // 대장장이의 숫돌 유물 효과
    if (gameState.artifacts.blacksmithsWhetstone) {
        currentAttackPower *= 1.10;
    }

    // 치명타 계산
    let finalAttackPower = currentAttackPower;
    let critDamage = currentStats.critDamage;
    if (gameState.artifacts.tomeOfSecrets) {
        critDamage += 0.5;
    }
    let isCrit = false;
    if (Math.random() < currentStats.critChance) {
        isCrit = true;
        finalAttackPower *= critDamage;
        triggerAnimation('monster-container', 'monster-shake-animation');
        triggerAnimation('sword-container', 'crit-attack-animation');
    }

    // 화염 부여 (화상 효과)
    if (currentStats.fireLevel > 0 && Math.random() < 0.1) { // 10% 확률로 화상
        const burnDamage = (currentStats.attackPower * 0.2) * currentStats.fireLevel; // 초당 공격력의 20% * 화염레벨
        const finalBurnDamage = burnDamage * (1 + gameState.prestigeLevel); // 회차 보너스 적용
        showVfx('vfx-fire');
        showDamageText(finalBurnDamage, 'fire');
        for (let i = 1; i <= 3; i++) { // 3초간 지속
            setTimeout(() => gameState.soulShards += finalBurnDamage, i * 1000);
        }
    }

    // 냉기 부여 (추가 피해)
    if (currentStats.frostLevel > 0 && Math.random() < 0.15) { // 15% 확률
        const frostDamage = (currentStats.attackPower * 0.1) * currentStats.frostLevel;
        showVfx('vfx-lightning'); // 임시로 번개 이펙트 사용
        showDamageText(frostDamage, 'frost');
        gameState.soulShards += frostDamage * (1 + gameState.prestigeLevel);
    }

    // 독, 저주 피해를 영혼 파편으로 직접 전환
    if (currentStats.poisonLevel > 0) showVfx('vfx-poison');
    let poisonDps = currentStats.poisonLevel * 2;
    // 맹독 각성 시, 독 데미지에 공격력 계수 추가
    if (gameState.isPoisonEvolved) {
        const scalingPoisonDps = currentStats.attackPower * (currentStats.poisonLevel / 100); // 독 레벨 1당 공격력의 1%
        poisonDps += scalingPoisonDps;
    }
    const curseDps = currentStats.curseDamage;

    let totalDamage = finalAttackPower;

    // 회차 피해량 보너스 적용
    const prestigeDamageBonus = 1 + (gameState.prestigeLevel * 0.01);
    totalDamage *= prestigeDamageBonus;

    triggerAnimation('sword-container', 'attack-animation');

    // 진화 패시브 스킬 처리
    if (gameState.evolutionLevel >= 1) {
        gameState.attackCountForPassive++;

        // 3차 진화 스킬: 7번 공격마다 '혹한의 일격' 발동
        if (gameState.evolutionLevel >= 3 && gameState.attackCountForPassive % 7 === 0) {
            // 기본 공격력에 비례하는 기본 피해량 추가
            let frostbiteDamage = (currentStats.attackPower * 5) + (currentStats.attackPower * currentStats.frostLevel * 0.5);
            showVfx('vfx-lightning'); // 임시 이펙트
            showDamageText(frostbiteDamage, 'frost');
            totalDamage += frostbiteDamage;
        }

        // 2차 진화 스킬: 10번 공격마다 '지옥불 일격' 발동
        if (gameState.evolutionLevel >= 2 && gameState.attackCountForPassive % 10 === 0) {
            // 기본 공격력에 비례하는 기본 피해량 추가
            let infernoDamage = (currentStats.attackPower * 2) + (currentStats.poisonLevel + currentStats.fireLevel) * 50;
            if (gameState.artifacts.ancientRunestone) {
                infernoDamage *= 1.25; // 룬스톤 효과
            }
            showVfx('vfx-fire');
            showDamageText(infernoDamage, 'fire');
            totalDamage += infernoDamage;
        }
        // 1차 진화 스킬: 5번 공격마다 '연쇄 번개' 발동 (지옥불 일격과 겹치지 않도록)
        else if (gameState.attackCountForPassive % 5 === 0) {
            let lightningDamage = currentStats.attackPower * 3;
            if (gameState.artifacts.ancientRunestone) {
                lightningDamage *= 1.25; // 룬스톤 효과
            }
            showVfx('vfx-lightning');
            showDamageText(lightningDamage, 'lightning');
            totalDamage += lightningDamage;
        }

        if (gameState.attackCountForPassive >= 10) gameState.attackCountForPassive = 0;
    }

    // --- 보스전 또는 일반 사냥 처리 ---
    if (gameState.currentBoss) {
        const bossZone = bosses[gameState.currentBoss.id].zone;
        const killsInZone = gameState.materials.monsterKillsByZone[bossZone];
        const requiredKills = 100 * (gameState.prestigeLevel + 1);

        // 지역 정복 조건 확인
        if (killsInZone >= requiredKills) {
            // 지역 정복 보너스: 100마리당 10% 추가 데미지
            const conquestBonusMultiplier = 1 + (Math.floor(killsInZone / 100) * 0.1);
            let finalBossDamage = totalDamage;

            if (conquestBonusMultiplier > 1) {
                finalBossDamage *= conquestBonusMultiplier;
            }

            let fragmentBonusDamage = 0;
            // 차원의 파편 보너스 추가 (차원 포식자에게만 적용)
            if (gameState.currentBoss.id === 'dimensionEater' && gameState.materials.dimensionalFragment > 0) {
                const fragmentBonus = 1 + (gameState.materials.dimensionalFragment * 0.002);
                const baseDamageForFragment = finalBossDamage; // 파편 보너스가 적용되기 전의 데미지
                fragmentBonusDamage = baseDamageForFragment * (fragmentBonus - 1); // 순수 추가 데미지만 계산
                finalBossDamage += fragmentBonusDamage; // 최종 데미지에 합산
                showDamageText(fragmentBonusDamage, 'dimensionalFragment'); // 추가 데미지를 별도로 표시
            }
            gameState.currentBoss.hp -= finalBossDamage;
            // 보스에게 입힌 피해량의 1/100만큼 영혼 파편 획득 (이전 요청에서 1/100로 수정됨)
            gameState.soulShards += (finalBossDamage - fragmentBonusDamage) / 100; // 파편 추가 데미지는 영혼 획득에서 제외

            // 보스에게 입힌 최종 데미지를 표시
            showDamageText(finalBossDamage, isCrit ? 'crit' : 'normal');

        } else {
            // 조건 불만족: 데미지 0, 메시지 표시
            addLogMessage(`[${zones[bossZone].name}] 지역의 몬스터를 ${requiredKills}마리 처치해야 보스에게 피해를 줄 수 있습니다! (${killsInZone}/${requiredKills})`, 'error');
        }

        if (gameState.currentBoss.hp <= 0) {
            const bossId = gameState.currentBoss.id;
            const bossData = bosses[bossId];
            addLogMessage(`🏆 ${bossData.name}을(를) 처치했습니다!`, 'special');

            // 보상 지급
            const prestigeMultiplier = 1 + gameState.prestigeLevel;
            let soulReward = bossData.reward.soulShards * prestigeMultiplier;
            // 영혼 수확 및 회차 특전 보너스 적용
            soulReward *= (1 + (gameState.soulReapLevel * 0.05));
            gameState.soulShards += soulReward;
            addLogMessage(`영혼의 파편 +${bossData.reward.soulShards}`, 'special');
            for (const material in bossData.reward.materials) {
                gameState.materials[material] += bossData.reward.materials[material];
                addLogMessage(`[${material}] +${bossData.reward.materials[material]}`, 'special');
                checkAndApplyOffering(material); // 보스 재료 획득 시 자동 제물 확인
            }

            gameState.bosses[bossId].isDefeated = true;

            // 보스 처치 시 타이머 중지
            if (gameState.currentBoss.timerId) {
                clearTimeout(gameState.currentBoss.timerId);
            }
            if (gameState.currentBoss.intervalId) {
                clearInterval(gameState.currentBoss.intervalId);
            }


            // 최종 보스 처치 시 엔딩 처리
            if (bossId === 'dimensionEater') {
                gameState.isGameFinished = true;
                stopGameLoop(); // 게임 루프를 즉시 중지합니다.
                saveGame(); // 마지막 상태 저장
                showEnding(); // 그 후 엔딩 화면을 표시합니다.
            }

            gameState.currentBoss = null;
        }
    } else {
        // 일반 몬스터 사냥
        currentMonster.hp -= totalDamage;

        // 일반 몬스터에게 입힌 데미지를 표시
        showDamageText(totalDamage, isCrit ? 'crit' : 'normal');

        if (currentMonster.hp <= 0) {
            // 몬스터 처치 횟수 기록
            if (gameState.materials.monsterKillsByZone[gameState.currentZone] !== undefined) {
                gameState.materials.monsterKillsByZone[gameState.currentZone]++;
            }

            const activeZone = zones[gameState.currentZone];
            const monsterMaxHp = activeZone.monsterHp * (1 + (gameState.prestigeLevel * 0.5));
            // 몬스터의 실제 최대 체력에 비례하여 보상 지급
            let soulReward = monsterMaxHp + (totalDamage/10000); // 기본 보상 비율 조정
            // 영혼 수확 및 회차 특전 보너스 적용
            soulReward *= (1 + (currentStats.soulReapLevel * 0.5)); // 유효 영혼 수확 레벨 사용
            soulReward *= (1 + gameState.prestigeLevel);
            gameState.soulShards += soulReward;
            addLogMessage(`영혼의 파편 +${formatNumber(soulReward)}`, 'normal');
            triggerAnimation('soul-shards-count', 'pulse-animation');

            // 재료 드랍
            let currentDropChance = activeZone.dropChance * (1 + (gameState.prestigeLevel * 0.005));
            if (gameState.isLuckPotionActive) {
                currentDropChance *= 1.5;
            }
            // 행운의 편자 유물 효과
            if (gameState.artifacts.luckyHorseshoe) {
                currentDropChance += 0.05;
            }
            if (activeZone.material && Math.random() < currentDropChance) {
                gameState.materials[activeZone.material]++;
                addLogMessage(`✨ ${activeZone.name}에서 [${activeZone.material}] 획득!`, 'special');
                triggerAnimation(`${activeZone.material}-count`, 'pulse-animation');
            }

            // 몬스터 리스폰
            triggerAnimation('monster-container', 'monster-death-animation');
            setTimeout(() => {
                const monsterMaxHp = activeZone.monsterHp * (1 + (gameState.prestigeLevel * 0.5));
                currentMonster.hp = monsterMaxHp;
                triggerAnimation('monster-container', 'monster-spawn-animation');
            }, 400); // 0.4초 후 리스폰
        }
    }
    
    updateDisplay();
}

function stopGameLoop() {
    if (gameLoopIntervalId) {
        clearInterval(gameLoopIntervalId); // setTimeout -> clearInterval
        gameLoopIntervalId = null;
    }
}

function startGameLoop() {
    stopGameLoop(); // 기존 루프가 있다면 중지
    // 16ms(약 60fps)마다 게임 상태를 확인하고 공격을 실행합니다.
    // 실제 공격 간격은 runGameLoop 내부에서 제어되므로, 이 방식이 더 정확하고 안정적입니다.
    gameLoopIntervalId = setInterval(runGameLoop, 16);
}

function showEnding() {
    stopGameLoop(); // 게임 루프 정지
    const endingScreen = document.getElementById('ending-screen');
    const finalSwordContainer = document.getElementById('final-sword-container');

    document.getElementById('main-container').style.display = 'none';
    // 엔딩 화면에서 불필요한 UI 숨기기
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementById('summary-bar').style.display = 'none';
    
    finalSwordContainer.innerHTML = gameIcons.swordFinal;

    // 다음 회차 보상 미리 계산 및 표시
    const nextPrestigeLevel = gameState.prestigeLevel + 1;
    const bonusShards = Math.floor(gameState.soulShards * 0.1);
    const nextDamageBonus = nextPrestigeLevel * 1;
    const nextLuckBonus = nextPrestigeLevel * 0.5;

    document.getElementById('ngp-prestige-level').textContent = nextPrestigeLevel;
    document.getElementById('ngp-damage-bonus').textContent = nextDamageBonus.toFixed(1);
    document.getElementById('ngp-luck-bonus').textContent = nextLuckBonus.toFixed(1);
    document.getElementById('ngp-bonus-shards').textContent = formatNumber(bonusShards);

    // 다음 회차에 해금될 유물 확인
    let newArtifactName = null;
    for (const artifactId in artifacts) {
        if (!gameState.artifacts[artifactId] && artifacts[artifactId].unlockLevel === nextPrestigeLevel) {
            newArtifactName = artifacts[artifactId].name;
            break;
        }
    }

    const newArtifactContainer = document.getElementById('ngp-new-artifact-container');
    newArtifactContainer.style.display = newArtifactName ? 'block' : 'none';
    if (newArtifactName) document.getElementById('ngp-new-artifact').textContent = `[${newArtifactName}]`;

    endingScreen.style.display = 'flex';
    setTimeout(() => endingScreen.style.opacity = 1, 100);
}

function startNewGamePlus() {
    // 새로운 회차 시작 전, 현재 진행 중인 모든 게임 루프를 확실하게 중지합니다.
    isResetting = true; // 리셋 시작 플래그 설정
    stopGameLoop();

    // 유지할 상태
    const prestigeLevel = gameState.prestigeLevel + 1;
    const evolutionLevel = gameState.evolutionLevel;
    const isPoisonEvolved = gameState.isPoisonEvolved;
    const previousSoulShards = gameState.soulShards; // 이전 영혼의 파편 저장
    const currentArtifacts = gameState.artifacts;

    // 게임 상태 초기화
    gameState = JSON.parse(JSON.stringify(initialGameState));

    // 유지할 상태 복원
    gameState.prestigeLevel = prestigeLevel;
    gameState.evolutionLevel = evolutionLevel;
    gameState.isPoisonEvolved = isPoisonEvolved;
    gameState.artifacts = currentArtifacts; // 기존 유물 유지

    // 회차 보너스 지급 (이전 파편의 10%)
    const bonusShards = Math.floor(previousSoulShards * 0.1);
    if (bonusShards > 0) {
        gameState.soulShards += bonusShards;
    }

    // 새로운 유물 획득 확인
    for (const artifactId in artifacts) {
        const artifactData = artifacts[artifactId];
        if (!gameState.artifacts[artifactId] && gameState.prestigeLevel >= artifactData.unlockLevel) {
            gameState.artifacts[artifactId] = true;
            addLogMessage(`새로운 유물 획득: [${artifactData.name}]!`, 'special');
        }
    }

    // 이미 달성한 도전 과제 보상 자동 적용
    for (const achievementId in achievements) {
        const achievementData = achievements[achievementId];
        if (achievementData.isCompleted(gameState) && !gameState.completedAchievements[achievementId]) {
            claimAchievementReward(achievementId, true);
        }
    }

    // 회차 플레이 시작
    document.getElementById('ending-screen').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex'; // flex로 변경
    document.getElementById('nav-bar').style.display = 'flex';
    document.getElementById('summary-bar').style.display = 'flex';
    addLogMessage(`계승자의 증표 Lv.${prestigeLevel} - 새로운 여정을 시작합니다!`, 'special');
    if (bonusShards > 0) {
        addLogMessage(`이전 여정의 유산으로 영혼의 파편 ${formatNumber(bonusShards)}개를 획득했습니다!`, 'special');
    }

    // 새로운 회차에 맞춰 첫 몬스터의 체력을 다시 설정합니다. (이 부분이 중요합니다)
    const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    currentMonster.hp = monsterMaxHp;
    
    updateDisplay(); // 초기화된 상태를 화면에 즉시 반영합니다.
    isResetting = false; // 리셋 완료 플래그 해제
    startGameLoop();
    applyArtifactEffects();
}

function applyArtifactEffects() {
    if (chaliceIntervalId) clearInterval(chaliceIntervalId);

    if (gameState.artifacts.chaliceOfLife) {
        chaliceIntervalId = setInterval(() => {
            const dps = calculateDps();
            const bonusShards = dps * 5;
            gameState.soulShards += bonusShards;
            addLogMessage(`생명의 성배가 영혼의 파편 ${formatNumber(bonusShards)}개를 생성합니다.`, 'special');
        }, 10000); // 10초마다
    }
}

// 3초마다 자동 저장
setInterval(saveGame, 3000);

function initializeGame() {
    document.getElementById('opening-screen').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    document.getElementById('nav-bar').style.display = 'flex';
    document.getElementById('summary-bar').style.display = 'flex';
    // 첫 몬스터 생성
    const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    currentMonster.hp = monsterMaxHp;

    loadGame();
    calculateOfflineRewards(); // 오프라인 보상 계산

    initializeIcons();
    updateDisplay();

    // 새로고침 시 활성화된 물약 상태 복원
    if (gameState.isPotionActive) {
        isSwiftnessPotionChainActive = true;
        consumeNextSwiftnessPotion();
    }
    if (gameState.isLuckPotionActive) {
        isLuckPotionChainActive = true;
        consumeNextLuckPotion();
    }

    // 새로고침 시 보스 타이머 상태 복원
    if (gameState.currentBoss && gameState.currentBoss.startTime) {
        const timeLimit = Math.max(10, 60 - (gameState.prestigeLevel * 2));
        const elapsedTime = (Date.now() - gameState.currentBoss.startTime) / 1000;
        const remainingTime = Math.max(0, timeLimit - elapsedTime);

        if (remainingTime > 0) {
            // 남은 시간으로 타이머 재시작
            bossTimeLeft = Math.ceil(remainingTime);
            const { intervalId, timerId } = startBossTimer(gameState.currentBoss.id, remainingTime);
            gameState.currentBoss.intervalId = intervalId;
            gameState.currentBoss.timerId = timerId;
        } else {
            // 이미 시간이 초과된 경우
            runFromBoss();
        }
    }

    applyArtifactEffects();
    startGameLoop();
}

// --- 오프닝 시퀀스 제어 ---
let isGameStarting = false;

function startGameFromOpening() {
    if (isGameStarting) return;
    isGameStarting = true;

    const openingScreen = document.getElementById('opening-screen');
    openingScreen.style.opacity = '0';
    openingScreen.addEventListener('transitionend', () => {
        initializeGame();
    }, { once: true });

    // 한 번 시작되면 더 이상 이벤트가 발생하지 않도록 리스너를 제거합니다.
    document.removeEventListener('keydown', startGameFromOpening);
    document.removeEventListener('mousedown', startGameFromOpening);
}

function calculateOfflineRewards() {
    if (!gameState.lastSaveTime) return;

    const now = Date.now();
    const offlineTimeInSeconds = (now - gameState.lastSaveTime) / 1000;

    // 최소 1분 이상 오프라인이었을 때만 보상 지급
    if (offlineTimeInSeconds < 60) return;

    // 최대 24시간까지만 보상
    const cappedOfflineTime = Math.min(offlineTimeInSeconds, 86400);

    const offlineRewardRate = 0.1; // 온라인 효율의 10%

    // 영혼 파편 보상
    const dps = calculateDps();
    const earnedShards = dps * cappedOfflineTime * offlineRewardRate;

    // 재료 보상
    const { attackInterval } = calculatePassiveStats();
    const attacksPerSecond = 1000 / attackInterval;
    const monstersKilled = attacksPerSecond * cappedOfflineTime * offlineRewardRate;
    const activeZone = zones[gameState.currentZone];
    const earnedMaterialCount = Math.floor(monstersKilled * activeZone.dropChance);

    // 보상 지급
    gameState.soulShards += earnedShards;
    if (activeZone.material && earnedMaterialCount > 0) {
        gameState.materials[activeZone.material] += earnedMaterialCount;
    }

    // 보상 팝업 표시
    showOfflineRewardPopup(cappedOfflineTime, earnedShards, activeZone.material, earnedMaterialCount);
}

function showOfflineRewardPopup(time, shards, materialId, materialCount) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    document.getElementById('offline-time-text').textContent = `총 ${hours}시간 ${minutes}분 동안의 부재 보상입니다.`;

    const rewardsList = document.getElementById('offline-rewards-list');
    rewardsList.innerHTML = `<p><span class="icon">${gameIcons.coin}</span> +${formatNumber(shards)}</p>`;
    if (materialId && materialCount > 0) {
        rewardsList.innerHTML += `<p><span class="icon">${gameIcons[zones[gameState.currentZone].monsterIconKey]}</span> +${formatNumber(materialCount)}</p>`;
    }
    openOverlay('offline-reward-overlay');
}

function checkSaveDataAndStart() {
    const savedData = localStorage.getItem(saveKey);
    if (savedData) {
        // 저장된 데이터가 있으면 바로 게임 시작
        initializeGame();
    } else {
        // 저장된 데이터가 없으면 오프닝 화면 표시
        document.addEventListener('keydown', startGameFromOpening);
        document.addEventListener('mousedown', startGameFromOpening);
    }
}

function closeOfflineRewardPopup() {
    document.getElementById('offline-reward-overlay').style.display = 'none';
}

// 게임 시작
checkSaveDataAndStart();

// --- 툴팁 클릭 이벤트 처리 ---
document.body.addEventListener('click', (event) => {
    // event.target에서 가장 가까운 [data-tooltip] 속성을 가진 부모 요소를 찾습니다.
    const tooltipElement = event.target.closest('[data-tooltip]');

    // 툴팁 요소가 존재하고, 모바일 환경(hover 미지원)일 경우에만 실행합니다.
    if (tooltipElement && window.matchMedia("(hover: none)").matches) {
        const tooltipText = tooltipElement.getAttribute('data-tooltip');
        if (tooltipText) {
            // 토스트 팝업으로 툴팁 내용을 보여줍니다.
            addLogMessage(tooltipText, 'special');
        }
    }
});

function calculatePassiveStats() {
    const stats = {
        attackPower: gameState.attackPower,
        critChance: gameState.critChance,
        critDamage: gameState.critDamage,
        poisonLevel: gameState.poisonLevel,
        curseDamage: gameState.curseDamage,
        fireLevel: gameState.fireLevel,
        frostLevel: gameState.frostLevel,
        soulReapLevel: gameState.soulReapLevel
    };

    // 재료에 따른 패시브 능력치 적용 (예: 로그 함수로 점감 효과)
    // 슬라임 코어의 공격력 증가 공식을 지수 함수에서 로그 함수로 변경하여 성장 곡선을 완만하게 만듭니다.
    // 슬라임 코어의 공격력 증가 공식을 제곱근으로 변경하여 후반에도 유의미한 성장을 제공합니다.
    stats.attackPower += Math.sqrt(gameState.materials.slimeCore) * 50;
    stats.critChance += Math.min(0.75, Math.log2(gameState.materials.goblinEar + 1) * 0.015); // 최대 75%
    stats.critDamage += Math.log2(gameState.materials.goblinEar + 1) * 0.1;
    stats.curseDamage += Math.log2(gameState.materials.cursedBone + 1) * 20;
    stats.fireLevel += Math.floor(Math.log2(gameState.materials.fireEssence + 1));
    stats.frostLevel += Math.floor(Math.log2(gameState.materials.frostCrystal + 1));
    stats.poisonLevel += Math.floor(Math.log2(gameState.materials.slimeCore + 1) * 5);
    // monsterKillsByZone을 gameState.materials 하위로 이동했으므로, 이 부분은 그대로 둡니다.
    // 만약 별도의 객체로 유지한다면, loadGame에서 병합 로직을 추가해야 합니다.
    if (!gameState.materials.monsterKillsByZone) {
        gameState.materials.monsterKillsByZone = { forest: 0, cave: 0, ruins: 0, volcano: 0, mountain: 0, rift: 0 };
    }

    stats.soulReapLevel += Math.floor(Math.log2(gameState.materials.cursedBone + 1));

    // 공격 속도: 고블린 귀가 많아질수록 빨라짐 (최소 100ms)
    const attackSpeedBonus = Math.log2(gameState.materials.goblinEar + 1) * 30;
    let attackInterval = Math.max(100, 1000 - attackSpeedBonus);

    // 스킨 보너스 적용
    let attacksPerSecond = 1000 / attackInterval;
    const currentSkinBonus = skinBonuses[gameState.currentSkin];
    if (currentSkinBonus && currentSkinBonus.attacksPerSecond) {
        attacksPerSecond += currentSkinBonus.attacksPerSecond;
    }

    // 최종 공격 간격 재계산
    attackInterval = 1000 / attacksPerSecond;

    return { currentStats: stats, attackInterval: attackInterval, attacksPerSecond: attacksPerSecond.toFixed(2) };
}

function checkAndApplyOffering(materialId) {
    // 3차 진화 미만, 이미 바친 제물, 또는 제물 대상이 아니면 함수 종료
    if (gameState.evolutionLevel < 3 || gameState.offeredMaterials[materialId] || !initialGameState.offeredMaterials.hasOwnProperty(materialId)) {
        return;
    }

    const offerings = {
        ancientCore: { cost: 1, name: '고대의 핵' },
        venomGland: { cost: 1, name: '맹독 주머니' },
        queensHeart: { cost: 1, name: '여왕의 심장' },
        cursedSoul: { cost: 1, name: '저주받은 영혼' }
    };
    const offeringData = offerings[materialId];

    if (gameState.materials[materialId] >= offeringData.cost) {
        gameState.materials[materialId] -= offeringData.cost;
        gameState.attackPower *= 2;
        gameState.offeredMaterials[materialId] = true;
        addLogMessage(`✨ ${offeringData.name}이(가) 제물로 바쳐져 영구 공격력이 2배가 되었습니다!`, 'special');
    }
}
function startBossTimer(bossId, timeInSeconds) {
    const bossData = bosses[bossId];
    const timerIntervalId = setInterval(() => {
        bossTimeLeft = Math.max(0, bossTimeLeft - 1); // 0 미만으로 내려가지 않도록
        document.getElementById('boss-time-left').textContent = bossTimeLeft;
    }, 1000);

    // setTimeout의 ID를 지역 변수로 관리
    const timeoutId = setTimeout(() => {
        addLogMessage(`시간 초과! ${bossData.name}이(가) 사라졌습니다.`, 'error');
        runFromBoss();
    }, timeInSeconds * 1000);
    
    return { intervalId: timerIntervalId, timerId: timeoutId };
}


function evolveSword() {
    if (gameState.evolutionLevel === 0) {
        // 회차 레벨이 1 이상일 때만 비용 할인을 적용합니다.
        const cost = 1; // 1차 진화 비용은 1개로 고정
        if (gameState.materials.venomGland >= cost) {
            gameState.materials.venomGland -= cost;
            gameState.evolutionLevel = 1;
            gameState.attackPower += 500; // 진화 보너스 공격력
            updateDisplay();
            addLogMessage("⚔️ 1차 진화! 고대의 힘이 깨어납니다! [연쇄 번개] 스킬 획득!", 'special');            
            triggerAnimation('sword-container', 'pulse-animation');
        } else {
            addLogMessage("1차 진화에는 [맹독 주머니] 1개가 필요합니다.", 'error');
        }
    } else if (gameState.evolutionLevel === 1) {
        // 회차 레벨이 1 이상일 때만 비용 할인을 적용합니다.
        const discount = gameState.prestigeLevel > 0 ? (1 - (gameState.prestigeLevel * 0.005)) : 1;
        const cost = { ancientCore: Math.max(1, Math.round(1 * discount)), fireEssence: Math.max(1, Math.round(10 * discount)) };
        if (gameState.materials.ancientCore >= cost.ancientCore && gameState.materials.fireEssence >= cost.fireEssence) {
            gameState.materials.ancientCore -= cost.ancientCore;
            gameState.materials.fireEssence -= cost.fireEssence;
            gameState.evolutionLevel = 2;
            gameState.attackPower += 2500; // 2차 진화 보너스 공격력
            updateDisplay();
            addLogMessage("☠️🔥 2차 진화! 지옥의 힘이 넘실거립니다! [지옥불 일격] 스킬 획득!", 'special');            
            triggerAnimation('sword-container', 'pulse-animation');
        } else {
            addLogMessage(`2차 진화에는 [고대의 핵] ${formatNumber(cost.ancientCore)}개와 [불의 정수] ${formatNumber(cost.fireEssence)}개가 필요합니다.`, 'error');
        }
    } else if (gameState.evolutionLevel === 2) {
        const cost = { queensHeart: 1 };
        if (gameState.materials.queensHeart >= cost.queensHeart) {
            gameState.materials.queensHeart -= cost.queensHeart;
            gameState.evolutionLevel = 3;
            updateDisplay();
            addLogMessage("❄️ 3차 진화! 절대 영도의 힘이 깃듭니다! [혹한의 일격] 스킬 획득!", 'special');            
        } else {
            addLogMessage(`3차 진화에는 [여왕의 심장] ${formatNumber(cost.queensHeart)}개가 필요합니다.`, 'error');
        }
    }
}

function evolvePoison() {
    const cost = 1;
    if (gameState.isPoisonEvolved) {
        addLogMessage("이미 맹독 각성을 마쳤습니다.", 'error');
        return;
    }
    if (gameState.materials.venomGland >= cost) {
        gameState.materials.venomGland -= cost;
        gameState.isPoisonEvolved = true;
        updateDisplay();
        addLogMessage("🐍 독 속성이 [맹독 각성]으로 진화했습니다! 이제 독 피해가 공격력에 비례합니다.", 'special');
        triggerAnimation('poison-level-display', 'pulse-animation');
    } else {
        addLogMessage("맹독 각성에는 [맹독 주머니]가 필요합니다.", 'error');
    }
}

function calculateDps(stats, interval, aps) {
    // updateDisplay에서 계산된 값을 인자로 받아 사용합니다.
    const currentStats = stats || calculatePassiveStats().currentStats;
    // let attackInterval = interval || calculatePassiveStats().attackInterval; // 이 줄은 더 이상 필요 없습니다.

    const attacksPerSecond = aps || calculatePassiveStats().attacksPerSecond;
    
    let baseAttack = currentStats.attackPower;
    const avgCritDamage = baseAttack * (1 + currentStats.critChance * (currentStats.critDamage - 1));
    let poisonDps = currentStats.poisonLevel * 2;
    if (gameState.isPoisonEvolved) {
        poisonDps += baseAttack * (currentStats.poisonLevel / 100);
    }
    const curseDps = currentStats.curseDamage;
    
    // 진화 스킬 DPS 계산 (스킬 피해량 / 발동 주기(초))
    let evolutionSkillDps = 0;
    const attacksPerSecondNum = parseFloat(attacksPerSecond);

    if (gameState.evolutionLevel >= 1) {
        // 1차: 연쇄 번개 (5회 공격마다)
        let lightningDamage = baseAttack * 3;
        if (gameState.artifacts.ancientRunestone) lightningDamage *= 1.25;
        evolutionSkillDps += (lightningDamage / 5) * attacksPerSecondNum;
    }
    if (gameState.evolutionLevel >= 2) {
        // 2차: 지옥불 일격 (10회 공격마다)
        let infernoDamage = (baseAttack * 2) + (currentStats.poisonLevel + currentStats.fireLevel) * 50;
        if (gameState.artifacts.ancientRunestone) infernoDamage *= 1.25;
        evolutionSkillDps += (infernoDamage / 10) * attacksPerSecondNum;
    }
    if (gameState.evolutionLevel >= 3) {
        // 3차: 혹한의 일격 (7회 공격마다)
        let frostbiteDamage = (baseAttack * 5) + (baseAttack * currentStats.frostLevel * 0.5);
        evolutionSkillDps += (frostbiteDamage / 7) * attacksPerSecondNum;
    }

    let totalDps = (avgCritDamage * attacksPerSecondNum) + poisonDps + curseDps + evolutionSkillDps;

    // 회차 피해량 보너스 적용    
    const prestigeDamageBonus = 1 + (gameState.prestigeLevel * 0.01); // 1% per level
    return totalDps * prestigeDamageBonus;
}

function changeSkin() {
    const unlockedSkins = Object.keys(gameState.unlockedSkins).filter(skin => gameState.unlockedSkins[skin]);
    if (unlockedSkins.length === 0) return;

    const currentIndex = unlockedSkins.indexOf(gameState.currentSkin);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= unlockedSkins.length) {
        gameState.currentSkin = 'default'; // 기본 스킨으로 순환
    } else {
        gameState.currentSkin = unlockedSkins[nextIndex];
    }
    updateDisplay();
}

function updateSwordAppearance() {
    let swordIconKey = 'sword'; // 기본값
    if (gameState.currentSkin !== 'default' && gameState.unlockedSkins[gameState.currentSkin]) {
        swordIconKey = gameState.currentSkin;
    } else if (gameState.evolutionLevel >= 3) {
        swordIconKey = 'swordEvolved3';
    } else if (gameState.evolutionLevel >= 2) {
        swordIconKey = 'swordEvolved2';
    } else if (gameState.evolutionLevel === 1) {
        swordIconKey = 'swordEvolved1';
    }
    document.getElementById('sword-container').innerHTML = gameIcons[swordIconKey];
}

function updateEvolutionButton() {
    const evolutionTriggerButton = document.getElementById('evolution-trigger-button');

    let canEvolve = false;
    if (gameState.evolutionLevel === 0) {
        const cost = 1;
        if (gameState.materials.venomGland >= cost) {
            canEvolve = true;
            const newTooltip = "1차 진화! (맹독 주머니 소모)";
            if (evolutionTriggerButton.getAttribute('data-tooltip') !== newTooltip) {
                evolutionTriggerButton.setAttribute('data-tooltip', newTooltip);
            }
        }
    } else if (gameState.evolutionLevel === 1) {
        const discount = gameState.prestigeLevel > 0 ? (1 - (gameState.prestigeLevel * 0.005)) : 1;
        const cost = { ancientCore: Math.max(1, Math.round(1 * discount)), fireEssence: Math.max(1, Math.round(10 * discount)) };
        if (gameState.materials.ancientCore >= cost.ancientCore && gameState.materials.fireEssence >= cost.fireEssence) {
            canEvolve = true;
            const newTooltip = "2차 진화! (고대의 핵, 불의 정수 소모)";
            if (evolutionTriggerButton.getAttribute('data-tooltip') !== newTooltip) {
                evolutionTriggerButton.setAttribute('data-tooltip', newTooltip);
            }
        }
    } else if (gameState.evolutionLevel === 2) {
        const cost = { queensHeart: 1 };
        if (gameState.materials.queensHeart >= cost.queensHeart) {
            canEvolve = true;
            const newTooltip = "3차 진화! (여왕의 심장 소모)";
            if (evolutionTriggerButton.getAttribute('data-tooltip') !== newTooltip) {
                evolutionTriggerButton.setAttribute('data-tooltip', newTooltip);
            }
        }
    }

    evolutionTriggerButton.style.display = canEvolve ? 'inline-block' : 'none';

    // 자동 제물 시스템으로 변경되었으므로, offeringZone 관련 로직은 제거합니다.
}