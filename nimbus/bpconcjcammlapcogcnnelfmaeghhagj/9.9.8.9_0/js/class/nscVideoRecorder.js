if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
    MediaStream.prototype.stop = function () {
        this.getAudioTracks().forEach(function (track) {
            track.stop();
        });

        this.getVideoTracks().forEach(function (track) {
            track.stop();
        });
    };
}

if (typeof AudioContext !== 'undefined') {
    Storage.AudioContext = AudioContext;
} else if (typeof webkitAudioContext !== 'undefined') {
    Storage.AudioContext = webkitAudioContext;
}

class nscVideoRecorder {
    constructor(options) {

    }

    async tabCapture(param) {
        return new Promise(function (resolve, reject) {
            chrome.tabCapture.capture(param || {video: true, audio: true}, function (stream) {
                if (chrome.runtime.lastError && /activeTab/.test(chrome.runtime.lastError.message)) {
                    return reject(chrome.i18n.getMessage('notificationErrorActiveTab'));
                }
                resolve(stream)
            });
        });
    }

    async desktopCapture() {
        return new Promise(function (resolve, reject) {

            chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab", "audio"], async function (streamId, option) {
                if (!streamId) return reject('desktopCapture no search streamId')

                resolve({streamId, option})
            });
        });
    }

    async setVideoResolution(videoResolution, activeTab) {
        switch (videoResolution) {
            case 'auto':
                if (activeTab) videoResolution = {width: activeTab.width, height: activeTab.height}
                else videoResolution = {width: screen.width, height: screen.height}
                break;
            case 'qhd':
                videoResolution = {width: 854, height: 480};
                break;
            case 'hd':
                videoResolution = {width: 1280, height: 720};
                break;
            case 'fullhd':
                videoResolution = {width: 1920, height: 1080};
                break;
            case '2k':
                videoResolution = {width: 2560, height: 1440};
                break;
            case '4k':
                videoResolution = {width: 3840, height: 2160};
                break;
        }
        return videoResolution;
    }

    async getUserMedia(constraints = {video: true, audio: true}) {
        return await navigator.mediaDevices.getUserMedia(constraints);

        // return new Promise(function (resolve, reject) {
        //     navigator.mediaDevices.getUserMedia(constraints)
        //         .then(function(stream) {
        //             stream.stop()
        //             resolve(true)
        //         })
        //         .catch(function(err) {
        //             reject(false)
        //         });
        // });

        // return new Promise(function (resolve, reject) {
        //     window.navigator.getUserMedia(constraints, resolve, reject)
        // });
    }

    async getSeekableBlob(blob) {
        return new Promise(function (resolve, reject) {
            if (typeof EBML === 'undefined') reject(new Error('Please link: https://www.webrtc-experiment.com/EBML.js'));

            const reader = new EBML.Reader();
            const decoder = new EBML.Decoder();
            const tools = EBML.tools;

            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                try{
                    decoder.decode(this.result).forEach(element => reader.read(element));
                    reader.stop();
                    const refinedMetadataBuf = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
                    const body = this.result.slice(reader.metadataSize);
                    Logger.log(`Seekable file`)
                    resolve(new Blob([refinedMetadataBuf, body], {type: 'video/webm'}));
                } catch (e) {
                    reject(e)
                }
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(blob);
        });
    }

    async getMixedAudioStream(arrayOfAudioStreams) {
        const audioContext = new AudioContext();
        const gainNode = audioContext.createGain();

        let audioSources = [];
        let audioTracksLength = 0;

        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0;

        arrayOfAudioStreams.forEach(function (stream) {
            if (!stream.getAudioTracks().length) {
                return;
            }

            audioTracksLength++;

            let audioSource = audioContext.createMediaStreamSource(stream);
            audioSource.connect(gainNode);
            audioSources.push(audioSource);
        });

        if (!audioTracksLength) {
            return;
        }

        let audioDestination = audioContext.createMediaStreamDestination();
        audioSources.forEach(function (audioSource) {
            audioSource.connect(audioDestination);
        });

        return audioDestination.stream;
    }

    async requestFileSystem() {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem(window.PERSISTENT, 10 * 1024 * 1024 * 1024, resolve, reject);
        });
    }

    async getFile(name, option) {
        return new Promise(function (resolve, reject) {
            this.requestFileSystem().then(function (fs) {
                fs.root.getFile(name, option || {}, resolve, reject);
            }).catch(reject)
        }.bind(this));
    }

    async removeFile(entry) {
        return new Promise(function (resolve) {
            entry.remove(resolve);
        }.bind(this));
    }

    async writeFile(entry, blob) {
        // let truncated = false;
        return new Promise(function (resolve, reject) {
            entry.createWriter(async function (writer) {
                writer.onwriteend = resolve;
                // writer.onwriteend = async function () {
                //     if (truncated) {
                //         return resolve()
                //     }
                //     truncated = true;
                //     this.truncate(this.position);
                // };
                writer.onerror = reject;
                writer.write(blob);
             }, reject);
        }.bind(this));
    }
}

const nscVideo = new nscVideoRecorder();
