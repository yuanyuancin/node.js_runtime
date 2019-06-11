'use strict';

const fs = require('mz/fs');
const consts = require('./consts');
const sleep = require('mz-modules/sleep');
const logger = require('./logger');

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
