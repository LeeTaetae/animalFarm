import "./MiniGameMenu.css";

export default function MiniGameMenu({onSelect}) {

    const games = [
    {
      id: "carrot",
      icon: "🥕",
      title: "당근 수확 대작전",
      description: "30초 동안 당근을 빠르게 수확해요!",
      reward: "점수 × 2코인",
    },
    {
      id: "fish",
      icon: "🐟",
      title: "나비의 생선 받기",
      description: "고양이를 움직여 생선을 받아요!",
      reward: "점수 × 3코인",
    },
    {
      id: "egg",
      icon: "🥚",
      title: "삐약이의 달걀 분류",
      description: "색깔에 맞춰 달걀을 분류해요!",
      reward: "점수 × 3코인",
      // locked: true,
    },
  ];

  return(
    <div className="minigame-menu">
      <h2>🎮 동물농장 아르바이트</h2>
      <p>좋아하는 아르바이트를 선택해 봐!</p>

      <div className="minigame-cards">
        {games.map((game) => (
          <button
            key={game.id}
            className="minigame-card"
            disabled={game.locked}
            onClick={() => onSelect(game.id)}
          >
            <span className="minigame-icon">{game.icon}</span>
            <strong>{game.title}</strong>
            <span>{game.description}</span>
            <small>
              {game.locked ? "🔒 준비 중" : `🪙 ${game.reward}`}
            </small>
          </button>
        ))}
      </div>
    </div>
  );
  
}