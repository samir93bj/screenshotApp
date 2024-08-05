const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Electron App', function () {
  let appStub;
  let BrowserWindowStub;
  let ipcMainStub;
  let handleScreenshotStub;
  let createWindowStub;
  let setupAppEventsStub;

  beforeEach(function () {
    appStub = {
      on: sinon.stub(),
      quit: sinon.stub(),
    };

    BrowserWindowStub = sinon.stub();
    BrowserWindowStub.prototype.loadFile = sinon.stub();

    ipcMainStub = {
      handle: sinon.stub(),
    };

    handleScreenshotStub = sinon.stub();
    createWindowStub = sinon.stub();
    setupAppEventsStub = sinon.stub();

    proxyquire('../src/main', {
      electron: {
        app: appStub,
        BrowserWindow: BrowserWindowStub,
        ipcMain: ipcMainStub,
      },
      '../src/screenshot': { handleScreenshot: handleScreenshotStub },
      '../src/config': {
        createWindow: createWindowStub,
        setupAppEvents: setupAppEventsStub,
      },
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should call createWindow when app is ready', function () {
    assert(appStub.on.calledWith('ready', createWindowStub));
  });

  it('should quit app when all windows are closed and platform is not darwin', function () {
    const windowAllClosedCallback = appStub.on.getCall(1).args[1];

    process.platform = 'win32';

    windowAllClosedCallback();

    assert(appStub.quit.calledOnce);
  });

  it('should not quit app when all windows are closed and platform is darwin', function () {
    process.platform = 'darwin';

    assert(appStub.quit.notCalled);
  });

  it('should handle take-screenshot event', function () {
    assert(
      ipcMainStub.handle.calledWith('take-screenshot', handleScreenshotStub)
    );
  });

  it('should setup app events', function () {
    assert(setupAppEventsStub.calledWith(appStub));
  });
});
