import './App.scss'
import 'bootstrap/dist/css/bootstrap.css'
import { useState } from 'react'

import * as Mousetrap from 'mousetrap'

let cursorX = 24
let cursorY = 6

function App () {

  const rows = 24
  const cols = 100

  let chars = decodeURIComponent(window.location.hash.substring(1)).split('')
  chars = chars.slice(0, 10)

  if (chars.length === 0) {
    const hash = '|_/\\:`´-\''
    window.location.hash = `#${encodeURIComponent(hash)}`
  }

  const grid = (new Array(25)).fill(0).map(() =>
    (new Array(100)).fill(0),
  )
  const [contents] = useState(grid)

  const [selectionFrom, setSelectionFrom] = useState({ x: null, y: null })
  const [selectionTo, setSelectionTo] = useState({ x: null, y: null })

  const [, updateState] = useState()

  const clearSelection = () => {
    setSelectionFrom({ x: null, y: null })
    setSelectionTo({ x: null, y: null })
  }

  const getSelection = () => {
    return {
      from: {
        x: Math.min(selectionFrom.x || -1, selectionTo.x || -1),
        y: Math.min(selectionFrom.y || -1, selectionTo.y || -1),
      },
      to: {
        x: Math.max(selectionFrom.x || -1, selectionTo.x || -1),
        y: Math.max(selectionFrom.y || -1, selectionTo.y || -1),
      },
    }
  }

  Mousetrap.bind(['up', 'down', 'left', 'right'], async e => {
    e.preventDefault()
    clearSelection()
    switch (e.key) {
      case 'ArrowUp':
        await moveCursorUp()
        break
      case 'ArrowDown':
        await moveCursorDown()
        break
      case 'ArrowLeft':
        await moveCursorLeft()
        break
      case 'ArrowRight':
      default:
        await moveCursorRight()
        break
    }
  })

  Mousetrap.bind(['shift+up', 'shift+down', 'shift+left', 'shift+right'], async e => {
    e.preventDefault()
    if (null === selectionFrom.x) {
      setSelectionFrom({ x: cursorX, y: cursorY })
    }
    switch (e.key) {
      case 'ArrowUp':
        await moveCursorUp()
        break
      case 'ArrowDown':
        await moveCursorDown()
        break
      case 'ArrowLeft':
        await moveCursorLeft()
        break
      case 'ArrowRight':
      default:
        await moveCursorRight()
        break
    }
    setSelectionTo({ x: cursorX, y: cursorY })
  })

  const moveCursorLeft = () => {
    cursorX = (cursorX - 1 > 0 ? cursorX - 1 : 0)
    updateState({})
  }

  const moveCursorRight = () => {
    cursorX = (cursorX + 1 < cols ? cursorX + 1 : cols - 1)
    updateState({})
  }

  const moveCursorUp = () => {
    cursorY = (cursorY - 1 > 0 ? cursorY - 1 : 0)
    updateState({})
  }

  const moveCursorDown = () => {
    cursorY = (cursorY + 1 < rows ? cursorY + 1 : rows - 1)
    updateState({})
  }

  Mousetrap.bind('tab', e => {
    e.preventDefault()
    cursorX = (cursorX + 4 < cols ? cursorX + 4 : cols - 1)
    updateState({})
  })

  Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], e => {
    e.preventDefault()
    let key = parseInt(e.key)
    if (key === 0) {
      key = 10
    }
    contents[cursorY][cursorX] = chars[key - 1]
    moveCursorRight()
  })

  Mousetrap.bind('space', e => {
    e.preventDefault()
    clearSelection()
    contents[cursorY][cursorX] = ' '
    moveCursorRight()
  })

  Mousetrap.bind('backspace', e => {
    e.preventDefault()
    clearSelection()
    moveCursorLeft()
    contents[cursorY][cursorX] = ' '
  })

  return (
    <div className="container">
      <h3>

        {chars.map((char, i) => {
          let key = i + 1
          if (key === 10) {
            key = 0
          }
          return <button key={i}>{char}<sub>{key}</sub></button>
        })}
        <button onClick={() => {
          let text = ''
          contents.forEach(row => {
            row.forEach(char => {
              text += char ? char : ' '
            })
            text += '\n'
          })

          navigator.clipboard.writeText(text)
        }}>copy all
        </button>
      </h3>
      <div className="ansi">
        {(new Array(rows)).fill(0).map((i, row) => <div key={row}>
          {(new Array(cols)).fill(0).map((i, col) => {
            const active = cursorY === row && cursorX === col
            const oddCol = col % 4 === 0
            const oddRow = row % 3 === 0

            const selection = getSelection()
            const selected = row >= selection.from.y && row <= selection.to.y && col >= selection.from.x && col <= selection.to.x

            const classes = [
              active ? 'active' : '',
              oddCol ? 'odd-col' : '',
              oddRow ? 'odd-row' : '',
              selected ? 'selected' : '',
            ]

            return <span
              className={classes.join(' ')}
              key={`${row}-${col}`}
            >
              {contents[row][col] || ' '}
            </span>
          })}
        </div>)}
      </div>
      <div className="manual pt-4">
        * Arrow keys: move cursor<br />
        * Number keys: write characters in current block<br />
        * Spacebar: clear current block <br />
        * Backspace: clear previous block<br />
        * Tab: jump 4 blocks to the right<br />
        <br />
        * Shift + Arrow keys: select blocks<br />
        * Alt + Arrow keys: move selected block<br />
        * C: copy selected block<br />
        * X: cut selected block<br />
        * V: paste selected block<br />
      </div>
    </div>
  )
}

export default App
