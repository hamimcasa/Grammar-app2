let currentQuestionIndex = 0;
let score = 0;
let isAnswerLocked = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

function loadQuestion() {
    isAnswerLocked = false;
    const q = quizData[currentQuestionIndex];
    const progressPercent = (currentQuestionIndex / quizData.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    document.getElementById('tense-badge').textContent = q.tense;
    document.getElementById('group-badge').textContent = q.group;
    document.getElementById('question-prompt').innerHTML = `${q.prompt}<br><strong style="font-size: 20px; color: #2b2b2b; display: block; margin-top: 10px; direction: ltr; text-align: left;">${q.sentence}</strong>`;
    document.getElementById('example-text').textContent = q.exampleFr;

    let allOptions = [...q.options, q.answer];
    allOptions.sort(() => Math.random() - 0.5);

    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';

    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => selectOption(option, btn);
        optionsGrid.appendChild(btn);
    });
}

function selectOption(selectedOption, selectedBtn) {
    if (isAnswerLocked) return;
    isAnswerLocked = true;

    const currentQ = quizData[currentQuestionIndex];
    const isCorrect = (selectedOption === currentQ.answer);
    const buttons = document.querySelectorAll('.option-btn');

    buttons.forEach(btn => {
        if (btn.textContent === currentQ.answer) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        score++;
        playSound('correct');
    } else {
        playSound('error');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            document.getElementById('quiz-header').style.display = 'none';
            document.getElementById('quiz-screen').style.display = 'none';
            document.getElementById('results-screen').style.display = 'flex';
            document.getElementById('final-score-text').textContent = `لقد أجبت على ${score} من ${quizData.length} إجابة صحيحة بشكل ممتاز!`;
        }
    }, 1500);
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('quiz-header').style.display = 'flex';
    document.getElementById('quiz-screen').style.display = 'flex';
    document.getElementById('results-screen').style.display = 'none';
    loadQuestion();
}

function openAdminPanel() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'flex';
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-pass-input').value = '';
}

function verifyAdminPassword() {
    const pass = document.getElementById('admin-pass-input').value;
    if (pass === '1234') {
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    } else {
        alert('رمز المرور خاطئ!');
    }
}

function exitAdminToQuiz() {
    document.getElementById('admin-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-header').style.display = 'flex';
    document.getElementById('quiz-screen').style.display = 'flex';
    if (currentQuestionIndex >= quizData.length) {
        currentQuestionIndex = 0;
        score = 0;
    }
    loadQuestion();
}

function addNewQuestion() {
    const tense = document.getElementById('new-tense').value.trim();
    const group = document.getElementById('new-group').value;
    const sentence = document.getElementById('new-sentence').value.trim();
    const answer = document.getElementById('new-answer').value.trim();
    const optionsInput = document.getElementById('new-options').value.trim();
    const exampleFr = document.getElementById('new-example').value.trim();

    if (!tense || !sentence || !answer || !optionsInput) {
        alert('المرجو ملء جميع الحقول الضرورية!');
        return;
    }

    const options = optionsInput.split(',').map(item => item.trim());

    quizData.push({
        tense: tense,
        group: group,
        exampleFr: exampleFr || "Exemple par défaut.",
        prompt: "أتمم الجملة:",
        sentence: sentence,
        options: options,
        answer: answer
    });

    alert('تمت إضافة السؤال بنجاح!');
    document.getElementById('new-tense').value = '';
    document.getElementById('new-sentence').value = '';
    document.getElementById('new-answer').value = '';
    document.getElementById('new-options').value = '';
    document.getElementById('new-example').value = '';
    
    exitAdminToQuiz();
}

window.onload = loadQuestion;
                            
