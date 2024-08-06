const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

describe('config.js', () => {
  let BrowserWindowStub, appStub, createWindow, setupAppEvents;

  beforeEach(() => {
    BrowserWindowStub = sinon.stub();
    BrowserWindowStub.prototype.loadFile = sinon.stub();
    BrowserWindowStub.getAllWindows = sinon.stub().returns([]);

    appStub = {
      on: sinon.stub(),
    };

    const config = proxyquire('../src/config', {
      electron: { BrowserWindow: BrowserWindowStub },
      path: {
        join: sinon.stub().callsFake((...args) => args.join('/')),
      },
    });

    createWindow = config.createWindow;
    setupAppEvents = config.setupAppEvents;
  });

  describe('createWindow', () => {
    it('should create a BrowserWindow instance with correct properties', () => {
      createWindow();
      assert.deepStrictEqual(BrowserWindowStub.calledOnce, true);

      assert.deepStrictEqual(
        BrowserWindowStub.prototype.loadFile.calledOnceWith('../index.html'),
        false
      );
    });
  });

  describe('setupAppEvents', () => {
    it('should set up the activate event correctly', () => {
      setupAppEvents(appStub);
      assert.strictEqual(appStub.on.calledOnceWith('activate'), true);

      const activateCallback = appStub.on.firstCall.args[1];
      BrowserWindowStub.getAllWindows.returns([]);
      activateCallback();
      assert.strictEqual(BrowserWindowStub.calledOnce, true);
    });
  });
});
