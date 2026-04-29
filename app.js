document.addEventListener('DOMContentLoaded', () => {
    // === 1. Data Definitions ===
    const masterData = [
        { id: 1, text: "前髪際中点～後髪際中点", value: 12, displayAnswer: "1尺2寸 / 12寸" },
        { id: 2, text: "眉間～前髮際中点", value: 3, displayAnswer: "3寸" },
        { id: 3, text: "両額角髮際間", value: 9, displayAnswer: "9寸" },
        { id: 4, text: "両乳様突起間", value: 9, displayAnswer: "9寸" },
        { id: 5, text: "頚切痕～胸骨体下端", value: 9, displayAnswer: "9寸" },
        { id: 6, text: "胸骨体下端～臍中央", value: 8, displayAnswer: "8寸" },
        { id: 7, text: "臍中央～恥骨結合上縁", value: 5, displayAnswer: "5寸" },
        { id: 8, text: "両乳頭間", value: 8, displayAnswer: "8寸" },
        { id: 9, text: "左右の肩甲棘内端縁間", value: 6, displayAnswer: "6寸" },
        { id: 10, text: "中指尖～手関節横紋", value: 8.5, displayAnswer: "8寸5分" },
        { id: 11, text: "腋窩横紋前端または後端～肘窩", value: 9, displayAnswer: "9寸" },
        { id: 12, text: "肘窩～手関節横紋", value: 12, displayAnswer: "1尺2寸 / 12寸" },
        { id: 13, text: "恥骨結合上縁～膝蓋骨上縁", value: 18, displayAnswer: "1尺8寸 / 18寸" },
        { id: 14, text: "膝蓋骨尖～内果尖", value: 15, displayAnswer: "1尺5寸 / 15寸" },
        { id: 15, text: "脛骨内側顆下縁～内果尖", value: 13, displayAnswer: "1尺3寸 / 13寸" },
        { id: 16, text: "脛骨内側顆下縁～膝蓋骨尖", value: 2, displayAnswer: "2寸" },
        { id: 17, text: "大転子頂点～膝窩", value: 19, displayAnswer: "1尺9寸 / 19寸" },
        { id: 18, text: "殿溝～膝窩", value: 14, displayAnswer: "1尺4寸 / 14寸" },
        { id: 19, text: "膝窩～外果尖", value: 16, displayAnswer: "1尺6寸 / 16寸" },
        { id: 20, text: "内果尖～足底", value: 3, displayAnswer: "3寸" },
        { id: 21, text: "足指尖～踵(足底)", value: 12, displayAnswer: "1尺2寸 / 12寸" }
    ];

    // === 2. State Management ===
    let currentData = [...masterData];
    let isIndividualMode = true; // true: 各問モード, false: 全問モード
    let isShowingAnswers = false;

    // === 3. DOM Elements ===
    const container = document.getElementById('questions-container');
    const btnModeIndividual = document.getElementById('mode-individual');
    const btnModeAll = document.getElementById('mode-all');
    const btnShowAnswer = document.getElementById('btn-show-answer');
    const btnReset = document.getElementById('btn-reset');
    const btnInitialOrder = document.getElementById('btn-initial-order');
    const btnShuffle = document.getElementById('btn-shuffle');
    const btnGuide = document.getElementById('btn-guide');
    
    const progressText = document.getElementById('progress-text');
    const progressBarFill = document.getElementById('progress-bar-fill');
    
    const guideModal = document.getElementById('guide-modal');
    const btnCloseGuide = document.getElementById('btn-close-guide');
    const btnStart = document.getElementById('btn-start');
    const chkDontShow = document.getElementById('chk-dont-show');

    // === 4. Initialization ===
    function init() {
        renderQuestions();
        checkGuidePreference();
    }

    function checkGuidePreference() {
        const dontShow = localStorage.getItem('kotudoGuideDontShow');
        if (dontShow !== 'true') {
            openGuide();
        }
    }

    // === 5. Render Functions ===
    function renderQuestions() {
        container.innerHTML = '';
        currentData.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.dataset.id = q.id;

            card.innerHTML = `
                <div class="question-label">${index + 1}. ${q.text}</div>
                <div class="input-wrapper">
                    <input type="text" class="answer-input" placeholder="入力 (例: 1尺2寸)" aria-label="回答入力" data-id="${q.id}">
                    <i class="fa-solid fa-circle-check status-icon correct-icon"></i>
                    <i class="fa-solid fa-circle-xmark status-icon incorrect-icon"></i>
                    <div class="answer-display ${isShowingAnswers ? 'show' : ''}">${q.displayAnswer}</div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners to newly created inputs
        document.querySelectorAll('.answer-input').forEach(input => {
            input.addEventListener('input', handleInput);
        });
    }

    // === 6. Logic & Validation ===
    function parseAnswer(inputStr) {
        if (!inputStr) return null;
        
        // 単位が含まれているかチェック
        if (!inputStr.includes('尺') && !inputStr.includes('寸') && !inputStr.includes('分')) {
            return null; // 単位なしは不正解
        }

        // 全角を半角に変換し、空白を削除
        let str = inputStr.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        }).replace(/\s+/g, '');

        let shaku = 0, sun = 0, bu = 0;

        const shakuMatch = str.match(/([0-9.]+)尺/);
        if (shakuMatch) shaku = parseFloat(shakuMatch[1]);

        const sunMatch = str.match(/([0-9.]+)寸/);
        if (sunMatch) sun = parseFloat(sunMatch[1]);

        const buMatch = str.match(/([0-9.]+)分/);
        if (buMatch) bu = parseFloat(buMatch[1]);

        // 数値が一つも抽出できなかった場合
        if (!shakuMatch && !sunMatch && !buMatch) return null;

        return (shaku * 10) + sun + (bu / 10);
    }

    function validateItem(inputElement) {
        const valueStr = inputElement.value;
        const card = inputElement.closest('.question-card');
        const id = parseInt(inputElement.dataset.id);
        const qData = masterData.find(q => q.id === id);

        card.classList.remove('correct', 'incorrect');
        
        // Show correct icon for correct, incorrect icon for incorrect
        const cIcon = card.querySelector('.correct-icon');
        const iIcon = card.querySelector('.incorrect-icon');
        cIcon.style.opacity = '0';
        iIcon.style.opacity = '0';

        if (valueStr.trim() === '') return; // 未入力は無色

        const parsedValue = parseAnswer(valueStr);

        if (parsedValue !== null && Math.abs(parsedValue - qData.value) < 0.01) {
            card.classList.add('correct');
            cIcon.style.opacity = '1';
        } else {
            card.classList.add('incorrect');
            iIcon.style.opacity = '1';
        }
        
        updateProgress();
    }

    function checkAllFilled() {
        const inputs = document.querySelectorAll('.answer-input');
        for (let input of inputs) {
            if (input.value.trim() === '') {
                return false;
            }
        }
        return true;
    }

    function validateAll() {
        const inputs = document.querySelectorAll('.answer-input');
        inputs.forEach(input => validateItem(input));
    }

    function updateProgress() {
        const total = masterData.length;
        const correctCount = document.querySelectorAll('.question-card.correct').length;
        progressText.innerText = `${correctCount} / ${total}`;
        const percentage = (correctCount / total) * 100;
        progressBarFill.style.width = `${percentage}%`;
    }

    function handleInput(e) {
        if (isIndividualMode) {
            validateItem(e.target);
        } else {
            // 全問モード
            // 入力中は判定状態をリセット
            const card = e.target.closest('.question-card');
            card.classList.remove('correct', 'incorrect');
            card.querySelector('.correct-icon').style.opacity = '0';
            card.querySelector('.incorrect-icon').style.opacity = '0';

            // 全て入力されたかチェック
            if (checkAllFilled()) {
                validateAll();
            }
        }
    }

    // === 7. Event Listeners ===

    // Mode Switching
    btnModeIndividual.addEventListener('click', () => {
        isIndividualMode = true;
        btnModeIndividual.classList.add('active');
        btnModeAll.classList.remove('active');
        // モード切替時に現在の入力状態で判定し直す
        validateAll();
    });

    btnModeAll.addEventListener('click', () => {
        isIndividualMode = false;
        btnModeAll.classList.add('active');
        btnModeIndividual.classList.remove('active');
        
        // 全問モードに切り替えた時、未入力があれば全ての判定をクリア
        if (!checkAllFilled()) {
            document.querySelectorAll('.question-card').forEach(card => {
                card.classList.remove('correct', 'incorrect');
                card.querySelector('.correct-icon').style.opacity = '0';
                card.querySelector('.incorrect-icon').style.opacity = '0';
            });
            updateProgress();
        } else {
            validateAll();
        }
    });

    // Show Answer Toggle
    btnShowAnswer.addEventListener('click', () => {
        isShowingAnswers = !isShowingAnswers;
        if (isShowingAnswers) {
            btnShowAnswer.innerHTML = '<i class="fa-solid fa-eye-slash"></i> 回答隠す';
            btnShowAnswer.classList.add('active');
        } else {
            btnShowAnswer.innerHTML = '<i class="fa-solid fa-eye"></i> 回答表示';
            btnShowAnswer.classList.remove('active');
        }
        
        document.querySelectorAll('.answer-display').forEach(el => {
            if (isShowingAnswers) {
                el.classList.add('show');
            } else {
                el.classList.remove('show');
            }
        });
    });

    // Reset
    btnReset.addEventListener('click', () => {
        document.querySelectorAll('.answer-input').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.question-card').forEach(card => {
            card.classList.remove('correct', 'incorrect');
            card.querySelector('.correct-icon').style.opacity = '0';
            card.querySelector('.incorrect-icon').style.opacity = '0';
        });
        updateProgress();
    });

    // Initial Order
    btnInitialOrder.addEventListener('click', () => {
        // 現在の入力を保存
        const inputs = {};
        document.querySelectorAll('.answer-input').forEach(input => {
            inputs[input.dataset.id] = input.value;
        });

        currentData = [...masterData];
        renderQuestions();

        // 入力を復元し、必要に応じて判定
        document.querySelectorAll('.answer-input').forEach(input => {
            if (inputs[input.dataset.id]) {
                input.value = inputs[input.dataset.id];
            }
        });

        if (isIndividualMode || (!isIndividualMode && checkAllFilled())) {
            validateAll();
        }
    });

    // Shuffle (Fisher-Yates)
    btnShuffle.addEventListener('click', () => {
        // 現在の入力を保存
        const inputs = {};
        document.querySelectorAll('.answer-input').forEach(input => {
            inputs[input.dataset.id] = input.value;
        });

        // シャッフル
        for (let i = currentData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentData[i], currentData[j]] = [currentData[j], currentData[i]];
        }
        
        renderQuestions();

        // 入力を復元し、必要に応じて判定
        document.querySelectorAll('.answer-input').forEach(input => {
            if (inputs[input.dataset.id]) {
                input.value = inputs[input.dataset.id];
            }
        });

        if (isIndividualMode || (!isIndividualMode && checkAllFilled())) {
            validateAll();
        }
    });

    // Guide Modal
    function openGuide() {
        guideModal.classList.add('show');
    }

    function closeGuide() {
        guideModal.classList.remove('show');
        if (chkDontShow.checked) {
            localStorage.setItem('kotudoGuideDontShow', 'true');
        } else {
            localStorage.removeItem('kotudoGuideDontShow');
        }
    }

    btnGuide.addEventListener('click', openGuide);
    btnCloseGuide.addEventListener('click', closeGuide);
    btnStart.addEventListener('click', closeGuide);
    
    // Close modal on outside click
    guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            closeGuide();
        }
    });

    // Start App
    init();
});
