import './App.scss'
import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useState } from 'react'

import * as Mousetrap from 'mousetrap'

let cursorX = 8
let cursorY = 3
let buffer = null

setTimeout(() => {
  window.onbeforeunload = () => {
    return false
  }
}, 5000)

function App () {

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const rows = parseInt(urlParams.get('rows')) || 15
  const cols = parseInt(urlParams.get('cols')) || 64

  const grid = (new Array(rows)).fill(0).map(() =>
    (new Array(cols)).fill(0),
  )
  const [contents, setContents] = useState(grid)
  const [history] = useState([contents])

  const [selectionFrom, setSelectionFrom] = useState({ x: null, y: null })
  const [selectionTo, setSelectionTo] = useState({ x: null, y: null })

  const [, updateState] = useState()

  let chars = decodeURIComponent(window.location.hash.substring(1)).split('')
  chars = chars.slice(0, 10)

  if (chars.length === 0) {
    const hash = '|_/\\:`´-\''
    window.location.hash = `#${encodeURIComponent(hash)}`
    updateState({})
  }

  const saveState = () => {
    history.push((JSON.parse(JSON.stringify(contents))))
    if (history.length > 1000) {
      history.shift()
    }
  }

  const undo = () => {
    if (history.length > 0) {
      setContents(history[history.length - 1])
      history.pop()
      resetSelection()
    }
  }

  const resetSelection = () => {
    setSelectionFrom({ x: null, y: null })
    setSelectionTo({ x: null, y: null })
  }

  const getSelection = () => {
    if (null === selectionFrom.x || null === selectionTo.x) {
      return null
    }
    return {
      from: {
        x: Math.min(selectionFrom.x, selectionTo.x),
        y: Math.min(selectionFrom.y, selectionTo.y),
      },
      to: {
        x: Math.max(selectionFrom.x, selectionTo.x),
        y: Math.max(selectionFrom.y, selectionTo.y),
      },
    }
  }

  const getSelectionSize = () => {
    const selection = getSelection()
    if (null === selection) {
      return 0
    }
    let x = selection.to.x - selection.from.x
    let y = selection.to.y - selection.from.y
    return (x + 1) * (y + 1)
  }

  const clearSelection = () => {
    if (0 === getSelectionSize()) {
      return false
    }
    const selection = getSelection()
    for (let row = selection.from.y; row <= selection.to.y; row++) {
      for (let col = selection.from.x; col <= selection.to.x; col++) {
        contents[row] = contents[row] || {}
        contents[row][col] = ' '
      }
    }
  }

  const copySelectionToBuffer = () => {
    if (0 === getSelectionSize()) {
      return false
    }
    buffer = {}
    const selection = getSelection()
    for (let row = selection.from.y; row <= selection.to.y; row++) {
      for (let col = selection.from.x; col <= selection.to.x; col++) {
        buffer[row] = buffer[row] || {}
        buffer[row][col] = contents[row][col] || ' '
      }
    }
  }

  const getBufferStart = () => {
    const bufferStartY = parseInt(Object.keys(buffer)[0])
    const bufferStartX = parseInt(Object.keys(buffer[bufferStartY])[0])
    return [bufferStartY, bufferStartX]
  }

  const getBufferEnd = () => {
    const bufferEndY = parseInt(Object.keys(buffer).pop())
    const bufferEndX = parseInt(Object.keys(buffer[bufferEndY]).pop())
    return [bufferEndY, bufferEndX]
  }

  const applyBuffer = () => {
    if (0 === getBufferSize()) {
      return false
    }
    const [bufferStartY, bufferStartX] = getBufferStart()

    const offsetX = cursorX - bufferStartX
    const offsetY = cursorY - bufferStartY

    for (let row in buffer) {
      for (let col in buffer[row]) {
        const newRow = parseInt(row) + offsetY
        const newCol = parseInt(col) + offsetX
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          contents[newRow][newCol] = buffer[row][col]
        }
      }
    }
  }

  const clearBuffer = () => {
    buffer = {}
  }

  const getBufferSize = () => {
    if (null === buffer) {
      return 0
    }
    let count = 0
    for (let row in buffer) {
      count += Object.keys(buffer[row]).length
    }
    return count
  }

  const moveCursorLeft = () => {
    cursorX = (cursorX - 1 > 0 ? cursorX - 1 : 0)
  }

  const moveCursorRight = () => {
    cursorX = (cursorX + 1 < cols ? cursorX + 1 : cols - 1)
  }

  const moveCursorUp = () => {
    cursorY = (cursorY - 1 > 0 ? cursorY - 1 : 0)
  }

  const moveCursorDown = () => {
    cursorY = (cursorY + 1 < rows ? cursorY + 1 : rows - 1)
  }

  const copyAllToClipboard = () => {
    let text = ''
    contents.forEach(row => {
      row.forEach(char => {
        text += char ? char : ' '
      })
      text += '\n'
    })
    navigator.clipboard.writeText(text)
  }

  const handleCursorMovement = async key => {
    switch (key) {
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
  }

  Mousetrap.bind(['up', 'down', 'left', 'right'], async e => {
    e.preventDefault()
    resetSelection()
    await handleCursorMovement(e.key)
  })

  Mousetrap.bind(['shift+up', 'shift+down', 'shift+left', 'shift+right'], async e => {
    e.preventDefault()
    if (null === selectionFrom.x) {
      setSelectionFrom({ x: cursorX, y: cursorY })
    }
    await handleCursorMovement(e.key)
    setSelectionTo({ x: cursorX, y: cursorY })
  })

  Mousetrap.bind(['alt+up', 'alt+down', 'alt+left', 'alt+right'], async e => {
    e.preventDefault()
    if (0 === getSelectionSize()) {
      return false
    }
    saveState()
    copySelectionToBuffer()
    clearSelection()
    resetSelection()
    const [bufferStartY, bufferStartX] = getBufferStart()
    const [bufferEndY, bufferEndX] = getBufferEnd()
    const bufferWidth = bufferEndX - bufferStartX
    const bufferHeight = bufferEndY - bufferStartY
    cursorX = bufferStartX
    cursorY = bufferStartY
    await handleCursorMovement(e.key)
    applyBuffer()
    clearBuffer()
    setSelectionFrom({ x: cursorX, y: cursorY })
    setSelectionTo({ x: cursorX + bufferWidth, y: cursorY + bufferHeight })
    updateState({})
  })

  Mousetrap.bind('tab', e => {
    e.preventDefault()
    resetSelection()
    cursorX = (cursorX + 4 < cols ? cursorX + 4 : cols - 1)
  })

  Mousetrap.bind('shift+tab', e => {
    e.preventDefault()
    resetSelection()
    cursorX = (cursorX - 4 > 0 ? cursorX - 4 : 0)
  })

  Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], e => {
    e.preventDefault()
    saveState()
    let key = parseInt(e.key)
    if (key === 0) {
      key = 10
    }
    contents[cursorY][cursorX] = chars[key - 1]
    moveCursorRight()
    updateState({})
  })

  Mousetrap.bind('space', e => {
    e.preventDefault()
    resetSelection()
    if (contents[cursorY][cursorX] && contents[cursorY][cursorX] !== ' ') {
      saveState()
      contents[cursorY][cursorX] = ' '
    }
    moveCursorRight()
    updateState({})
  })

  Mousetrap.bind('backspace', e => {
    e.preventDefault()
    resetSelection()
    moveCursorLeft()
    if (contents[cursorY][cursorX] && contents[cursorY][cursorX] !== ' ') {
      saveState()
      contents[cursorY][cursorX] = ' '
    }
    updateState({})
  })

  Mousetrap.bind('command+c', e => {
    e.preventDefault()
    copyAllToClipboard()
  })

  Mousetrap.bind('c', e => {
    e.preventDefault()
    copySelectionToBuffer()
  })

  Mousetrap.bind('x', e => {
    e.preventDefault()
    saveState()
    copySelectionToBuffer()
    clearSelection()
    updateState({})
  })

  Mousetrap.bind('v', e => {
    e.preventDefault()
    saveState()
    applyBuffer()
    updateState({})
  })

  Mousetrap.bind('esc', e => {
    e.preventDefault()
    clearBuffer()
    updateState({})
  })

  Mousetrap.bind('z', e => {
    e.preventDefault()
    undo()
    updateState({})
  })

  return (
    <div className="container">
      <h3 className="py-2">
        {chars.map((char, i) => {
          let key = i + 1
          if (key === 10) {
            key = 0
          }
          return <button key={i}>{char}<sub>{key}</sub></button>
        })}
      </h3>
      <div className="ansi">
        {(new Array(rows)).fill(0).map((i, row) => <div key={row}>
          {(new Array(cols)).fill(0).map((i, col) => {
            const active = cursorY === row && cursorX === col
            const oddCol = col % 4 === 0
            const oddRow = row % 3 === 0

            const selection = getSelection()
            let selected = false
            if (null !== selection) {
              selected = row >= selection.from.y && row <= selection.to.y && col >= selection.from.x && col <= selection.to.x
            }

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
      <p className="pt-4 text-muted">
        <small>
          <a href="https://github.com/gherkins/hansi"
             target="_blank"
             rel="noreferrer"
             className="text-muted">
            https://github.com/gherkins/hansi
          </a> #rtfm
        </small>
      </p>
    </div>
  )
}

export default App
