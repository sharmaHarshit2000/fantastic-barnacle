import {
  __commonJS,
  __esm,
  __export,
  __toCommonJS
} from "./chunk-DZZM6G22.js";

// node_modules/@superset-ui/embedded-sdk/lib/const.js
var require_const = __commonJS({
  "node_modules/@superset-ui/embedded-sdk/lib/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.IFRAME_COMMS_MESSAGE_TYPE = exports.DASHBOARD_UI_FILTER_CONFIG_URL_PARAM_KEY = void 0;
    var IFRAME_COMMS_MESSAGE_TYPE = exports.IFRAME_COMMS_MESSAGE_TYPE = "__embedded_comms__";
    var DASHBOARD_UI_FILTER_CONFIG_URL_PARAM_KEY = exports.DASHBOARD_UI_FILTER_CONFIG_URL_PARAM_KEY = {
      visible: "show_filters",
      expanded: "expand_filters"
    };
  }
});

// node_modules/@superset-ui/switchboard/esm/switchboard.js
function isGet(message) {
  return message.switchboardAction === Actions.GET;
}
function isReply(message) {
  return message.switchboardAction === Actions.REPLY;
}
function isEmit(message) {
  return message.switchboardAction === Actions.EMIT;
}
function isError(message) {
  return message.switchboardAction === Actions.ERROR;
}
var Actions, Switchboard, switchboard_default;
var init_switchboard = __esm({
  "node_modules/@superset-ui/switchboard/esm/switchboard.js"() {
    Actions = (function(Actions2) {
      Actions2["GET"] = "get";
      Actions2["REPLY"] = "reply";
      Actions2["EMIT"] = "emit";
      Actions2["ERROR"] = "error";
      return Actions2;
    })(Actions || {});
    Switchboard = class {
      constructor(params) {
        this.port = void 0;
        this.name = "";
        this.methods = {};
        this.incrementor = 1;
        this.debugMode = void 0;
        this.isInitialised = void 0;
        if (!params) {
          return;
        }
        this.init(params);
      }
      init(params) {
        if (this.isInitialised) {
          this.logError("already initialized");
          return;
        }
        const { port, name = "switchboard", debug = false } = params;
        this.port = port;
        this.name = name;
        this.debugMode = debug;
        port.addEventListener("message", async (event) => {
          this.log("message received", event);
          const message = event.data;
          if (isGet(message)) {
            this.port.postMessage(await this.getMethodResult(message));
          } else if (isEmit(message)) {
            const { method, args } = message;
            const executor = this.methods[method];
            if (executor) {
              executor(args);
            }
          }
        });
        this.isInitialised = true;
      }
      async getMethodResult({
        messageId,
        method,
        args
      }) {
        const executor = this.methods[method];
        if (executor == null) {
          return {
            switchboardAction: Actions.ERROR,
            messageId,
            error: `[${this.name}] Method "${method}" is not defined`
          };
        }
        try {
          const result = await executor(args);
          return {
            switchboardAction: Actions.REPLY,
            messageId,
            result
          };
        } catch (err) {
          this.logError(err);
          return {
            switchboardAction: Actions.ERROR,
            messageId,
            error: `[${this.name}] Method "${method}" threw an error`
          };
        }
      }
      /**
       * Defines a method that can be "called" from the other side by sending an event.
       */
      defineMethod(methodName, executor) {
        this.methods[methodName] = executor;
      }
      /**
       * Calls a method registered on the other side, and returns the result.
       *
       * How this is accomplished:
       * This switchboard sends a "get" message over the channel describing which method to call with which arguments.
       * The other side's switchboard finds a method with that name, and calls it with the arguments.
       * It then packages up the returned value into a "reply" message, sending it back to us across the channel.
       * This switchboard has attached a listener on the channel, which will resolve with the result when a reply is detected.
       *
       * Instead of an arguments list, arguments are supplied as a map.
       *
       * @param method the name of the method to call
       * @param args arguments that will be supplied. Must be serializable, no functions or other nonsense.
       * @returns whatever is returned from the method
       */
      get(method, args = void 0) {
        return new Promise((resolve, reject) => {
          if (!this.isInitialised) {
            reject(new Error("Switchboard not initialised"));
            return;
          }
          const messageId = this.getNewMessageId();
          const listener = (event) => {
            const message2 = event.data;
            if (message2.messageId !== messageId) return;
            this.port.removeEventListener("message", listener);
            if (isReply(message2)) {
              resolve(message2.result);
            } else {
              const errStr = isError(message2) ? message2.error : "Unexpected response message";
              reject(new Error(errStr));
            }
          };
          this.port.addEventListener("message", listener);
          this.port.start();
          const message = {
            switchboardAction: Actions.GET,
            method,
            messageId,
            args
          };
          this.port.postMessage(message);
        });
      }
      /**
       * Emit calls a method on the other side just like get does.
       * But emit doesn't wait for a response, it just sends and forgets.
       *
       * @param method
       * @param args
       */
      emit(method, args = void 0) {
        if (!this.isInitialised) {
          this.logError("Switchboard not initialised");
          return;
        }
        const message = {
          switchboardAction: Actions.EMIT,
          method,
          args
        };
        this.port.postMessage(message);
      }
      start() {
        if (!this.isInitialised) {
          this.logError("Switchboard not initialised");
          return;
        }
        this.port.start();
      }
      log(...args) {
        if (this.debugMode) {
          console.debug(`[${this.name}]`, ...args);
        }
      }
      logError(...args) {
        console.error(`[${this.name}]`, ...args);
      }
      getNewMessageId() {
        return `m_${this.name}_${this.incrementor++}`;
      }
    };
    switchboard_default = new Switchboard();
  }
});

// node_modules/@superset-ui/switchboard/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  Switchboard: () => Switchboard,
  default: () => esm_default
});
var esm_default;
var init_esm = __esm({
  "node_modules/@superset-ui/switchboard/esm/index.js"() {
    init_switchboard();
    init_switchboard();
    esm_default = switchboard_default;
  }
});

// node_modules/jwt-decode/build/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/jwt-decode/build/cjs/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.jwtDecode = exports.InvalidTokenError = void 0;
    var InvalidTokenError = class extends Error {
    };
    exports.InvalidTokenError = InvalidTokenError;
    InvalidTokenError.prototype.name = "InvalidTokenError";
    function b64DecodeUnicode(str) {
      return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
          code = "0" + code;
        }
        return "%" + code;
      }));
    }
    function base64UrlDecode(str) {
      let output = str.replace(/-/g, "+").replace(/_/g, "/");
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += "==";
          break;
        case 3:
          output += "=";
          break;
        default:
          throw new Error("base64 string is not of the correct length");
      }
      try {
        return b64DecodeUnicode(output);
      } catch (err) {
        return atob(output);
      }
    }
    function jwtDecode(token, options) {
      if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
      }
      options || (options = {});
      const pos = options.header === true ? 0 : 1;
      const part = token.split(".")[pos];
      if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
      }
      let decoded;
      try {
        decoded = base64UrlDecode(part);
      } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
      }
      try {
        return JSON.parse(decoded);
      } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
      }
    }
    exports.jwtDecode = jwtDecode;
  }
});

// node_modules/@superset-ui/embedded-sdk/lib/guestTokenRefresh.js
var require_guestTokenRefresh = __commonJS({
  "node_modules/@superset-ui/embedded-sdk/lib/guestTokenRefresh.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.REFRESH_TIMING_BUFFER_MS = exports.MIN_REFRESH_WAIT_MS = exports.DEFAULT_TOKEN_EXP_MS = void 0;
    exports.getGuestTokenRefreshTiming = getGuestTokenRefreshTiming;
    var _jwtDecode = require_cjs();
    var REFRESH_TIMING_BUFFER_MS = exports.REFRESH_TIMING_BUFFER_MS = 5e3;
    var MIN_REFRESH_WAIT_MS = exports.MIN_REFRESH_WAIT_MS = 1e4;
    var DEFAULT_TOKEN_EXP_MS = exports.DEFAULT_TOKEN_EXP_MS = 3e5;
    function getGuestTokenRefreshTiming(currentGuestToken) {
      const parsedJwt = (0, _jwtDecode.jwtDecode)(currentGuestToken);
      const exp = new Date(/[^0-9\.]/g.test(parsedJwt.exp) ? parsedJwt.exp : parseFloat(parsedJwt.exp) * 1e3);
      const isValidDate = exp.toString() !== "Invalid Date";
      const ttl = isValidDate ? Math.max(MIN_REFRESH_WAIT_MS, exp.getTime() - Date.now()) : DEFAULT_TOKEN_EXP_MS;
      return ttl - REFRESH_TIMING_BUFFER_MS;
    }
  }
});

// node_modules/@superset-ui/embedded-sdk/lib/index.js
var require_lib = __commonJS({
  "node_modules/@superset-ui/embedded-sdk/lib/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.embedDashboard = embedDashboard;
    var _const = require_const();
    var _switchboard = (init_esm(), __toCommonJS(esm_exports));
    var _guestTokenRefresh = require_guestTokenRefresh();
    async function embedDashboard({
      id,
      supersetDomain,
      mountPoint,
      fetchGuestToken,
      dashboardUiConfig,
      debug = false,
      iframeTitle = "Embedded Dashboard",
      iframeSandboxExtras = [],
      referrerPolicy
    }) {
      function log(...info) {
        if (debug) {
          console.debug(`[superset-embedded-sdk][dashboard ${id}]`, ...info);
        }
      }
      log("embedding");
      if (supersetDomain.endsWith("/")) {
        supersetDomain = supersetDomain.slice(0, -1);
      }
      function calculateConfig() {
        let configNumber = 0;
        if (dashboardUiConfig) {
          if (dashboardUiConfig.hideTitle) {
            configNumber += 1;
          }
          if (dashboardUiConfig.hideTab) {
            configNumber += 2;
          }
          if (dashboardUiConfig.hideChartControls) {
            configNumber += 8;
          }
          if (dashboardUiConfig.emitDataMasks) {
            configNumber += 16;
          }
        }
        return configNumber;
      }
      async function mountIframe() {
        return new Promise((resolve) => {
          const iframe = document.createElement("iframe");
          const dashboardConfigUrlParams = dashboardUiConfig ? {
            uiConfig: `${calculateConfig()}`
          } : void 0;
          const filterConfig = dashboardUiConfig?.filters || {};
          const filterConfigKeys = Object.keys(filterConfig);
          const filterConfigUrlParams = Object.fromEntries(filterConfigKeys.map((key) => [_const.DASHBOARD_UI_FILTER_CONFIG_URL_PARAM_KEY[key], filterConfig[key]]));
          const urlParams = {
            ...dashboardConfigUrlParams,
            ...filterConfigUrlParams,
            ...dashboardUiConfig?.urlParams
          };
          const urlParamsString = Object.keys(urlParams).length ? "?" + new URLSearchParams(urlParams).toString() : "";
          iframe.sandbox.add("allow-same-origin");
          iframe.sandbox.add("allow-scripts");
          iframe.sandbox.add("allow-presentation");
          iframe.sandbox.add("allow-downloads");
          iframe.sandbox.add("allow-forms");
          iframe.sandbox.add("allow-popups");
          iframeSandboxExtras.forEach((key) => {
            iframe.sandbox.add(key);
          });
          if (referrerPolicy) {
            iframe.referrerPolicy = referrerPolicy;
          }
          iframe.addEventListener("load", () => {
            const commsChannel = new MessageChannel();
            const ourPort2 = commsChannel.port1;
            const theirPort = commsChannel.port2;
            iframe.contentWindow.postMessage({
              type: _const.IFRAME_COMMS_MESSAGE_TYPE,
              handshake: "port transfer"
            }, supersetDomain, [theirPort]);
            log("sent message channel to the iframe");
            resolve(new _switchboard.Switchboard({
              port: ourPort2,
              name: "superset-embedded-sdk",
              debug
            }));
          });
          iframe.src = `${supersetDomain}/embedded/${id}${urlParamsString}`;
          iframe.title = iframeTitle;
          mountPoint.replaceChildren(iframe);
          log("placed the iframe");
        });
      }
      const [guestToken, ourPort] = await Promise.all([fetchGuestToken(), mountIframe()]);
      ourPort.emit("guestToken", {
        guestToken
      });
      log("sent guest token");
      async function refreshGuestToken() {
        const newGuestToken = await fetchGuestToken();
        ourPort.emit("guestToken", {
          guestToken: newGuestToken
        });
        setTimeout(refreshGuestToken, (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(newGuestToken));
      }
      setTimeout(refreshGuestToken, (0, _guestTokenRefresh.getGuestTokenRefreshTiming)(guestToken));
      function unmount() {
        log("unmounting");
        mountPoint.replaceChildren();
      }
      const getScrollSize = () => ourPort.get("getScrollSize");
      const getDashboardPermalink = (anchor) => ourPort.get("getDashboardPermalink", {
        anchor
      });
      const getActiveTabs = () => ourPort.get("getActiveTabs");
      const getDataMask = () => ourPort.get("getDataMask");
      const observeDataMask = (callbackFn) => {
        ourPort.start();
        ourPort.defineMethod("observeDataMask", callbackFn);
      };
      const setThemeConfig = async (themeConfig) => {
        try {
          ourPort.emit("setThemeConfig", {
            themeConfig
          });
          log("Theme config sent successfully (or at least message dispatched)");
        } catch (error) {
          log('Error sending theme config. Ensure the iframe side implements the "setThemeConfig" method.');
          throw error;
        }
      };
      return {
        getScrollSize,
        unmount,
        getDashboardPermalink,
        getActiveTabs,
        observeDataMask,
        getDataMask,
        setThemeConfig
      };
    }
  }
});
export default require_lib();
//# sourceMappingURL=@superset-ui_embedded-sdk.js.map
