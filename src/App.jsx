
import { useState, useEffect } from "react";
import "./App.css";

import CarrotGame from "./components/minigames/CarrotGame";
import MiniGameMenu from "./components/minigames/MiniGameMenu";
import FishGame from "./components/minigames/FishGame";
import EggGame from "./components/minigames/EggGame";
import Shop from "./components/shop/Shop";
import Bag from "./components/bag/Bag";

// 처음 시작할 때 동물 데이터
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

// localStorage 데이터 불러오기
function loadData(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);

    return saved !== null
      ? JSON.parse(saved)
      : defaultValue;
  } catch (error) {
    console.error(`${key} 데이터 불러오기 실패:`, error);
    return defaultValue;
  }
}

export default function App() {
  // 동물 상태
  const [animals, setAnimals] = useState(() =>
    loadData("farm_animals", initialAnimals)
  );

  // 선택한 동물
  const [selectedId, setSelectedId] = useState(null);

  // 코인
  const [coins, setCoins] = useState(() =>
    loadData("farm_coins", 200)
  );

  // 가방
  const [inventory, setInventory] = useState(() =>
    loadData("farm_inventory", {})
  );

  // 레벨
  const [level, setLevel] = useState(() =>
    loadData("farm_level", 1)
  );

  // 경험치
  const [xp, setXp] = useState(() =>
    loadData("farm_xp", 0)
  );

  // 메시지 및 화면 상태
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("farm");
  const [selectedGame, setSelectedGame] = useState(null);

  const selectedAnimal = animals.find(
    (animal) => animal.id === selectedId
  );

  // =========================================
  // 자동 저장
  // =========================================

  useEffect(() => {
    localStorage.setItem(
      "farm_animals",
      JSON.stringify(animals)
    );
  }, [animals]);

  useEffect(() => {
    localStorage.setItem(
      "farm_coins",
      JSON.stringify(coins)
    );
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(
      "farm_inventory",
      JSON.stringify(inventory)
    );
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(
      "farm_level",
      JSON.stringify(level)
    );
  }, [level]);

  useEffect(() => {
    localStorage.setItem(
      "farm_xp",
      JSON.stringify(xp)
    );
  }, [xp]);

  // =========================================
  // 동물 상태 변경
  // =========================================

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
      setMessage(
        "코인이 부족해! 아르바이트에서 벌어보자 🥕"
      );
      return;
    }

    if (selectedAnimal.hunger >= 100) {
      setMessage("이미 배가 불러요!");
      return;
    }

    setCoins((prev) => prev - 10);

    changeAnimal(selectedAnimal.id, {
      hunger: Math.min(
        100,
        selectedAnimal.hunger + 20
      ),
      love: Math.min(
        100,
        selectedAnimal.love + 5
      ),
    });

    setMessage(
      `${selectedAnimal.name}가 맛있게 먹었어요! 💕`
    );
  };

  // 쓰다듬기
  const pet = () => {
    if (!selectedAnimal) return;

    if (selectedAnimal.love >= 100) {
      setMessage("이미 친밀도가 가득 찼어요! 💗");
      return;
    }

    changeAnimal(selectedAnimal.id, {
      love: Math.min(
        100,
        selectedAnimal.love + 10
      ),
    });

    setMessage(
      `${selectedAnimal.name}가 행복해해요! 💗`
    );
  };

  // =========================================
  // 상점 아이템 구매
  // =========================================

  const buyItem = (item) => {
    if (coins < item.price) return;

    setCoins((prev) => prev - item.price);

    setInventory((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  // =========================================
  // 아르바이트 보상 및 경험치
  // =========================================

  const earnReward = (amount) => {
    const reward = Number(amount);

    if (!Number.isFinite(reward) || reward <= 0) {
      console.error("잘못된 보상 금액:", amount);
      return;
    }

    // 아르바이트 코인 지급
    setCoins((prev) => prev + reward);

    // 코인의 10%를 경험치로 지급
    const earnedXp = Math.floor(reward * 0.1);

    // 경험치 100마다 레벨업
    const totalXp = xp + earnedXp;
    const levelUps = Math.floor(totalXp / 100);
    const remainingXp = totalXp % 100;

    setXp(remainingXp);

    if (levelUps > 0) {
      setLevel((prev) => prev + levelUps);

      // 레벨업 보너스
      const bonusCoins = levelUps * 50;

      setCoins((prev) => prev + bonusCoins);

      alert(
        `🎉 레벨업!\n` +
        `⭐ ${levelUps}레벨 상승!\n` +
        `🪙 보너스 ${bonusCoins}코인 획득!`
      );
    }
  };

  // =========================================
  // 가방 아이템 사용
  // =========================================

  const useItem = (item, animalId) => {
    const quantity = inventory[item.id] || 0;

    const animal = animals.find(
      (a) => a.id === animalId
    );

    if (quantity <= 0 || !animal) {
      return false;
    }

    const newHunger = Math.min(
      100,
      animal.hunger + (item.hunger || 0)
    );

    const newLove = Math.min(
      100,
      animal.love + (item.love || 0)
    );

    // 효과가 없으면 아이템 소비하지 않음
    if (
      newHunger === animal.hunger &&
      newLove === animal.love
    ) {
      return false;
    }

    // 동물 상태 업데이트
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

    // 아이템 1개 사용
    setInventory((prev) => ({
      ...prev,
      [item.id]: Math.max(
        0,
        (prev[item.id] || 0) - 1
      ),
    }));

    return true;
  };

  // =========================================
  // 페이지 이동
  // =========================================

  const openPage = (next) => {
    setPage(next);
    setSelectedId(null);
    setSelectedGame(null);
    setMessage("");
  };

  // =========================================
  // 화면
  // =========================================

  return (
    <div className="game-shell">
      {/* 상단 헤더 */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-flower">
            🌸
          </span>

          <div>
            <h1>별빛 동물농장</h1>
            <small>
              오늘도 동물 친구들과 행복한 하루!
            </small>
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

      {/* 메인 화면 */}
      <main className="farm-frame">
        {page === "farm" ? (
          // 농장 화면
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
                <span className="heart-bubble">
                  ♥
                </span>

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
          // 아르바이트 화면
          selectedGame === "carrot" ? (
            <CarrotGame
              onExit={() => setSelectedGame(null)}
              onReward={earnReward}
            />
          ) : selectedGame === "fish" ? (
            <FishGame
              onExit={() => setSelectedGame(null)}
              onReward={earnReward}
            />
          ) : selectedGame === "egg" ? (
            <EggGame
              onExit={() => setSelectedGame(null)}
              onReward={earnReward}
            />
          ) : (
            <MiniGameMenu
              onSelect={setSelectedGame}
            />
          )
        ) : page === "shop" ? (
          // 상점 화면
          <Shop
            coins={coins}
            inventory={inventory}
            onBuy={buyItem}
          />
        ) : page === "bag" ? (
          // 가방 화면
          <Bag
            inventory={inventory}
            animals={animals}
            onUseItem={useItem}
          />
        ) : null}
      </main>

      {/* 하단 메뉴 */}
      <nav
        className="bottom-nav"
        aria-label="게임 메뉴"
      >
        {[
          {
            id: "farm",
            icon: "🏡",
            label: "농장",
          },
          {
            id: "shop",
            icon: "🏪",
            label: "상점",
          },
          {
            id: "work",
            icon: "🎮",
            label: "아르바이트",
          },
          {
            id: "bag",
            icon: "🎒",
            label: "가방",
          },
        ].map((item) => (
          <button
            key={item.id}
            className={
              page === item.id ? "active" : ""
            }
            onClick={() => openPage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* 동물 정보 모달 */}
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-heading">
              <span>
                💗 {selectedAnimal.name}
              </span>

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
                <b>
                  {selectedAnimal.hunger}/100
                </b>
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
                <b>
                  {selectedAnimal.love}/100
                </b>
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

            <p
              className="feedback"
              aria-live="polite"
            >
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
