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

// Lista de cartas numeradas sem texto de nome (apenas imagem e atributos)
const deckDatabase = [
    { id: 1, atk: 2500, def: 2100, num: 1 },
    { id: 2, atk: 3000, def: 2500, num: 2 },
    { id: 3, atk: 1400, def: 1200, num: 3 },
    { id: 4, atk: 2400, def: 2000, num: 4 }
];

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
        
        const gameStatus = document.getElementById("game-status");
        if (gameStatus) gameStatus.innerText = "Batalha contra o Bot iniciada! Escolhe uma carta estrategicamente.";
        
        loadPlayerHand();
        document.getElementById("field-container").innerHTML = "<span style='color: #aaa; font-size: 14px;'>Nenhuma carta no campo. Clica numa carta da mão para invocar!</span>";
        document.getElementById("opponent-field").innerHTML = "<span style='color: #aaa; font-size: 14px;'>O bot está a analisar a sua mão...</span>";
    }
}

// --- CÉREBRO DA IA DO BOT ---
function getSmartBotCard(playerAtk) {
    // Filtrar cartas que conseguem vencer ou empatar com a carta do jogador
    const winningOrTyingCards = deckDatabase.filter(card => card.atk >= playerAtk);
    
    // 75% de chance de jogar estrategicamente (tentar vencer/empatar se tiver carta para isso)
    // 25% de chance de cometer um "erro" tático (jogar aleatório para o jogo não ser impossível)
    const isSmartMove = Math.random() < 0.75;

    if (isSmartMove && winningOrTyingCards.length > 0) {
        // Escolher a carta mais fraca do bot que ainda assim derrota ou empata com o jogador (gestão de recursos)
        winningOrTyingCards.sort((a, b) => a.atk - b.atk);
        return winningOrTyingCards[0];
    } else {
        // Caso contrário, ou se não tiver cartas superiores, escolhe uma carta do deck de forma inteligente/aleatória ponderada
        return deckDatabase[Math.floor(Math.random() * deckDatabase.length)];
    }
}

// Jogar uma carta da mão para o campo e enfrentar o bot inteligente
function playCard(cardNum, cardAtk) {
    // 1. Mostrar a carta do jogador no campo
    const fieldContainer = document.getElementById("field-container");
    const imgPath = `images/(${cardNum}).jpg`;
    const imgPathPng = `images/(${cardNum}).png`;

    fieldContainer.innerHTML = `
        <div class="card" style="border-color: #27ae60;">
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${cardNum}">
            <span>ATK: ${cardAtk}</span>
        </div>
    `;

    // 2. O Bot Inteligente escolhe a carta com base na jogada do utilizador
    const selectedBotCard = getSmartBotCard(cardAtk);
    const botImgPath = `images/(${selectedBotCard.num}).jpg`;
    const botImgPathPng = `images/(${selectedBotCard.num}).png`;

    const opponentField = document.getElementById("opponent-field");
    opponentField.innerHTML = `
        <div class="card" style="border-color: #c0392b;">
            <img src="${botImgPath}" onerror="this.onerror=null; this.src='${botImgPathPng}';" alt="Carta Bot ${selectedBotCard.num}">
            <span>ATK: ${selectedBotCard.atk}</span>
        </div>
    `;

    // 3. Comparar o ATK para decidir o resultado do duelo
    const gameStatus = document.getElementById("game-status");
    if (cardAtk > selectedBotCard.atk) {
        playerData.wins += 1;
        updateRank();
        saveGameData();
        
        document.getElementById("user-wins").innerText = playerData.wins;
        document.getElementById("user-rank").innerText = playerData.rank;
        
        gameStatus.innerHTML = `🎉 **Boa! Vitória nesta ronda!** O teu ATK (${cardAtk}) superou a defesa do bot (${selectedBotCard.atk}).<br><button onclick="startGameMode('bot')" style="margin-top:5px; padding:6px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:4px;">[Próxima Ronda]</button>`;
    } else if (cardAtk < selectedBotCard.atk) {
        gameStatus.innerHTML = `❌ **Derrota!** O bot leu a tua jogada e usou uma carta mais forte (${selectedBotCard.atk} vs ${cardAtk}).<br><button onclick="startGameMode('bot')" style="margin-top:5px; padding:6px; font-size:12px; background:#c0392b; color:white; border:none; border-radius:4px;">[Tentar Novamente]</button>`;
    } else {
        gameStatus.innerHTML = `🤝 **Empate estratégico!** Ambos jogaram cartas com ${cardAtk} de ATK.<br><button onclick="startGameMode('bot')" style="margin-top:5px; padding:6px; font-size:12px; background:#f39c12; color:white; border:none; border-radius:4px;">[Jogar Outra]</button>`;
    }
}

// Carregar as cartas na mão do jogador com eventos de clique
function loadPlayerHand() {
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = "";

    deckDatabase.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        
        const imgPath = `images/(${card.num}).jpg`;
        const imgPathPng = `images/(${card.num}.png`;

        cardElement.innerHTML = `
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${card.num}">
            <span>ATK: ${card.atk}</span>
        `;

        // Ao clicar na carta da mão, joga-a para o campo
        cardElement.style.cursor = "pointer";
        cardElement.onclick = function() {
            playCard(card.num, card.atk);
        };

        handContainer.appendChild(cardElement);
    });
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

