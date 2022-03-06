/*
 * "This work is created by NimbusWeb and is copyrighted by NimbusWeb. (c) 2017 NimbusWeb.
 * You may not replicate, copy, distribute, or otherwise create derivative works of the copyrighted
 * material without prior written permission from NimbusWeb.
 *
 * Certain parts of this work contain code licensed under the MIT License.
 * https://www.webrtc-experiment.com/licence/ THE SOFTWARE IS PROVIDED "AS IS",
 * WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */

"use strict";

const {version} = chrome.runtime.getManifest();
const extension_id = chrome.i18n.getMessage("@@extension_id");
const {language} = window.navigator;

localStorage.appMenuItem = localStorage.appMenuItem || JSON.stringify({
    "entire": true,
    "window": true,
    "selected": true,
    "fragment": true,
    "visible": true,
    "blank": true,
    "delayed": true,
    "scroll": true,
    "video": true
});
localStorage.pageinfo = localStorage.pageinfo || JSON.stringify({
    'url': '',
    'title': '',
    'time': nscExt.getTimeStamp()
});

localStorage.youtubePlaylist = localStorage.youtubePlaylist || 'no-playlist';
localStorage.videoCameraEnable = localStorage.videoCameraEnable || 'false';
localStorage.videoMicSoundEnable = localStorage.videoMicSoundEnable || 'true';
localStorage.videoTabSoundEnable = localStorage.videoTabSoundEnable || 'false';
localStorage.videoAnimationCursor = localStorage.videoAnimationCursor || 'true';
localStorage.videoPrivateUploadEnable = localStorage.videoPrivateUploadEnable || 'false';
localStorage.videoDrawingToolsEnable = localStorage.videoDrawingToolsEnable || 'false';
localStorage.videoRecordType = localStorage.videoRecordType || 'tab';
localStorage.videoBitrate = localStorage.videoBitrate || '4000000';
localStorage.videoAudioBitrate = localStorage.videoAudioBitrate || '96000';
localStorage.videoFps = localStorage.videoFps || '24';
localStorage.videoDrawingToolsDelete = localStorage.videoDrawingToolsDelete || '0';
localStorage.videoCountdown = localStorage.videoCountdown || 0;
localStorage.videoFormat = localStorage.videoFormat || 'webm';
localStorage.enableSaveAs = localStorage.enableSaveAs || 'true';
localStorage.saveCropPosition = localStorage.saveCropPosition || 'false';
localStorage.appContentMenuShow = localStorage.appContentMenuShow || 'true';
localStorage.shareOnGoogle = localStorage.shareOnGoogle || 'true';
localStorage.shareOnYoutube = localStorage.shareOnYoutube || 'public';
localStorage.fileNamePatternScreenshot = localStorage.fileNamePatternScreenshot || 'screenshot-{domain}-{date}-{time}';
localStorage.fileNamePatternScreencast = localStorage.fileNamePatternScreencast || 'screencast-{domain}-{date}-{time}';
localStorage.actionEntirePageScrollDelay = localStorage.actionEntirePageScrollDelay || 200;
localStorage.googleUploadFolder = localStorage.googleUploadFolder || '{"id": "root", "title": "Main folder"}';
localStorage.nimbusShare = localStorage.nimbusShare || 'false';
localStorage.showInfoPrint = localStorage.showInfoPrint || 'true';
localStorage.redactorEnableNumbers = localStorage.redactorEnableNumbers || 'false';
localStorage.videoEditorTools = 'cursorRing'; // localStorage.videoEditorTools || 'cursorRing';
localStorage.videoCameraPosition = localStorage.videoCameraPosition || JSON.stringify({"x": 10, "y": 10});
localStorage.watermarkEnable = localStorage.watermarkEnable || 'false';
localStorage.watermarkFile = localStorage.watermarkFile || '';
localStorage.watermarkType = localStorage.watermarkType || 'image';
localStorage.watermarkPosition = localStorage.watermarkPosition || 'rb';
localStorage.watermarkPercent = localStorage.watermarkPercent || 0.5;
localStorage.watermarkAlpha = localStorage.watermarkAlpha || 1;
localStorage.watermarkFont = localStorage.watermarkFont || 'Times New Roman';
localStorage.watermarkSize = localStorage.watermarkSize || 24;
localStorage.watermarkColor = localStorage.watermarkColor || 'rgb(0, 0, 0)';
localStorage.watermarkText = localStorage.watermarkText || 'Watermark';
localStorage.appShowButtonNew = localStorage.appShowButtonNew || 'true';
localStorage.watermarkEnableTime = localStorage.watermarkEnableTime || 'false';
localStorage.watermarkTime = localStorage.watermarkTime || 30;
localStorage.quickVideoStreamMenuEnable = localStorage.quickVideoStreamMenuEnable || 'false';
localStorage.quickVideoStorageLimit = localStorage.quickVideoStorageLimit || 'false';
localStorage.nimbusOrganizationSelect = localStorage.nimbusOrganizationSelect || 'false';
localStorage.nimbusWorkspaceSelect = localStorage.nimbusWorkspaceSelect || 'false';
localStorage.nimbusFolderSelect = localStorage.nimbusFolderSelect || 'default';
localStorage.videoResolution = localStorage.videoResolution || 'hd';
localStorage.appVersion = localStorage.appVersion || version;
localStorage.showPopupRateUs = localStorage.showPopupRateUs || Date.now();

if (localStorage.appVersion !== version && localStorage.appShowButtonNew === 'true') {
    browserAction.setUpdate();

    chrome.browserAction.onClicked.addListener(async function () {
        localStorage.appVersion = version;
        browserAction.setDefault();
        const patch = `releasecapture${language === 'ru' ? 'ru' : ''}.php`;
        await nscCore.tabCreate({
            url: `https://nimbusweb.me/nimbus-stream/${patch}?utm_source=clarity&utm_medium=addon&utm_campaign=release_page`,
            active: true
        })
    });
}
const crypto = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

chrome.runtime.setUninstallURL('https://nimbusweb.me/stream-uninstall/?utm_source=clarity&utm_medium=addon&utm_campaign=unistall_page');

(async function () {
    await nscNimbus.authState();
    await nscNimbus.getInfo();
    await nscNimbus.checkPremium(false);

    let storage = await nscCore.storageGet();

    const default_setting = {};
    default_setting.firstTime = Date.now(); // - (nscExt.trialTime - 60 * 15 * 1000);
    default_setting.firstInstall = true;
    default_setting.isTrial = false;
    default_setting.isTrialPopupShow = true;
    default_setting.nimbusNotePremium = false;
    default_setting.nimbusPremium = false;
    default_setting.nimbusAuthorized = false;
    default_setting.appGlobalId = crypto() + crypto() + crypto() + crypto();

    storage = Object.assign(default_setting, storage);

    if (storage.firstInstall) {
        storage.firstInstall = false;
        storage.isTrial = true;
        if (!window.nimbus_core.is_app) {
            await nscCore.tabCreate({url : 'welcome.html'});
        }
    }

    for (const [key, value] of Object.entries(storage)) {
        localStorage[key] = value;
    }

    await nscCore.storageSet(storage)
})();

let xs, ys, ws, hs,
    scroll_crop = false, download_scroll_crop = false, send_nimbus_scroll_crop = false, send_slack_scroll_crop = false,
    send_google_scroll_crop = false, send_print_scroll_crop = false, send_pdf_scroll_crop = false,
    send_quick_scroll_crop = false, copy_to_clipboard_scroll_crop = false,
    fragment = false, download_fragment = false, send_nimbus_fragment = false, send_slack_fragment = false,
    send_google_fragment = false, send_print_fragment = false, send_pdf_fragment = false, send_quick_fragment = false,
    copy_to_clipboard_fragment = false,
    manifest = chrome.runtime.getManifest();

let screenshot = {
    id: chrome.i18n.getMessage("@@extension_id"),
    path: `filesystem:chrome-extension://${chrome.i18n.getMessage("@@extension_id")}/persistent/`,
    dataUrl: null,
    file: {
        parts: []
    },
    template: {
        panel_video_compact: ''
    },
    button_video: null,
    insertPopup: async function (action) {
        Logger.info(`insertPopup ${action}`)
        await nscCore.executeFiles([
            'css/flex.min.css',
            'css/new-style.min.css',
            'css/icons.min.css',
            'css/popup.min.css',
            'css/fix-style.min.css',
            'js/lib/jquery-3.3.1.js',
            'js/connect-nimbus.js',
            'js/content-popup.js'
        ]);
        await nscCore.checkContentReady();
        await nscCore.sendTabMessage(null, {operation: action});
    },
    mediaAccess: async function (constraints, params, access) {
        console.log('BG: Permission check: constraints', JSON.stringify(constraints), 'access', access, 'params', params);

        if (access) {
            localStorage.isMediaAccess = 'false';
            params && await screenshot.videoRecorder.capture(params || {});
        } else {
            await nscCore.tabActive().then(async (tab) => {
                try {
                    if (localStorage.isMediaAccess === 'true') {
                        await screenshot.insertPopup('nsc_popup_media_access_open');
                    }
                    await nscCore.executeFiles(['js/content-core.js', 'js/content-automation.js']);
                    await nscCore.sendTabMessage(tab, {
                        operation: 'content_automation_media_access',
                        constraints: JSON.stringify(constraints),
                        params: JSON.stringify(params)
                    });
                } catch (e) {
                    console.log('BG: Permission check: error', e);
                }
                localStorage.isMediaAccess = 'true';
            }).catch(function () {
                console.log('BG: Permission check: chrome page, open tabs');
                localStorage.isMediaAccess = 'true';
                chrome.tabs.create({url: 'template/frame-media-access.html?' + JSON.stringify(constraints) + '?'+ JSON.stringify(params)});
            })
        }
    },
    automatic: {
        data: {
            auth: '',
            action: '',
            type: '',
            site: '',
            workspace: {}
        },
        auth: async function () {
            await nscExt.pageInfo(screenshot.automatic.data.type);

            switch (screenshot.automatic.data.auth) {
                case 'nimbus':
                    const is_auth = await nscNimbus.authState();
                    if (is_auth) {
                        await nscNimbus.getInfo();
                        screenshot.automatic.data.workspace = await nscNimbus.getWorkspaces();

                        if (screenshot.automatic.data.action === 'video') {
                            await screenshot.videoRecorder.capture({type: screenshot.automatic.data.type});
                        } else {
                            screenshot.capture.activate.image_type(screenshot.automatic.data.type);
                        }
                    } else {
                        await screenshot.insertPopup('nsc_popup_login_open');
                    }
                    break;
                case 'google':
                    if (!googleShare.story.get.accessToken()) {
                        window.google_oauth.login();
                    } else {
                        if (screenshot.automatic.data.action === 'video') {
                            await screenshot.videoRecorder.capture({type: screenshot.automatic.data.type});
                        } else {
                            screenshot.capture.activate.image_type(screenshot.automatic.data.type);
                        }
                    }
                    break;
                case 'youtube':
                    if (!youtubeShare.getAccessToken()) {
                        window.youtube_oauth.login();
                    } else {
                        if (screenshot.automatic.data.action === 'video') {
                            await screenshot.videoRecorder.capture({type: screenshot.automatic.data.type});
                        }
                    }
                    break;
                default:
                    if (screenshot.automatic.data.action === 'video') {
                        await screenshot.videoRecorder.capture({type: screenshot.automatic.data.type});
                    } else {
                        screenshot.capture.activate.image_type(screenshot.automatic.data.type);
                    }
                    break;
            }
        },
        send: async function (blob) {
            console.log('send', blob, 'screenshot.automatic.data', screenshot.automatic.data);

            if(nimbusShare.server.send.pending) {
                Logger.warning('Double click automatic send')
            }

            if (screenshot.automatic.data.auth === 'nimbus') {
                if (blob.size > screenshot.automatic.data.workspace.org.limits.attachmentSize) {
                    if (screenshot.automatic.data.workspace.org.user.premium && screenshot.automatic.data.workspace.org.user.premium.status === 'active') {
                        await screenshot.insertPopup('nsc_popup_limitorgpremium_open');
                    } else {
                        await screenshot.insertPopup('nsc_popup_limitorgfree_open');
                    }
                    return;
                }

                if (blob.size + screenshot.automatic.data.workspace.org.usage.traffic.current > screenshot.automatic.data.workspace.org.usage.traffic.max) {
                    await screenshot.insertPopup('nsc_popup_limitorglimit_open');
                    return;
                }
            }

            window.nimbus_core.sendMessage({operation: 'content_automation_status_upload'});
            browserAction.setLoading();

            switch (screenshot.automatic.data.auth) {
                case 'quick':
                    switch (screenshot.automatic.data.action) {
                        case 'video':
                            nimbusShare.server.send.quick({
                                data: blob,
                                title: screenshot.getFileName2(false, 'webm')
                            }, function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (!err && res) {
                                    nimbusShare.shortUrl(res.url, function (url) {
                                        nimbus_core.sendMessage({
                                            operation: 'content_automation_send_url',
                                            site: screenshot.automatic.data.site,
                                            url: url
                                        });
                                        screenshot.automatic.data = {
                                            auth: null,
                                            action: null,
                                            type: null,
                                            site: null,
                                            workspace: {}
                                        };
                                    });
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    chrome.tabs.create({url: 'edit.html?video'});
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        workspace: {}
                                    };
                                }
                            });
                            break;
                        case 'image':
                            nimbusShare.server.send.quick({
                                data: blob,
                                title: screenshot.getFileName()
                            }, function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (!err && res) {
                                    nimbusShare.shortUrl(res.url, function (url) {
                                        nimbus_core.sendMessage({
                                            operation: 'content_automation_send_url',
                                            site: screenshot.automatic.data.site,
                                            url: url
                                        });
                                        screenshot.automatic.data = {
                                            auth: null,
                                            action: null,
                                            type: null,
                                            site: null,
                                            workspace: {}
                                        };
                                    });
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    chrome.tabs.create({url: 'edit.html'});
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        workspace: {}
                                    };
                                }
                            });
                    }
                    break;
                case 'nimbus':
                    switch (screenshot.automatic.data.action) {
                        case 'video':
                            nimbusShare.server.send.screencast({
                                data: blob,
                                title: screenshot.getFileName2(false, 'webm'),
                                name: screenshot.getFileName2(true, 'webm'),
                                shared: true
                            }, function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (!err && res) {
                                    nimbusShare.shortUrl(res.body.location, function (url) {
                                        nimbus_core.sendMessage({
                                            operation: 'content_automation_send_url',
                                            site: screenshot.automatic.data.site,
                                            url: url
                                        });
                                        screenshot.automatic.data = {
                                            auth: null,
                                            action: null,
                                            type: null,
                                            site: null,
                                            workspace: {}
                                        };
                                    });
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    chrome.tabs.create({url: 'edit.html?video'});
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        workspace: {}
                                    };
                                }
                            });
                            break;
                        case 'image':
                            nimbusShare.server.send.screenshot({
                                data: blob,
                                title: screenshot.getFileName(),
                                name: screenshot.getFileName(),
                                shared: true
                            }, function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (!err && res) {
                                    nimbusShare.shortUrl(res.body.location, function (url) {
                                        nimbus_core.sendMessage({
                                            operation: 'content_automation_send_url',
                                            site: screenshot.automatic.data.site,
                                            url: url
                                        });
                                        screenshot.automatic.data = {
                                            auth: null,
                                            action: null,
                                            type: null,
                                            site: null,
                                            workspace: {}
                                        };
                                    });
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    chrome.tabs.create({url: 'edit.html'});
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        workspace: {}
                                    };
                                }
                            });
                            break;
                    }
                    break;
                case 'google':
                    switch (screenshot.automatic.data.action) {
                        case 'video':
                            googleShare.save(blob, screenshot.getFileName2(true, 'webm'), function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (err && err.name === 401) {
                                    window.google_oauth.login();
                                } else if (!err && res) {
                                    googleShare.setPublicGdrive(res.id);
                                    nimbus_core.sendMessage({
                                        operation: 'content_automation_send_url',
                                        site: screenshot.automatic.data.site,
                                        url: 'https://drive.google.com/file/d/' + res.id
                                    });
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                    chrome.tabs.create({url: 'edit.html?video'});
                                }
                            });
                            break;
                        case 'image':
                            googleShare.save(blob, screenshot.getFileName('format'), function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (err && err.name === 401) {
                                    window.google_oauth.login();
                                } else if (!err && res) {
                                    googleShare.setPublicGdrive(res.id);
                                    nimbus_core.sendMessage({
                                        operation: 'content_automation_send_url',
                                        site: screenshot.automatic.data.site,
                                        url: 'https://drive.google.com/file/d/' + res.id
                                    });
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                    chrome.tabs.create({url: 'edit.html'});
                                }
                            });
                            break;
                    }
                    break;
                case 'youtube':
                    switch (screenshot.automatic.data.action) {
                        case 'video':
                            youtubeShare.save(blob, screenshot.getFileName2(true, 'webm'), function (err, res) {
                                nimbus_core.sendAllMessage({operation: 'content_automation_status_upload_end'});
                                browserAction.setDefault();
                                if (err && err.name === 401) {
                                    window.youtube_oauth.login();
                                } else if (!err && res) {
                                    nimbus_core.sendMessage({
                                        operation: 'content_automation_send_url',
                                        site: screenshot.automatic.data.site,
                                        url: 'https://youtu.be/' + res.id
                                    });
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                } else if (screenshot.automatic.data.action !== 'abort') {
                                    screenshot.automatic.data = {
                                        auth: null,
                                        action: null,
                                        type: null,
                                        site: null,
                                        premium_note: null,
                                        max_attachment_size_note: null
                                    };
                                    chrome.tabs.create({url: 'edit.html?video'});
                                }
                            });
                            break;
                    }
                    break;
            }
        },
        abort: function () {
            switch (screenshot.automatic.data.auth) {
                case 'nimbus':
                    nimbusShare.server.send.abort();
                    break;
                case 'google':
                    googleShare.abort();
                    break;
                case 'youtube':
                    youtubeShare.abort();
                    break;
                case 'quick':
                    nimbusShare.server.send.abort();
                    break;
            }
        }
    },
    capture: {
        activate: {
            image_type: function (type) {
                switch (type) {
                    case 'capture-visible' :
                        screenshot.capture.visible.init();
                        break;
                    case 'capture-fragment' :
                        screenshot.capture.fragment.init();
                        break;
                    case 'capture-fragment-scroll' :
                        screenshot.capture.fragment_scroll.init();
                        break;
                    case 'capture-selected' :
                        screenshot.capture.selected.init();
                        break;
                    case 'capture-scroll' :
                        screenshot.capture.scroll.init();
                        break;
                    case 'capture-entire' :
                        screenshot.capture.entire.init();
                        break;
                    case 'capture-window' :
                        screenshot.capture.window.init();
                        break;
                    case 'capture-delayed' :
                        screenshot.capture.delayed.init();
                        break;
                    case 'capture-desktopApp' :
                        const loadImage = () => {
                            return new Promise(resolve => {
                                const img = document.createElement('img');
                                img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    canvas.width = img.naturalWidth;
                                    canvas.height = img.naturalHeight;
                                    console.log(canvas.width);

                                    ctx.drawImage(img, 0, 0);
                                    img.remove();

                                    screenshot.file.parts = [];
                                    screenshot.capture.window.parts.push({
                                        x: 0,
                                        y: 0,
                                        w: canvas.width,
                                        h: canvas.height
                                    });
                                    screenshot.file.parts.push(canvas.toDataURL('image/' + localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png', +localStorage.imageQuality / 100));
                                    localStorage.imageFileInfo = JSON.stringify({
                                        w: canvas.width,
                                        h: canvas.height,
                                        z: 1,
                                        parts: screenshot.capture.window.parts
                                    });
                                    screenshot.capture.window.parts = [];
                                    resolve();
                                }
                                img.src = `/bin/screen.${localStorage.imageFormat}?${Math.random()}`;
                            })
                        }
                        loadImage();
                        break;
                    case 'capture-blank' :
                    case 'capture-blank-popup' :
                        screenshot.capture.blank.init(type);
                        break;
                }
            },
            image: function (type) {
                Logger.info('enableEdit', localStorage.enableEdit);
                if (localStorage.enableEdit === 'nimbus' || localStorage.enableEdit === 'google' || localStorage.enableEdit === 'quick') {
                    screenshot.automatic.data.action = 'image';
                    screenshot.automatic.data.auth = localStorage.enableEdit;
                    screenshot.automatic.data.type = type;
                    screenshot.automatic.data.site = undefined;
                    screenshot.automatic.auth();
                } else {
                    screenshot.setPageInfo(function () {
                        screenshot.capture.activate.image_type(type)
                    }, type);
                }
            },
            video: function (type) {
                // if (localStorage.quickVideoCapture === 'true') {
                //     screenshot.automatic.data.action = 'video';
                //     screenshot.automatic.data.auth = localStorage.enableVideoEdit;
                //     screenshot.automatic.data.type = type;
                //     screenshot.automatic.data.site = undefined;
                //     screenshot.automatic.auth();
                // } else {
                screenshot.videoRecorder.capture({type: type});
                // }
            }
        },
        visible: {
            parts: [],
            init: function () {
                screenshot.file.parts = [];

                window.nimbus_core.executeFile(['js/content-clear-capture.js', 'js/content-scrollbar.js'], function () {
                    window.nimbus_core.sendMessage({operation: 'nsc_scrollbar_invisible'}, screenshot.capture.visible.capture);
                });
            },
            capture: function (data) {
                chrome.tabs.captureVisibleTab(JSON.parse(localStorage.pageinfo).windowId, {
                        format: localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png',
                        quality: +localStorage.imageQuality
                    },
                    async function (dataURI) {
                        screenshot.capture.visible.parts.push({x: 0, y: 0, w: data.width, h: data.height});
                        screenshot.file.parts.push(dataURI);
                        localStorage.imageFileInfo = JSON.stringify({
                            w: data.width,
                            h: data.height,
                            z: data.z,
                            parts: screenshot.capture.visible.parts
                        });
                        screenshot.capture.visible.parts = [];
                        window.nimbus_core.sendMessage({operation: 'nsc_scrollbar_visible'});
                        await screenshot.createEditPage();
                    });
            },
            finish: function () {
            }
        },
        selected: {
            parts: [],
            init: function () {
                screenshot.file.parts = [];
                chrome.tabs.captureVisibleTab(JSON.parse(localStorage.pageinfo).windowId, {
                        format: localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png',
                        quality: +localStorage.imageQuality
                    },
                    function (dataUrl) {
                        screenshot.file.parts.push(dataUrl);
                        window.nimbus_core.executeFile([
                            'css/fragment.min.css',
                            'css/cropper.min.css',
                            'css/crop.min.css',
                            'js/lib/jquery-3.3.1.js',
                            'js/content-core.js',
                            'js/lib/cropper.js',
                            'js/content-crop.js'
                        ], function () {
                            window.nimbus_core.sendMessage({
                                operation: 'crop_data_screen',
                                format: localStorage.imageFormat,
                                quality: localStorage.imageQuality,
                                dataUrl: dataUrl,
                                appType: localStorage.appType
                            });
                        });
                    });
            },
            capture: function (cb) {
                let data = JSON.parse(localStorage.cropPosition);
                let z = window.devicePixelRatio;
                screenshot.capture.selected.parts.push({x: data.x, y: data.y, w: data.width, h: data.height});

                localStorage.imageFileInfo = JSON.stringify({
                    w: data.width,
                    h: data.height,
                    z: 1,
                    parts: screenshot.capture.selected.parts
                });
                screenshot.capture.selected.parts = [];
                cb ? cb() : screenshot.createEditPage();
            },
            finish: function (cb) {
            }
        },
        entire: {
            parts: [],
            parts_load: 0,
            status: false,
            init: function () {
                screenshot.capture.entire.parts_load = 0;
                screenshot.file.parts = [];

                window.nimbus_core.executeFile([
                    'js/content-core.js',
                    'js/content-clear-capture.js',
                    'var actionEntirePageScrollDelay = ' + (localStorage.actionEntirePageScrollDelay) + ';',
                    'var isDebug = ' + (localStorage.isDebug === 'true') + ';',
                    'js/content-page.js'
                ], function () {
                    if (scroll_crop === true) {
                        scroll_crop = false;
                        let data = JSON.parse(localStorage.cropScrollPosition);
                        console.log('cropScrollPosition', localStorage.cropScrollPosition);
                        window.nimbus_core.sendMessage({
                            operation: 'content_scroll_page',
                            'scroll_crop': true,
                            'fragment': false,
                            'hide_fixed_elements': (localStorage.actionHideFixedElements === 'true'),
                            'x': data.x,
                            'y': data.y,
                            'width': data.width,
                            'height': data.height
                        });
                    } else if (fragment) {
                        fragment = false;
                        let data = JSON.parse(localStorage.fragmentPosition);
                        console.log('fragmentPosition', localStorage.fragmentPosition);
                        window.nimbus_core.sendMessage({
                            operation: 'content_scroll_page',
                            'scroll_crop': false,
                            'fragment': true,
                            'hide_fixed_elements': (localStorage.actionHideFixedElements === 'true'),
                            'x': data.x,
                            'y': data.y,
                            'width': data.width,
                            'height': data.height
                        });
                    } else {
                        window.nimbus_core.sendMessage({
                            operation: 'content_scroll_page',
                            'scroll_crop': false,
                            'fragment': false,
                            'hide_fixed_elements': (localStorage.actionHideFixedElements === 'true')
                        })
                    }
                });
            },
            capture: function (data, cb) {
                chrome.tabs.captureVisibleTab(JSON.parse(localStorage.pageinfo).windowId, {
                        format: localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png',
                        quality: +localStorage.imageQuality
                    },
                    function (dataURI) {
                        cb && cb();

                        let x = 0;
                        let y = Math.floor((data.windowHeight - data.h) * data.z);
                        let w = Math.floor(data.w * data.z);
                        let h = Math.floor(data.h * data.z);
                        let x2 = Math.floor(data.x * data.z);
                        let y2 = Math.floor(data.y * data.z);
                        let w2 = w;
                        let h2 = h;

                        if (data.scroll_crop || data.fragment) {
                            x = Math.ceil(data.x * data.z);
                            y = Math.ceil(data.y_shift * data.z);
                            x2 = 0;
                            y2 = Math.ceil(data.y_crop * data.z);
                        }

                        screenshot.capture.entire.parts.push({x: x, y: y, w: w, h: h, x2: x2, y2: y2, w2: w2, h2});
                        screenshot.file.parts.push(dataURI);

                        if (++screenshot.capture.entire.parts_load === data.count_parts) {
                            let maxSize = 32767;
                            let maxArea = 268435456;
                            let width = Math.ceil(Math.min(data.totalWidth * data.z, maxSize));
                            let height = Math.ceil(Math.min(data.totalHeight * data.z, maxSize));

                            if (width * height > maxArea) height = Math.floor(maxArea / width);

                            localStorage.imageFileInfo = JSON.stringify({
                                w: width,
                                h: height,
                                z: 1,
                                parts: screenshot.capture.entire.parts
                            });
                            console.log('imageFileInfo', localStorage.imageFileInfo);
                            screenshot.capture.entire.parts = [];
                            screenshot.capture.entire.parts_load = 0;
                            screenshot.capture.entire.finish(cb);
                        }
                    });
            },
            captureNew: function (data, cb) {
                chrome.tabs.captureVisibleTab(JSON.parse(localStorage.pageinfo).windowId, {
                        format: localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png',
                        quality: +localStorage.imageQuality
                    },
                    function (dataURI) {
                        screenshot.capture.entire.parts.push({
                            x: data.x,
                            y: data.y,
                            w: data.w,
                            h: data.h,
                            x2: data.x2,
                            y2: data.y2,
                            w2: data.w,
                            h2: data.h
                        });
                        screenshot.file.parts.push(dataURI);
                        screenshot.capture.entire.status = (data.status !== 'finish' && data.status !== 'cancel');
                        if (data.status === 'finish' || data.status === 'cancel') {

                            let maxSize = 32767;
                            let maxArea = 268435456;
                            let width = Math.min(data.pageWidth, maxSize);
                            let height = Math.min(data.pageHeight, maxSize);

                            if (width * height > maxArea) height = Math.floor(maxArea / width);

                            localStorage.imageFileInfo = JSON.stringify({
                                w: width,
                                h: height,
                                z: 1,
                                parts: screenshot.capture.entire.parts
                            });
                            console.log('imageFileInfo', localStorage.imageFileInfo);
                            screenshot.capture.entire.parts = [];
                            screenshot.capture.entire.parts_load = 0;
                            if (data.status === 'finish') screenshot.capture.entire.finish();
                        }

                        cb && cb();
                    });
            },
            finish: async function () {
                if (download_scroll_crop || download_fragment) {
                    download_scroll_crop = false;
                    download_fragment = false;
                    screenshot.download();
                } else if (send_nimbus_scroll_crop || send_nimbus_fragment) {
                    send_nimbus_scroll_crop = false;
                    send_nimbus_fragment = false;
                    await screenshot.createEditPage('nimbus');
                } else if (send_slack_scroll_crop || send_slack_fragment) {
                    send_slack_scroll_crop = false;
                    send_slack_fragment = false;
                    await screenshot.createEditPage('slack');
                } else if (send_google_scroll_crop || send_google_fragment) {
                    send_google_scroll_crop = false;
                    send_google_fragment = false;
                    await screenshot.createEditPage('google');
                } else if (send_print_scroll_crop || send_print_fragment) {
                    send_print_scroll_crop = false;
                    send_print_fragment = false;
                    await screenshot.createEditPage('print');
                } else if (send_pdf_scroll_crop || send_pdf_fragment) {
                    send_pdf_scroll_crop = false;
                    send_pdf_fragment = false;
                    await screenshot.createEditPage('pdf');
                } else if (send_quick_scroll_crop || send_quick_fragment) {
                    send_quick_scroll_crop = false;
                    send_quick_fragment = false;
                    await screenshot.createEditPage('quick');
                } else if (copy_to_clipboard_scroll_crop || copy_to_clipboard_fragment) {
                    copy_to_clipboard_scroll_crop = false;
                    copy_to_clipboard_fragment = false;
                    await screenshot.copyToClipboard();
                } else {
                    await screenshot.createEditPage();
                }
            }
        },
        scroll: {
            init: function () {
                window.nimbus_core.executeFile(['css/fragment.min.css', 'css/cropper.min.css', 'css/crop.min.css', 'js/content-core.js', 'js/content-clear-capture.js', 'js/lib/jquery-3.3.1.js', 'js/lib/cropper.js', 'js/content-scroll-crop.js'], function () {
                    window.nimbus_core.sendMessage({
                        operation: 'scroll_crop_data_screen',
                        appType: localStorage.appType
                    });
                });
            },
        },
        fragment: {
            init: function () {
                window.nimbus_core.executeFile(['css/fragment.min.css', 'css/crop.min.css', 'js/lib/jquery-3.3.1.js', 'js/content-core.js', 'js/content-fragment.js'], function () {
                    window.nimbus_core.sendMessage({
                        operation: 'content_capture_fragment_init',
                        appType: localStorage.appType
                    });
                });
            },
        },
        fragment_scroll: {
            init: function () {
                window.nimbus_core.executeFile(['css/fragment.min.css', 'css/crop.min.css', 'js/lib/jquery-3.3.1.js', 'js/content-core.js', 'js/content-fragment-scroll.js'], function () {
                    window.nimbus_core.sendMessage({
                        operation: 'content_capture_scroll_fragment_init',
                        appType: localStorage.appType
                    });
                });
            },
        },
        delayed: {
            init: async function () {
                try {
                    const tab = await nscCore.executeFiles([
                        'js/lib/jquery-3.3.1.js',
                        'js/lib/progressbar.js',
                        'js/content-timer.js',
                        'css/timer.min.css'
                    ]);

                    await window.nimbus_core.setTimerContent(tab, localStorage.delayedScreenshotTime || 3);
                    await window.nimbus_core.setActiveTab(tab);
                    screenshot.capture.visible.init();
                } catch (e) {
                    console.error(e)
                }
            },
        },
        window: {
            parts: [],
            init: function (cb) {
                screenshot.file.parts = [];
                chrome.desktopCapture.chooseDesktopMedia(["tab", 'screen', 'window'], function (streamId) {
                    screenshot.capture.window.capture(streamId, cb)
                })
            },
            capture: async function (streamId, cb) {
                await nscVideo.getUserMedia({
                    audio: false,
                    video: {mandatory: {chromeMediaSource: "desktop", chromeMediaSourceId: streamId}}
                }).then(function (stream) {
                    let video = document.createElement('video');
                    video.onloadedmetadata = function () {
                        let canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        ctx.drawImage(video, 0, 0);
                        stream.getTracks()[0].stop();
                        video.remove();

                        screenshot.capture.window.parts.push({x: 0, y: 0, w: canvas.width, h: canvas.height});
                        screenshot.file.parts.push(canvas.toDataURL('image/' + localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png', +localStorage.imageQuality / 100));
                        localStorage.imageFileInfo = JSON.stringify({
                            w: canvas.width,
                            h: canvas.height,
                            z: 1,
                            parts: screenshot.capture.window.parts
                        });
                        screenshot.capture.window.parts = [];
                        screenshot.capture.window.finish(cb);

                        if (cb) {
                            chrome.tabs.create({url: 'nimbus_screnshot_active_tab'});
                            cb()
                        } else {
                            screenshot.createEditPage();
                        }
                    };
                    try {
                        video.srcObject = stream;
                    } catch (error) {
                        video.src = window.URL.createObjectURL(stream);
                    }
                    video.play();
                }).catch(console.error);
            },
            finish: function (cb) {
            },
        },
        blank: {
            canvas: null,
            popup: false,
            ctx: null,
            parts: [],
            init: function (type) {
                screenshot.file.parts = [];
                localStorage.removeItem('imageFileInfo');
                screenshot.capture.blank.popup = (type === 'capture-blank-popup');
                screenshot.capture.blank.capture()
            },
            capture: function () {
                screenshot.capture.blank.canvas = document.createElement('canvas');
                screenshot.capture.blank.ctx = screenshot.capture.blank.canvas.getContext('2d');
                screenshot.capture.blank.canvas.width = screenshot.capture.blank.popup ? 1150 : screen.width - 40;
                screenshot.capture.blank.canvas.height = screenshot.capture.blank.popup ? 500 : screen.height - 100;

                screenshot.capture.blank.ctx.fillStyle = "#FFF";
                screenshot.capture.blank.ctx.fillRect(0, 0, screenshot.capture.blank.canvas.width, screenshot.capture.blank.canvas.height);

                screenshot.capture.blank.parts.push({
                    x: 0,
                    y: 0,
                    w: screenshot.capture.blank.canvas.width,
                    h: screenshot.capture.blank.canvas.height
                });
                screenshot.file.parts.push(screenshot.capture.blank.canvas.toDataURL());
                screenshot.capture.blank.finish();
            },
            finish: function () {
                localStorage.imageFileInfo = JSON.stringify({
                    w: screenshot.capture.blank.canvas.width,
                    h: screenshot.capture.blank.canvas.height,
                    z: 1,
                    parts: screenshot.capture.blank.parts
                });

                screenshot.capture.blank.canvas = null;
                screenshot.capture.blank.ctx = null;
                screenshot.capture.blank.parts = [];

                if (!window.nimbus_core.is_app) {
                    screenshot.createEditPage(screenshot.capture.blank.popup ? 'popup' : 'blank');
                }
            }
        }
    },
    createMenu: function () {
        chrome.contextMenus.removeAll();
        if (localStorage.appContentMenuShow !== 'false') {
            const button_root = chrome.contextMenus.create({
                "title": chrome.i18n.getMessage("appNameMini"),
                "contexts": ["all"]
            });

            screenshot.button_video = chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnCaptureVideo"),
                contexts: ["all"],
                parentId: button_root,
                onclick: screenshot.capture.activate.video.bind(screenshot, 'tab')
            });

            chrome.contextMenus.create({
                title: "separator",
                type: "separator",
                contexts: ["all"],
                parentId: button_root
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("tooltipOptions"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    chrome.tabs.create({url: 'options.html'});
                }
            });
        }
    },
    changeVideoButton: function () {
        if (localStorage.appContentMenuShow === 'true') {
            if (screenshot.videoRecorder.getStatus()) {
                chrome.contextMenus.update(screenshot.button_video, {
                    title: chrome.i18n.getMessage("optionsLabelStopVideo"),
                    onclick: videoRecorder.stopRecord
                })
            } else {
                chrome.contextMenus.update(screenshot.button_video, {
                    title: chrome.i18n.getMessage("btnCaptureVideo"),
                    onclick: function () {
                        videoRecorder.capture({
                            type: 'tab',
                            countdown: localStorage.videoCountdown
                        });
                    }
                })
            }
        }
    },
    openPage: function (url) {
        chrome.tabs.create({url: url});
    },
    setPageInfo: function (cb, type) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            let info = {
                id: tabs[0].id,
                windowId: tabs[0].windowId,
                url: tabs[0].url,
                title: tabs[0].title,
                time: nscExt.getTimeStamp()
            };
            if (type === 'desktop' || type === 'capture-window') {
                info.title = 'nimbus-capture';
                info.url = 'http://nimbus-capture';
            }

            localStorage.pageinfo = JSON.stringify(info);
            cb && cb(info);
        });
    },
    createEditPage: async function (params) {
        console.log('createEditPage', params)
        if (params !== 'video' && params !== 'blank' && (localStorage.enableEdit === 'nimbus' || localStorage.enableEdit === 'google' || localStorage.enableEdit === 'quick')) {
            const info = JSON.parse(localStorage.imageFileInfo);
            window.nimbus_core.createCanvasParts(info, screenshot.file.parts, function (canvas, blob) {
                screenshot.setWaterMark(canvas, blob, function (finish_canvas, finish_blob) {
                    screenshot.automatic.send(finish_blob)
                })
            });
        } else {
            params = params || localStorage.enableEdit;
            switch (params) {
                case 'copy':
                    await screenshot.copyToClipboard();
                    break;
                case 'save':
                    screenshot.download();
                    break;
                case 'popup':
                    await videoRecorder.createPopupRedactor();
                    break;
                default:
                    chrome.tabs.create({url: 'edit.html' + ((params === 'edit' || !params) ? '' : '?' + params)});
                    break;
            }
        }
    },
    init: function () {
        if (window.nimbus_core.is_chrome) screenshot.videoRecorder = videoRecorder;
        screenshot.createMenu();
    },
    setWaterMark: async function (canvas, blob, cb) {
        try {
            await nscExt.checkWaterMark();
            const premium = await nscNimbus.checkPremium(false);
            if (!premium) return cb && cb(canvas, blob);
            const watermark = await nscExt.getWaterMark();
            const position = nscExt.getWaterMarkPosition(watermark, canvas);

            canvas.getContext('2d').drawImage(watermark, position.x, position.y, watermark.width, watermark.height);
            canvas.toBlob(function (blob) {
                cb && cb(canvas, blob)
            }, 'image/' + (localStorage.imageFormat === 'jpg' ? 'jpeg' : 'png'));
        } catch (e) {
            cb && cb(canvas, blob);
        }
    },
    copyToClipboard: async function () {
        console.log('copyToClipboard');
        let imageinfo = JSON.parse(localStorage.imageFileInfo);

        if (window.nimbus_core.is_firefox) {
            window.nimbus_core.createCanvasParts(imageinfo, screenshot.file.parts, function (canvas, blob) {
                screenshot.setWaterMark(canvas, blob, function (finish_canvas, finish_blob) {
                    window.nimbus_core.dataUrlToArrayBuffer(window.URL.createObjectURL(finish_blob), function (buffer) {
                        chrome.clipboard.setImageData(buffer, (localStorage.format === 'jpg' ? 'jpeg' : 'png'));

                        chrome.notifications.create(null, {
                                type: 'basic',
                                iconUrl: 'images/icons/48x48.png',
                                title: chrome.i18n.getMessage("appName"),
                                message: chrome.i18n.getMessage("notificationCopy")
                            },
                            function (notificationId) {
                                window.setTimeout(function (id) {
                                    chrome.notifications.clear(id);

                                    screenshot.file.parts = [];
                                    localStorage.removeItem('imageFileInfo');
                                }.bind(this, notificationId), 3000);
                            });
                    });
                });
            });
        } else {
            let pageinfo = JSON.parse(localStorage.pageinfo);
            await window.nimbus_core.setActiveTab(pageinfo.id);

            window.setTimeout(function () {
                window.nimbus_core.sendMessage({
                    operation: 'copy_to_clipboard',
                    info: imageinfo,
                    parts: screenshot.file.parts
                });

                screenshot.file.parts = [];
                localStorage.removeItem('imageFileInfo');
            }, 200);
        }
    },
    download: function () {
        let info = JSON.parse(localStorage.imageFileInfo);
        window.nimbus_core.createCanvasParts(info, screenshot.file.parts, function (canvas, blob) {
            screenshot.setWaterMark(canvas, blob, function (finish_canvas, finish_blob) {
                screenshot.file.parts = [];
                localStorage.removeItem('imageFileInfo');
                chrome.downloads.download({
                    url: window.URL.createObjectURL(finish_blob),
                    filename: screenshot.getFileName(),
                    saveAs: localStorage.enableSaveAs !== 'false'
                })
            });
        });
    },
    getFileName: function () {
        let s = localStorage.fileNamePatternScreenshot;
        let f = localStorage.imageFormat;
        let info = JSON.parse(localStorage.pageinfo);
        let url = document.createElement('a');
        url.href = info.url || '';
        s = s.replace(/\{url}/, info.url || '')
            .replace(/\{title}/, info.title || '')
            .replace(/\{domain}/, url.host || '')
            .replace(/\{date}/, info.time.split(' ')[0] || '')
            .replace(/\{time}/, info.time.split(' ')[1] || '')
            .replace(/\{ms}/, info.time.split(' ')[2] || '')
            .replace(/\{timestamp}/, info.time.split(' ')[3] || '');

        return s.replace(/[\*\|\\\:\"\<\>\?\/#]+/ig, '_') + ('.' + f);
    },
    getFileName2: function (is_format, format) {
        let is_video = (format === 'webm' || format === 'mp4' || format === 'gif');
        let s = is_video ? localStorage.fileNamePatternScreencast : localStorage.fileNamePatternScreenshot;
        let info = JSON.parse(localStorage.pageinfo);
        let url = document.createElement('a');
        url.href = info.url || '';
        s = s.replace(/\{url}/, info.url || '')
            .replace(/\{title}/, info.title || '')
            .replace(/\{domain}/, url.host || '')
            .replace(/\{date}/, info.time.split(' ')[0] || '')
            .replace(/\{time}/, info.time.split(' ')[1] || '')
            .replace(/\{ms}/, info.time.split(' ')[2] || '')
            .replace(/\{timestamp}/, info.time.split(' ')[3] || '');

        return s.replace(/[\*\|\\\:\"\<\>\?\/#]+/ig, '_') + (is_format ? '.' + format : '');
    },
};

window.onload = screenshot.init;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // console.log('request', JSON.stringify(request));

        switch (request.operation) {
            // case 'nsc_create_video_complete_is':
            //     (async function () {
            //         await videoRecorder.isCreateVideoComplete()
            //     })()
            //     break;
            case 'ever_helper_message':
                if (request.data.action === "event:login") {
                    localStorage.nimbusSessionId = request.data.sessionId;
                    (async function () {
                        await nscCore.setTimeout(2000);
                        await nscCore.sendAllTabMessage({operation: 'access_nimbus'})
                    })()
                }
                break;
            case 'update_menu':
                screenshot.createMenu();
                break;
            case 'set_video_panel':
                localStorage.videoDrawingToolsEnable = request.value;
                break;
            case 'set_option':
                localStorage[request.key] = request.value;
                break;
            case 'get_option':
                sendResponse(localStorage[request.key]);
                break;
            case 'get_local_storage':
                sendResponse({localStorage: localStorage});
                break;
            case 'get_file_parts':
                sendResponse({parts: screenshot.file.parts});
                break;
            case 'get_extension_data':
                sendResponse({
                    recordState: is_chrome ? screenshot.videoRecorder.getState() : false,
                    recordStatus: is_chrome ? screenshot.videoRecorder.getStatus() : false,
                    recordTime: is_chrome ? screenshot.videoRecorder.getTimeRecord() : 0,
                    streamLoading: nscStream.loading,
                    entireStatus: screenshot.capture.entire.status
                });
                break;
            case 'get_info_record':
                sendResponse({
                    state: screenshot.videoRecorder.getState(),
                    status: screenshot.videoRecorder.getStatus(),
                    time: screenshot.videoRecorder.getTimeRecord(),
                    streamLoading: nscStream.loading
                });
                break;
            case 'get_quick_capture':
                sendResponse({
                    enable_edit: localStorage.enableEdit,
                    enable_video_edit: localStorage.enableVideoEdit,
                    quick_capture: localStorage.quickCapture,
                    quick_capture_type: localStorage.quickCaptureType,
                    quick_video_capture: localStorage.quickVideoCapture,
                    quick_video_capture_type: localStorage.quickVideoCaptureType,
                    entire_status: screenshot.capture.entire.status
                });
                break;
            case 'get_automation_setting':
                sendResponse({
                    quick_capture_github: localStorage.quickVideoCaptureGithub,
                    quick_capture_github_welcome: localStorage.quickVideoCaptureGithubWelcome
                });
                break;
            case 'get_capture_desktop':
                screenshot.capture.window.init(sendResponse);
                return true;
            // case 'get_is_media_access':
            //     (async function () {
            //         try {
            //             (await nscVideo.getUserMedia({video: true, audio: true})).stop();
            //             sendResponse(true);
            //         } catch (e) {
            //             sendResponse(false);
            //         }
            //     })()
            //     break;
            case 'open_page':
                screenshot.openPage(request.url);
                break;
            case 'content_camera_toggle':
                (async function () {
                    await nscCore.sendAllTabMessage({operation: 'content_camera_toggle_tab'})
                })()
                break;
            case 'content_panel_toggle':
                (async function () {
                    await nscCore.sendAllTabMessage({operation: 'content_panel_toggle_tab'})
                })()
                break;
            case 'update_context_menu':
                screenshot.createMenu();
                break;

            case 'activate_record':
                (async function () {
                    switch (request.key) {
                        case 'start' :
                            await screenshot.videoRecorder.capture(JSON.parse(request.params || '{}'));
                            break;
                        case 'pause' :
                            await screenshot.videoRecorder.pauseRecord();
                            break;
                        case 'stop' :
                            await screenshot.videoRecorder.stopRecord();
                            break;
                    }
                })()
                break;
            case 'status_video_change':
                switch (request.status) {
                    case 'play' :
                        screenshot.videoRecorder.pauseRecord();
                        break;
                    case 'pause' :
                        screenshot.videoRecorder.pauseRecord();
                        break;
                    case 'stop' :
                        screenshot.videoRecorder.stopRecord();
                        break;
                }
                break;
            case 'check_tab_action':
                switch (request.action) {
                    case 'insert_page' :
                        (async function () {
                            await nscCore.executeScript('js/content-check-action.js').catch(async () => {
                                const action = {
                                    chrome: true,
                                    url: false
                                };
                                await nscCore.sendMessage({
                                    'operation': 'check_tab_action',
                                    'action': 'back_is_page',
                                    'value': action
                                })
                            })
                        })()
                        break;
                }
                break;
            case 'content_media_access':
                (async function () {
                    await screenshot.mediaAccess({
                        audio: localStorage.videoMicSoundEnable === 'true',
                        video: localStorage.videoCameraEnable === 'true',
                        media_access: true
                    }, false, request.access);
                })()
                break;
            case 'content_automation':
                screenshot.automatic.data.action = request.action;
                if (request.action === 'abort') {
                    screenshot.automatic.abort();
                }
                break;
            case 'content_popup':
                screenshot.insertPopup(request.action);
                break;
            case 'content_popup_request':
                console.log(request);
                (async function () {
                    switch (request.action) {
                        case 'auth':
                            nimbusShare.server.user.auth(request.email, request.password, sendResponse);
                            break;
                        case 'challenge':
                            nimbusShare.server.user.challenge(request.state, request.code, sendResponse);
                            break;
                        case 'register':
                            nimbusShare.server.user.register(request.email, request.password, sendResponse);
                            break;
                        case 'remind':
                            nimbusShare.server.user.remindPassword(request.email, sendResponse);
                            break;
                        case 'info':
                            const info = await nscNimbus.getInfo();
                            sendResponse(info);
                    }
                })()
                return true;
            case 'content_message':
                window.nimbus_core.sendMessage(request.message);
                break
        }
    }
);

if (window.nimbus_core.is_chrome) {
    chrome.commands.onCommand.addListener(function (command) {
        switch (command) {
            case 'start_tab_video':
                screenshot.videoRecorder.capture({type: 'tab'});
                break;
            case 'start_desktop_video':
                screenshot.videoRecorder.capture({type: 'desktop'});
                break;
            case 'stop_video':
                screenshot.videoRecorder.stopRecord();
                break;
            case 'pause_video':
                screenshot.videoRecorder.pauseRecord();
                break;
        }
    });
}

chrome.tabs.onUpdated.addListener(async function (tabId, info, tab) {
    if (info.status === "complete") {

        try {
            if (/###EVERFAUTH:/.test(tab.title)) {
                await nscCore.tabRemove(tabId)
                await nscCore.setTimeout(200);
                await nscCore.sendAllTabMessage({operation: 'access_nimbus'})
            } else if (/nimbusweb.me\/auth\/t\/s.html\?capture-login-success=1/.test(tab.url)) {
                await nscCore.tabRemove(tabId)
            } else {
                await nscCore.executeFiles([
                    'js/content-core.js',
                    'js/content-automation.js',
                ]);
            }

            await screenshot.videoRecorder.tabsUpdated(tab);
        } catch (e) {

        }
    }
});

chrome.tabs.onActivated.addListener(async function (info) {
    await nscCore.setTimeout(200)
    const tab = await nscCore.tabGet(info.tabId)

    if(tab) {
        await screenshot.videoRecorder.tabsActivated(tab);
        if (tab.url.search(screenshot.id) !== -1) {
            nimbus_core.sendAllMessage({operation: 'page_extension_activated'});
        }
    }
});

chrome.tabs.onRemoved.addListener(async function (tabId, info) {
    await screenshot.videoRecorder.tabsRemoved({id: tabId});
});
