const fs = require('fs');
const rimraf = require('rimraf');
const sasCsd = require('./sas_csd');

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
