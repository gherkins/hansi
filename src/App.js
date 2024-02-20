import './App.scss'
import 'bootstrap/dist/css/bootstrap.css'
import { useRef, useState } from 'react'

import * as Mousetrap from 'mousetrap'

function App () {

  const rows = 25
  const cols = 100

  let chars = decodeURIComponent(window.location.hash.substring(1)).split('')
  chars = chars.slice(0, 10)

  if (chars.length === 0) {
    const hash = '|_/\\:`´-\''
    window.location.hash = `#${encodeURIComponent(hash)}`
  }

  const [cursorY, setCursorY] = useState(8)
  const [cursorX, setCursorX] = useState(24)
  const [contents] = useState((new Array(25)).fill(0).map(() => (new Array(100)).fill(0)))
  const [, updateState] = useState()

  const currentSpan = useRef()

  Mousetrap.bind(['up', 'down', 'left', 'right'], async e => {
    e.preventDefault()
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

  const moveCursorLeft = () => {
    setCursorX(cursorX - 1 > 0 ? cursorX - 1 : 0)
  }

  const moveCursorRight = () => {
    setCursorX(cursorX + 1 < cols ? cursorX + 1 : cols - 1)
  }

  const moveCursorUp = () => {
    setCursorY(cursorY - 1 > 0 ? cursorY - 1 : 0)
  }

  const moveCursorDown = () => {
    setCursorY(cursorY + 1 < rows ? cursorY + 1 : rows - 1)
  }

  Mousetrap.bind('tab', e => {
    e.preventDefault()
    setCursorX(cursorX + 4 < cols ? cursorX + 4 : cols - 1)
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
    contents[cursorY][cursorX] = ' '
    moveCursorRight()
  })

  Mousetrap.bind('backspace', e => {
    e.preventDefault()
    console.log(cursorX)
    moveCursorLeft()
    console.log(cursorX)
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

            const classes = []
            if (active) {
              classes.push('active')
            }
            if (oddCol) {
              classes.push('odd-col')
            }
            if (oddRow) {
              classes.push('odd-row')
            }

            return <span
              ref={active ? currentSpan : null}
              className={classes.join(' ')}
              key={`${row}-${col}`}
            >
              {contents[row][col] || ' '}
            </span>
          })}
        </div>)}
      </div>
    </div>
  )
}

export default App
