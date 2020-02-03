import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

const kahanSumJs = values => {
  let sum = 0.0
  let c = 0.0
  for (let i = 0; i < values.length; i++) {
    const y = values[i] - c
    const t = sum + y
    c = t - sum - y
    sum = t
  }

  return sum
}

const MAX_VAL_SIZE = 20000
const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 }) // // memory * 65.536 Byte (64 KB)
const MAX_VAL = 40

const gen_values = new Float64Array(memory.buffer, 0, MAX_VAL_SIZE)

const envWasm = {
  memory,
  // eslint-disable-next-line @typescript-eslint/camelcase
  __table_base: 0,
  table: new WebAssembly.Table({
    initial: 10,
    maximum: 10,
    element: 'anyfunc'
  })
}

const importWasmObject = {
  env: envWasm
}
const fetchWebAssembly = async () => {
  // @ts-ignore
  const { instance } = await WebAssembly.instantiateStreaming(
    window.fetch('lib/summation.wasm'),
    importWasmObject
  )
  return instance
}

const ResultCalculation = ({ description, duration, resultValue }) => (
  <div style={{ display: 'flex', marginTop: 10 }}>
    {duration !== 0 ? (
      <span style={{ marginLeft: 5, color: '#3f51a0' }}>
        {`${duration.toFixed(2)} milliseconds = ${(duration / 1000).toFixed(
          3
        )} seconds`}
      </span>
    ) : null}
    {resultValue !== 0 ? (
      <span style={{ marginLeft: 5 }}>
        <span>{` => calculation result: `}</span>
        <span style={{ color: '#6f51b5' }}>{resultValue}</span>
        <span>{` in ${description}`}</span>
      </span>
    ) : null}
  </div>
)

const SomePreactComponent = () => {
  const [durationJS, setDurationJS] = useState(0)
  const [resultJs, setResultJs] = useState(0)
  const [resultWasm, setResultWasm] = useState(0)
  const [durationWASM, setDurationWASM] = useState(0)
  const [randomGenTime, setRandomGenTime] = useState(0)
  const [instance, setInstance] = useState()

  useEffect(() => {
    fetchWebAssembly().then(val => setInstance(val))
  }, [])

  const runKahanSumJS = () => {
    let startTime = performance.now()
    setResultJs(kahanSumJs(gen_values, MAX_VAL_SIZE))
    setDurationJS(performance.now() - startTime)
  }
  const runKahanSumWASM = () => {
    let startTime = performance.now()
    setResultWasm(instance.exports._kahan_sum(0, MAX_VAL_SIZE))
    setDurationWASM(performance.now() - startTime)
  }

  const run = () => {
    let startTime = performance.now()
    for (let i = 0; i < MAX_VAL_SIZE; i++) {
      gen_values[i] = Math.random() * MAX_VAL
    }
    setRandomGenTime(performance.now() - startTime)

    runKahanSumJS()
    runKahanSumWASM()
  }

  return (
    <React.Fragment>
      <h2 style={{ color: '#3f51b5' }}>{`Kahan summation algorithm`}</h2>
      <button style={{ marginBottom: 10, padding: 10 }} onClick={run}>
        Generate values and calculate
      </button>
      {randomGenTime !== 0 ? (
        <div>{`${MAX_VAL_SIZE.toLocaleString()} random values in ${randomGenTime.toFixed(
          2
        )} milliseconds (${(randomGenTime / 1000).toFixed(
          3
        )} s) generated`}</div>
      ) : null}
      <ResultCalculation
        description="JS"
        duration={durationJS}
        resultValue={resultJs}
      />
      <ResultCalculation
        description="WASM"
        duration={durationWASM}
        resultValue={resultWasm}
      />
    </React.Fragment>
  )
}

// Inject your application into the an element with the id `app`.
render(<SomePreactComponent />, document.getElementById('app'))
