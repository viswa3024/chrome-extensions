window.FFMPEG_CONVERT = function () {

    const DEBUG = true;
    const FFMPEG_TIMEOUT = 60 * 60 * 1000;

    let output = '';
    let msg = '';
    let last_active = Date.now();

    function set_active() {
        last_active = Date.now();
    }

    // -----------------------------------------------------------
    function run_ffmpeg(params, options, finish, message) {
        // if (DEBUG) console.log('--video_ffmpeg.run--', '\n', params.join(' '));

        let timer = null;
        output = '';

        let pnacl = document.createElement("embed");
        pnacl.setAttribute("id", "pnacl");
        pnacl.setAttribute("height", "0");
        pnacl.setAttribute("width", "0");
        pnacl.setAttribute("src", "/manifest_ffmpeg.nmf");
        pnacl.setAttribute("type", "application/x-nacl");

        pnacl.setAttribute("ps_stdout", "dev/tty");
        pnacl.setAttribute("ps_stderr", "dev/tty");
        pnacl.setAttribute("ps_tty_prefix", "''");

        let i = 0;
        pnacl.setAttribute("arg" + (i++).toString(), "ffmpeg");
        pnacl.setAttribute("arg" + (i++).toString(), "-y");

        for (let j = 0; j < params.length; j++) {
            pnacl.setAttribute("arg" + (i++).toString(), params[j]);
        }

        document.body.appendChild(pnacl);

        pnacl.addEventListener('loadstart', () => { eventStatus("Load Start") });
        // pnacl.addEventListener('progress', eventProgress);
        pnacl.addEventListener('load', () => { eventStatus("load") });
        pnacl.addEventListener('error', () => { eventStatus("error: " + pnacl.lastError) });
        pnacl.addEventListener('abort', () => { eventStatus("abort: " + pnacl.lastError) });
        pnacl.addEventListener('loadend', eventRunning);

        pnacl.addEventListener('message', function (ev) {
            msg = ev.data.replace(/^''/gm, '');
            console.log(msg)
            message && message(msg);
            output += msg;
        });

        pnacl.addEventListener('crash', function () {
            if (DEBUG) Logger.log(`Exit: ${pnacl.exitStatus}`);
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            document.body.removeChild(pnacl);
            setTimeout(function () {
                finish && finish((pnacl.exitStatus !== 0), output);
            }, 0);
        });

        function eventStatus(status) {
            if (DEBUG) Logger.log(`Nacl ${status}`);
        }

        function eventProgress(event) {
            if (DEBUG) Logger.log(`Progress: ${event}`);
        }

        function eventRunning() {
            if (DEBUG) Logger.log("Running");
        }

        timer = setInterval(function () {
            if (last_active + FFMPEG_TIMEOUT < Date.now()) {
                clearTimeout(timer);
                finish && finish(false);
                message('timeout');
                document.body.removeChild(pnacl);
            }
        }, FFMPEG_TIMEOUT / 2); // частота ???
    }

    async function info(file) {
        return new Promise((resolve) => {
            const args = [
                "-i",
                "/fs/" + file.match(/[^\/]+$/)[0],
                "-strict",
                "-2"
            ];

            let info = {};

            run_ffmpeg(args, {},
                async (f, msg) => {
                    const m = msg.match(/Video:\s(.+?)\s(.+?)\s([0-9]+)x([0-9]+)[\s|,]/i);
                    const duration = msg.match(/([0-9]*):([0-9]*):([0-9]*)\.([0-9]*)/i);
                    if (m) {
                        info.codec = m[1];
                        info.quality = {width: m[3], height: m[4]};
                    }

                    if (duration) {
                        const hour = parseInt(duration[1]);
                        const minute = parseInt(duration[2]);
                        const second = parseInt(duration[3]);
                        info.duration = hour * 3600 + minute * 60 + second;
                    }

                    if (DEBUG) Logger.log(`File info - duration: ${duration && duration[1]}:${duration && duration[2]}:${duration && duration[3]} codec: ${m && m[1]} width: ${m && m[3]} height: ${m && m[4]}`);

                    resolve(info);
                });
        });
    }

    // =============================================================
    let queryRun = [];
    let isRun = false;

    function start(params, opt, finish, message) {

        opt = opt ? opt : {priority: false};

        // ставим в очередь
        if (opt.priority) {
            queryRun.unshift({
                params: params,
                options: opt,
                trial: 0,
                state: 0,
                finish: finish,
                message: message
            });
        } else {
            queryRun.push({
                params: params,
                options: opt,
                trial: 0,
                state: 0,
                finish: finish,
                message: message
            });
        }

        run_query();

    }

    // -------------------------------------------------------------------
    function run_query() {
        if (DEBUG) console.log("run_query", queryRun);

        if (isRun) return;

        for (let i = 0; i < queryRun.length; i++) {
            if (queryRun[i].state === 0) {
                queryRun[i].state = 1;
                queryRun[i].trial++;
                _run(queryRun[i]);
                isRun = true;
            }
        }

        function _run(qq) {
            run_ffmpeg(qq.params, qq.options, function (f) {
                    if (DEBUG) console.log(f);
                    qq.state = 2;
                    isRun = false;
                    qq.finish(f);
                    setTimeout(function () {
                        run_query();
                    }, 0);
                },
                function (msg) {
                    qq.message(msg.replace("''", ""));
                });
        }
    }

    return {
        info,
        start,
        set_active
    }
};
