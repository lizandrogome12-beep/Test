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

// Lista de cartas numeradas. O código vai testar automaticamente se é .jpg ou .png
const deckDatabase = [
    { id: 1, name: "Mago Negro", atk: 2500, def: 2100, num: 1 },
    { id: 2, name: "Dragão Branco", atk: 3000, def: 2500, num: 2 },
    { id: 3, name: "Guerreiro Céltico", atk: 1400, def: 1200, num: 3 },
    { id: 4, name: "Dragão Vermelho", atk: 2400, def: 2000, num: 4 }
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

// Iniciar Modos de Jogo (Bot ou Multiplayer por Convite)
function startGameMode(mode) {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("battle-screen").classList.remove("hidden");

    if (mode === 'bot') {
        document.getElementById("game-status").innerText = "Batalha contra o Bot iniciada!";
        loadPlayerHand();
    } else if (mode === 'multiplayer') {
        let shareText = `🔥 Desafio de Yu-Gi-Oh! TCG criado por ${playerData.username}! Clica para aceitar o duelo.`;
        let shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me/Waifu20_bot/test")}&text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
    }
}

// Simular vitória contra o bot
function simulateBotWin() {
    playerData.wins += 1;
    updateRank();
    saveGameData();
    
    document.getElementById("user-wins").innerText = playerData.wins;
    document.getElementById("user-rank").innerText = playerData.rank;
    alert("Vitória registada com sucesso! Dados guardados no banco de dados.");
}

// Carregar as cartas e tentar detetar extensões diferentes (.jpg ou .png) automaticamente
function loadPlayerHand() {
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = "";

    deckDatabase.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        
        // Criamos o elemento da imagem e definimos um sistema de fallback inteligente (.jpg -> se falhar, tenta .png)
        const imgPathJpg = `images/${card.num}.jpg`;
        const imgPathPng = `images/${card.num}.png`;

        cardElement.innerHTML = `
            <span>${card.name}</span>
            <img src="${imgPathJpg}" onerror="this.onerror=null; this.src='${imgPathPng}';" alt="${card.name}">
            <span>ATK:${card.atk}</span>
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

