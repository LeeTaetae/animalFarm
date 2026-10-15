
import { useState } from "react";
import { SHOP_ITEMS } from "../shop/Shop";
import "./Bag.css";

export default function Bag({ inventory, animals, onUseItem }) {
  const [category, setCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [message, setMessage] = useState("");

  // 실제로 보유한 아이템만 표시
  const ownedItems = SHOP_ITEMS.filter((item) => {
    const quantity = inventory[item.id] || 0;

    if (quantity <= 0) return false;
    if (category === "all") return true;

    return item.category === category;
  });

  const totalItems = Object.values(inventory).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  // 아이템 선택
  const selectItem = (item) => {
    setSelectedItem(item);
    setSelectedAnimalId(null);
    setMessage("");
  };

  // 아이템 사용
  const handleUseItem = () => {
    if (!selectedItem || selectedAnimalId === null) {
      setMessage("🐾 선물할 동물 친구를 선택해 줘!");
      return;
    }

    const animal = animals.find(
      (item) => item.id === selectedAnimalId
    );

    if (!animal) return;

    const success = onUseItem(selectedItem, selectedAnimalId);

    if (success) {
      setMessage(
        `💕 ${animal.name}에게 ${selectedItem.name}을(를) 사용했어!`
      );
      setSelectedItem(null);
      setSelectedAnimalId(null);
    } else {
      setMessage("지금은 이 아이템을 사용할 수 없어!");
    }
  };

  return (
    <div className="bag-page">
      <div className="bag-header">
        <div className="bag-title">
          <span className="bag-title-icon">🎒</span>
          <div>
            <h2>나의 가방</h2>
            <p>동물 친구들을 위한 소중한 아이템!</p>
          </div>
        </div>

        <div className="bag-count">
          📦 총 {totalItems}개
        </div>
      </div>

      <div className="bag-tabs">
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

      {ownedItems.length === 0 ? (
        <div className="bag-empty">
          <span>🎒</span>
          <h3>가방이 비어 있어!</h3>
          <p>상점에서 동물 친구들을 위한 선물을 사보자 💗</p>
        </div>
      ) : (
        <div className="bag-items">
          {ownedItems.map((item) => (
            <button
              key={item.id}
              className="bag-item"
              onClick={() => selectItem(item)}
            >
              <span className="bag-item-icon">{item.icon}</span>
              <strong>{item.name}</strong>
              <span className="bag-item-effect">
                ✨ {item.effect}
              </span>
              <span className="bag-item-quantity">
                보유 {inventory[item.id]}개
              </span>
              <span className="bag-item-action">
                사용하기
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="bag-message" aria-live="polite">
        {message || "💌 아이템을 선택해 동물 친구에게 선물해 봐!"}
      </p>

      {selectedItem && (
        <div
          className="bag-modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bag-modal"
            role="dialog"
            aria-modal="true"
            aria-label="아이템 사용"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bag-modal-header">
              <h3>🎁 아이템 사용</h3>
              <button onClick={() => setSelectedItem(null)}>
                ✕
              </button>
            </div>

            <div className="bag-selected-item">
              <span>{selectedItem.icon}</span>
              <strong>{selectedItem.name}</strong>
              <p>{selectedItem.effect}</p>
            </div>

            <h4>어떤 동물 친구에게 줄까?</h4>

            <div className="bag-animal-list">
              {animals.map((animal) => (
                <button
                  key={animal.id}
                  className={
                    selectedAnimalId === animal.id
                      ? "bag-animal active"
                      : "bag-animal"
                  }
                  onClick={() => setSelectedAnimalId(animal.id)}
                >
                  <img src={animal.image} alt={animal.name} />
                  <strong>{animal.name}</strong>
                  <small>{animal.type}</small>
                </button>
              ))}
            </div>

            <button
              className="bag-use-button"
              onClick={handleUseItem}
              disabled={selectedAnimalId === null}
            >
              💕 선물하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
