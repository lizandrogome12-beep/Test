// Inicializa o Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Carregar dados salvos do jogador ou iniciar valores padrão (Banco de Dados Local)
let playerData = JSON.parse(localStorage.getItem('yugioh_player')) || {
    username: tg.initDataUnsafe?.user?.first_name || "Duelista",
    wins: 0,
    rank: "Novato",
    hp: 8000
};

// Base completa de cartas do jogo
const fullDeckDatabase = [
    { id: 1, atk: 2500, def: 2100, num: 1 },
    { id: 2, atk: 3000, def: 2500, num: 2 },
    { id: 3, atk: 1400, def: 1200, num: 3 },
    { id: 4, atk: 2400, def: 2000, num: 4 }
];

// Estado atual da partida
let playerHand = [];
let playerHp = 8000;
let opponentHp = 8000;

// Salvar dados no Banco de Dados local para não perder nada ao fechar
function saveGameData() {
    localStorage.setItem('yugioh_player', JSON.stringify(playerData));
}

// Atualizar o Rank de acordo com o número de vitórias
function updateRank() {
    if (playerData.wins >= 10) {
        playerData.rank = "Mestre dos Jogos";
    } else if (playerData.wins >= 5) {
        playerData.rank = "Duelista Experiente";
    } else if (playerData.wins >= 2) {
        playerData.rank = "Duelista Intermediário";
    } else {
        playerData.rank = "Novato";
    }
}

// Carregar informações principais ao iniciar a aplicação
window.onload = function() {
    updateRank();
    saveGameData();
    document.getElementById("username").innerText = playerData.username;
    document.getElementById("user-wins").innerText = playerData.wins;
    document.getElementById("user-rank").innerText = playerData.rank;
};

// Iniciar Batalha contra o Bot
function startGameMode(mode) {
    if (mode === 'bot') {
        const mainMenu = document.getElementById("main-menu");
        const battleScreen = document.getElementById("battle-screen");
        if (mainMenu) mainMenu.classList.add("hidden");
        if (battleScreen) battleScreen.classList.remove("hidden");
        
        // Reiniciar HPs da partida
        playerHp = 8000;
        opponentHp = 8000;
        updateHpDisplay();

        // Embaralhar e distribuir mão inicial
        refillPlayerHand();
        
        const gameStatus = document.getElementById("game-status");
        if (gameStatus) gameStatus.innerText = "Duelo iniciado! Escolhe uma carta da tua mão.";
        
        document.getElementById("field-container").innerHTML = "<span style='color: #aaa; font-size: 14px;'>Nenhuma carta no campo.</span>";
        document.getElementById("opponent-field").innerHTML = "<span style='color: #aaa; font-size: 14px;'>O bot aguarda a sua jogada.</span>";
    }
}

// Atualizar o display de HP no ecrã
function updateHpDisplay() {
    document.getElementById("opp-hp").innerText = opponentHp;
    // Se tiveres um span para o teu HP no HTML, podes atualizar aqui também
}

// Embaralhar e distribuir novas cartas para a mão
function refillPlayerHand() {
    // Copia todas as cartas do banco e baralha-as de forma aleatória
    playerHand = [...fullDeckDatabase].sort(() => Math.random() - 0.5);
    renderPlayerHand();
}

// Renderizar as cartas na mão do jogador
function renderPlayerHand() {
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = "";

    if (playerHand.length === 0) {
        handContainer.innerHTML = "<span style='color: #f1c40f; font-size: 12px;'>Mão vazia! A reembaralhar baralho...</span>";
        setTimeout(() => {
            refillPlayerHand();
        }, 1200);
        return;
    }

    playerHand.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        
        const imgPath = `images/(${card.num}).jpg`;
        const imgPathPng = `images/(${card.num}).png`;

        cardElement.innerHTML = `
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${card.num}">
            <span>ATK: ${card.atk}</span>
        `;

        cardElement.style.cursor = "pointer";
        cardElement.style.webkitTapHighlightColor = "transparent";
        cardElement.style.touchAction = "manipulation";

        // Ao clicar, joga a carta, remove da mão e gasta-a
        cardElement.addEventListener('click', function(e) {
            e.preventDefault();
            playCard(index);
        });

        handContainer.appendChild(cardElement);
    });
}

// --- CÉREBRO DA IA DO BOT ---
function getSmartBotCard(playerAtk) {
    const winningOrTyingCards = fullDeckDatabase.filter(card => card.atk >= playerAtk);
    const isSmartMove = Math.random() < 0.75;

    if (isSmartMove && winningOrTyingCards.length > 0) {
        winningOrTyingCards.sort((a, b) => a.atk - b.atk);
        return winningOrTyingCards[0];
    } else {
        return fullDeckDatabase[Math.floor(Math.random() * fullDeckDatabase.length)];
    }
}

// Jogar carta selecionada da mão
function playCard(index) {
    // Retirar a carta jogada da mão do jogador
    const playedCard = playerHand.splice(index, 1)[0];

    // 1. Mostrar a carta do jogador no campo
    const fieldContainer = document.getElementById("field-container");
    const imgPath = `images/(${playedCard.num}).jpg`;
    const imgPathPng = `images/(${playedCard.num}).png`;

    fieldContainer.innerHTML = `
        <div class="card" style="border-color: #27ae60; pointer-events: none;">
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${playedCard.num}">
            <span>ATK: ${playedCard.atk}</span>
        </div>
    `;

    // 2. O Bot joga a sua carta
    const selectedBotCard = getSmartBotCard(playedCard.atk);
    const botImgPath = `images/(${selectedBotCard.num}).jpg`;
    const botImgPathPng = `images/(${selectedBotCard.num}).png`;

    const opponentField = document.getElementById("opponent-field");
    opponentField.innerHTML = `
        <div class="card" style="border-color: #c0392b; pointer-events: none;">
            <img src="${botImgPath}" onerror="this.onerror=null; this.src='${botImgPathPng}';" alt="Carta Bot ${selectedBotCard.num}">
            <span>ATK: ${selectedBotCard.atk}</span>
        </div>
    `;

    // 3. Resolver combate e calcular dano de HP
    const gameStatus = document.getElementById("game-status");
    let damage = Math.abs(playedCard.atk - selectedBotCard.atk) + 500; // Dano base + diferença

    if (playedCard.atk > selectedBotCard.atk) {
        opponentHp -= damage;
        if (opponentHp < 0) opponentHp = 0;
        updateHpDisplay();

        if (opponentHp === 0) {
            // Jogador venceu o jogo completo!
            playerData.wins += 1;
            updateRank();
            saveGameData();
            document.getElementById("user-wins").innerText = playerData.wins;
            document.getElementById("user-rank").innerText = playerData.rank;

            gameStatus.innerHTML = `🏆 **PARABÉNS! Venceu o Duelo!** O bot ficou sem HP.<br><button onclick="startGameMode('bot')" style="margin-top:5px; padding:6px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;">[Jogar Novamente]</button>`;
            return;
        }

        gameStatus.innerHTML = `🎉 **Vitória na ronda!** Causaste ${damage} de dano ao bot.<br><button onclick="nextRound()" style="margin-top:5px; padding:6px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;">[Continuar Duelo]</button>`;
    
    } else if (playedCard.atk < selectedBotCard.atk) {
        playerHp -= damage;
        if (playerHp < 0) playerHp = 0;

        if (playerHp === 0) {
            gameStatus.innerHTML = `💀 **Derrota!** O teu HP chegou a zero. O bot venceu o jogo.<br><button onclick="startGameMode('bot')" style="margin-top:5px; padding:6px; font-size:12px; background:#c0392b; color:white; border:none; border-radius:4px; cursor:pointer;">[Tentar Novamente]</button>`;
            return;
        }

        gameStatus.innerHTML = `❌ **Derrota na ronda!** Sofreste ${damage} de dano.<br><button onclick="nextRound()" style="margin-top:5px; padding:6px; font-size:12px; background:#c0392b; color:white; border:none; border-radius:4px; cursor:pointer;">[Continuar Duelo]</button>`;
    
    } else {
        gameStatus.innerHTML = `🤝 **Empate!** Ninguém sofreu dano nesta ronda.<br><button onclick="nextRound()" style="margin-top:5px; padding:6px; font-size:12px; background:#f39c12; color:white; border:none; border-radius:4px; cursor:pointer;">[Continuar Duelo]</button>`;
    }

    // Atualizar visualmente a mão restante do jogador
    renderPlayerHand();
}

// Avançar para a próxima jogada mantendo o HP atual
function nextRound() {
    document.getElementById("field-container").innerHTML = "<span style='color: #aaa; font-size: 14px;'>Nenhuma carta no campo.</span>";
    document.getElementById("opponent-field").innerHTML = "<span style='color: #aaa; font-size: 14px;'>O bot aguarda a sua jogada.</span>";
    document.getElementById("game-status").innerText = "Sua vez de jogar! Escolhe uma carta.";
    
    // Se a mão esvaziou totalmente, reembaralha automaticamente
    if (playerHand.length === 0) {
        refillPlayerHand();
    }
}

// Voltar para o Menu Principal
function returnToMenu() {
    document.getElementById("battle-screen").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

function endTurn() {
    alert("Turno encerrado. Escolhe uma carta para jogar!");
}

function openDeckBuilder() {
    alert("Funcionalidade do Baralho em desenvolvimento!");
}

