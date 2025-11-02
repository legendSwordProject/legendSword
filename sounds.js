// sounds.js - 게임에 사용되는 배경 음악 및 효과음 데이터를 담습니다.
// Web Audio API를 사용하여 동적으로 사운드를 생성합니다.

const backgroundMusic = {
    // 시작의 숲: 밝고 희망찬 분위기 (12마디, 약 28.8초)
    forest: { // 16마디, 약 38.4초
        melody: [
            // Part 1 (4 bars)
            { note: 'G4', duration: '8n', time: '0:0' },
            { note: 'A4', duration: '8n', time: '0:1' },
            { note: 'B4', duration: '8n', time: '0:2' },
            { note: 'G4', duration: '8n', time: '0:3' },
            { note: 'C5', duration: '4n', time: '1:0' },
            { note: 'B4', duration: '4n', time: '1:2' },
            { note: 'A4', duration: '2n', time: '2:0' },
            { note: 'G4', duration: '2n', time: '3:0' },
            // Part 2 (4 bars)
            { note: 'G4', duration: '8n', time: '4:0' },
            { note: 'A4', duration: '8n', time: '4:1' },
            { note: 'B4', duration: '8n', time: '4:2' },
            { note: 'C5', duration: '8n', time: '4:3' },
            { note: 'D5', duration: '4n', time: '5:0' },
            { note: 'C5', duration: '4n', time: '5:2' },
            { note: 'B4', duration: '2n', time: '6:0' },
            { note: 'A4', duration: '2n', time: '7:0' },
            // Part 3 (4 bars) - New Variation
            { note: 'C5', duration: '4n', time: '8:0' }, { note: 'B4', duration: '4n', time: '8:2' },
            { note: 'A4', duration: '4n', time: '9:0' }, { note: 'G4', duration: '4n', time: '9:2' },
            { note: 'B4', duration: '4n', time: '10:0' }, { note: 'A4', duration: '4n', time: '10:2' },
            { note: 'G4', duration: '2n', time: '11:0' },
            // Part 4 (4 bars) - Bridge
            { note: 'F4', duration: '2n', time: '12:0' },
            { note: 'A4', duration: '2n', time: '13:0' },
            { note: 'G4', duration: '2n', time: '14:0' },
            { note: 'B4', duration: '4n', time: '15:0' }, { note: 'C5', duration: '4n', time: '15:2' },
        ],
        harmony: [
            // Part 1 & 2
            { note: 'D4', duration: '1n', time: '0:0' },
            { note: 'E4', duration: '1n', time: '1:0' },
            { note: 'C4', duration: '1n', time: '2:0' },
            { note: 'D4', duration: '1n', time: '3:0' },
            { note: 'B3', duration: '1n', time: '4:0' },
            { note: 'C4', duration: '1n', time: '5:0' },
            { note: 'G3', duration: '2n', time: '6:0' },
            { note: 'F#3', duration: '2n', time: '7:0' },
            // Part 3 & 4
            { note: 'E4', duration: '2n', time: '8:0' },
            { note: 'D4', duration: '2n', time: '9:0' },
            { note: 'C4', duration: '2n', time: '10:0' },
            { note: 'B3', duration: '2n', time: '11:0' },
            { note: 'D4', duration: '1n', time: '12:0' },
            { note: 'E4', duration: '1n', time: '14:0' },
        ],
        bass: [
            // Part 1 & 2
            { note: 'G2', duration: '2n', time: '0:0' },
            { note: 'C3', duration: '2n', time: '1:0' },
            { note: 'F2', duration: '2n', time: '2:0' },
            { note: 'G2', duration: '2n', time: '3:0' },
            { note: 'G2', duration: '2n', time: '4:0' },
            { note: 'A2', duration: '2n', time: '5:0' },
            { note: 'D3', duration: '2n', time: '6:0' },
            { note: 'G2', duration: '2n', time: '7:0' },
            // Part 3 & 4
            { note: 'C3', duration: '2n', time: '8:0' },
            { note: 'G2', duration: '2n', time: '9:0' },
            { note: 'A2', duration: '2n', time: '10:0' },
            { note: 'D3', duration: '2n', time: '11:0' },
            { note: 'F2', duration: '2n', time: '12:0' },
            { note: 'C2', duration: '2n', time: '13:0' },
            { note: 'G2', duration: '1n', time: '14:0' },
        ],
        bpm: 100,
        loopEnd: '16m' // 16마디 루프
    },
    // 어두운 동굴: 신비롭고 조용한 분위기 (10마디, 약 30초)
    cave: {
        melody: [
            { note: 'E4', duration: '4n', time: '0:0' },
            { note: 'D4', duration: '4n', time: '0:2' },
            { note: 'C4', duration: '2n', time: '1:0' },
            { note: 'D4', duration: '2n', time: '2:0' },
            { note: 'E4', duration: '4n', time: '4:0' },
            { note: 'F4', duration: '4n', time: '4:2' },
            { note: 'E4', duration: '2n', time: '5:0' },
            { note: 'D4', duration: '2n', time: '6:0' },
            { note: 'C4', duration: '2n', time: '8:0' },
            { note: 'B3', duration: '2n', time: '9:0' },
        ],
        harmony: [
            { note: 'C5', duration: '2n', time: '1:0' },
            { note: 'A4', duration: '2n', time: '3:0' },
            { note: 'B4', duration: '2n', time: '5:0' },
            { note: 'G4', duration: '2n', time: '7:0' },
            { note: 'E4', duration: '1n', time: '8:0' },
        ],
        bass: [
            { note: 'A2', duration: '1n', time: '0:0' },
            { note: 'G2', duration: '1n', time: '2:0' },
            { note: 'A2', duration: '1n', time: '4:0' },
            { note: 'F2', duration: '1n', time: '6:0' },
            { note: 'C2', duration: '1n', time: '8:0' },
        ],
        bpm: 80,
        loopEnd: '10m'
    },
    // 저주받은 폐허: 긴장감 있고 어두운 분위기 (12마디, 약 32초)
    ruins: {
        melody: [
            { note: 'F#4', duration: '8n', time: '0:0' },
            { note: 'G4', duration: '8n', time: '0:1' },
            { note: 'F#4', duration: '4n', time: '0:2' },
            { note: 'D4', duration: '4n', time: '1:0' },
            { note: 'C#4', duration: '2n', time: '2:0' },
            { note: 'F#4', duration: '8n', time: '4:0' },
            { note: 'G4', duration: '8n', time: '4:1' },
            { note: 'A4', duration: '4n', time: '4:2' },
            { note: 'G4', duration: '4n', time: '5:0' },
            { note: 'F#4', duration: '2n', time: '6:0' },
            { note: 'B4', duration: '4n', time: '8:0' },
            { note: 'A4', duration: '4n', time: '8:2' },
            { note: 'G4', duration: '2n', time: '9:0' },
            { note: 'F#4', duration: '2n', time: '10:0' },
        ],
        harmony: [
            { note: 'D3', duration: '1n', time: '0:0' },
            { note: 'E3', duration: '1n', time: '2:0' },
            { note: 'D3', duration: '1n', time: '4:0' },
            { note: 'C#3', duration: '1n', time: '6:0' },
            { note: 'G3', duration: '1n', time: '8:0' },
            { note: 'F#3', duration: '1n', time: '10:0' },
        ],
        bass: [
            { note: 'B2', duration: '1n', time: '0:0' },
            { note: 'A2', duration: '1n', time: '2:0' },
            { note: 'B2', duration: '1n', time: '4:0' },
            { note: 'G2', duration: '1n', time: '6:0' },
            { note: 'D3', duration: '1n', time: '8:0' },
            { note: 'A2', duration: '1n', time: '10:0' },
        ],
        bpm: 90,
        loopEnd: '12m'
    },
    // 화산 지대: 웅장하고 강렬한 분위기 (16마디, 약 32초)
    volcano: {
        melody: [
            { note: 'C5', duration: '8n', time: '0:0' },
            { note: 'G4', duration: '8n', time: '0:1' },
            { note: 'C5', duration: '8n', time: '0:2' },
            { note: 'G4', duration: '8n', time: '0:3' },
            { note: 'Eb5', duration: '4n', time: '1:0' },
            { note: 'D5', duration: '4n', time: '1:2' },
            { note: 'C5', duration: '2n', time: '2:0' },
            { note: 'G5', duration: '8n', time: '4:0' },
            { note: 'F5', duration: '8n', time: '4:1' },
            { note: 'Eb5', duration: '8n', time: '4:2' },
            { note: 'D5', duration: '8n', time: '4:3' },
            { note: 'C5', duration: '2n', time: '5:0' },
            { note: 'G5', duration: '2n', time: '6:0' },
            { note: 'C5', duration: '4n', time: '8:0' },
            { note: 'D5', duration: '4n', time: '8:2' },
            { note: 'Eb5', duration: '2n', time: '9:0' },
            { note: 'G5', duration: '2n', time: '10:0' },
            { note: 'F5', duration: '4n', time: '12:0' },
            { note: 'Eb5', duration: '4n', time: '12:2' },
            { note: 'D5', duration: '2n', time: '13:0' },
            { note: 'C5', duration: '2n', time: '14:0' },
        ],
        harmony: [
            { note: 'G4', duration: '4n', time: '0:0' },
            { note: 'G4', duration: '4n', time: '1:0' },
            { note: 'G4', duration: '4n', time: '2:0' },
            { note: 'G4', duration: '4n', time: '3:0' },
            { note: 'C5', duration: '4n', time: '4:0' },
            { note: 'C5', duration: '4n', time: '5:0' },
            { note: 'Bb4', duration: '4n', time: '6:0' },
            { note: 'C5', duration: '4n', time: '7:0' },
            { note: 'G4', duration: '2n', time: '8:0' },
            { note: 'C5', duration: '2n', time: '9:0' },
            { note: 'G4', duration: '2n', time: '10:0' },
            { note: 'C5', duration: '2n', time: '11:0' },
            { note: 'Ab4', duration: '2n', time: '12:0' },
            { note: 'G4', duration: '2n', time: '13:0' },
            { note: 'F4', duration: '1n', time: '14:0' },
        ],
        bass: [
            { note: 'C3', duration: '4n', time: '0:0' },
            { note: 'C3', duration: '4n', time: '1:0' },
            { note: 'G2', duration: '4n', time: '2:0' },
            { note: 'G2', duration: '4n', time: '3:0' },
            { note: 'Ab2', duration: '4n', time: '4:0' },
            { note: 'Ab2', duration: '4n', time: '5:0' },
            { note: 'F2', duration: '4n', time: '6:0' },
            { note: 'G2', duration: '4n', time: '7:0' },
            { note: 'C3', duration: '1n', time: '8:0' },
            { note: 'G2', duration: '1n', time: '10:0' },
            { note: 'Ab2', duration: '1n', time: '12:0' },
            { note: 'C3', duration: '1n', time: '14:0' },
        ],
        bpm: 120,
        loopEnd: '16m'
    },
    // 혹한의 설산: 차갑고 신비로운 분위기 (12마디, 약 41.1초)
    mountain: {
        melody: [
            { note: 'A5', duration: '8n', time: '0:0' }, { note: 'E5', duration: '8n', time: '0:1' }, { note: 'C#5', duration: '8n', time: '0:2' }, { note: 'E5', duration: '8n', time: '0:3' },
            { note: 'G#5', duration: '8n', time: '1:0' }, { note: 'E5', duration: '8n', time: '1:1' }, { note: 'B4', duration: '8n', time: '1:2' }, { note: 'E5', duration: '8n', time: '1:3' },
            { note: 'F#5', duration: '8n', time: '2:0' }, { note: 'D5', duration: '8n', time: '2:1' }, { note: 'A4', duration: '8n', time: '2:2' }, { note: 'D5', duration: '8n', time: '2:3' },
            { note: 'E5', duration: '2n', time: '3:0' },
            { note: 'B5', duration: '8n', time: '4:0' }, { note: 'F#5', duration: '8n', time: '4:1' }, { note: 'D5', duration: '8n', time: '4:2' }, { note: 'F#5', duration: '8n', time: '4:3' },
            { note: 'A5', duration: '8n', time: '5:0' }, { note: 'E5', duration: '8n', time: '5:1' }, { note: 'C#5', duration: '8n', time: '5:2' }, { note: 'E5', duration: '8n', time: '5:3' },
            { note: 'G#5', duration: '2n', time: '6:0' },
            { note: 'A5', duration: '2n', time: '7:0' },
            { note: 'C#6', duration: '2n', time: '8:0' },
            { note: 'B5', duration: '2n', time: '9:0' },
            { note: 'A5', duration: '2n', time: '10:0' },
            { note: 'G#5', duration: '2n', time: '11:0' },
        ],
        harmony: [
            { note: 'A3', duration: '1n', time: '0:0' },
            { note: 'E4', duration: '1n', time: '1:0' },
            { note: 'D4', duration: '1n', time: '2:0' },
            { note: 'B3', duration: '1n', time: '4:0' },
            { note: 'A3', duration: '1n', time: '5:0' },
            { note: 'E3', duration: '2n', time: '6:0' },
            { note: 'F#3', duration: '1n', time: '8:0' },
            { note: 'A3', duration: '1n', time: '10:0' },
        ],
        bass: [
            { note: 'A2', duration: '2n', time: '0:0' },
            { note: 'E3', duration: '2n', time: '1:0' },
            { note: 'D3', duration: '2n', time: '2:0' },
            { note: 'E3', duration: '2n', time: '3:0' },
            { note: 'B2', duration: '2n', time: '4:0' },
            { note: 'A2', duration: '2n', time: '5:0' },
            { note: 'E2', duration: '1n', time: '6:0' },
            { note: 'F#2', duration: '1n', time: '8:0' },
            { note: 'A2', duration: '1n', time: '10:0' },
        ],
        bpm: 70,
        loopEnd: '12m'
    },
    // 차원의 균열: 혼란스럽고 기묘한 분위기 (16마디, 약 34.9초)
    rift: {
        melody: [
            { note: 'C#5', duration: '8n', time: '0:0' },
            { note: 'D5', duration: '4n', time: '0:2' },
            { note: 'G4', duration: '8n', time: '1:1' },
            { note: 'A#4', duration: '4n', time: '2:0' },
            { note: 'C#5', duration: '8n', time: '4:0' },
            { note: 'E5', duration: '4n', time: '4:2' },
            { note: 'G#4', duration: '8n', time: '5:1' },
            { note: 'B4', duration: '4n', time: '6:0' },
            { note: 'D5', duration: '8n', time: '8:0' },
            { note: 'C#5', duration: '8n', time: '8:1' },
            { note: 'B4', duration: '4n', time: '8:2' },
            { note: 'A#4', duration: '2n', time: '9:0' },
            { note: 'G#4', duration: '8n', time: '12:0' },
            { note: 'A#4', duration: '8n', time: '12:1' },
            { note: 'C#5', duration: '4n', time: '12:2' },
            { note: 'D5', duration: '2n', time: '13:0' },
        ],
        harmony: [
            { note: 'F#3', duration: '2n', time: '0:0' },
            { note: 'G3', duration: '2n', time: '1:0' },
            { note: 'D3', duration: '2n', time: '2:0' },
            { note: 'E3', duration: '2n', time: '3:0' },
            { note: 'F#3', duration: '2n', time: '4:0' },
            { note: 'A#3', duration: '2n', time: '5:0' },
            { note: 'B3', duration: '2n', time: '6:0' },
            { note: 'C#4', duration: '2n', time: '7:0' },
            { note: 'D4', duration: '1n', time: '8:0' },
            { note: 'F#3', duration: '1n', time: '12:0' },
        ],
        bass: [
            { note: 'F#2', duration: '1n', time: '0:0' },
            { note: 'D2', duration: '1n', time: '2:0' },
            { note: 'F#2', duration: '1n', time: '4:0' },
            { note: 'A#1', duration: '1n', time: '6:0' },
            { note: 'B1', duration: '1n', time: '8:0' },
            { note: 'G#1', duration: '1n', time: '10:0' },
            { note: 'F#1', duration: '1n', time: '12:0' },
            { note: 'D1', duration: '1n', time: '14:0' },
        ],
        bpm: 110,
        loopEnd: '16m'
    },
    // 보스전: 긴박하고 웅장한 분위기 (16마디, 약 27.4초)
    boss: {
        melody: [
            { note: 'C5', duration: '16n', time: '0:0:0' },
            { note: 'Eb5', duration: '16n', time: '0:0:2' },
            { note: 'G5', duration: '16n', time: '0:1:0' },
            { note: 'Eb5', duration: '16n', time: '0:1:2' },
            { note: 'C5', duration: '16n', time: '0:2:0' },
            { note: 'Eb5', duration: '16n', time: '0:2:2' },
            { note: 'G5', duration: '16n', time: '0:3:0' },
            { note: 'Eb5', duration: '16n', time: '0:3:2' },
            { note: 'C6', duration: '16n', time: '4:0:0' },
            { note: 'Ab5', duration: '16n', time: '4:0:2' },
            { note: 'G5', duration: '16n', time: '4:1:0' },
            { note: 'F5', duration: '16n', time: '4:1:2' },
            { note: 'Eb5', duration: '16n', time: '4:2:0' },
            { note: 'Db5', duration: '16n', time: '4:2:2' },
            { note: 'C5', duration: '16n', time: '4:3:0' },
            { note: 'B4', duration: '16n', time: '4:3:2' },
            { note: 'G5', duration: '8n', time: '8:0' },
            { note: 'Ab5', duration: '8n', time: '8:2' },
            { note: 'G5', duration: '4n', time: '9:0' },
            { note: 'F5', duration: '4n', time: '9:2' },
            { note: 'Eb5', duration: '2n', time: '10:0' },
            { note: 'C5', duration: '2n', time: '11:0' },
            { note: 'G5', duration: '2n', time: '12:0' },
            { note: 'C6', duration: '1n', time: '14:0' },
        ],
        harmony: [
            { note: 'C4', duration: '2n', time: '0:0' },
            { note: 'Eb4', duration: '2n', time: '1:0' },
            { note: 'C4', duration: '2n', time: '2:0' },
            { note: 'Eb4', duration: '2n', time: '3:0' },
            { note: 'F4', duration: '2n', time: '4:0' },
            { note: 'Ab4', duration: '2n', time: '5:0' },
            { note: 'F4', duration: '2n', time: '6:0' },
            { note: 'Ab4', duration: '2n', time: '7:0' },
            { note: 'C5', duration: '1n', time: '8:0' },
            { note: 'Ab4', duration: '1n', time: '10:0' },
            { note: 'F4', duration: '1n', time: '12:0' },
            { note: 'G4', duration: '1n', time: '14:0' },
        ],
        bass: [
            { note: 'C3', duration: '4n', time: '0:0' },
            { note: 'G2', duration: '4n', time: '0:2' },
            { note: 'Ab2', duration: '4n', time: '1:0' },
            { note: 'Eb2', duration: '4n', time: '1:2' },
            { note: 'F2', duration: '4n', time: '4:0' },
            { note: 'C2', duration: '4n', time: '4:2' },
            { note: 'Db2', duration: '4n', time: '5:0' },
            { note: 'Ab1', duration: '4n', time: '5:2' },
            { note: 'C3', duration: '2n', time: '8:0' },
            { note: 'G2', duration: '2n', time: '9:0' },
            { note: 'Ab2', duration: '2n', time: '10:0' },
            { note: 'Eb2', duration: '2n', time: '11:0' },
            { note: 'F2', duration: '2n', time: '12:0' },
            { note: 'C2', duration: '2n', time: '13:0' },
            { note: 'G2', duration: '1n', time: '14:0' },
        ],
        bpm: 140,
        loopEnd: '16m'
    },
    // 엔딩: 평화롭고 서정적인 분위기
    ending: { // 16마디, 약 16초
        melody: [
            // Part A (8 bars)
            { note: 'G4', duration: '1n', time: '0:0' },
            { note: 'C5', duration: '1n', time: '1:0' },
            { note: 'E5', duration: '1n', time: '2:0' },
            { note: 'D5', duration: '1n', time: '3:0' },
            { note: 'C5', duration: '2n', time: '4:0' }, { note: 'B4', duration: '2n', time: '4:2' },
            { note: 'A4', duration: '2n', time: '5:0' }, { note: 'G4', duration: '2n', time: '5:2' },
            { note: 'F4', duration: '1n', time: '6:0' },
            { note: 'G4', duration: '1n', time: '7:0' },
            // Part B (8 bars)
            { note: 'A4', duration: '2n', time: '8:0' }, { note: 'G4', duration: '2n', time: '8:2' },
            { note: 'F4', duration: '2n', time: '9:0' }, { note: 'E4', duration: '2n', time: '9:2' },
            { note: 'D4', duration: '1n', time: '10:0' },
            { note: 'E4', duration: '1n', time: '11:0' },
            { note: 'C5', duration: '1n', time: '12:0' },
            { note: 'B4', duration: '1n', time: '13:0' },
            { note: 'C5', duration: '1n', time: '14:0' },
        ],
        harmony: [
            // Part A
            { note: 'C4', duration: '1n', time: '0:0' },
            { note: 'G3', duration: '1n', time: '1:0' },
            { note: 'A3', duration: '1n', time: '2:0' },
            { note: 'G3', duration: '1n', time: '3:0' },
            { note: 'F3', duration: '1n', time: '4:0' },
            { note: 'E3', duration: '1n', time: '5:0' },
            { note: 'D3', duration: '1n', time: '6:0' },
            { note: 'G3', duration: '1n', time: '7:0' },
            // Part B
            { note: 'F3', duration: '1n', time: '8:0' },
            { note: 'C3', duration: '1n', time: '10:0' },
            { note: 'G3', duration: '1n', time: '12:0' },
            { note: 'C4', duration: '1n', time: '14:0' },
        ],
        bass: [
            { note: 'C3', duration: '1n', time: '0:0' },
            { note: 'G2', duration: '1n', time: '1:0' },
            { note: 'A2', duration: '1n', time: '2:0' },
            { note: 'E2', duration: '1n', time: '3:0' },
            { note: 'F2', duration: '1n', time: '4:0' },
            { note: 'C2', duration: '1n', time: '5:0' },
            { note: 'G2', duration: '2n', time: '6:0' },
            { note: 'C2', duration: '1n', time: '8:0' },
        ],
        bpm: 90, // 템포를 약간 올려서 덜 처지는 느낌을 줍니다.
        loopEnd: '16m'
    }
};

const soundEffects = {
    // 일반 칼질 소리
    swordSlash: {
        type: 'noise',
        noise: { type: 'white' },
        envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0,
            release: 0.1
        },
        filter: {
            type: 'highpass', // 고주파를 통과시켜 날카로운 소리 생성
            Q: 2 // Q값을 높여 금속성 강조
        },
        filterEnvelope: {
            attack: 0.002,
            decay: 0.3,
            sustain: 0,
            baseFrequency: 6000, // 높은 주파수에서 시작
            octaves: -2.5,       // 주파수를 빠르게 낮춰 '쉬익' 소리 구현
            exponent: 2
        },
        duration: '0.5s',
        volume: -12 // 볼륨을 낮춥니다.
    },
    // 치명타 칼질 소리 (더 날카롭고 강한 느낌)
    critSlash: {
        type: 'noise',
        noise: { type: 'white' },
        envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0,
            release: 0.1
        },
        filter: {
            type: 'highpass',
            Q: 3
        },
        filterEnvelope: {
            attack: 0.002,
            decay: 0.3,
            sustain: 0,
            baseFrequency: 7000,
            octaves: -3,
            exponent: 2
        },
        duration: '0.5s',
        volume: -20 // 일반 공격보다 약간 크게 설정합니다.
    },
    // 치명타 타격음 (번개가 부서지는 소리)
    critImpact: {
        type: 'polysynth',
        notes: ['C7', 'E7', 'G7'], // 매우 높은 화음을 사용하여 '파지직'하는 느낌
        duration: '16n',
        synth: {
            oscillator: { type: 'square' }, // 날카로운 사각파 사용
            envelope: {
                attack: 0.001,
                decay: 0.15,
                sustain: 0,
                release: 0.15
            },
            volume: -25 // 볼륨을 낮춰 칼날 소리와 조화롭게
        },
        volume: -25 // 일반 공격보다 약간 크게 설정합니다.
    },
    // 보스 처치 효과음 (팡파르)
    bossDefeat: {
        type: 'synth',
        notes: ['G5', 'C6', 'E6', 'G6'],
        duration: '8n',
        interval: 0.08, // 노트 사이의 간격
        synth: {
            oscillator: { type: 'fatsawtooth' },
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.2,
                release: 0.5
            },
            volume: -6
        }
    },
    // 보스 등장 효과음 (낮고 웅장한 소리)
    bossSummon: {
        type: 'polysynth',
        notes: ['C2', 'G2', 'C3'], // 낮은 화음
        duration: '1n',
        synth: {
            oscillator: { type: 'fatsawtooth' },
            envelope: {
                attack: 0.4,
                decay: 1.5,
                sustain: 0.4,
                release: 2.0
            },
            volume: -5
        }
    },
    // 새로운 여정 시작 효과음
    newGamePlus: {
        type: 'polysynth',
        notes: ['C4', 'E4', 'G4', 'C5'], // 밝은 C Major 코드
        duration: '2n',
        synth: {
            oscillator: { type: 'fatsine' },
            envelope: {
                attack: 0.2,
                decay: 0.5,
                sustain: 0.8,
                release: 1.5
            },
            volume: -8
        }
    },
    // 스킨 변경 효과음 (칼 뽑는 소리)
    changeSkin: {
        type: 'noise',
        noise: {
            type: 'white' // 금속성 소리에 더 적합한 화이트 노이즈
        },
        envelope: {
            attack: 0.005,
            decay: 0.2,
            sustain: 0,
            release: 0.1
        },
        filterEnvelope: {
            attack: 0.005,
            decay: 0.15,
            sustain: 0,
            baseFrequency: 2000, // 높은 주파수에서 시작하여 날카로운 느낌
            octaves: 2.5,        // 주파수 범위를 좁혀 '쉬링'하는 소리 강조
            exponent: 2
        },
        duration: '0.3s' // 효과음의 총 길이를 0.3초로 조정
    },
    // 사냥터 이동 효과음
    changeZone: { // 마법진 워프 효과음
        type: 'warp', // 새로운 타입 정의
        duration: '0.5s', // 길이를 0.5초로 조정
        synth: {            
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.05,
                release: 0.05 // release 시간을 줄여 소리가 더 빨리 끝나도록 합니다.
            }
        },
        frequencyEnvelope: {
            attack: 0.05,
            baseFrequency: 'C3',
            octaves: 3,
            exponent: 1.5,
            release: 0.2 // frequency release도 함께 조정합니다.
        }
    },
    // 도망가기 효과음
    runAway: {
        type: 'noise',
        noise: {
            type: 'white'
        },
        envelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0,
            release: 0.1
        },
        filterEnvelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0,
            baseFrequency: 2000,
            octaves: -3, // 주파수를 낮춰 '휙' 하고 사라지는 느낌
            exponent: 2
        },
        duration: '0.5s',
        volume: -15
    },
    // 대장장이 숫돌 발동 효과음
    whetstoneActivate: {
        type: 'warp', // '사냥터 이동'과 유사한 워프 타입
        duration: '0.3s', // 더 짧고 강렬하게
        synth: {
            oscillator: { type: 'fatsawtooth' }, // 더 풍부하고 강렬한 소리
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.05,
                release: 0.05
            }
        },
        frequencyEnvelope: {
            attack: 0.02,
            baseFrequency: 'C4', // 한 옥타브 높은 '도'에서 시작
            octaves: 4,          // 4옥타브를 빠르게 상승하여 '슈웅!'하는 느낌 강화
            exponent: 1.5,
            release: 0.1
        },
        volume: -8 // 볼륨을 약간 키워 강조
    }
};