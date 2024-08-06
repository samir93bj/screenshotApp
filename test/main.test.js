const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('App Tests', () => {
  let appStub,
    BrowserWindowStub,
    ipcMainStub,
    handleScreenshotStub,
    createWindowStub,
    setupAppEventsStub;

  beforeEach(() => {
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

  afterEach(() => {
    sinon.restore();
  });

  it('should call createWindow when app is ready', () => {
    assert(appStub.on.calledWith('ready', createWindowStub));
  });

  it('should quit app when all windows are closed and platform is not darwin', () => {
    const windowAllClosedCallback = appStub.on.getCall(1).args[1];
    windowAllClosedCallback();
    assert(appStub.quit.calledOnce);
  });

  it('should not quit app when all windows are closed and platform is darwin', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    });

    const windowAllClosedCallback = appStub.on.getCall(1).args[1];
    windowAllClosedCallback();
    assert(appStub.quit.notCalled);

    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('should handle take-screenshot event', () => {
    assert(
      ipcMainStub.handle.calledWith('take-screenshot', handleScreenshotStub)
    );
  });

  it('should setup app events', () => {
    assert(setupAppEventsStub.calledWith(appStub));
  });
});
