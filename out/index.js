module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(916);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 66:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 158:
/***/ (function(module) {

module.exports = require("mz-modules");

/***/ }),

/***/ 159:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(194);
const consts = __webpack_require__(278);
const sleep = __webpack_require__(158);
const logger = __webpack_require__(160);

async function waitForAssignment() {
  logger.log('Waiting for CSD Assignment');

  /* eslint-disable no-constant-condition */
  while (true) {
    if (await fs.exists(consts.CsdModeAssignmentFilePath)) {
      if (await isAssignmentDone()) {
        logger.log('CSD assigned');
        break;
      }
    }
    await sleep(100);
  }
}

async function isAssignmentDone() {
  const assignment = await parseAssignmentContent();
  return !!assignment[consts.AnnotationUserContanierEnv] &&
    !!assignment[consts.AnnotationSasContext] &&
    !!assignment[consts.AnnotationSasContanierEnv];
}

async function parseAssignmentContent() {
  const fileContent = await fs.readFile(consts.CsdModeAssignmentFilePath, { encoding: 'UTF-8' });
  const result = {};
  fileContent.split('\n').forEach(line => {
    if (!line || line.indexOf('=') === -1) {
      return;
    }
    const index = line.indexOf('=');
    const key = line.substring(0, index);
    result[key] = JSON.parse(line.substring(index + 1));
  });
  return result;
}

async function setUpEnvVars() {
  const assignment = await parseAssignmentContent();
  const sasContext = JSON.parse(assignment[consts.AnnotationSasContext]);
  const userContainerEnv = JSON.parse(assignment[consts.AnnotationUserContanierEnv]);

  const env = {
    SOFASTACK_SAS_CONTEXT: JSON.stringify(sasContext),
    SOFASTACK_SAS_SERVERLESS_APP_IDENTITY: sasContext.appName,
    SOFASTACK_SAS_SERVERLESS_APP_SERVICE_IDENTITY: sasContext.serverlessAppServiceName,
    SOFASTACK_SAS_SERVERLESS_APP_SERVICE_VERSION: sasContext.serverlessAppServiceVersion,
    SOFASTACK_SAS_TENANT_ID: sasContext.tenantName,
    SOFASTACK_SAS_WORKSPACE_ID: sasContext.workspaceIdentity,
  };

  userContainerEnv.forEach(item => {
    env[item.name] = item.value;
  });

  logger.log('Setting up env for CSD: %s', JSON.stringify(env));

  Object.keys(env).forEach(key => {
    process.env[key] = env[key];
  });
}

async function isCsdMode() {
  return await fs.exists(consts.CsdModeRootPath);
}

module.exports = {
  waitForAssignment,
  setUpEnvVars,
  isCsdMode,
};


/***/ }),

/***/ 160:
/***/ (function(module) {

"use strict";


let out = '';

function log(...args) {
  out += args.join(' ') + '\n';
  console.log(...args);
}

function clearOut() {
  out = '';
}

module.exports = {
  log,
  clearOut,
  get out() {
    return out;
  },
};


/***/ }),

/***/ 194:
/***/ (function(module) {

module.exports = require("mz");

/***/ }),

/***/ 278:
/***/ (function(module) {

"use strict";


const CsdModeRootPath = '/home/admin/sas_assignment';
const CsdModeAssignmentFilePath = CsdModeRootPath + '/assignment';
const AnnotationUserContanierEnv = 'sas.cafe.sofastack.io/user-container-env';
const AnnotationSasContanierEnv = 'sas.cafe.sofastack.io/sas-container-env';
const AnnotationSasContext = 'sas.cafe.sofastack.io/sas-context';

module.exports = {
  get CsdModeRootPath() {
    return process.env.CSD_MODE_ROOT_PATH || CsdModeRootPath;
  },
  get CsdModeAssignmentFilePath() {
    return process.env.CSD_MODE_ASSIGNMENT_FILE_PATH || CsdModeAssignmentFilePath;
  },
  AnnotationUserContanierEnv,
  AnnotationSasContanierEnv,
  AnnotationSasContext,
};


/***/ }),

/***/ 365:
/***/ (function(module, __unusedexports, __webpack_require__) {

const fs = __webpack_require__(66);
const rimraf = __webpack_require__(569);
const sasCsd = __webpack_require__(159);

module.exports = async function waitForCode() {
    // 支持SAS预热池（CSD）功能
    if (await sasCsd.isCsdMode()) {
        await sasCsd.waitForAssignment();
        await sasCsd.setUpEnvVars();
    }

    return await waitForIpcRequest();
};

// 等待IPC指令
async function waitForIpcRequest() {
    const IPC_REQUEST_PATH = path.join(process.env.SOFASTACK_SAS_IPC_PATH, 'ipc.request');
    let result;

    while (true) {
        const exists = await fs.exists(IPC_REQUEST_PATH);
        if (exists) {
            const res = JSON.parse(fs.readFileSync(IPC_REQUEST_PATH, {encoding: "UTF-8"}));
            console.log('Get IPC request %s', JSON.stringify(res));
            result = res.data.commandArguments;
            break;
        }
        await sleep(100);
    }
    await rimraf(IPC_REQUEST_PATH);
    return result;
}


/***/ }),

/***/ 569:
/***/ (function(module) {

module.exports = require("rimraf");

/***/ }),

/***/ 890:
/***/ (function(__unusedmodule, exports) {

exports.world = function() {
    console.log('Hello World');
}

/***/ }),

/***/ 916:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

// 运行时实现参考文档： https://yuque.antfin-inc.com/zhongle.wk/serverless-spec-for-basement/abuc07

const waitForCode = __webpack_require__(365);

(async function () {
    const {codePath} = await waitForCode();
    console.log("Got code path: " + codePath);
    //TODO: run it!

    process.env.CODE_PATH = codePath;
    eval("require")(codePath);
    var hello = __webpack_require__(890);
    hello.world();
})();


/***/ })

/******/ });