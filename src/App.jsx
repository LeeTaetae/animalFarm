
import { useState, useEffect } from "react";
import "./App.css";

import CarrotGame from "./components/minigames/CarrotGame";
import MiniGameMenu from "./components/minigames/MiniGameMenu";
import FishGame from "./components/minigames/FishGame";
import EggGame from "./components/minigames/EggGame";
import Shop from "./components/shop/Shop";
import Bag from "./components/bag/Bag";

const initialAnimals = [
  {
    id: 1,
    name: "토토",
    type: "토끼",
    image: "/assets/animals/rabbit.png",
    hunger: 80,
    love: 30,
    x: 43,
    y: 55,
  },
  {
    id: 2,
    name: "나비",
    type: "고양이",
    image: "/assets/animals/cat.png",
    hunger: 60,
    love: 50,
    x: 61,
    y: 62,
  },
  {
    id: 3,
    name: "삐약",
    type: "병아리",
    image: "/assets/animals/chick.png",
    hunger: 90,
    love: 20,
    x: 79,
    y: 53,
  },
];

export default function App() {
  
const [animals, setAnimals] = useState(() => {
  const saved = localStorage.getItem("farm_animals");
  return saved ? JSON.parse(saved) : initialAnimals;
});

const [selectedId, setSelectedId] = useState(null);

const [coins, setCoins] = useState(() => {
  const saved = localStorage.getItem("farm_coins");
  return saved !== null ? JSON.parse(saved) : 200;
});

const [inventory, setInventory] = useState(() => {
  const saved = localStorage.getItem("farm_inventory");
  return saved ? JSON.parse(saved) : {};
});

const [level, setLevel] = useState(() => {
  const saved = localStorage.getItem("farm_level");
  return saved ? JSON.parse(saved) : 1;
});

const [xp, setXp] = useState(() => {
  const saved = localStorage.getItem("farm_xp");
  return saved ? JSON.parse(saved) : 0;
});

  const [message, setMessage] = useState("");
  const [page, setPage] = useState("farm");
  const [selectedGame, setSelectedGame] = useState(null);

  
  useEffect(() => {
    localStorage.setItem("farm_animals", JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    localStorage.setItem("farm_coins", JSON.stringify(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(
      "farm_inventory",
      JSON.stringify(inventory)
    );
  }, [inventory]);

  useEffect(() => {
  localStorage.setItem("farm_level", JSON.stringify(level));
}, [level]);

useEffect(() => {
  localStorage.setItem("farm_xp", JSON.stringify(xp));
}, [xp]);
  


  const selectedAnimal = animals.find(
    (animal) => animal.id === selectedId
  );

  // 동물 상태 변경
  const changeAnimal = (id, changes) => {
    setAnimals((current) =>
      current.map((animal) =>
        animal.id === id
          ? { ...animal, ...changes }
          : animal
      )
    );
  };

  // 먹이 주기
  const feed = () => {
    if (!selectedAnimal) return;

    if (coins < 10) {
      setMessage("코인이 부족해! 아르바이트에서 벌어보자 🥕");
      return;
    }

    if (selectedAnimal.hunger === 100) {
      setMessage("이미 배가 불러요!");
      return;
    }

    setCoins((value) => value - 10);

    changeAnimal(selectedAnimal.id, {
      hunger: Math.min(100, selectedAnimal.hunger + 20),
      love: Math.min(100, selectedAnimal.love + 5),
    });

    setMessage(`${selectedAnimal.name}가 맛있게 먹었어요! 💕`);
  };

  // 쓰다듬기
  const pet = () => {
    if (!selectedAnimal) return;

    changeAnimal(selectedAnimal.id, {
      love: Math.min(100, selectedAnimal.love + 10),
    });

    setMessage(`${selectedAnimal.name}가 행복해해요! 💗`);
  };

  // 상점 아이템 구매
  const buyItem = (item) => {
    if (coins < item.price) return;

    setCoins((prev) => prev - item.price);

    setInventory((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const earnReward = (amount) => {
  // 아르바이트 보상 코인
  setCoins((prev) => prev + amount);

  // 획득 코인의 10%만큼 경험치 지급
  const earnedXp = Math.floor(amount * 0.1);

  // 현재 경험치에 추가
  const totalXp = xp + earnedXp;

  // 100XP마다 레벨업
  const levelUps = Math.floor(totalXp / 100);

  setXp(totalXp % 100);

  if (levelUps > 0) {
    setLevel((prev) => prev + levelUps);
    setCoins((prev) => prev + levelUps * 50);
    alert(`🎉 레벨업! ${levelUps * 50} 보너스 코인 획득!`);
  }
};

  // 가방 아이템 사용
  const useItem = (item, animalId) => {
    const quantity = inventory[item.id] || 0;
    const animal = animals.find((a) => a.id === animalId);

    if (quantity <= 0 || !animal) return false;

    const newHunger = Math.min(
      100,
      animal.hunger + item.hunger
    );

    const newLove = Math.min(
      100,
      animal.love + item.love
    );

    // 이미 최대치라면 아이템을 사용하지 않음
    if (
      newHunger === animal.hunger &&
      newLove === animal.love
    ) {
      return false;
    }

    setAnimals((prev) =>
      prev.map((a) =>
        a.id === animalId
          ? {
              ...a,
              hunger: newHunger,
              love: newLove,
            }
          : a
      )
    );

    setInventory((prev) => ({
      ...prev,
      [item.id]: prev[item.id] - 1,
    }));

    return true;
  };

  // 페이지 이동
  const openPage = (next) => {
    setPage(next);
    setSelectedId(null);
    setSelectedGame(null);
  };

  return (
    <div className="game-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-flower">🌸</span>

          <div>
            <h1>별빛 동물농장</h1>
            <small>오늘도 동물 친구들과 행복한 하루!</small>
          </div>
        </div>

        <div className="top-stats">
          <div className="coin-pill">
            👛 <strong>{coins}</strong> 코인
          </div>

          <div className="level-pill">
          ⭐ Lv. {level}
          <small style={{ marginLeft: "8px" }}>
            {xp}/100 XP
          </small>
        </div>
        </div>
      </header>

      <main className="farm-frame">
        {page === "farm" ? (
          <div className="farm-scene">
            <div className="scene-label">
              ☀️ 햇살 가득한 우리 농장
            </div>

            {animals.map((animal) => (
              <button
                key={animal.id}
                className="farm-animal"
                style={{
                  left: `${animal.x}%`,
                  top: `${animal.y}%`,
                }}
                onClick={() => {
                  setSelectedId(animal.id);
                  setMessage("");
                }}
              >
                <span className="heart-bubble">♥</span>

                <img
                  src={animal.image}
                  alt={animal.name}
                />

                <span className="nameplate">
                  {animal.name}
                </span>
              </button>
            ))}
          </div>
        ) : page === "work" ? (
          selectedGame === "carrot" ? (
            <CarrotGame
              onExit={() => setSelectedGame(null)}
              onReward={{earnReward}}
            />
          ) : selectedGame === "fish" ? (
            <FishGame
              onExit={() => setSelectedGame(null)}
              onReward={{earnReward}}
            />
          ) : selectedGame === "egg" ? (
            <EggGame
              onExit={() => setSelectedGame(null)}
              onReward={{earnReward}}
            />
          ) : (
            <MiniGameMenu onSelect={setSelectedGame} />
          )
        ) : page === "shop" ? (
          <Shop
            coins={coins}
            inventory={inventory}
            onBuy={buyItem}
          />
        ) : page === "bag" ? (
          <Bag
            inventory={inventory}
            animals={animals}
            onUseItem={useItem}
          />
        ) : null}
      </main>

      <nav className="bottom-nav" aria-label="게임 메뉴">
        {[
          { id: "farm", icon: "🏡", label: "농장" },
          { id: "shop", icon: "🏪", label: "상점" },
          { id: "work", icon: "🎮", label: "아르바이트" },
          { id: "bag", icon: "🎒", label: "가방" },
        ].map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => openPage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {selectedAnimal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedId(null)}
        >
          <section
            className="animal-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedAnimal.name} 상태`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <span>💗 {selectedAnimal.name}</span>

              <button
                aria-label="닫기"
                onClick={() => setSelectedId(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <img
                src={selectedAnimal.image}
                alt={selectedAnimal.name}
              />

              <div className="animal-info">
                <span>
                  종류 <b>{selectedAnimal.type}</b>
                </span>

                <span>
                  성격 <b>활발함</b>
                </span>

                <span>
                  상태 <b>행복해요!</b>
                </span>
              </div>
            </div>

            <div className="stat-line">
              <div>
                🥕 배부름
                <b>{selectedAnimal.hunger}/100</b>
              </div>

              <div className="meter">
                <span
                  className="hunger-meter"
                  style={{
                    width: `${selectedAnimal.hunger}%`,
                  }}
                />
              </div>
            </div>

            <div className="stat-line">
              <div>
                💖 친밀도
                <b>{selectedAnimal.love}/100</b>
              </div>

              <div className="meter">
                <span
                  className="love-meter"
                  style={{
                    width: `${selectedAnimal.love}%`,
                  }}
                />
              </div>
            </div>

            <p className="feedback" aria-live="polite">
              {message ||
                `${selectedAnimal.name}가 반갑게 인사해요!`}
            </p>

            <div className="modal-actions">
              <button onClick={feed}>
                🥕 먹이 주기
                <small>-10코인</small>
              </button>

              <button onClick={pet}>
                💗 쓰다듬기
                <small>+친밀도</small>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
