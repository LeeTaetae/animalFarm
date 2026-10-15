
    import { useEffect, useRef, useState } from "react";
    import "./EggGame.css";

    const GAME_TIME = 30;

    const EGG_COLORS = [
    { id: "pink", name: "분홍", color: "#f4bfd7" },
    { id: "yellow", name: "노랑", color: "#ffe18a" },
    { id: "blue", name: "파랑", color: "#b8ddfa" },
    ];

    function randomEgg() {
    return EGG_COLORS[
        Math.floor(Math.random() * EGG_COLORS.length)
    ];
    }

    export default function EggGame({ onExit, onReward }) {
    const [status, setStatus] = useState("ready");
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [egg, setEgg] = useState(randomEgg);
    const [feedback, setFeedback] = useState("");
    const [claimed, setClaimed] = useState(false);

    const scoreRef = useRef(0);
    const claimedRef = useRef(false);

    // 게임 시작
    const startGame = () => {
        scoreRef.current = 0;
        claimedRef.current = false;

        setScore(0);
        setCombo(0);
        setTimeLeft(GAME_TIME);
        setEgg(randomEgg());
        setFeedback("");
        setClaimed(false);
        setStatus("playing");
    };

    // 30초 타이머
    useEffect(() => {
        if (status !== "playing") return;

        const startedAt = Date.now();

        const timer = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(
            0,
            Math.ceil((GAME_TIME * 1000 - elapsed) / 1000)
        );

        setTimeLeft(remaining);

        if (remaining === 0) {
            clearInterval(timer);
            setStatus("finished");
        }
        }, 100);

        return () => clearInterval(timer);
    }, [status]);

    // 달걀 분류
    const sortEgg = (selectedColor) => {
        if (status !== "playing" || timeLeft <= 0) return;

        if (selectedColor === egg.id) {
        scoreRef.current += 15;
        setScore(scoreRef.current);
        setCombo((prev) => prev + 1);
        setFeedback("정답! 아주 잘했어! 💖");
        } else {
        scoreRef.current = Math.max(0, scoreRef.current - 5);
        setScore(scoreRef.current);
        setCombo(0);
        setFeedback("앗! 다른 바구니야! 😵");
        }

        // 다음 달걀 등장
        setEgg(randomEgg());
    };

    useEffect(() => {
        if(status !== "playing") return;


        const handleKeyDown = (event) => {
        const index = Number(event.key) - 1;

        if (index >= 0 && index < EGG_COLORS.length) {
            const selectedColor = EGG_COLORS[index].id;

            // 키보드로 바구니 선택
            document
            .querySelector(
                `.egg-basket[data-color="${selectedColor}"]`
            )
            ?.click();
        }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        };
    }, [status])

    // 보상 지급
    const claimReward = () => {
        if (status !== "finished" || claimedRef.current) return;

        claimedRef.current = true;
        setClaimed(true);

        onReward(scoreRef.current * 3);
        onExit();
    };

    return (
        <div className="egg-game">
        <h2>🐥 삐약이의 달걀 분류!</h2>

        <div className="egg-status">
            <span>⏰ {timeLeft}초</span>
            <span>⭐ {score}점</span>
            <span>🔥 {combo}콤보</span>
        </div>

        {status === "ready" && (
            <div className="egg-intro">
            <div className="egg-intro-icon">🐥🥚💕</div>

            <h3>삐약이가 도움이 필요하대!</h3>
            <p>달걀 색깔을 보고 같은 색 바구니에 넣어줘!</p>
            <p>정답 +15점 / 오답 -5점</p>
            <p>키보드 1, 2, 3으로도 분류할 수 있어.</p>

            <button onClick={startGame}>
                게임 시작!
            </button>
            </div>
        )}

        {status === "playing" && (
            <div className="egg-play">
            <div className="egg-character">
                🐥
                <span>이 달걀은 어디에 넣을까?</span>
            </div>

            <div className="egg-display">
                <div
                className="egg-shape"
                style={{ backgroundColor: egg.color }}
                />
                <p>{egg.name} 달걀</p>
            </div>

            <p className="egg-feedback" aria-live="polite">
                {feedback || "알맞은 바구니를 골라줘!"}
            </p>

            <div className="egg-baskets">
                {EGG_COLORS.map((basket, index) => (
                <button
                    key={basket.id}
                    data-color={basket.id}
                    className="egg-basket"
                    style={{
                    backgroundColor: basket.color,
                    }}
                    onClick={() => sortEgg(basket.id)}
                >
                    <span className="basket-icon">🧺</span>
                    <strong>{basket.name}</strong>
                    <small>키보드 {index + 1}</small>
                </button>
                ))}
            </div>
            </div>
        )}

        {status === "finished" && (
            <div className="egg-result">
            <div className="egg-result-icon">🎉🐥🎉</div>
            <h3>아르바이트 종료!</h3>

            <p>최종 점수: {score}점</p>
            <p>획득 코인: 🪙 {score * 3}</p>

            <button
                onClick={claimReward}
                disabled={claimed}
            >
                보상 받기
            </button>
            </div>
        )}

        <button className="egg-exit" onClick={onExit}>
            🏡 아르바이트 메뉴로
        </button>
        </div>
    );
    }
