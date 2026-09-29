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

// Carregar informações principais ao iniciar a aplicação e verificar convites de duelo
window.onload = function() {
    updateRank();
    saveGameData();
    document.getElementById("username").innerText = playerData.username;
    document.getElementById("user-wins").innerText = playerData.wins;
    document.getElementById("user-rank").innerText = playerData.rank;

    // Verificar se o jogo foi aberto através de um link de convite (Multiplayer)
    const urlParams = new URLSearchParams(window.location.search);
    const duelOpponent = urlParams.get('duel');

    if (duelOpponent) {
        const mainMenu = document.getElementById("main-menu");
        const battleScreen = document.getElementById("battle-screen");
        if (mainMenu) mainMenu.classList.add("hidden");
        if (battleScreen) battleScreen.classList.remove("hidden");
        
        const gameStatus = document.getElementById("game-status");
        if (gameStatus) {
            gameStatus.innerText = `Duelo contra ${duelOpponent} iniciado!`;
        }
        loadPlayerHand();
    }
};

// Iniciar Modos de Jogo (Bot ou Partilha de Multiplayer)
function startGameMode(mode) {
    try {
        if (mode === 'bot') {
            // Se for contra o bot, esconde o menu e abre o ecrã de batalha
            const mainMenu = document.getElementById("main-menu");
            const battleScreen = document.getElementById("battle-screen");
            if (mainMenu) mainMenu.classList.add("hidden");
            if (battleScreen) battleScreen.classList.remove("hidden");
            
            const gameStatus = document.getElementById("game-status");
            if (gameStatus) gameStatus.innerText = "Batalha contra o Bot iniciada!";
            
            loadPlayerHand();
        } else if (mode === 'multiplayer') {
            // Mensagem de convite atrativa para o grupo
            let shareText = `⚔️ ${playerData.username} abriu uma sala de Duelo no Card Battle TCG! Clica no link para jogar contra mim:`;
            
            // O teu link atualizado do GitHub Pages com o parâmetro de duelo
            let gameUrl = `https://shedowhhghf.github.io/Test/?duel=${encodeURIComponent(playerData.username)}`;
            let shareUrl = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(shareText)}`;
            
            // Abre o menu de partilha nativo do Telegram sem falhas
            if (tg && tg.openTelegramLink) {
                tg.openTelegramLink(shareUrl);
            } else {
                window.open(shareUrl, '_blank');
            }
        }
    } catch (err) {
        console.error("Erro ao iniciar modo de jogo:", err);
    }
}

// Simular vitória contra o bot/oponente
function simulateBotWin() {
    playerData.wins += 1;
    updateRank();
    saveGameData();
    
    document.getElementById("user-wins").innerText = playerData.wins;
    document.getElementById("user-rank").innerText = playerData.rank;
    alert("Vitória registada com sucesso! Dados guardados no banco de dados.");
}

// Carregar as cartas considerando os parênteses nos nomes dos ficheiros do GitHub
function loadPlayerHand() {
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = "";

    deckDatabase.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        
        // Caminho adaptado para os ficheiros com parênteses (ex: images/(1).jpg)
        const imgPath = `images/(${card.num}).jpg`;
        const imgPathPng = `images/(${card.num}).png`;

        cardElement.innerHTML = `
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${card.num}">
            <span>ATK: ${card.atk}</span>
        `;
        handContainer.appendChild(cardElement);
    });
    
    document.getElementById("game-status").innerHTML = `
        Sua vez de jogar! <br>
        <button onclick="simulateBotWin()" style="margin-top:5px; padding:6px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:4px;">[Simular Vitória]</button>
    `;
}

// Voltar para o Menu Principal
function returnToMenu() {
    document.getElementById("battle-screen").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

function endTurn() {
    alert("Turno encerrado. Vez do Oponente!");
}

function openDeckBuilder() {
    alert("Funcionalidade do Baralho em desenvolvimento!");
}

