// 运行时实现参考文档： https://yuque.antfin-inc.com/zhongle.wk/serverless-spec-for-basement/abuc07

const waitForCode = require('./lib/waitForCode');

(async function () {
    const {codePath} = await waitForCode();
    console.log("Got code path: " + codePath);
    //TODO: run it!

    process.env.CODE_PATH = codePath;
    eval("require")(codePath);
    var hello = require('./hello.js');
    hello.world();


    const startTimePath = path.join(process.env.SOFASTACK_SAS_RUNTIME_STATE_DIR, 'start_time');
    await mkdirp(path.dirname(startTimePath));
    await fs.writeFile(startTimePath, Math.floor(new Date() / 1000));


})();
