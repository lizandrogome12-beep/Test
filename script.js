// Inicializa o Telegram Web App
let tg = {};
try {
    tg = window.Telegram.WebApp;
    tg.expand();
} catch (e) {
    console.log("Telegram WebApp não detetado.");
}

// Carregar dados salvos do jogador ou iniciar valores padrão (Banco de Dados Local)
let playerData = JSON.parse(localStorage.getItem('yugioh_player')) || {
    username: (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) ? tg.initDataUnsafe.user.first_name : "Duelista",
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
    try {
        localStorage.setItem('yugioh_player', JSON.stringify(playerData));
    } catch (e) {
        console.error("Erro ao salvar dados:", e);
    }
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

// Carregar informações principais ao iniciar a aplicação com segurança
window.onload = function() {
    try {
        updateRank();
        saveGameData();
        
        const usernameEl = document.getElementById("username");
        if (usernameEl) usernameEl.innerText = playerData.username;

        const winsEl = document.getElementById("user-wins");
        if (winsEl) winsEl.innerText = playerData.wins;

        const rankEl = document.getElementById("user-rank");
        if (rankEl) rankEl.innerText = playerData.rank;
    } catch (err) {
        console.error("Erro no onload:", err);
    }
};

// Iniciar Modos de Jogo (Protegido contra falhas)
function startGameMode(mode) {
    try {
        if (mode === 'bot') {
            const mainMenu = document.getElementById("main-menu");
            const battleScreen = document.getElementById("battle-screen");
            if (mainMenu) mainMenu.classList.add("hidden");
            if (battleScreen) battleScreen.classList.remove("hidden");
            
            const gameStatus = document.getElementById("game-status");
            if (gameStatus) gameStatus.innerText = "Batalha contra o Bot iniciada!";
            
            loadPlayerHand();
        } else if (mode === 'multiplayer') {
            let queryText = `duel_${playerData.username}`;
            
            if (tg && tg.switchInlineQuery) {
                try {
                    tg.switchInlineQuery(queryText, ['users', 'groups', 'channels']);
                } catch (e) {
                    tg.switchInlineQuery(queryText);
                }
            } else {
                alert("Modo multiplayer inline não suportado neste ambiente.");
            }
        }
    } catch (err) {
        console.error("Erro ao iniciar modo de jogo:", err);
    }
}

// Simular vitória contra o bot
function simulateBotWin() {
    playerData.wins += 1;
    updateRank();
    saveGameData();
    
    const winsEl = document.getElementById("user-wins");
    if (winsEl) winsEl.innerText = playerData.wins;

    const rankEl = document.getElementById("user-rank");
    if (rankEl) rankEl.innerText = playerData.rank;

    alert("Vitória registada com sucesso! Dados guardados no banco de dados.");
}

// Carregar as cartas considerando os parênteses nos nomes dos ficheiros do GitHub
function loadPlayerHand() {
    const handContainer = document.getElementById("player-hand");
    if (!handContainer) return;
    
    handContainer.innerHTML = "";

    deckDatabase.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        
        const imgPath = `images/(${card.num}).jpg`;
        const imgPathPng = `images/(${card.num}).png`;

        cardElement.innerHTML = `
            <img src="${imgPath}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="Carta ${card.num}">
            <span>ATK: ${card.atk}</span>
        `;
        handContainer.appendChild(cardElement);
    });
    
    const gameStatus = document.getElementById("game-status");
    if (gameStatus) {
        gameStatus.innerHTML = `
            Sua vez de jogar! <br>
            <button onclick="simulateBotWin()" style="margin-top:5px; padding:6px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:4px;">[Simular Vitória]</button>
        `;
    }
}

// Voltar para o Menu Principal
function returnToMenu() {
    const battleScreen = document.getElementById("battle-screen");
    const mainMenu = document.getElementById("main-menu");
    if (battleScreen) battleScreen.classList.add("hidden");
    if (mainMenu) mainMenu.classList.remove("hidden");
}

function endTurn() {
    alert("Turno encerrado. Vez do Oponente!");
}

function openDeckBuilder() {
    alert("Funcionalidade do Baralho em desenvolvimento!");
}

