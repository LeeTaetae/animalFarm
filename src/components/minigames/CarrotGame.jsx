import { useState, useEffect } from "react";
import "./CarrotGame.css";

const GAME_TIME = 30;

function makeCrops() {
    return Array.from({length : 9}, (_,id) => ({
        id,
        type: Math.random() < 0.2 ? "bad" : "carrot",
        harvested: false
    }));
}

export default function CarrotGame({ onExit, onReward }) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [crops, setCrops] = useState(makeCrops);
  const [finished, setFinished] = useState(false);
  const [claimed, setClaimed] = useState(false);


    useEffect(() => {

        if (!playing) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [playing]);

    useEffect(() => {
        if(playing && timeLeft == 0) {
            setPlaying(false);
            setFinished(true);
        }
    }, [playing, timeLeft]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_TIME);
        setCrops(makeCrops());
        setFinished(false);
        setClaimed(false);
        setPlaying(true);
    };

    const harvest = (id) => {
        if(!playing || timeLeft == 0) return;

        const crop  = crops.find((item) => item.id === id);
        if(!crop || crop.harvested) return;
        
        setScore((prev) => Math.max(0, prev + (crop.type === "carrot" ? 10 : -5)));

        const updated = crops.map((item) =>
            item.id === id ? { ...item, harvested: true } : item
        );

        if(updated.every((item) => item.harvested)) {
            setCrops(makeCrops())
        } else {
            setCrops(updated);
        }

    };

    const claimReward = () => {
        if(!finished || claimed) return;

        setClaimed(true);
        onReward(score * 2);
        onExit();
    };

     return (
        <div className="carrot-game">
            <h2>🥕 당근 수확 대작전!</h2>

            <div className="carrot-status">
                <span>⏰ {timeLeft}초</span>
                <span>⭐ {score}점</span>
            </div>

            {!playing && !finished && (
                <div className="carrot-intro">
                <p>30초 동안 당근을 최대한 많이 수확해 봐!</p>
                <p>🥕 +10점 / 🥀 -5점</p>
                <button onClick={startGame}>게임 시작!</button>
                </div>
            )}

            {playing && (
                <div className="carrot-field">
                {crops.map((crop) => (
                    <button
                    key={crop.id}
                    className="carrot-plot"
                    disabled={crop.harvested}
                    onClick={() => harvest(crop.id)}
                    >
                    {crop.harvested
                        ? "🕳️"
                        : crop.type === "carrot"
                        ? "🥕"
                        : "🥀"}
                    </button>
                ))}
                </div>
            )}

            {finished && (
                <div className="carrot-result">
                <h3>🎉 아르바이트 종료!</h3>
                <p>최종 점수: {score}점</p>
                <p>획득 코인: 🪙 {score * 2}</p>
                <button onClick={claimReward} disabled={claimed}>
                    보상 받기
                </button>
                </div>
            )}

            <button className="carrot-exit" onClick={onExit}>
                농장으로 돌아가기
            </button>
        </div>
    );

} 

// export default CarrotGame;