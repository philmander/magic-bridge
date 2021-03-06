const mocha = require('mocha')
const assert = require('assert')
const newBridge = require('../client/index')

const bridge = newBridge('http://localhost:3000/jsonrpc/default')
const circle = newBridge('http://localhost:3000/jsonrpc/circle')
const triangle = newBridge('http://localhost:3000/jsonrpc/triangle')

describe('E2E client --> server calls', function () {
  it('calls a method on the server', async () => {
    const val = await bridge.add(10, 10)
    assert.equal(val, 20)
  })

  it('calls a method on the server with array params', async () => {
    const val1 = await bridge.multiply(10, 10)
    assert.equal(val1, 100)

    const val2 = await bridge.multiply(10, 20)
    assert.equal(val2, 200)
  })

  it('calls a method on the server with object params', async () => {
    const val = await bridge.concat({ foo: 'foo', bar: 'bar'})
    assert.equal(val, 'foobar')
  })

  it('can call a void function', async () => {
    await bridge.resetSomething()
    let val = await bridge.getSomething()
    assert.equal(val, 'hello')
    await bridge.changeSomething()
    val = await bridge.getSomething()
    assert.equal(val, 'hello world')
  })

  it('calls a method that needs context', async () => {
    const area = await bridge.calcArea()
    assert.equal(area, 2000)
  })

  it('calls a methods that uses a session local args', async () => {
    const result = await bridge.saveUser('test@magic');
    assert.equal(result, 'test@magic_99')
  })

  it('calls a function on a registered object (requiring context)', async () => {
    const result = await triangle.calcArea()
    assert.equal(result, 31415.93)
  })

  it('throws if the method was not found', async () => {
    try {
      await bridge.lalala();
      assert.fail('Shouldnt get this far. Missing method error was not thrown!')
    } catch(err) {
      assert.equal(err.message, 'JSON RPC error (-32601): Method not found: lalala')
    }
  })

  it('throws if there was an internal server error', async () => {
    try {
      await bridge.somethingWrong();
      assert.fail('Shouldnt get this far. Internal error was not thrown!')
    } catch(err) {
      assert.equal(err.message, 'JSON RPC error (-32603): Internal server error: something wrong')
    }
  })

  it('throws if there was an id mismatch', async () => {
    try {
      await bridge.__TEST_BAD_RESPONSE_ID();
      assert.fail('Shouldnt get this far. Internal error was not thrown!')
    } catch(err) {
      assert.equal(err.message, 'JSON RPC error: Response id does not match request id')
    }
  })

  it('it can use multiple bridges', async () => {
    const rectArea = await bridge.calcArea()
    assert.equal(rectArea, 2000)

    const circleArea = await circle.calcArea()
    assert.equal(circleArea, 31415.93)

    const rectPerimeter = await bridge.calcPerimeter()
    assert.equal(rectPerimeter, 180)

    const circlePerimeter = await circle.calcPerimeter()
    assert.equal(circlePerimeter, 628.32)
  })
})