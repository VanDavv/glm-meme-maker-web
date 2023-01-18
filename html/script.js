document.addEventListener("DOMContentLoaded", function () {
    const imgInput = document.getElementById("image");

    function getImage() {
        return imgInput.files[0]
    }

    const select = document.querySelector("#meme-layout");
    const topTextGroup = document.getElementById("top-text-group");
    const topTextInput = document.getElementById("top-text");
    const bottomTextGroup = document.getElementById("bottom-text-group");
    const bottomTextInput = document.getElementById("bottom-text");
    select.addEventListener("change", function (event) {
        switch (select.value) {
            case "top-bottom":
                topTextGroup.style.display = "block"
                bottomTextGroup.style.display = "block"
                break;
            case "top":
                topTextGroup.style.display = "block"
                bottomTextGroup.style.display = "none"
                break;
            case "bottom":
                topTextGroup.style.display = "none"
                bottomTextGroup.style.display = "block"
                break;
        }
    });

    function getTextsAndPositions(w, h) {
        const format = val => Number(val).toFixed(0).toString()
        switch (select.value) {
            case "top-bottom":
                return [`30,30,"${topTextInput.value}"`, `${format(w / 2)},${format(h * 0.9)},"${bottomTextInput.value}"`]
            case "top":
                return [`30,30,"${topTextInput.value}"`]
            case "bottom":
                return [`${format(w / 2)},${format(h * 0.9)},"${bottomTextInput.value}"`]
        }
    }

    const imgResult = document.querySelector("#generated-meme img");
    const submitButton = document.getElementById("submit-button");

    function convertBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = function(file) {
                    const image = new Image();
                    image.src = file.target.result;
                    image.onload = function() {
                        resolve([fileReader.result, this.width.toFixed(0), this.height.toFixed(0)]);
                    }
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    }

    function appendLog(msg) {
        const logs_el = document.getElementById('logs');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(msg));
        logs_el.appendChild(li);
    }

    function setResponse(result) {
        const data = result.split(' ');
        imgResult.src = 'data:image/png;base64,' + data[2];
    }

    const logger = {
        log: (msg) => appendLog(`[${new Date().toISOString()}] ${msg}`),
        warn: (msg) => appendLog(`[${new Date().toISOString()}] [warn] ${msg}`),
        debug: (msg) => appendLog(`[${new Date().toISOString()}] [debug] ${msg}`),
        // debug: (msg) => console.log(msg),
        error: (msg) => appendLog(`[${new Date().toISOString()}] [error] ${msg}`),
        info: (msg) => appendLog(`[${new Date().toISOString()}] [info] ${msg}`),
        table: (msg) => appendLog(JSON.stringify(msg, null, "\t")),
    }

    function chunkString(str, length) {
        return str.match(new RegExp('.{1,' + length + '}', 'g'));
    }

    async function run() {
        const apiKey = "428cfed4fcde40eda39bb1bae4b21b94";
        const basePath = "/yagna";
        const [encodedImg, width, height] = await convertBase64(getImage())
        const chunkedImg = chunkString(encodedImg, 64000)

        const executor = await yajsapi
            .createExecutor({
                yagnaOptions: {apiKey, basePath},
                package: "6539a63fecfb4ce98bc838ab2de71c6f4d36e1ee5945fbd8f1165c48",
                repoUrl: "/girepo",
                logger
            })

        const batchResults = await executor
            .run(async (ctx) => {
                const batch = ctx.beginBatch();
                for (const chunk of chunkedImg) {
                    batch.run(`echo "${chunk}" >> /golem/work/input_img.txt`);
                }
                batch.run(`/usr/bin/python3 /golem/work/task.py /golem/work/input_img.txt ${getTextsAndPositions(width, height).join(' ')}`)
                return batch.end();
            }).catch(e => logger.error(e));

        await executor.end();
        const result = batchResults.pop();
        setResponse(result.stdout)
    }

    submitButton.addEventListener("click", run);
});