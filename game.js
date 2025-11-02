// game.js - 게임의 핵심 로직을 담당합니다.

console.log("게임 로직이 시작되었습니다!");

// Zone 데이터 정의
const zones = {
    forest: { name: '시작의 숲', material: 'slimeCore', dropChance: 0.5, monsterIconKey: 'slime', monsterHp: 10, unlockCondition: () => true },
    whisperingWetlands: { name: '속삭이는 습지', material: 'spiritDew', dropChance: 0.4, monsterIconKey: 'swampSpirit', monsterHp: 50, unlockCondition: (state) => state.prestigeLevel >= 3 && state.materials.monsterKillsByZone.forest >= 100 * (state.prestigeLevel + 1), unlockText: (state) => `시작의 숲 몬스터 ${100 * (state.prestigeLevel + 1)}마리 처치 (3회차 이상)` },
    cave: { name: '어두운 동굴', material: 'goblinEar', dropChance: 0.3, monsterIconKey: 'goblin', monsterHp: 100, unlockCondition: (state) => (state.prestigeLevel < 3 && state.materials.monsterKillsByZone.forest >= 100 * (state.prestigeLevel + 1)) || (state.prestigeLevel >= 3 && state.bosses.swampGuardian.isDefeated), unlockText: (state) => state.prestigeLevel < 3 ? `시작의 숲 몬스터 ${100 * (state.prestigeLevel + 1)}마리 처치` : "보스 '늪의 수호자' 처치" },
    sunkenCemetery: { name: '가라앉은 묘지', material: 'graveDust', dropChance: 0.25, monsterIconKey: 'ghoul', monsterHp: 300, unlockCondition: (state) => state.prestigeLevel >= 6 && state.bosses.giantSpider.isDefeated, unlockText: "6회차 달성 및 보스 '거대 거미' 처치" },
    ruins: { name: '저주받은 폐허', material: 'cursedBone', dropChance: 0.2, monsterIconKey: 'skeleton', monsterHp: 600, unlockCondition: (state) => (state.prestigeLevel < 6 && state.bosses.giantSpider.isDefeated) || (state.prestigeLevel >= 6 && state.bosses.lich.isDefeated), unlockText: (state) => state.prestigeLevel < 6 ? "보스 '거대 거미' 처치" : "보스 '리치' 처치" },
    scorchedDesert: { name: '불타는 사막', material: 'sandstoneFragment', dropChance: 0.18, monsterIconKey: 'sandworm', monsterHp: 1200, unlockCondition: (state) => state.prestigeLevel >= 9 && state.bosses.skeletonKing.isDefeated, unlockText: "9회차 달성 및 보스 '해골 왕' 처치" },
    volcano: { name: '화산 지대', material: 'fireEssence', dropChance: 0.15, monsterIconKey: 'fireGolem', monsterHp: 2500, unlockCondition: (state) => (state.prestigeLevel < 9 && state.bosses.skeletonKing.isDefeated) || (state.prestigeLevel >= 9 && state.bosses.phoenix.isDefeated), unlockText: (state) => state.prestigeLevel < 9 ? "보스 '해골 왕' 처치" : "보스 '불사조' 처치" },
    crystalCaverns: { name: '수정 동굴', material: 'crystalShard', dropChance: 0.12, monsterIconKey: 'crystalGolem', monsterHp: 8000, unlockCondition: (state) => state.prestigeLevel >= 12 && state.bosses.cursedKing.isDefeated, unlockText: "12회차 달성 및 보스 '저주받은 왕' 처치" },
    mountain: { name: '혹한의 설산', material: 'frostCrystal', dropChance: 0.1, monsterIconKey: 'iceGolem', monsterHp: 15000, unlockCondition: (state) => (state.prestigeLevel < 12 && state.bosses.cursedKing.isDefeated) || (state.prestigeLevel >= 12 && state.bosses.crystalTitan.isDefeated), unlockText: (state) => state.prestigeLevel < 12 ? "'저주받은 왕' 처치" : "보스 '수정 타이탄' 처치" },
    astralPlane: { name: '별의 평원', material: 'stardust', dropChance: 0.08, monsterIconKey: 'astralBeing', monsterHp: 30000, unlockCondition: (state) => state.prestigeLevel >= 15 && state.bosses.frostQueen.isDefeated, unlockText: "15회차 달성 및 보스 '서리 여왕' 처치" },
    voidChasm: { name: '공허의 심연', material: 'voidEssence', dropChance: 0.05, monsterIconKey: 'voidSpawn', monsterHp: 40000, unlockCondition: (state) => state.prestigeLevel >= 18 && state.bosses.astralWatcher.isDefeated, unlockText: "18회차 달성 및 보스 '별의 감시자' 처치" },
    rift: { name: '차원의 균열', material: 'dimensionalFragment', dropChance: 0.1, monsterIconKey: 'dimensionalShadow', monsterHp: 50000, unlockCondition: (state) => (state.prestigeLevel < 18 && state.materials.ancientMapPiece >= 4) || (state.prestigeLevel >= 18 && state.bosses.voidLord.isDefeated), unlockText: (state) => state.prestigeLevel < 18 ? "고대의 지도 조각 4개 수집" : "보스 '공허의 군주' 처치" }
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
    swampGuardian: {
        name: '늪의 수호자',
        hp: 500000,
        zone: 'whisperingWetlands',
        iconKey: 'swampGuardian',
        reward: { soulShards: 250000, materials: { guardiansCore: 1 } }
    },
    lich: {
        name: '리치',
        hp: 1500000,
        zone: 'sunkenCemetery',
        iconKey: 'lich',
        reward: { soulShards: 750000, materials: { phylacteryShard: 1 } }
    },
    phoenix: {
        name: '불사조',
        hp: 5000000,
        zone: 'scorchedDesert',
        iconKey: 'phoenix',
        reward: { soulShards: 2500000, materials: { phoenixFeather: 1 } }
    },
    crystalTitan: {
        name: '수정 타이탄',
        hp: 15000000,
        zone: 'crystalCaverns',
        iconKey: 'crystalTitan',
        reward: { soulShards: 7500000, materials: { titansHeart: 1 } }
    },
    astralWatcher: {
        name: '별의 감시자',
        hp: 40000000,
        zone: 'astralPlane',
        iconKey: 'astralWatcher',
        reward: { soulShards: 20000000, materials: { celestialTear: 1 } }
    },
    voidLord: {
        name: '공허의 군주',
        hp: 75000000,
        zone: 'voidChasm',
        iconKey: 'voidLord',
        reward: { soulShards: 37500000, materials: { voidCrystal: 1 } }
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

// 아이템 ID에 대한 사용자 친화적인 이름 매핑
const itemDisplayNames = {
    slimeCore: '슬라임 코어',
    goblinEar: '고블린의 귀',
    cursedBone: '저주받은 뼈',
    fireEssence: '불의 정수',
    frostCrystal: '서리의 결정',
    spiritDew: '정령의 이슬',
    graveDust: '무덤의 흙',
    sandstoneFragment: '사암 파편',
    crystalShard: '수정 조각',
    stardust: '별의 먼지',
    voidEssence: '공허의 정수',
    swiftness: '가속 물약',
    luck: '행운 물약',
    guardiansCore: '수호자의 핵',
    phylacteryShard: '성물함 파편',
    phoenixFeather: '불사조의 깃털',
    titansHeart: '타이탄의 심장',
    celestialTear: '천체의 눈물',
    voidCrystal: '공허의 결정'
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
        unlockLevel: 4,
        iconKey: 'chaliceOfLife'
    },
    hourglassOfTime: {
        name: '시간의 모래시계',
        description: '무기의 기본 초당 공격 횟수가 영구적으로 +2 증가합니다.',
        unlockLevel: 8,
        iconKey: 'hourglassOfTime'
    },
    tomeOfSecrets: {
        name: '비밀의 고서',
        description: '치명타 발생 시, 10% 확률로 해당 치명타 피해량이 2배에서 10배 사이의 랜덤한 배율로 증폭됩니다.',
        unlockLevel: 11,
        iconKey: 'tomeOfSecrets'
    },
    blacksmithsWhetstone: {
        name: '대장장이의 숫돌',
        description: "공격 시 0.5% 확률로 2초간 영구 공격력이 3배가 됩니다. (중복 발동 불가)",
        unlockLevel: 14,
        iconKey: 'blacksmithsWhetstone'
    },
    luckyHorseshoe: {
        name: '행운의 편지',
        description: '재료 아이템 획득 시, 1개 대신 1개에서 5개 사이의 랜덤한 개수를 획득합니다.',
        unlockLevel: 19,
        iconKey: 'luckyHorseshoe'
    },
    blessingOfAncientGod: {
        name: '고대 신의 축복',
        description: '모든 유물의 발동 확률과 능력이 두 배로 증폭됩니다.',
        unlockLevel: 25,
        iconKey: 'blessingOfAncientGod'
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
    attack50000: {
        name: '5만 번의 숙련',
        description: '총 50,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 50000,
        reward: { permanentAtk: 50000 },
        rewardText: '영구 공격력 +50k'
    },
    attack100000: {
        name: '십만 번의 경지',
        description: '총 100,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 100000,
        reward: { permanentAtk: 100000 },
        rewardText: '영구 공격력 +100k'
    },
    attack500000: {
        name: '5십만 번의 경지',
        description: '총 500,000회 공격 달성',
        isCompleted: (state) => state.totalAttacks >= 500000,
        reward: { permanentAtk: 500000 },
        rewardText: '영구 공격력 +500k'
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
    defeatSwampGuardian: {
        name: '늪의 지배자',
        description: '보스 늪의 수호자 처치',
        isCompleted: (state) => state.bosses.swampGuardian.isDefeated,
        reward: { permanentAtk: 1500 },
        rewardText: '영구 공격력 +1.5k'
    },
    defeatLich: {
        name: '불멸을 이긴 자',
        description: '보스 리치 처치',
        isCompleted: (state) => state.bosses.lich.isDefeated,
        reward: { permanentAtk: 2500 },
        rewardText: '영구 공격력 +2.5k'
    },
    defeatPhoenix: {
        name: '재가 된 불사조',
        description: '보스 불사조 처치',
        isCompleted: (state) => state.bosses.phoenix.isDefeated,
        reward: { permanentAtk: 4000 },
        rewardText: '영구 공격력 +4k'
    },
    defeatCrystalTitan: {
        name: '결정 파괴자',
        description: '보스 수정 타이탄 처치',
        isCompleted: (state) => state.bosses.crystalTitan.isDefeated,
        reward: { permanentAtk: 8000 },
        rewardText: '영구 공격력 +8k'
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
    defeatAstralWatcher: {
        name: '별의 종결자',
        description: '보스 별의 감시자 처치',
        isCompleted: (state) => state.bosses.astralWatcher.isDefeated,
        reward: { permanentAtk: 30000 },
        rewardText: '영구 공격력 +30k'
    },
    defeatVoidLord: {
        name: '공허의 정복자',
        description: '보스 공허의 군주 처치',
        isCompleted: (state) => state.bosses.voidLord.isDefeated,
        reward: { permanentAtk: 50000 },
        rewardText: '영구 공격력 +50k'
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
        spiritDew: 0,
        graveDust: 0,
        sandstoneFragment: 0,
        crystalShard: 0,
        stardust: 0,
        voidEssence: 0,
        guardiansCore: 0,
        phylacteryShard: 0,
        phoenixFeather: 0,
        titansHeart: 0,
        celestialTear: 0,
        voidCrystal: 0,
        fireEssence: 0,
        cursedSoul: 0,
        frostCrystal: 0,
        monsterKillsByZone: {
            forest: 0,
            whisperingWetlands: 0,
            cave: 0,
            sunkenCemetery: 0,
            ruins: 0,
            scorchedDesert: 0,
            volcano: 0,
            crystalCaverns: 0,
            mountain: 0,
            astralPlane: 0,
            voidChasm: 0,
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
        swampGuardian: { isDefeated: false },
        lich: { isDefeated: false },
        phoenix: { isDefeated: false },
        crystalTitan: { isDefeated: false },
        astralWatcher: { isDefeated: false },
        voidLord: { isDefeated: false },
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
        luckyHorseshoe: false,
        blessingOfAncientGod: false
    },
    completedAchievements: {
        reach100Atk: false,
        attack100: false,
        attack1000: false,
        attack10000: false,
        attack50000: false,
        attack100000: false,
        attack500000: false,
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
    floatingTextSettings: {
        normal: true,
        crit: true,
        superCrit: true,
        fire: true,
        frost: true,
        lightning: true,
        dimensionalFragment: true,
        soulShards: true,
        material: true,
    },
    isWhetstoneActive: false, // 대장장이 숫돌 효과 활성화 상태
    isCombatUiHidden: false,
    offeredMaterials: {
        ancientCore: false,
        venomGland: false,
        queensHeart: false,
        cursedSoul: false
    },
    unlockedZones: {
        forest: true,
        cave: false,
        whisperingWetlands: false,
        sunkenCemetery: false,
        ruins: false,
        scorchedDesert: false,
        volcano: false,
        crystalCaverns: false,
        mountain: false,
        astralPlane: false,
        voidChasm: false,
        rift: false
    }
};
let isMusicPlaying = false;
let isAudioContextStarted = false;

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
let whetstoneTimeoutId = null; // 숫돌 효과 타이머 ID
let attacksThisSecond = 0; // 실제 초당 공격 횟수 측정을 위한 카운터
let lastSecondTimestamp = 0; // 마지막으로 초당 공격 횟수를 업데이트한 시간
let musicParts = { melody: null, bass: null, harmony: null };
let totalDamage = 0; // 데미지 계산을 위한 전역 변수
let lastEffectTime = {}; // 효과음 중복 재생 방지를 위한 객체
let sfxSynths = {}; // 효과음 신디사이저를 재사용하기 위한 객체

// --- 성능 최적화를 위한 오브젝트 풀링 ---
const damageTextPool = [];
const lootTextPool = [];

// --- 전투 로그 기능 ---
function addLogMessage(message, type = 'normal') {
    if (!gameState.showToastPopups) return; // 토스트 팝업이 꺼져있으면 함수 종료

    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.createElement('div');
    toastMessage.className = `toast-message ${type}`;
    toastMessage.textContent = message;

    toastContainer.appendChild(toastMessage);

    // 최대 2개의 로그만 유지
    if (toastContainer.children.length > 2) {
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
    // superCrit:배율 형식의 타입을 처리하기 위해 기본 타입만 추출
    const baseType = type.split(':')[0];
    if (!gameState.floatingTextSettings[baseType]) {
        // 해당 타입의 텍스트 표시가 꺼져있으면 함수 종료
        return;
    }

    const damageEl = damageTextPool.find(el => !el.dataset.active);
    if (!damageEl) return; // 사용 가능한 풀 요소가 없으면 무시

    damageEl.dataset.active = 'true';
    damageEl.className = `damage-text ${type.startsWith('superCrit') ? 'superCrit' : type}`; // 애니메이션 클래스는 잠시 후 추가

    if (type.startsWith('superCrit')) {
        const multiplier = parseFloat(type.split(':')[1]).toFixed(1);
        damageEl.innerHTML = `${formatNumber(damage)}`;
    } else {
        damageEl.textContent = formatNumber(damage);
    }

    const offsetX = Math.random() * 40 - 20; // -20px to +20px
    const offsetY = Math.random() * 20 - 10; // -10px to +10px
    damageEl.style.transform = `translate(-50%) translate(${offsetX}px, ${offsetY}px)`;
    damageEl.style.opacity = '1';

    // 애니메이션 클래스를 추가하여 애니메이션 시작
    damageEl.classList.add('float-up-animation');

    // 애니메이션이 끝나면 풀로 반환 (한 번만 실행되도록 { once: true })
    damageEl.addEventListener('animationend', () => {
        damageEl.dataset.active = '';
        damageEl.style.opacity = '0'; // 다음 사용을 위해 숨김
        damageEl.classList.remove('float-up-animation');
    }, { once: true });
}

// --- 플로팅 재화 텍스트 기능 ---
function showLootText(amount, type) {
    if (type === 'soulShards') {
        if (!gameState.floatingTextSettings.soulShards) return;
    } else {
        // soulShards가 아닌 모든 경우는 재료로 간주
        if (!gameState.floatingTextSettings.material) return;
    }

    const lootEl = lootTextPool.find(el => !el.dataset.active);
    if (!lootEl) return; // 사용 가능한 풀 요소가 없으면 무시

    lootEl.dataset.active = 'true';
    let iconKey = '';
    let textClass = '';

    if (type === 'soulShards') {
        iconKey = 'coin';
        textClass = 'loot-text shards';
    } else {
        iconKey = type;
        textClass = 'loot-text material';
    }

    lootEl.className = textClass;
    lootEl.innerHTML = `<span class="icon">${gameIcons[iconKey] || ''}</span> +${formatNumber(amount)}`;

    const offsetX = Math.random() * 40 - 20;
    const offsetY = (type === 'soulShards') ? (Math.random() * 20 - 10) : (Math.random() * 20 - 30);
    lootEl.style.transform = `translate(-50%) translate(${offsetX}px, ${offsetY}px)`;
    lootEl.style.opacity = '1';

    // 애니메이션 클래스를 추가하여 애니메이션 시작
    lootEl.classList.add('float-up-animation');

    // 애니메이션이 끝나면 풀로 반환
    lootEl.addEventListener('animationend', () => {
        lootEl.dataset.active = '';
        lootEl.style.opacity = '0'; // 다음 사용을 위해 숨김
        lootEl.classList.remove('float-up-animation');
    }, { once: true });
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
                                gameState[key] = Object.assign({}, initialGameState[key], loadedState[key]);
                            }
                        } else if (key === 'unlockedSkins' || key === 'offeredMaterials') {
                             // unlockedSkins는 initialGameState의 모든 키를 포함하도록 보장합니다.
                             if (initialGameState[key]) {
                                gameState[key] = Object.assign({}, initialGameState[key], loadedState[key]);
                             } else {
                                gameState[key] = loadedState[key];
                             }
                } else if (key === 'unlockedZones') {
                    // unlockedZones는 initialGameState의 모든 키를 포함하도록 보장합니다.
                    if (initialGameState[key]) {
                        gameState[key] = Object.assign({}, initialGameState[key], loadedState[key]);
                    } else {
                        gameState[key] = loadedState[key];
                    }
                } else if (key === 'floatingTextSettings') {
                    if (initialGameState[key]) {
                        gameState[key] = Object.assign({}, initialGameState[key], loadedState[key]); // 저장된 설정을 기본 설정에 덮어씁니다.
                    }
                        }else {
                            gameState[key] = Object.assign({}, gameState[key] || {}, loadedState[key]);
                        }
                    } else {
                        gameState[key] = loadedState[key];
                    }
                }
            }

            // 불러온 데이터에 일시적인 버프 상태가 포함되어 있을 경우를 대비해 초기화합니다.
            gameState.isWhetstoneActive = false;
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
    if (whetstoneTimeoutId) {
        clearTimeout(whetstoneTimeoutId);
        whetstoneTimeoutId = null;
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
        fullReset();

        setTimeout(() => {
            localStorage.removeItem(saveKey);
            // 데이터를 삭제한 후 페이지를 새로고침하여
            // 오프닝 화면부터 다시 시작하도록 합니다.
            window.location.reload();
        }, 100); // 약간의 지연 후에 실행하여 UI가 멈추지 않도록 합니다.

    }
}

function toggleCombatUI() {
    gameState.isCombatUiHidden = !gameState.isCombatUiHidden;
    applyCombatUiVisibility();
}

function applyCombatUiVisibility() {
    const title = document.querySelector('h1');
    const summaryBar = document.getElementById('summary-bar');
    const toggleButtonIcon = document.getElementById('icon-toggle-ui');
    const combatStatsSummary = document.getElementById('combat-stats-summary');
    const zoneSelectorContainer = document.getElementById('zone-selector-container');

    title.classList.toggle('hidden-ui', gameState.isCombatUiHidden);
    summaryBar.classList.toggle('hidden-ui', gameState.isCombatUiHidden);
    combatStatsSummary.classList.toggle('hidden-ui', gameState.isCombatUiHidden);
    zoneSelectorContainer.classList.toggle('hidden-ui', gameState.isCombatUiHidden);

    toggleButtonIcon.innerHTML = gameState.isCombatUiHidden ? gameIcons.eyeSlash : gameIcons.eye;
    document.getElementById('toggle-ui-button').setAttribute('data-tooltip', gameState.isCombatUiHidden ? 'UI 보이기' : 'UI 숨기기');
}

function toggleToastPopups() {
    gameState.showToastPopups = !gameState.showToastPopups;
    const button = document.getElementById('toast-toggle-button');
    button.textContent = gameState.showToastPopups ? '토스트 팝업 끄기' : '토스트 팝업 켜기';
    addLogMessage(`토스트 팝업이 ${gameState.showToastPopups ? '활성화' : '비활성화'}되었습니다.`, 'special');
}

function initializeObjectPools() {
    const damageContainer = document.getElementById('damage-text-container');
    const lootContainer = document.getElementById('loot-text-container');

    // 기존 풀 초기화
    damageTextPool.length = 0;
    lootTextPool.length = 0;
    damageContainer.innerHTML = '';
    lootContainer.innerHTML = '';

    for (let i = 0; i < 150; i++) { // 풀 크기를 30에서 100으로 늘립니다.
        const damageEl = document.createElement('div');
        damageContainer.appendChild(damageEl);
        damageTextPool.push(damageEl);

        const lootEl = document.createElement('div');
        lootContainer.appendChild(lootEl);
        lootTextPool.push(lootEl);
    }
}

function initializeFloatingTextSettings() {
    const container = document.getElementById('floating-text-settings');
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'checkbox-group';

    const settingLabels = {
        normal: '일반',
        crit: '치명타',
        superCrit: '초월 치명타',
        fire: '화염',
        frost: '냉기',
        lightning: '번개',
        dimensionalFragment: '차원',
        soulShards: '파편',
        material: '재료'
    };

    for (const key in gameState.floatingTextSettings) {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = gameState.floatingTextSettings[key];
        checkbox.onchange = () => {
            gameState.floatingTextSettings[key] = checkbox.checked;
        };
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${settingLabels[key] || key}`));
        checkboxGroup.appendChild(label);
    }
    container.appendChild(checkboxGroup);
}

function updateFloatingTextSettingsUI() {
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

    // 도망가기 효과음 재생
    playSoundEffect('runAway');

    gameState.currentBoss = null;

    // 일반 사냥터 음악으로 전환
    playZoneMusic(gameState.currentZone);

    // 일반 몬스터로 다시 전환
    const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    currentMonster.hp = monsterMaxHp;
    updateDisplay();
}

function updateShopVisibility(state) {
    // 각 재료가 어느 지역에서 나오는지 매핑합니다.
    const materialToZoneMap = {};
    for (const zoneId in zones) {
        const zone = zones[zoneId];
        if (zone.material) {
            materialToZoneMap[zone.material] = zone;
        }
    }

    const shopItems = document.querySelectorAll('#shop .action-group[data-material]');
    shopItems.forEach(item => {
        const materialId = item.dataset.material;
        const zoneData = materialToZoneMap[materialId];
        if (zoneData) {
            // 슬라임 코어, 고블린 귀, 저주받은 뼈는 항상 보이도록 예외 처리
            if (['slimeCore', 'goblinEar', 'cursedBone'].includes(materialId)) {
                item.style.display = 'flex';
                return; // 다음 아이템으로 넘어감
            }

            // 해당 재료의 획득처인 사냥터의 해금 조건을 직접 확인합니다.
            const isVisible = zoneData.unlockCondition(state);
            item.style.display = isVisible ? 'flex' : 'none';
        }
    });
}

// --- 오버레이 메뉴 기능 ---
function openOverlay(overlayId) {
    closeAllOverlays();
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.display = 'flex';
        if (overlayId === 'shop-overlay') { // 상점을 열 때 아이템 표시 여부를 업데이트합니다.
            updateShopVisibility(gameState);
        } 
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
    document.getElementById('spirit-dew-count').textContent = formatNumber(gameState.materials.spiritDew);
    document.getElementById('grave-dust-count').textContent = formatNumber(gameState.materials.graveDust);
    document.getElementById('sandstone-fragment-count').textContent = formatNumber(gameState.materials.sandstoneFragment);
    document.getElementById('crystal-shard-count').textContent = formatNumber(gameState.materials.crystalShard);
    document.getElementById('stardust-count').textContent = formatNumber(gameState.materials.stardust);
    document.getElementById('guardians-core-count').textContent = formatNumber(gameState.materials.guardiansCore);
    document.getElementById('phylactery-shard-count').textContent = formatNumber(gameState.materials.phylacteryShard);
    document.getElementById('phoenix-feather-count').textContent = formatNumber(gameState.materials.phoenixFeather);
    document.getElementById('titans-heart-count').textContent = formatNumber(gameState.materials.titansHeart);
    document.getElementById('celestial-tear-count').textContent = formatNumber(gameState.materials.celestialTear);
    document.getElementById('void-crystal-count').textContent = formatNumber(gameState.materials.voidCrystal);
    document.getElementById('void-essence-count').textContent = formatNumber(gameState.materials.voidEssence);
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
    document.getElementById('permanent-atk-display').textContent = formatNumber(currentStats.attackPower);
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
    document.getElementById('offered-sacrifices-zone').style.display = 'none'; // 상태창에서는 숨김

    // 전투화면 하단 '획득한 보스 재료' 요약 UI 업데이트
    const sacrificesSummaryZone = document.getElementById('sacrifices-summary-zone');
    const sacrificesSummaryList = document.getElementById('sacrifices-summary-list');
    sacrificesSummaryList.innerHTML = '';
    let hasBossMaterial = false;

    // 모든 보스 재료 목록
    const bossMaterials = [
        'ancientCore', 'venomGland', 'cursedSoul', 'queensHeart', // 기존 보스 재료
        'guardiansCore', 'phylacteryShard', 'phoenixFeather', 'titansHeart', 'celestialTear', 'voidCrystal' // 신규 보스 재료
    ];

    for (const materialId of bossMaterials) {
        if (gameState.materials[materialId] > 0 || gameState.offeredMaterials[materialId]) {
            hasBossMaterial = true;
            const materialName = itemDisplayNames[materialId] || materialId;
            let tooltipText = `${materialName} 획득`;

            // 제물 효과 또는 치명타 피해량 증가 효과를 툴팁에 추가
            if (gameState.offeredMaterials[materialId]) {
                tooltipText += ' (제물로 바쳐짐: 영구 공격력 x2)';
            } else if (['guardiansCore', 'phylacteryShard', 'phoenixFeather', 'titansHeart', 'celestialTear', 'voidCrystal'].includes(materialId)) {
                tooltipText += ' (치명타 피해량 +10%)';
            }
            const materialIcon = `<span class="icon" data-tooltip='${tooltipText}'>${gameIcons[materialId]}</span>`;
            sacrificesSummaryList.innerHTML += materialIcon;
        }
    }
    sacrificesSummaryZone.style.display = hasBossMaterial ? 'flex' : 'none';

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
        if (!zoneData) return;

        const isNowUnlocked = zoneData.unlockCondition(gameState);
        const wasUnlocked = gameState.unlockedZones[zoneId];

        if (isNowUnlocked && !wasUnlocked) {
            gameState.unlockedZones[zoneId] = true;
            addLogMessage(`새로운 사냥터 [${zoneData.name}]이(가) 해금되었습니다!`, 'special');
        }

        const isLocked = !isNowUnlocked;
        if (isLocked) {
            // 잠긴 사냥터는 보이되, 비활성화하고 툴팁으로 해금 조건 표시
            button.style.display = 'flex';
            button.classList.add('locked');
            const newTooltip = `해금 조건: ${typeof zoneData.unlockText === 'function' ? zoneData.unlockText(gameState) : zoneData.unlockText}`;
            if (button.getAttribute('data-tooltip') !== newTooltip) {
                button.setAttribute('data-tooltip', newTooltip);
            }
        } else {
            // 해금된 사냥터는 보이도록 처리 (CSS 기본값인 flex로 설정)
            button.style.display = 'flex';
            button.classList.remove('locked');
            button.setAttribute('data-tooltip', zoneData.name); // 기본 툴팁으로 복원
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
    
    // 현재 지역에 해당하는 모든 보스를 찾습니다.
    const bossesInCurrentZone = [];
    for (const bossId in bosses) {
        if (bosses[bossId].zone === gameState.currentZone) {
            bossesInCurrentZone.push(bossId);
        }
    }

    // 아직 처치하지 않은 보스를 우선적으로 찾습니다.
    let bossForCurrentZone = bossesInCurrentZone.find(id => !gameState.bosses[id]?.isDefeated);

    // 모든 보스를 처치했다면, 마지막 보스를 기준으로 다음 지역 이동 버튼을 표시합니다.
    if (!bossForCurrentZone && bossesInCurrentZone.length > 0) {
        bossForCurrentZone = bossesInCurrentZone[bossesInCurrentZone.length - 1];
    }

    if (!gameState.currentBoss) { // 보스전 중이 아닐 때만 소환/이동 버튼 표시
        runFromBossButton.style.display = 'none';
        bossSummonButton.style.display = 'inline-block';

        if (bossForCurrentZone) {
            if (gameState.bosses[bossForCurrentZone]?.isDefeated) {
                // 보스를 처치한 후, 다음 지역의 해금 여부를 확인합니다.
                let nextZoneId = null;
                const allZoneIds = Object.keys(zones);
                const currentZoneIndex = allZoneIds.indexOf(gameState.currentZone);

                // 현재 지역 이후의 모든 지역을 순회하며, 해금 조건을 만족하는 첫 번째 지역을 찾습니다.
                for (let i = currentZoneIndex + 1; i < allZoneIds.length; i++) {
                    const potentialNextZoneId = allZoneIds[i];
                    if (zones[potentialNextZoneId].unlockCondition(gameState)) {
                        nextZoneId = potentialNextZoneId;
                        break; // 가장 먼저 해금되는 지역을 찾으면 중단
                    }
                }
                
                if (nextZoneId && zones[nextZoneId]) {
                    // 다음에 이동할 수 있는 지역으로 이동 버튼을 표시합니다.
                    bossSummonButton.disabled = false;
                    bossSummonButton.textContent = `${zones[nextZoneId].name}으로 이동`;
                    bossSummonButton.onclick = () => changeZone(nextZoneId);
                } else {
                    bossSummonButton.disabled = true;
                    bossSummonButton.textContent = `${bosses[bossForCurrentZone].name} (처치 완료)`;
                }
            } else {
                const bossZone = bosses[bossForCurrentZone].zone;
                const killsInZone = gameState.materials.monsterKillsByZone[bossZone] || 0;
                const requiredKills = 100 * (gameState.prestigeLevel + 1);

                if (killsInZone >= requiredKills) {
                    bossSummonButton.disabled = false;
                    bossSummonButton.textContent = `${bosses[bossForCurrentZone].name} 소환`;
                    bossSummonButton.onclick = () => startBossFight(bossForCurrentZone);
                } else {
                    bossSummonButton.disabled = true;
                    bossSummonButton.textContent = `${bosses[bossForCurrentZone].name} (${killsInZone}/${requiredKills})`;
                    bossSummonButton.onclick = null;
                }
            }
        } else if (gameState.currentZone === 'forest') {
            // 시작의 숲: 다음에 해금될 수 있는 지역을 찾아 이동 버튼 표시
            let nextAvailableZoneId = null;
            const allZoneIds = Object.keys(zones);
            const currentZoneIndex = allZoneIds.indexOf(gameState.currentZone);

            // 시작의 숲 다음 지역부터 순회하며 해금 조건을 만족하는 첫 지역을 찾음
            for (let i = currentZoneIndex + 1; i < allZoneIds.length; i++) {
                const potentialNextZoneId = allZoneIds[i];
                if (zones[potentialNextZoneId].unlockCondition(gameState)) {
                    nextAvailableZoneId = potentialNextZoneId;
                    break;
                }
            }
            if (nextAvailableZoneId) {
                bossSummonButton.style.display = 'inline-block';
                bossSummonButton.disabled = false;
                bossSummonButton.textContent = `${zones[nextAvailableZoneId].name}으로 이동`;
                bossSummonButton.onclick = () => changeZone(nextAvailableZoneId);
            } else {
                bossSummonButton.style.display = 'none';
            }
        }
    } else {
        runFromBossButton.style.display = gameState.currentBoss ? 'inline-block' : 'none';
        bossSummonButton.style.display = 'none';
    }
    
    // 토스트 팝업 버튼 텍스트 업데이트
    const toastToggleButton = document.getElementById('toast-toggle-button');
    toastToggleButton.textContent = gameState.showToastPopups ? '토스트 팝업 끄기' : '토스트 팝업 켜기';

    // UI가 생성된 후에만 체크박스 상태를 업데이트합니다.
    const checkboxes = document.querySelectorAll('#floating-text-settings input[type="checkbox"]');
    if (checkboxes.length > 0) {
        for (const key in gameState.floatingTextSettings) {
            const checkbox = document.querySelector(`#floating-text-settings input[onchange*="${key}"]`);
            if (checkbox) {
                checkbox.checked = gameState.floatingTextSettings[key];
            }
        }
    }
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

        const bossHpTextElement = document.getElementById('boss-hp-text');
        // 모바일 화면에서는 %로, 데스크톱에서는 전체 숫자로 표시합니다.
        if (window.innerWidth <= 768) {
            bossHpTextElement.textContent = `${bossData.name} HP: ${hpPercent.toFixed(1)}%`;
        } else {
            bossHpTextElement.textContent = `${bossData.name} HP: ${formatNumber(gameState.currentBoss.hp)} / ${formatNumber(gameState.currentBoss.maxHp)}`;
        }
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
    document.getElementById('summary-spirit-dew-count').textContent = formatNumber(gameState.materials.spiritDew);
    document.getElementById('summary-grave-dust-count').textContent = formatNumber(gameState.materials.graveDust);
    document.getElementById('summary-sandstone-fragment-count').textContent = formatNumber(gameState.materials.sandstoneFragment);
    document.getElementById('summary-crystal-shard-count').textContent = formatNumber(gameState.materials.crystalShard);
    document.getElementById('summary-stardust-count').textContent = formatNumber(gameState.materials.stardust);
    document.getElementById('summary-void-essence-count').textContent = formatNumber(gameState.materials.voidEssence);
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
    document.getElementById('icon-spirit-dew').innerHTML = gameIcons.spiritDew;
    document.getElementById('icon-grave-dust').innerHTML = gameIcons.graveDust;
    document.getElementById('icon-sandstone-fragment').innerHTML = gameIcons.sandstoneFragment;
    document.getElementById('icon-crystal-shard').innerHTML = gameIcons.crystalShard;
    document.getElementById('icon-stardust').innerHTML = gameIcons.stardust;
    document.getElementById('icon-guardians-core').innerHTML = gameIcons.guardiansCore;
    document.getElementById('icon-phylactery-shard').innerHTML = gameIcons.phylacteryShard;
    document.getElementById('icon-phoenix-feather').innerHTML = gameIcons.phoenixFeather;
    document.getElementById('icon-titans-heart').innerHTML = gameIcons.titansHeart;
    document.getElementById('icon-celestial-tear').innerHTML = gameIcons.celestialTear;
    document.getElementById('icon-void-crystal').innerHTML = gameIcons.voidCrystal;
    document.getElementById('icon-void-essence').innerHTML = gameIcons.voidEssence;
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
    document.getElementById('summary-icon-spirit-dew').innerHTML = gameIcons.spiritDew;
    document.getElementById('summary-icon-grave-dust').innerHTML = gameIcons.graveDust;
    document.getElementById('summary-icon-sandstone-fragment').innerHTML = gameIcons.sandstoneFragment;
    document.getElementById('summary-icon-crystal-shard').innerHTML = gameIcons.crystalShard;
    document.getElementById('summary-icon-stardust').innerHTML = gameIcons.stardust;
    document.getElementById('summary-icon-void-essence').innerHTML = gameIcons.voidEssence;
    document.getElementById('summary-icon-crit-chance').innerHTML = gameIcons.critChance;
    document.getElementById('summary-icon-total-attacks').innerHTML = gameIcons.dps; // dps 아이콘 재사용
    document.getElementById('summary-icon-dimensional-fragment').innerHTML = gameIcons.dimensionalFragment;
    document.getElementById('summary-icon-attack-speed').innerHTML = gameIcons.attackSpeed;
    document.getElementById('summary-icon-real-attack-speed').innerHTML = gameIcons.attackSpeed; // 아이콘 재사용
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
    document.getElementById('zone-icon-whispering-wetlands').innerHTML = gameIcons.zoneWhisperingWetlands;
    document.getElementById('zone-icon-cave').innerHTML = gameIcons.zoneCave;
    document.getElementById('zone-icon-sunken-cemetery').innerHTML = gameIcons.zoneSunkenCemetery;
    document.getElementById('zone-icon-ruins').innerHTML = gameIcons.zoneRuins;
    document.getElementById('zone-icon-scorched-desert').innerHTML = gameIcons.zoneScorchedDesert;
    document.getElementById('icon-toggle-ui').innerHTML = gameIcons.eye;
    document.getElementById('zone-icon-volcano').innerHTML = gameIcons.zoneVolcano;
    document.getElementById('zone-icon-crystal-caverns').innerHTML = gameIcons.zoneCrystalCaverns;
    document.getElementById('zone-icon-mountain').innerHTML = gameIcons.zoneMountain;
    document.getElementById('zone-icon-astral-plane').innerHTML = gameIcons.zoneAstralPlane;
    document.getElementById('zone-icon-void-chasm').innerHTML = gameIcons.zoneVoidChasm;
    document.getElementById('zone-icon-rift').innerHTML = gameIcons.dimensionalShadow;
    document.getElementById('music-toggle-button').innerHTML = isMusicPlaying ? gameIcons.musicOn : gameIcons.musicOff;
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
    ,
    spiritDew: { buy: 40 },
    graveDust: { buy: 150 },
    sandstoneFragment: { buy: 400 },
    crystalShard: { buy: 800 },
    stardust: { buy: 1500 },
    voidEssence: { buy: 2500 }};

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

    // 구매 전 능력치 스냅샷
    const oldPassiveStats = calculatePassiveStats();
    const oldDps = calculateDps(oldPassiveStats.currentStats, oldPassiveStats.attackInterval, oldPassiveStats.attacksPerSecond);
    const oldCritChance = oldPassiveStats.currentStats.critChance;
    const oldAttacksPerSecond = parseFloat(oldPassiveStats.attacksPerSecond);

    const singleItemCost = Math.max(1, Math.round(baseCost));
    let buyQuantity;

    if (typeof quantity === 'number' && quantity <= 1) {
        // 1 이하의 숫자는 비율로 간주 (e.g., 0.1, 0.5, 1)
        const shardsToSpend = Math.floor(gameState.soulShards * quantity);
        if (singleItemCost <= 0) return; // 0으로 나누는 오류 방지
        buyQuantity = Math.floor(shardsToSpend / singleItemCost);
    } else {
        buyQuantity = quantity; // 기존 로직 (현재는 사용되지 않음)
    }

    if (buyQuantity <= 0) {
        addLogMessage("구매할 수량이 없습니다. (파편 부족)", 'error');
        return;
    }

    const totalCost = singleItemCost * buyQuantity;

    if (gameState.soulShards >= totalCost) {
        gameState.soulShards -= totalCost;
        let purchasedItemName = itemDisplayNames[item] || item;

        if (isPotion) {
            gameState.potions[item] += buyQuantity;
            addLogMessage(`${purchasedItemName} ${formatNumber(buyQuantity)}개 구매 완료!`, 'normal');
        } else {
            gameState.materials[item] += buyQuantity;
            // 구매 후 능력치 스냅샷
            const newPassiveStats = calculatePassiveStats();
            const newDps = calculateDps(newPassiveStats.currentStats, newPassiveStats.attackInterval, newPassiveStats.attacksPerSecond);
            const newCritChance = newPassiveStats.currentStats.critChance;
            const newAttacksPerSecond = parseFloat(newPassiveStats.attacksPerSecond);

            // 증가량 계산
            const dpsIncrease = newDps - oldDps;
            const critChanceIncrease = (newCritChance - oldCritChance) * 100; // %로 변환
            const apsIncrease = newAttacksPerSecond - oldAttacksPerSecond;

            let statChanges = [];
            if (dpsIncrease > 0) statChanges.push(`DPS +${formatNumber(dpsIncrease)}`);
            if (critChanceIncrease > 0) statChanges.push(`치명타 확률 +${critChanceIncrease.toFixed(2)}%`);
            if (apsIncrease > 0) statChanges.push(`공격 속도 +${apsIncrease.toFixed(2)}/초`);

            if (statChanges.length > 0) {
                addLogMessage(`${purchasedItemName} ${formatNumber(buyQuantity)}개 구매 완료! (${statChanges.join(', ')})`, 'special');
            } else {
                addLogMessage(`${purchasedItemName} ${formatNumber(buyQuantity)}개 구매 완료!`, 'normal');
            }
        }
        updateDisplay();
    } else {
        addLogMessage(`영혼의 파편이 부족합니다! (필요: ${formatNumber(totalCost)})`, 'error');
    }
    closeAllOverlays();
}

function useSwiftnessPotion() {
    if (isSwiftnessPotionChainActive) {
        isSwiftnessPotionChainActive = false;
        addLogMessage("가속 물약 자동 사용을 중단합니다.", 'special');
        return;
    }
    if (gameState.potions.swiftness > 0) {
        addLogMessage("🚀 가속 물약 효과 발동! 10초간 공격 속도가 2배가 됩니다!", 'special');
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
        return;
    }

    gameState.isPotionActive = true;
    gameState.potions.swiftness--;
    updateDisplay();

    const duration = 10000; // 10초

    // 쿨다운 시각 효과 시작
    const cooldownEl = document.querySelector('#swiftness-potion-button .potion-cooldown');
    if (cooldownEl) {
        cooldownEl.style.animation = ''; // 인라인 애니메이션 스타일 제거
        cooldownEl.style.height = '100%'; // 높이를 100%로 초기화
        cooldownEl.classList.remove('cooldown-animation');
        // 애니메이션을 안정적으로 재시작하기 위해 requestAnimationFrame 사용
        requestAnimationFrame(() => {
            cooldownEl.style.animationDuration = `${duration / 1000}s`;
            cooldownEl.classList.add('cooldown-animation');
        });
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
        addLogMessage("🍀 행운 물약 효과 발동! 10초간 재료 획득 확률이 1.5배가 됩니다!", 'special');
    } else {
        addLogMessage("행운 물약이 없습니다.", 'error');
    }
}

function consumeNextLuckPotion() {
    if (!isLuckPotionChainActive || gameState.potions.luck <= 0) {
        isLuckPotionChainActive = false;
        gameState.isLuckPotionActive = false;
        document.querySelector('#luck-potion-button .potion-cooldown').style.height = '0%';
        return;
    }

    gameState.isLuckPotionActive = true;
    gameState.potions.luck--;
    updateDisplay();

    const duration = 10000; // 10초
    // 쿨다운 시각 효과 시작
    const cooldownEl = document.querySelector('#luck-potion-button .potion-cooldown');
    if (cooldownEl) {
        cooldownEl.style.animation = ''; // 인라인 애니메이션 스타일 제거
        cooldownEl.style.height = '100%'; // 높이를 100%로 초기화
        cooldownEl.classList.remove('cooldown-animation');
        // 애니메이션을 안정적으로 재시작하기 위해 requestAnimationFrame 사용
        requestAnimationFrame(() => {
            cooldownEl.style.animationDuration = `${duration / 1000}s`;
            cooldownEl.classList.add('cooldown-animation');
        });
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
    playSoundEffect('bossSummon'); // 보스 등장 효과음 재생
    playZoneMusic('boss'); // 보스전 음악 재생
    updateDisplay();
}

// 5. 사냥터 변경
function changeZone(zoneName) {
    if (gameState.isGameFinished) return; // 게임 종료 시 지역 변경 불가

    // 해금 조건 확인
    if (zones[zoneName] && !zones[zoneName].unlockCondition(gameState)) {
        // 잠긴 사냥터를 클릭하면 해금 조건을 토스트 메시지로 보여줍니다.
        const unlockText = typeof zones[zoneName].unlockText === 'function' ? zones[zoneName].unlockText(gameState) : zones[zoneName].unlockText;
        addLogMessage(`해금 조건: ${unlockText}`, 'error');
        return;
    }

    if (zones[zoneName]) {
        // 사냥터 이동 효과음 재생
        playSoundEffect('changeZone');

        gameState.currentZone = zoneName;
        // 지역 변경 시 새로운 몬스터 생성
        // 일반 몬스터 체력 증가율을 완화합니다. (예: 100% -> 50%)
        const monsterMaxHp = zones[zoneName].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
        currentMonster.hp = monsterMaxHp;
        triggerAnimation('monster-container', 'monster-spawn-animation');
        playZoneMusic(zoneName);
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
    let { currentStats, attackInterval: baseAttackInterval, attacksPerSecond } = calculatePassiveStats();

    // 마지막 공격 시간으로부터 attackInterval만큼 지났는지 확인
    // 여러 번의 공격이 밀렸을 경우를 처리하기 위해 while 루프 사용
    if (now >= lastAttackTime + baseAttackInterval) {
        // 공격 애니메이션은 루프당 한 번만 실행하여 시각적 과부하를 방지합니다.
        triggerAnimation('sword-container', 'attack-animation');
        const swordContainer = document.getElementById('sword-container');
        const animationDuration = Math.max(0.05, (baseAttackInterval / 1000) * 0.8);
        swordContainer.style.animationDuration = `${animationDuration}s`;
    }

    while (now >= lastAttackTime + baseAttackInterval) {
        lastAttackTime += baseAttackInterval;

        // --- 데미지 계산 (루프 내부로 이동) ---
        gameState.totalAttacks++;

        attacksThisSecond++; // 실제 공격 횟수 카운트 증가
        let currentAttackPower = currentStats.attackPower;
        let finalAttackPower = currentAttackPower;
        let isCrit = false;
        let isSuperCrit = false; // 비밀의 고서 효과 발동 여부

        // 대장장이의 숫돌 효과 발동 (가장 먼저 체크)
        const whetstoneChance = gameState.artifacts.blessingOfAncientGod ? 0.01 : 0.005;
        if (gameState.artifacts.blacksmithsWhetstone && !gameState.isWhetstoneActive && Math.random() < whetstoneChance) {
            activateWhetstoneEffect();
        }

        if (Math.random() < currentStats.critChance) {
            isCrit = true;
            finalAttackPower *= currentStats.critDamage;

            // 비밀의 고서 효과: 50% 확률로 치명타 데미지 2배
            const tomeChance = gameState.artifacts.blessingOfAncientGod ? 0.2 : 0.1;
            if (gameState.artifacts.tomeOfSecrets && Math.random() < tomeChance) {
                let superCritMultiplier = Math.random() * 8 + 2; // 2.0 ~ 10.0 사이의 랜덤 배율
                if (gameState.artifacts.blessingOfAncientGod) superCritMultiplier *= 2; // 4.0 ~ 20.0
                finalAttackPower *= superCritMultiplier;                
                isSuperCrit = superCritMultiplier; // 배율 값을 저장
            }

            triggerAnimation('monster-container', 'monster-shake-animation');
            playSoundEffect('critSlash');
            triggerAnimation('sword-container', 'crit-attack-animation');
        }

        if (currentStats.fireLevel > 0 && Math.random() < 0.1) {
            const burnDamage = (currentStats.attackPower * 0.2) * currentStats.fireLevel;
            const finalBurnDamage = burnDamage * (1 + gameState.prestigeLevel);
            showVfx('vfx-fire');
            showDamageText(finalBurnDamage, 'fire');
            for (let i = 1; i <= 3; i++) {
                setTimeout(() => gameState.soulShards += finalBurnDamage, i * 1000);
            }
        }

        if (currentStats.frostLevel > 0 && Math.random() < 0.15) {
            const frostDamage = (currentStats.attackPower * 0.1) * currentStats.frostLevel;
            showVfx('vfx-lightning');
            showDamageText(frostDamage, 'frost');
            gameState.soulShards += frostDamage * (1 + gameState.prestigeLevel);
        }

        if (currentStats.poisonLevel > 0) showVfx('vfx-poison');

        let totalDamage = finalAttackPower;
        const prestigeDamageBonus = 1 + (gameState.prestigeLevel * 0.01);
        totalDamage *= prestigeDamageBonus;

        if (gameState.evolutionLevel >= 1) {
            gameState.attackCountForPassive++;

            if (gameState.evolutionLevel >= 3 && gameState.attackCountForPassive % 7 === 0) {
                let frostbiteDamage = (currentStats.attackPower * 5) + (currentStats.attackPower * currentStats.frostLevel * 0.5);
                showVfx('vfx-lightning');
                showDamageText(frostbiteDamage, 'frost');
                totalDamage += frostbiteDamage;
            }

            if (gameState.evolutionLevel >= 2 && gameState.attackCountForPassive % 10 === 0) {
                let infernoDamage = (currentStats.attackPower * 2) + (currentStats.poisonLevel + currentStats.fireLevel) * 50;
                if (gameState.artifacts.ancientRunestone) { // 룬스톤 효과
                    const runestoneBonus = gameState.artifacts.blessingOfAncientGod ? 0.50 : 0.25;
                    infernoDamage *= 1.25;
                }
                showVfx('vfx-fire');
                showDamageText(infernoDamage, 'fire');
                totalDamage += infernoDamage;
            } else if (gameState.attackCountForPassive % 5 === 0) {
                let lightningDamage = currentStats.attackPower * 3;
                if (gameState.artifacts.ancientRunestone) { // 룬스톤 효과
                    const runestoneBonus = gameState.artifacts.blessingOfAncientGod ? 0.50 : 0.25;
                    lightningDamage *= 1.25;
                }
                showVfx('vfx-lightning');
                showDamageText(lightningDamage, 'lightning');
                totalDamage += lightningDamage;
            }

        if (gameState.attackCountForPassive >= 70) gameState.attackCountForPassive = 0; // LCM(5, 7, 10) = 70
        }

        // --- 보스전 또는 일반 사냥 처리 (루프 내부로 이동) ---
        if (gameState.currentBoss) {
            const bossZone = bosses[gameState.currentBoss.id].zone;
            const killsInZone = gameState.materials.monsterKillsByZone[bossZone];
            const requiredKills = 100 * (gameState.prestigeLevel + 1);

            if (killsInZone >= requiredKills) {
                const conquestBonusMultiplier = 1 + (Math.floor(killsInZone / 100) * 0.1);
                let finalBossDamage = totalDamage * conquestBonusMultiplier;

                let fragmentBonusDamage = 0;
                if (gameState.currentBoss.id === 'dimensionEater' && gameState.materials.dimensionalFragment > 0) {
                    const fragmentBonus = 1 + (gameState.materials.dimensionalFragment * 0.002);
                    fragmentBonusDamage = finalBossDamage * (fragmentBonus - 1);
                    finalBossDamage += fragmentBonusDamage;
                    showDamageText(fragmentBonusDamage, 'dimensionalFragment');
                }
                gameState.currentBoss.hp -= finalBossDamage;
                gameState.soulShards += (finalBossDamage - fragmentBonusDamage) / 100;
                showDamageText(finalBossDamage, isSuperCrit ? `superCrit:${isSuperCrit}` : (isCrit ? 'crit' : 'normal'));
            } else {
                addLogMessage(`[${zones[bossZone].name}] 지역의 몬스터를 ${requiredKills}마리 처치해야 보스에게 피해를 줄 수 있습니다! (${killsInZone}/${requiredKills})`, 'error');
            }

            if (gameState.currentBoss.hp <= 0) {
                handleBossDefeat();
                break; // 보스 처치 시 while 루프 즉시 종료
            }
        } else {
            currentMonster.hp -= totalDamage;            
            showDamageText(totalDamage, isSuperCrit ? `superCrit:${isSuperCrit}` : (isCrit ? 'crit' : 'normal'));

            if (currentMonster.hp <= 0) {
                handleMonsterDefeat(currentStats, totalDamage);
            }
        }
    }

    // 독/저주 피해는 공격 횟수와 무관하게 초당 피해이므로 루프 밖에서 한 번만 처리합니다.
    const loopIntervalSeconds = 16 / 1000; // 0.016초
    let poisonDps = currentStats.poisonLevel * 2;
    if (gameState.isPoisonEvolved) {
        poisonDps += currentStats.attackPower * (currentStats.poisonLevel / 100);
    }
    const curseDps = currentStats.curseDamage;
    gameState.soulShards += (poisonDps + curseDps) * loopIntervalSeconds;

    // 1초마다 실제 공격 횟수 UI 업데이트
    if (now >= lastSecondTimestamp + 1000) {
        const realApsDisplay = document.getElementById('summary-real-attack-speed-display');
        if (realApsDisplay) realApsDisplay.textContent = attacksThisSecond;
        attacksThisSecond = 0;
        lastSecondTimestamp = now;
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
function handleBossDefeat() {
    const bossId = gameState.currentBoss.id;
    const bossData = bosses[bossId];
    addLogMessage(`🏆 ${bossData.name}을(를) 처치했습니다!`, 'special');

    playSoundEffect('bossDefeat');

    const prestigeMultiplier = 1 + gameState.prestigeLevel;
    let soulReward = bossData.reward.soulShards * prestigeMultiplier;
    soulReward *= (1 + (gameState.soulReapLevel * 0.05));
    gameState.soulShards += soulReward;
    addLogMessage(`영혼의 파편 +${formatNumber(bossData.reward.soulShards)}`, 'special');
    for (const material in bossData.reward.materials) {
        gameState.materials[material] += bossData.reward.materials[material];
        addLogMessage(`[${itemDisplayNames[material] || material}] +${bossData.reward.materials[material]}`, 'special');
        checkAndApplyOffering(material);
    }

    gameState.bosses[bossId].isDefeated = true;

    if (gameState.currentBoss.timerId) clearTimeout(gameState.currentBoss.timerId);
    if (gameState.currentBoss.intervalId) clearInterval(gameState.currentBoss.intervalId);

    if (bossId === 'dimensionEater') {
        gameState.isGameFinished = true;
        stopGameLoop();
        playZoneMusic('ending');
        saveGame();
        showEnding();
    } else {
        playZoneMusic(gameState.currentZone);
    }

    gameState.currentBoss = null;
}

function handleMonsterDefeat(currentStats, totalDamage) {
    if (gameState.materials.monsterKillsByZone[gameState.currentZone] !== undefined) {
        gameState.materials.monsterKillsByZone[gameState.currentZone]++;
    }

    const activeZone = zones[gameState.currentZone];
    const monsterMaxHp = activeZone.monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    let soulReward = monsterMaxHp + (totalDamage / 10000);
    soulReward *= (1 + (currentStats.soulReapLevel * 0.5));
    soulReward *= (1 + gameState.prestigeLevel);
    showLootText(soulReward, 'soulShards');
    gameState.soulShards += soulReward;
    triggerAnimation('soul-shards-count', 'pulse-animation');

    let currentDropChance = activeZone.dropChance * (1 + (gameState.prestigeLevel * 0.005));
    if (gameState.isLuckPotionActive) {
        currentDropChance *= 1.5;
    }
    if (activeZone.material && Math.random() < currentDropChance) {
        let dropAmount = 1;
        // 행운의 편지 효과: 1~5개 사이 랜덤 획득
        if (gameState.artifacts.luckyHorseshoe) {
            dropAmount = Math.floor(Math.random() * 5) + 1; // 1~5
            if (gameState.artifacts.blessingOfAncientGod) dropAmount *= 2; // 2~10
        }
        gameState.materials[activeZone.material] += dropAmount;
        showLootText(dropAmount, activeZone.material);
        triggerAnimation(`${activeZone.material}-count`, 'pulse-animation');
    }

    triggerAnimation('monster-container', 'monster-death-animation');
    setTimeout(() => {
        if (gameState.currentBoss) return; // 몬스터가 죽는 애니메이션 중에 보스전이 시작되면 리스폰하지 않음
        const newMonsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
        currentMonster.hp = newMonsterMaxHp;
        triggerAnimation('monster-container', 'monster-spawn-animation');
    }, 400);
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

    // 모든 물약 관련 타이머와 상태를 확실하게 초기화합니다.
    if (swiftnessPotionTimeoutId) clearTimeout(swiftnessPotionTimeoutId);
    if (luckPotionTimeoutId) clearTimeout(luckPotionTimeoutId);
    swiftnessPotionTimeoutId = null;
    luckPotionTimeoutId = null;
    isSwiftnessPotionChainActive = false;
    isLuckPotionChainActive = false;
    document.querySelector('#swiftness-potion-button .potion-cooldown').style.animation = 'none';
    document.querySelector('#luck-potion-button .potion-cooldown').style.animation = 'none';
    document.querySelector('#swiftness-potion-button .potion-cooldown').style.height = '0%';
    document.querySelector('#luck-potion-button .potion-cooldown').style.height = '0%';

    // 유지할 상태
    const prestigeLevel = gameState.prestigeLevel + 1;
    const evolutionLevel = gameState.evolutionLevel;
    const isPoisonEvolved = gameState.isPoisonEvolved;
    const previousSoulShards = gameState.soulShards; // 이전 영혼의 파편 저장
    const currentArtifacts = gameState.artifacts;
    const currentFloatingTextSettings = gameState.floatingTextSettings; // 현재 텍스트 설정 저장

    // 게임 상태 초기화
    gameState = JSON.parse(JSON.stringify(initialGameState));

    // 유지할 상태 복원
    gameState.prestigeLevel = prestigeLevel;
    gameState.evolutionLevel = evolutionLevel;
    gameState.isPoisonEvolved = isPoisonEvolved;
    gameState.artifacts = currentArtifacts; // 기존 유물 유지
    gameState.floatingTextSettings = currentFloatingTextSettings; // 저장했던 텍스트 설정 복원

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
    // 엔딩 음악이 재생 중이었다면, 새로운 지역의 음악으로 전환합니다.

    // 새로운 여정 시작 효과음 재생
    playSoundEffect('newGamePlus');
    if (isMusicPlaying) {
        playZoneMusic(gameState.currentZone);
    }

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
        const chaliceMultiplier = gameState.artifacts.blessingOfAncientGod ? 10 : 5;
        chaliceIntervalId = setInterval(() => {
            if (!gameState.artifacts.chaliceOfLife) return;
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
    
    // 사용자의 첫 상호작용 시 오디오 컨텍스트를 시작하도록 이벤트 리스너를 추가합니다.
    initializeAudioContextOnFirstInteraction();

    // 브라우저 탭이 비활성화되었다가 다시 활성화될 때 오디오 컨텍스트를 재개합니다.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isAudioContextStarted) {
            if (Tone.context.state === 'suspended') {
                Tone.context.resume();
                console.log('AudioContext resumed on visibility change.');
            }
        }
    });

    loadGame();
    calculateOfflineRewards(); // 오프라인 보상 계산

    // 무한 루프 방지를 위해 게임 시작 및 오프라인 보상 계산 후 마지막 공격 시간을 현재로 초기화합니다.
    lastAttackTime = Date.now();

    initializeIcons();
    initializeObjectPools();
    initializeFloatingTextSettings();
    updateDisplay();
    applyCombatUiVisibility(); // UI 숨김 상태 적용

    // 음악 초기화 및 자동 재생 (사용자가 원할 경우)
    if (isMusicPlaying) {
        playZoneMusic(gameState.currentZone);
    }

    // 시각 효과 초기화
    document.getElementById('whetstone-aura').classList.remove('active');

    // 첫 몬스터 생성
    const monsterMaxHp = zones[gameState.currentZone].monsterHp * (1 + (gameState.prestigeLevel * 0.5));
    currentMonster.hp = monsterMaxHp;

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

function initializeAudioContextOnFirstInteraction() {
    const startAudio = async () => {
        if (isAudioContextStarted || typeof Tone === 'undefined') return;

        try {
            await Tone.start();
            isAudioContextStarted = true;
            console.log('AudioContext has been successfully started by user gesture.');
            // 오디오 컨텍스트가 시작된 후, 음악이 켜져 있었다면 즉시 재생합니다.
            if (isMusicPlaying) {
                playZoneMusic(gameState.currentZone);
            }
        } catch (e) {
            console.error("Could not start AudioContext: ", e);
        }
    };

    // 사용자의 첫 상호작용(클릭 또는 키다운) 시 오디오를 시작하고, 이벤트 리스너는 한 번만 실행된 후 제거됩니다.
    document.body.addEventListener('click', startAudio, { once: true });
    document.body.addEventListener('keydown', startAudio, { once: true });
    window.addEventListener('click', startAudio, { once: true, capture: true });
    window.addEventListener('keydown', startAudio, { once: true, capture: true });
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

    // 툴팁 요소가 존재하면, 해당 내용을 토스트 메시지로 보여줍니다.
    if (tooltipElement) {
        const tooltipText = tooltipElement.getAttribute('data-tooltip');
        if (tooltipText) {
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
        soulReapLevel: gameState.soulReapLevel,
        // 신규 재료 효과를 위한 스탯 추가
        skillDamageBonus: 0,
        whetstoneDurationBonus: 0,
        elementalResistanceDebuff: 0,
        artifactPowerBonus: 0,
        prestigeDamageMultiplier: 1
    };

    // 재료에 따른 패시브 능력치 적용 (예: 로그 함수로 점감 효과)
    // 슬라임 코어의 공격력 증가 공식을 지수 함수에서 로그 함수로 변경하여 성장 곡선을 완만하게 만듭니다.
    // 슬라임 코어의 공격력 증가 공식을 제곱근으로 변경하여 후반에도 유의미한 성장을 제공합니다.
    stats.attackPower += Math.sqrt(gameState.materials.slimeCore) * 50;
    stats.critChance += Math.min(0.75, Math.log2(gameState.materials.goblinEar + 1) * 0.015); // 최대 75%

    stats.critDamage += Math.log2(gameState.materials.goblinEar + 1) * 0.1;
    stats.curseDamage += Math.log2(gameState.materials.cursedBone + 1) * 20;

    // 신규 보스 재료 보유 효과: 재료당 치명타 피해량 10% (0.1) 증가
    if (gameState.materials.guardiansCore > 0) stats.critDamage += 0.1;
    if (gameState.materials.phylacteryShard > 0) stats.critDamage += 0.1;
    if (gameState.materials.phoenixFeather > 0) stats.critDamage += 0.1;
    if (gameState.materials.titansHeart > 0) stats.critDamage += 0.1;
    if (gameState.materials.celestialTear > 0) stats.critDamage += 0.1;
    if (gameState.materials.voidCrystal > 0) stats.critDamage += 0.1;

    stats.fireLevel += Math.floor(Math.log2(gameState.materials.fireEssence + 1));
    stats.frostLevel += Math.floor(Math.log2(gameState.materials.frostCrystal + 1));
    stats.poisonLevel += Math.floor(Math.log2(gameState.materials.slimeCore + 1) * 5);
    // monsterKillsByZone을 gameState.materials 하위로 이동했으므로, 이 부분은 그대로 둡니다.
    // 만약 별도의 객체로 유지한다면, loadGame에서 병합 로직을 추가해야 합니다.

    // --- 신규 재료 보유 효과 추가 ---
    // 정령의 이슬: 스킬 피해량 증가 (연쇄 번개, 지옥불 일격 등)
    stats.skillDamageBonus += Math.log2(gameState.materials.spiritDew + 1) * 0.05; // 5% per log2
    // 무덤의 흙: 저주 피해량 및 영혼 수확 레벨 추가 증가
    stats.curseDamage *= 1 + (Math.log2(gameState.materials.graveDust + 1) * 0.1); // 10% multiplier
    stats.soulReapLevel += Math.floor(Math.log2(gameState.materials.graveDust + 1) * 0.5);
    // 사암 파편: 화염 레벨 및 숫돌 지속시간 증가
    stats.fireLevel += Math.floor(Math.log2(gameState.materials.sandstoneFragment + 1) * 0.5);
    stats.whetstoneDurationBonus += Math.log2(gameState.materials.sandstoneFragment + 1) * 0.1; // 0.1초 per log2
    // 수정 조각: 냉기 레벨 및 적 속성 저항 감소
    stats.frostLevel += Math.floor(Math.log2(gameState.materials.crystalShard + 1) * 0.5);
    stats.elementalResistanceDebuff += Math.log2(gameState.materials.crystalShard + 1) * 0.01; // 1% per log2
    // 별의 먼지: 유물 효과 증폭
    stats.artifactPowerBonus += Math.log2(gameState.materials.stardust + 1) * 0.02; // 2% per log2
    // 공허의 정수: 회차 레벨 비례 피해량 증폭
    stats.prestigeDamageMultiplier += (Math.log2(gameState.materials.voidEssence + 1) * 0.001) * gameState.prestigeLevel;

    if (!gameState.materials.monsterKillsByZone) { // 안전장치
        gameState.materials.monsterKillsByZone = JSON.parse(JSON.stringify(initialGameState.materials.monsterKillsByZone));
    }

    stats.soulReapLevel += Math.floor(Math.log2(gameState.materials.cursedBone + 1));

    // 대장장이의 숫돌 효과: 활성화 시 영구 공격력 2배
    if (gameState.isWhetstoneActive) {
        // 슬라임 코어 등으로 증가된 공격력을 포함한 전체 영구 공격력에 배율을 적용하도록 수정
        const currentPermanentAttack = stats.attackPower;
        const whetstoneMultiplier = gameState.artifacts.blessingOfAncientGod ? 6 : 3; // 축복 유물 효과: 3배 -> 6배
        stats.attackPower = currentPermanentAttack * whetstoneMultiplier;
    }

    // 공격 속도: 고블린 귀가 많아질수록 빨라짐 (최소 100ms)
    // 기본 공격 속도 1에, 고블린의 귀로 인한 보너스(최대 9)를 더하는 방식으로 변경합니다.
    const goblinEarBonus = Math.log2(gameState.materials.goblinEar + 1) * 0.3;
    let attacksPerSecond = 1 + Math.min(10, goblinEarBonus); // 최대 보너스는 9로 제한

    // 스킨 보너스 적용 (숫자로 더함)
    const currentSkinBonus = skinBonuses[gameState.currentSkin];
    if (currentSkinBonus && currentSkinBonus.attacksPerSecond) {
        attacksPerSecond += currentSkinBonus.attacksPerSecond;
    }

    // 시간의 모래시계 효과 적용 (숫자로 더함)
    if (gameState.artifacts.hourglassOfTime) {
        const hourglassBonus = gameState.artifacts.blessingOfAncientGod ? 4 : 2;
        attacksPerSecond += hourglassBonus;
    }

    // 가속 물약 효과 적용 (모든 보너스가 합산된 후 곱함)
    if (gameState.isPotionActive) {
        attacksPerSecond *= 2;
    }

    // 최종 공격 간격 계산
    let attackInterval = Math.max(1, 1000 / attacksPerSecond); // 무한 루프 방지를 위해 최소 1ms 보장

    return { currentStats: stats, attackInterval: attackInterval, attacksPerSecond: attacksPerSecond.toFixed(2) }; // 마지막에 문자열로 변환
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

function activateWhetstoneEffect() {
    const whetstoneMultiplier = gameState.artifacts.blessingOfAncientGod ? 6 : 3;
    if (!gameState.isWhetstoneActive) {
        gameState.isWhetstoneActive = true;
        document.getElementById('whetstone-aura').classList.add('active');
        playSoundEffect('whetstoneActivate'); // 효과음 재생
        addLogMessage(`✨ 대장장이의 숫돌 효과 발동! 2초간 영구 공격력이 ${whetstoneMultiplier}배가 됩니다!`, 'special');
    }

    // 기존 타이머가 있다면 제거 (안전장치)
    if (whetstoneTimeoutId) {
        clearTimeout(whetstoneTimeoutId);
    }

    // 1초 후에 효과를 비활성화
    const whetstoneDuration = 2000 + (calculatePassiveStats().currentStats.whetstoneDurationBonus * 1000);
    whetstoneTimeoutId = setTimeout(() => {
        gameState.isWhetstoneActive = false;
        document.getElementById('whetstone-aura').classList.remove('active');
        whetstoneTimeoutId = null; // 타이머 ID 초기화
    }, 2000);
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
    let avgCritMultiplier = 1 + currentStats.critChance * (currentStats.critDamage - 1);

    // 비밀의 고서 효과를 DPS 계산에 반영
    if (gameState.artifacts.tomeOfSecrets) {
        const tomeChance = gameState.artifacts.blessingOfAncientGod ? 0.2 : 0.1;
        const tomeMultiplier = gameState.artifacts.blessingOfAncientGod ? 12 : 6; // 평균 배율 (4~20 -> 12, 2~10 -> 6)
        // 기존 치명타 피해량(critDamage)에 추가되는 피해량은 (critDamage * (tomeMultiplier - 1)) 입니다.
        // (critChance * tomeChance) * (baseAttack * critDamage * (tomeMultiplier - 1)) / baseAttack
        // = critChance * tomeChance * critDamage * (tomeMultiplier - 1)
        avgCritMultiplier += currentStats.critChance * tomeChance * (currentStats.critDamage * (tomeMultiplier - 1));
    }
    const avgCritDamage = baseAttack * avgCritMultiplier;
    
    // 진화 스킬 DPS 계산 (스킬 피해량 / 발동 주기(초))
    let evolutionSkillDps = 0;
    const attacksPerSecondNum = parseFloat(attacksPerSecond);

    if (gameState.evolutionLevel >= 1) {
        // 1차: 연쇄 번개 (5회 공격마다)
        let lightningDamage = baseAttack * 3;
        const runestoneBonus = 1 + (gameState.artifacts.blessingOfAncientGod ? 0.50 : 0.25);
        if (gameState.artifacts.ancientRunestone) lightningDamage *= runestoneBonus;
        evolutionSkillDps += (lightningDamage / 5) * attacksPerSecondNum;
    }
    if (gameState.evolutionLevel >= 2) {
        // 2차: 지옥불 일격 (10회 공격마다)
        let infernoDamage = (baseAttack * 2) + (currentStats.poisonLevel + currentStats.fireLevel) * 50;
        const runestoneBonus = 1 + (gameState.artifacts.blessingOfAncientGod ? 0.50 : 0.25);
        if (gameState.artifacts.ancientRunestone) infernoDamage *= runestoneBonus;
        evolutionSkillDps += (infernoDamage / 10) * attacksPerSecondNum;
    }
    if (gameState.evolutionLevel >= 3) {
        // 3차: 혹한의 일격 (7회 공격마다)
        let frostbiteDamage = (baseAttack * 5) + (baseAttack * currentStats.frostLevel * 0.5);
        evolutionSkillDps += (frostbiteDamage / 7) * attacksPerSecondNum;
    }

    // 정령의 이슬 효과 적용 (모든 스킬 피해량 증가)
    evolutionSkillDps *= (1 + currentStats.skillDamageBonus);

    // 독/저주 DPS는 공격력과 별개로 초당 적용되므로, 공격 횟수와 곱하지 않습니다.
    let poisonDps = currentStats.poisonLevel * 2;
    if (gameState.isPoisonEvolved) {
        poisonDps += baseAttack * (currentStats.poisonLevel / 100);
    }
    const curseDps = currentStats.curseDamage;

    let totalDps = (avgCritDamage * attacksPerSecondNum) + evolutionSkillDps + poisonDps + curseDps;

    // 대장장이의 숫돌 효과를 DPS 계산에 반영
    if (gameState.artifacts.blacksmithsWhetstone) {
        const whetstoneChance = gameState.artifacts.blessingOfAncientGod ? 0.01 : 0.005;
        const whetstoneMultiplier = gameState.artifacts.blessingOfAncientGod ? 6 : 3;
        // 1% 확률로 2초간 영구 공격력이 5배가 되므로, 전체 DPS에 (영구 공격력 * 4 * 공격속도)의 1%만큼 추가됩니다.
        totalDps += (gameState.attackPower * (whetstoneMultiplier - 1) * attacksPerSecondNum) * whetstoneChance;
    }

    // 회차 피해량 보너스 적용    
    const prestigeDamageBonus = 1 + (gameState.prestigeLevel * 0.01); // 1% per level
    totalDps *= prestigeDamageBonus;

    // 공허의 정수 효과 적용 (최종 피해량 증폭)
    totalDps *= currentStats.prestigeDamageMultiplier;
    return totalDps;
}

function changeSkin() {
    const unlockedSkins = Object.keys(gameState.unlockedSkins).filter(skin => gameState.unlockedSkins[skin]);
    if (unlockedSkins.length === 0) return;

    // 스킨 변경 효과음 재생
    playSoundEffect('changeSkin');

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
    const swordIconWrapper = document.getElementById('sword-icon-wrapper');
    if (!swordIconWrapper) return;

    let swordIconKey = 'sword'; // 기본값
    if (gameState.currentSkin !== 'default' && gameState.unlockedSkins[gameState.currentSkin]) {
        swordIconKey = gameState.currentSkin;
    } else {
        switch (gameState.evolutionLevel) {
            case 1: swordIconKey = 'swordEvolved1'; break;
            case 2: swordIconKey = 'swordEvolved2'; break;
            case 3: swordIconKey = 'swordEvolved3'; break;
        }
    }

    swordIconWrapper.innerHTML = gameIcons[swordIconKey];
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

// --- 음악 제어 기능 ---
function playZoneMusic(zoneId) {
    if (!isMusicPlaying || typeof Tone === 'undefined') return;

    // 기존 음악 중지
    if (musicParts.melody) musicParts.melody.stop(0);
    if (musicParts.bass) musicParts.bass.stop(0);
    if (musicParts.harmony) musicParts.harmony.stop(0);

    const musicData = backgroundMusic[zoneId];
    if (!musicData) return;

    Tone.Transport.bpm.value = musicData.bpm;

    // 신디사이저 설정
    const melodySynth = new Tone.Synth({
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();

    const bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'fmsine' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.4 },
        filterEnvelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 2, baseFrequency: 80, octaves: 4 }
    }).toDestination();

    const harmonySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.1, sustain: 0.9, release: 1.5 }
    }).toDestination();
    harmonySynth.volume.value = -12; // 하모니 볼륨을 약간 줄여 멜로디를 돋보이게 합니다.
    // 파트 생성 및 시작
    musicParts.melody = new Tone.Part((time, value) => {
        melodySynth.triggerAttackRelease(value.note, value.duration, time);
    }, musicData.melody);
    musicParts.melody.loop = true;
    musicParts.melody.loopEnd = musicData.loopEnd || '8m'; // 기본 루프 길이를 8마디로 설정
    musicParts.melody.start(0);

    musicParts.bass = new Tone.Part((time, value) => {
        bassSynth.triggerAttackRelease(value.note, value.duration, time);
    }, musicData.bass);
    musicParts.bass.loop = true;
    musicParts.bass.loopEnd = musicData.loopEnd || '8m';
    musicParts.bass.start(0);

    if (musicData.harmony) {
        musicParts.harmony = new Tone.Part((time, value) => {
            harmonySynth.triggerAttackRelease(value.note, value.duration, time);
        }, musicData.harmony);
        musicParts.harmony.loop = true;
        musicParts.harmony.loopEnd = musicData.loopEnd || '8m';
        musicParts.harmony.start(0);
    }


    Tone.Transport.start();
}

function playSoundEffect(effectId) {
    // 오디오 컨텍스트가 시작되었고, 음악이 켜져 있을 때만 효과음 재생
    if (!isAudioContextStarted || !isMusicPlaying || typeof Tone === 'undefined') return;

    const effectData = soundEffects[effectId];
    if (!effectData) return;

    // 효과음 중복 재생 방지 로직
    const now = Tone.now();
    const throttleTime = 0.1; // 100ms. 이 시간 내에는 같은 효과음 중복 재생 안 함 (초당 10회)
    if (lastEffectTime[effectId] && now - lastEffectTime[effectId] < throttleTime) {
        return;
    }
    lastEffectTime[effectId] = now;

    // 치명타일 경우, 타격음을 추가로 재생합니다. (스로틀링 체크 이후에 호출)
    if (effectId === 'critSlash') {
        playSoundEffect('critImpact');
    }

    if (effectData.type === 'noise') {
        if (!sfxSynths[effectId]) {
            sfxSynths[effectId] = new Tone.NoiseSynth({
                noise: effectData.noise || { type: 'white' },
                envelope: effectData.envelope,
                filter: effectData.filter,
                filterEnvelope: effectData.filterEnvelope,
                volume: effectData.volume || 0
            }).toDestination();
        }
        sfxSynths[effectId].triggerAttackRelease(effectData.duration || 0.5);
    } else if (effectData.type === 'synth') {
        if (!sfxSynths[effectId]) {
            sfxSynths[effectId] = new Tone.Synth(effectData.synth).toDestination();
        }
        const now = Tone.now();
        effectData.notes.forEach((note, index) => {
            sfxSynths[effectId].triggerAttackRelease(note, effectData.duration, now + index * effectData.interval);
        });
    } else if (effectData.type === 'polysynth') {
        if (!sfxSynths[effectId]) {
            sfxSynths[effectId] = new Tone.PolySynth(Tone.Synth, effectData.synth).toDestination();
        }
        const now = Tone.now();
        sfxSynths[effectId].triggerAttackRelease(effectData.notes, effectData.duration, now);
    } else if (effectData.type === 'warp') {
        if (!sfxSynths[effectId]) {
            const synth = new Tone.Synth(effectData.synth).toDestination();
            const freqEnv = new Tone.FrequencyEnvelope(effectData.frequencyEnvelope).connect(synth.frequency);
            sfxSynths[effectId] = { synth, freqEnv };
        }
        sfxSynths[effectId].freqEnv.triggerAttackRelease(effectData.duration);
        sfxSynths[effectId].synth.triggerAttackRelease(effectData.duration);
    }
}

async function toggleMusic() {
    const musicButton = document.getElementById('music-toggle-button');    
    if (isMusicPlaying) {
        isMusicPlaying = false;
        Tone.Transport.stop();
        musicButton.innerHTML = gameIcons.musicOff;
    } else {
        // 오디오 컨텍스트가 아직 시작되지 않았다면 시작합니다.
        if (!isAudioContextStarted && Tone.context.state !== 'running') {
            await Tone.start();
            isAudioContextStarted = true;
            console.log('AudioContext started by music toggle button.');
        }
        isMusicPlaying = true;
        playZoneMusic(gameState.currentBoss ? 'boss' : gameState.currentZone);
        musicButton.innerHTML = gameIcons.musicOn;
    }
}