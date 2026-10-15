
import { useState } from "react";
import "./Shop.css";

export const SHOP_ITEMS = [
  {
    id: "carrot",
    name: "싱싱한 당근",
    icon: "🥕",
    category: "food",
    price: 20,
    description: "토토가 가장 좋아하는 간식!",
    effect: "배부름 +20",
    hunger: 20,
    love: 0,
  },
  {
    id: "fish",
    name: "맛있는 생선",
    icon: "🐟",
    category: "food",
    price: 30,
    description: "나비가 좋아하는 생선이에요.",
    effect: "배부름 +30",
    hunger: 30,
    love: 0,
  },
  {
    id: "feed",
    name: "고급 사료",
    icon: "🥣",
    category: "food",
    price: 50,
    description: "모든 동물 친구들이 좋아해요!",
    effect: "배부름 +50",
    hunger: 50,
    love: 0,
  },
  {
    id: "yarn",
    name: "털실 장난감",
    icon: "🧶",
    category: "toy",
    price: 40,
    description: "동물 친구들과 신나게 놀아요.",
    effect: "친밀도 +15",
    hunger: 0,
    love: 15,
  },
  {
    id: "ribbon",
    name: "사랑의 리본",
    icon: "🎀",
    category: "toy",
    price: 100,
    description: "동물 친구에게 특별한 선물!",
    effect: "친밀도 +30",
    hunger: 0,
    love: 30,
  },
];

export default function Shop({ coins, onBuy, inventory = {} }) {
  const [category, setCategory] = useState("all");
  const [message, setMessage] = useState("");

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (category === "all") return true;
    return item.category === category;
  });

  const handleBuy = (item) => {
    if (coins < item.price) {
      setMessage("🥺 코인이 부족해! 아르바이트를 해보자!");
      return;
    }

    onBuy(item);
    setMessage(`🎉 ${item.name} 구매 완료! 가방에 넣었어!`);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-title">
          <span className="shop-title-icon">🏪</span>
          <div>
            <h2>별빛 동물상점</h2>
            <p>동물 친구들을 위한 선물이 가득해요!</p>
          </div>
        </div>

        <div className="shop-wallet">
          🪙 <strong>{coins}</strong>
        </div>
      </div>

      <div className="shop-greeting">
        <span className="shopkeeper">🐻</span>
        <div className="shop-speech">
          어서 와! 오늘은 어떤 선물을 골라볼까? 💕
        </div>
      </div>

      <div className="shop-tabs">
        <button
          className={category === "all" ? "active" : ""}
          onClick={() => setCategory("all")}
        >
          🌸 전체
        </button>
        <button
          className={category === "food" ? "active" : ""}
          onClick={() => setCategory("food")}
        >
          🥕 먹이
        </button>
        <button
          className={category === "toy" ? "active" : ""}
          onClick={() => setCategory("toy")}
        >
          🎀 장난감
        </button>
      </div>

      <div className="shop-items">
        {filteredItems.map((item) => (
          <div className="shop-item" key={item.id}>
            <div className="shop-item-icon">
              {item.icon}
            </div>

            <h3>{item.name}</h3>
            <p className="shop-item-description">
              {item.description}
            </p>

            <div className="shop-item-effect">
              ✨ {item.effect}
            </div>

            <div className="shop-item-owned">
              🎒 보유 {inventory[item.id] || 0}개
            </div>

            <div className="shop-item-bottom">
              <span className="shop-item-price">
                🪙 {item.price}
              </span>

              <button
                className="shop-buy-button"
                onClick={() => handleBuy(item)}
                disabled={coins < item.price}
              >
                {coins < item.price ? "코인 부족" : "구매하기"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="shop-message" aria-live="polite">
        {message || "🌷 구매한 아이템은 가방에 보관돼요!"}
      </p>
    </div>
  );
}
