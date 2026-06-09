import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

function getSquare(n) {
  // Squares are labeled "Square {index}, empty" or "Square {index}, X|O"
  return screen.getByRole('gridcell', { name: new RegExp(`^Square ${n},`) })
}

async function clickSquare(user, n) {
  await user.click(getSquare(n))
}

describe('Tic Tac Toe App', () => {
  it('declares a winner and locks the board after a winning move', async () => {
    const user = userEvent.setup()
    render(<App />)

    // X wins across the top row: squares 1,2,3
    await clickSquare(user, 1) // X
    await clickSquare(user, 4) // O
    await clickSquare(user, 2) // X
    await clickSquare(user, 5) // O
    await clickSquare(user, 3) // X -> win

    expect(screen.getByText('Winner: X')).toBeInTheDocument()

    // After game over, remaining empty squares should be disabled and not accept moves.
    // Square 6 was never clicked; it should be disabled now.
    const square6 = getSquare(6)
    expect(square6).toBeDisabled()

    await user.click(square6)
    // Still empty (no text content inside the button) and aria-label should remain "empty"
    expect(square6).toHaveTextContent('')
    expect(square6).toHaveAttribute('aria-label', 'Square 6, empty')
  })

  it('shows draw when the board is full and no one wins', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Fill the board with a known draw pattern (no 3-in-a-row):
    // 1:X 2:O 3:X
    // 4:X 5:O 6:O
    // 7:O 8:X 9:X
    const moves = [1, 2, 3, 5, 4, 6, 8, 7, 9]
    for (const n of moves) {
      await clickSquare(user, n)
    }

    expect(screen.getByText('Draw — no more moves')).toBeInTheDocument()

    // Board should be locked: all cells disabled once full/draw.
    for (let i = 1; i <= 9; i += 1) {
      expect(getSquare(i)).toBeDisabled()
    }
  })

  it('reset clears the board and returns turn to X', async () => {
    const user = userEvent.setup()
    render(<App />)

    await clickSquare(user, 1) // X
    await clickSquare(user, 2) // O
    expect(screen.getByText('Turn: X')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset game/i }))

    // Turn indicator resets
    expect(screen.getByText('Turn: X')).toBeInTheDocument()

    // All squares reset to empty and enabled
    for (let i = 1; i <= 9; i += 1) {
      const sq = getSquare(i)
      expect(sq).toHaveTextContent('')
      expect(sq).toBeEnabled()
      expect(sq).toHaveAttribute('aria-label', `Square ${i}, empty`)
    }
  })
})
