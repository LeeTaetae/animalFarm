
import { useEffect, useRef, useState } from "react";
import "./FishGame.css";

const GAME_TIME = 30;
const PLAYER_WIDTH = 18;
const ITEM_WIDTH = 9;

export default function FishGame({ onExit, onReward }) {
  const [status, setStatus] = useState("ready");
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState([]);
  const [claimed, setClaimed] = useState(false);

  const keysRef = useRef(new Set());
  const gameRef = useRef({
    playerX: 50,
    items: [],
    score: 0,
    nextId: 0,
    spawnTime: 0,
    lastTime: 0,
    startedAt: 0,
  });

  const startGame = () => {
    keysRef.current.clear();

    gameRef.current = {
      playerX: 50,
      items: [],
      score: 0,
      nextId: 0,
      spawnTime: 0,
      lastTime: 0,
      startedAt: performance.now(),
    };

    setPlayerX(50);
    setItems([]);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setClaimed(false);
    setStatus("playing");
  };

  useEffect(() => {
    if (status !== "playing") return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
    };

    const handleKeyUp = (event) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    const clearKeys = () => keysRef.current.clear();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    let animationId;

    const update = (now) => {
      const game = gameRef.current;

      if (!game.lastTime) game.lastTime = now;

      const delta = Math.min((now - game.lastTime) / 1000, 0.05);
      game.lastTime = now;

      const elapsed = (now - game.startedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(GAME_TIME - elapsed));

      setTimeLeft((prev) => prev === remaining ? prev : remaining);

      if (elapsed >= GAME_TIME) {
        setScore(game.score);
        setStatus("finished");
        return;
      }

      const keys = keysRef.current;

      if (keys.has("arrowleft") || keys.has("a")) {
        game.playerX -= 55 * delta;
      }

      if (keys.has("arrowright") || keys.has("d")) {
        game.playerX += 55 * delta;
      }

      game.playerX = Math.max(
        PLAYER_WIDTH / 2,
        Math.min(100 - PLAYER_WIDTH / 2, game.playerX)
      );

      // 0.7초마다 새로운 아이템 생성
      game.spawnTime += delta;

      if (game.spawnTime >= 0.7) {
        game.spawnTime = 0;

        game.items.push({
          id: game.nextId++,
          x: 5 + Math.random() * 85,
          y: -10,
          type: Math.random() < 0.25 ? "trash" : "fish",
          speed: 24 + Math.random() * 14,
        });
      }

      const remainingItems = [];

      for (const item of game.items) {
        item.y += item.speed * delta;

        // 고양이는 화면 아래쪽(y=88)에 위치
        const caught =
          item.y >= 78 &&
          item.y <= 95 &&
          Math.abs(item.x - game.playerX) <
            (PLAYER_WIDTH + ITEM_WIDTH) / 2;

        if (caught) {
          game.score = Math.max(
            0,
            game.score + (item.type === "fish" ? 10 : -10)
          );
        } else if (item.y < 105) {
          remainingItems.push(item);
        }
      }

      game.items = remainingItems;

      setPlayerX(game.playerX);
      setItems([...game.items]);
      setScore(game.score);

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
      keysRef.current.clear();
    };
  }, [status]);

  const claimReward = () => {
    if (status !== "finished" || claimed) return;

    setClaimed(true);
    onReward(score * 3);
    onExit();
  };

  const movePlayer = (direction) => {
    if (status !== "playing") return;

    gameRef.current.playerX = Math.max(
      PLAYER_WIDTH / 2,
      Math.min(
        100 - PLAYER_WIDTH / 2,
        gameRef.current.playerX + direction * 8
      )
    );

    setPlayerX(gameRef.current.playerX);
  };

  return (
    <div className="fish-game">
      <h2>🐱 나비의 생선 받기!</h2>

      <div className="fish-status">
        <span>⏰ {timeLeft}초</span>
        <span>⭐ {score}점</span>
      </div>

      {status === "ready" && (
        <div className="fish-intro">
          <div className="fish-intro-icons">🐱 🐟 💕</div>
          <p>하늘에서 떨어지는 생선을 받아줘!</p>
          <p>🐟 +10점 / 🗑️ -10점</p>
          <p>⬅️ ➡️ 또는 A, D 키로 움직일 수 있어.</p>
          <button onClick={startGame}>게임 시작!</button>
        </div>
      )}

      {status === "playing" && (
        <>
          <div className="fish-field">
            <div className="fish-cloud cloud-one">☁️</div>
            <div className="fish-cloud cloud-two">☁️</div>

            {items.map((item) => (
              <span
                key={item.id}
                className="falling-item"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
              >
                {item.type === "fish" ? "🐟" : "🗑️"}
              </span>
            ))}

            <div
              className="fish-player"
              style={{ left: `${playerX}%` }}
            >
              <img
                src="/assets/animals/cat.png"
                alt="나비"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <span>🧺</span>
            </div>

            <div className="fish-ground" />
          </div>

          <div className="fish-controls">
            <button
              onPointerDown={() => movePlayer(-1)}
            >
              ⬅️ 왼쪽
            </button>
            <button
              onPointerDown={() => movePlayer(1)}
            >
              오른쪽 ➡️
            </button>
          </div>
        </>
      )}

      {status === "finished" && (
        <div className="fish-result">
          <h3>🎉 아르바이트 종료!</h3>
          <p>최종 점수: {score}점</p>
          <p>획득 코인: 🪙 {score * 3}</p>

          <button onClick={claimReward} disabled={claimed}>
            보상 받기
          </button>
        </div>
      )}

      <button className="fish-exit" onClick={onExit}>
        🏡 농장으로 돌아가기
      </button>
    </div>
  );
}
