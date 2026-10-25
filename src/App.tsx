
import { useRef, useState } from "react";
import "./App.css";

function generateNumber(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function App() {
  const [secretNumber, setSecretNumber] = useState<number>(generateNumber);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);

  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = localStorage.getItem("numberGameBestScore");
    return saved ? Number(saved) : null;
  });

  const [feedback, setFeedback] = useState("Make a guess to start!");
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeStep, setActiveStep] = useState<"plus" | "minus" | null>(null);

  const holdTimer = useRef<number | null>(null);
  const repeatTimer = useRef<number | null>(null);

  function stopHolding() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    if (repeatTimer.current !== null) {
      window.clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }

    setActiveStep(null);
  }

  function startHolding(direction: -1 | 1) {
    stopHolding();

    if (gameOver) return;

    setActiveStep(direction === 1 ? "plus" : "minus");

    const changeGuess = () => {
      setGuess((current) => {
        const currentNumber =
          current.trim() === ""
            ? direction === 1
              ? 0
              : 2
            : Number(current);

        return String(
          Math.max(1, Math.min(100, currentNumber + direction))
        );
      });
    };

    changeGuess();

    holdTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(changeGuess, 100);
    }, 350);
  }

  function handleGuess() {
    if (gameOver) return;

    if (guess.trim() === "") {
      setFeedback("Please enter a number between 1 and 100.");
      return;
    }

    const number = Number(guess);

    if (!Number.isInteger(number) || number < 1 || number > 100) {
      setFeedback("Enter a whole number between 1 and 100.");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (number === secretNumber) {
      setFeedback(
        `🎉 Correct! You found the number in ${newAttempts} ${
          newAttempts === 1 ? "attempt" : "attempts"
        }!`
      );

      setGameOver(true);

      if (bestScore === null || newAttempts < bestScore) {
        setBestScore(newAttempts);
        localStorage.setItem("numberGameBestScore", String(newAttempts));
      }
    } else if (number < secretNumber) {
      setFeedback("⬆️ Too low! Try a higher number.");
    } else {
      setFeedback("⬇️ Too high! Try a lower number.");
    }

    setGuess("");
  }

  function restartGame() {
    stopHolding();
    setSecretNumber(generateNumber());
    setGuess("");
    setAttempts(0);
    setFeedback("Make a guess to start!");
    setGameOver(false);
    setRevealed(false);
  }

  function showAnswer() {
    stopHolding();
    setRevealed(true);
    setGameOver(true);
    setFeedback(
      `The secret number is ${secretNumber}. Start a new game to play again.`
    );
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      handleGuess();
    }
  }

  return (
    <main className="app">
      <div className="decorations" aria-hidden="true">
        <span className="shape triangle shape-1">▲</span>
        <span className="shape diamond shape-2">◆</span>
        <span className="shape star shape-3">✦</span>
        <span className="shape dot shape-4" />
        <span className="shape diamond shape-5">◆</span>
        <span className="shape dot shape-6" />
        <span className="shape plus shape-7">✚</span>
        <span className="shape triangle shape-8">▲</span>
        <span className="shape dot shape-9" />
        <span className="shape star shape-10">✦</span>
      </div>

      <div className="app-container">
        <header className="header">
          <div className="game-icon" aria-hidden="true">
            🎮
          </div>

          <h1>
            Number <span>Guessing</span> Game
          </h1>

          <p>Guess the number between 1 and 100!</p>
        </header>

        <section className="game-layout">
          <div className="game-card">
            <div className="mystery-number">
              {gameOver ? secretNumber : "?"}
            </div>

            <form
              className="guess-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleGuess();
              }}
            >
              <div className="guess-row">
                <button
                  type="button"
                  className={`step-btn step-minus ${
                    activeStep === "minus" ? "pressing" : ""
                  }`}
                  aria-label="Decrease guess"
                  disabled={gameOver}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    startHolding(-1);
                  }}
                  onPointerUp={stopHolding}
                  onPointerLeave={stopHolding}
                  onPointerCancel={stopHolding}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  −
                </button>

                <input
                  className="guess-input"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your guess (1 - 100)"
                  aria-label="Enter your guess"
                  disabled={gameOver}
                />

                <button
                  type="button"
                  className={`step-btn step-plus ${
                    activeStep === "plus" ? "pressing" : ""
                  }`}
                  aria-label="Increase guess"
                  disabled={gameOver}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    startHolding(1);
                  }}
                  onPointerUp={stopHolding}
                  onPointerLeave={stopHolding}
                  onPointerCancel={stopHolding}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-guess"
                type="submit"
                disabled={gameOver}
              >
                Guess
              </button>
            </form>

            <div
              className={`feedback ${
                gameOver && !revealed ? "success" : ""
              } ${revealed ? "revealed" : ""}`}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-restart"
                type="button"
                onClick={restartGame}
              >
                <span className="button-icon" aria-hidden="true">
                  ⟳
                </span>
                Restart Game
              </button>

              <button
                className="btn btn-reveal"
                type="button"
                onClick={showAnswer}
                disabled={gameOver}
              >
                <span className="button-icon" aria-hidden="true">
                  ▥
                </span>
                Show Answer
              </button>
            </div>
          </div>

          <aside className="side-panel">
            <section className="side-card">
              <h2>
                <span className="heading-icon" aria-hidden="true">
                  🏆
                </span>
                Game Stats
              </h2>

              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-label">Attempts</p>
                  <p className="stat-value">{attempts}</p>
                </div>

                <div className="stat-box">
                  <p className="stat-label">
                    <span aria-hidden="true">👑</span> Best Score
                  </p>
                  <p className="stat-value best-score">
                    {bestScore ?? "–"}
                  </p>
                </div>
              </div>
            </section>

            <section className="side-card instructions-card">
              <h2>
                <span className="heading-icon" aria-hidden="true">
                  💡
                </span>
                How to Play
              </h2>

              <ol className="instructions">
                <li>
                  <span className="instruction-number blue">1</span>
                  <span>Guess a number between 1 and 100.</span>
                </li>

                <li>
                  <span className="instruction-number green">2</span>
                  <span>Click the Guess button.</span>
                </li>

                <li>
                  <span className="instruction-number yellow">3</span>
                  <span>
                    You will get a hint: "Too high!" or "Too low!".
                  </span>
                </li>

                <li>
                  <span className="instruction-number pink">4</span>
                  <span>
                    Try to guess the number in as few attempts as possible!
                  </span>
                </li>
              </ol>
            </section>
          </aside>
        </section>

        <footer className="footer">
          Made for fun · Think smart and guess wisely!
        </footer>
      </div>
    </main>
  );
}

export default App;
