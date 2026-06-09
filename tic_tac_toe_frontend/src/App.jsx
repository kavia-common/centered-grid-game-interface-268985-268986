import { useMemo, useState } from 'react'
import './App.css'

const PLAYERS = {
  X: 'X',
  O: 'O',
}

const WINNING_LINES = [
  // rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // cols
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // diagonals
  [0, 4, 8],
  [2, 4, 6],
]

// PUBLIC_INTERFACE
function App() {
  /** Root React component for the Tic Tac Toe app (UI + gameplay state). */
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS.X)

  const gameState = useMemo(() => {
    const winnerResult = calculateWinner(board)
    const winner = winnerResult?.winner ?? null
    const winningLine = winnerResult?.line ?? null

    const isBoardFull = board.every((cell) => cell !== null)
    const isDraw = !winner && isBoardFull
    const isGameOver = Boolean(winner) || isDraw

    return {
      winner,
      winningLine,
      isDraw,
      isGameOver,
    }
  }, [board])

  const status = useMemo(() => {
    if (gameState.winner) return `Winner: ${gameState.winner}`
    if (gameState.isDraw) return 'Draw — no more moves'
    return `Turn: ${currentPlayer}`
  }, [currentPlayer, gameState.isDraw, gameState.winner])

  const statusVariant = useMemo(() => {
    if (gameState.winner) return 'win'
    if (gameState.isDraw) return 'draw'
    return currentPlayer === PLAYERS.X ? 'x' : 'o'
  }, [currentPlayer, gameState.isDraw, gameState.winner])

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /**
     * Handle a click on a board square.
     * - Ignores clicks if the game ended or if the square is already filled.
     * - Otherwise fills the square with the current player's mark and swaps turns.
     */
    if (gameState.isGameOver) return
    if (board[index]) return

    setBoard((prev) => {
      const next = [...prev]
      next[index] = currentPlayer
      return next
    })
    setCurrentPlayer((prev) => (prev === PLAYERS.X ? PLAYERS.O : PLAYERS.X))
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    /** Reset the game to the initial state. */
    setBoard(Array(9).fill(null))
    setCurrentPlayer(PLAYERS.X)
  }

  return (
    <main className="appShell" aria-label="Tic Tac Toe game">
      <header className="header">
        <div className="titleRow">
          <h1>Tic Tac Toe</h1>
          <div className="badge" aria-live="polite" aria-atomic="true">
            <span className={`dot ${statusVariant}`} aria-hidden="true" />
            <span>{status}</span>
          </div>
        </div>
        <p className="subtitle">
          Click a square to place your mark. First to align three wins.
        </p>
      </header>

      <section className="boardWrap" aria-label="Game board">
        <div className="board" role="grid" aria-label="3 by 3 tic tac toe board">
          {board.map((value, index) => {
            const isWinningSquare = Boolean(
              gameState.winningLine?.includes(index),
            )
            const filledClass =
              value === PLAYERS.X
                ? 'filledX'
                : value === PLAYERS.O
                  ? 'filledO'
                  : ''

            return (
              <button
                key={index}
                type="button"
                className={`square ${filledClass} ${isWinningSquare ? 'win' : ''}`}
                onClick={() => handleSquareClick(index)}
                disabled={gameState.isGameOver || Boolean(value)}
                role="gridcell"
                aria-label={
                  value
                    ? `Square ${index + 1}, ${value}`
                    : `Square ${index + 1}, empty`
                }
              >
                {value}
              </button>
            )
          })}
        </div>
      </section>

      <section className="actions" aria-label="Game actions">
        <button type="button" className="resetBtn" onClick={handleReset}>
          Reset game
        </button>
      </section>

      <div className="footerNote">
        Tip: Reset anytime to start again. Board locks when a game ends.
      </div>
    </main>
  )
}

// PUBLIC_INTERFACE
function calculateWinner(board) {
  /**
   * Determine whether the given board has a winner.
   *
   * @param {Array<('X'|'O'|null)>} board - 9-cell board, indexed 0..8.
   * @returns {{ winner: 'X'|'O', line: number[] } | null} Winner and winning line if present; otherwise null.
   */
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    const av = board[a]
    if (!av) continue
    if (av === board[b] && av === board[c]) {
      return { winner: av, line }
    }
  }
  return null
}

export default App
