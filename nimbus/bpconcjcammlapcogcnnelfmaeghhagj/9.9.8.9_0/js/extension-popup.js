let t = null;
let actions;

/** @const url_share url nimbus web share page.
 */
const url_share = 'https://s.nimbusweb.me/share/';

const openPage = async (page, not_share) => {
    await nscCore.sendMessage({operation: 'open_page', 'url': `${!not_share ? url_share : ''}${page}`});
}

function setOption(key, value) {
    if (is_chrome) return;
    chrome.runtime.sendMessage({operation: 'set_option', key: key, value: value});
}

async function checkRecord() {
    const {
        recordStatus,
        recordState,
        recordTime,
        streamLoading
    } = await nscCore.sendMessage({operation: 'get_extension_data'});

    if (recordStatus) {
        const textState = chrome.i18n.getMessage(recordState === 'recording' ? "popupBtnStopPause" : "popupBtnStopResume");
        $('button[name=record-pause] .nsc-button-layout').text(textState);

        showTime(recordTime);
        showRecordStatus();
    } else if (streamLoading) {
        window.close();
    } else {
        showRecordOptions();
        clearTimeout(t)
    }
    t = setTimeout(checkRecord, 500);
}

async function getUserMedia() {
    if (localStorage.videoRecordType === 'desktop') return;

    let constraints = {
        audio: localStorage.videoMicSoundEnable !== 'false',
        video: localStorage.videoCameraEnable !== 'false'
    };
    if (!constraints.video && !constraints.audio) $('.nsc-capture-button-media-access').addClass('nsc-hide');
    else await nscVideo.getUserMedia(constraints).catch(function () {
        $('.nsc-capture-button-media-access').removeClass('nsc-hide').find('span span')
            .text(`Allow ${constraints.video ? 'Webcam' : ''} ${constraints.video && constraints.audio ? '&' : ''} ${constraints.audio ? 'Audio' : ''} Permissions`);
    })
}

function showRecordOptions() {
    $('#capture_options').addClass('nsc-hide');
    $('#record_options').removeClass('nsc-hide');
    $('#record_status').addClass('nsc-hide');
    $('#record_setting').addClass('nsc-hide');
    $('#workspaces_setting').addClass('nsc-hide');
    $('#progress_capture_option').addClass('nsc-hide');

    $('input[name=record-type][value=' + localStorage.videoRecordType + ']').trigger('change');
}

function showRecordSetting() {
    $('#capture_options').addClass('nsc-hide');
    $('#record_options').addClass('nsc-hide');
    $('#record_status').addClass('nsc-hide');
    $('#record_setting').removeClass('nsc-hide');
    $('#workspaces_setting').addClass('nsc-hide');
    $('#progress_capture_option').addClass('nsc-hide');
}

function showSelectWorkspace() {
    $('#capture_options').addClass('nsc-hide');
    $('#record_options').addClass('nsc-hide');
    $('#record_status').addClass('nsc-hide');
    $('#record_setting').addClass('nsc-hide');
    $('#workspaces_setting').removeClass('nsc-hide');
    $('#progress_capture_option').addClass('nsc-hide');

    $('body').removeClass('resize');
}

function showRecordStatus() {
    $('#capture_options').addClass('nsc-hide');
    $('#record_options').addClass('nsc-hide');
    $('#record_status').removeClass('nsc-hide');
    $('#record_setting').addClass('nsc-hide');
    $('#workspaces_setting').addClass('nsc-hide');
    $('#progress_capture_option').addClass('nsc-hide');
}

function showTime(date) {
    let time = new Date(date),
        m = time.getUTCMonth(),
        d = time.getUTCDate() - 1,
        h = time.getUTCHours(),
        M = time.getUTCMinutes(),
        s = time.getUTCSeconds(),
        time_str = '';
    if (m > 0) time_str += ('0' + m).slice(-2) + ':';
    if (d > 0) time_str += ('0' + d).slice(-2) + ':';
    if (h > 0) time_str += ('0' + h).slice(-2) + ':';
    time_str += ('0' + M).slice(-2) + ':';
    time_str += ('0' + s).slice(-2);

    $('#record_time').text(time_str);
}

function setDevices(devices) {
    const $camera = $('select[name=selected-video-camera]');
    const $microphone = $('select[name=selected-microphone]');
    let mic_is = false, cam_is = false;

    for (let i = 0; i !== devices.length; ++i) {
        const device = devices[i];
        const $option = $('<option>').val(device.deviceId);
        if (device.kind === 'audioinput') {
            if (localStorage.selectedMicrophone === device.deviceId) {
                $option.attr('selected', 'selected');
                mic_is = true;
            }
            $microphone.append($option.text(device.label || 'Microphone'));
        } else if (device.kind === 'videoinput') {
            if (localStorage.selectedVideoCamera === device.deviceId) {
                $option.attr('selected', 'selected');
                cam_is = true;
            }
            $camera.append($option.text(device.label || 'Camera'));
        }
    }

    if (!mic_is) localStorage.removeItem('selectedMicrophone');
    if (!cam_is) localStorage.removeItem('selectedVideoCamera');
}

$(async function () {
    nscNimbus.getInfo();

    if (language === 'ru') {
        $('.is-ru-hide').addClass('nsc-hide');
        $('.is-ru-show').removeClass('nsc-hide');
    } else {
        $('.is-ru-hide').removeClass('nsc-hide');
        $('.is-ru-show').addClass('nsc-hide');
    }

    const countFinishVideo = nscExt.getOption('countFinishVideo', 0);
    const countCancelRateUs = nscExt.getOption('countCancelRateUs', 0);
    const showIsRateUs = nscExt.getOption('showIsRateUs', true);
    const showIconIsRateUs = nscExt.getOption('showIconIsRateUs', true);

    if (!((countFinishVideo - 2) % 5) && showIsRateUs) {
        $('#nsc_popup_rate_us').removeClass('nsc-hide');
    } else if (((countFinishVideo - 2) % 5) && countCancelRateUs <= 2 && !showIsRateUs) {
        nscExt.setOption('showIsRateUs', true);
    }

    $("#nsc_popup_rate_us a").on('click', async function () {
        nscExt.setOption('showIsRateUs', false);
    })

    $('#nsc_popup_rate_us_star').on('mousemove', (e) => {
        if ($(e.target).hasClass('material-icons')) {
            const rate = $(e.target).data('rate');
            $(e.currentTarget).find('.material-icons').removeClass('active').each((index, element) => {
                if ($(element).data('rate') <= rate) {
                    $(element).addClass('active')
                }
            })
        }
    }).find('.material-icons').on('click', (e) => {
        const rate = $(e.target).data('rate');

        if (rate >= 4) {
            nscExt.setOption('showIsRateUs', false);

            if (is_edge) {
                openPage('https://microsoftedge.microsoft.com/addons/detail/nimbus-clarity-video-an/ialkhchcaibnpcilchfohbdhjhiofdmg', true)
            } else {
                openPage('https://chrome.google.com/webstore/detail/enhjjhkhjenjnanplmdkahkbkoeeljjp/reviews', true)
            }
        } else {
            nscExt.setOption('showIsRateUs', false);
            nscExt.setOption('countCancelRateUs', countCancelRateUs + 1);
            openPage('https://support.nimbusweb.co/portal/en/newticket', true)
        }
    })

    if (!showIsRateUs || !showIconIsRateUs) {
        $('#nsc_button_icon_open_rate_us').addClass('nsc-hide');
    }

    $('#nsc_button_icon_open_rate_us').on('click', async function () {
        nscExt.setOption('showIconIsRateUs', false);
    })

    $("button").on('click', async function () {
        switch (this.name) {
            case 'logout':
                await nscNimbus.logout();
                break;
            case 'open-option':
                await openPage('options.html', true);
                break;
            case 'open-rate-us':
                await openPage('https://chrome.google.com/webstore/detail/enhjjhkhjenjnanplmdkahkbkoeeljjp/reviews', true);
                break;
            case 'open-nimbus-premium':
                await openPage('https://nimbusweb.me/capture-pro?utm_source=capture&utm_medium=addon&utm_campaign=main_menu_upgrade', true);
                break;
            case 'open-sing-up':
                await openPage(`https://nimbusweb.me/auth/?f=register&b=capture&hpts=1&success=/auth/t/s.html?capture-login-success=1&sr=${nimbus_core.is_firefox ? 'screens_firefox' : 'screens_chrome'}&sc=1`, true);
                break;
            case 'capture-video':
                showRecordOptions();
                break;
            case 'back-to-capture':
                showCaptureOptions();
                break;
            case 'back-to-capture-setting':
                showRecordOptions();
                break;
            case 'record-start':
                localStorage.videoRecordIsStream = false;
                localStorage.videoCountdown = $('#video_countdown').val();
                setOption('videoCountdown', localStorage.videoCountdown);
                setOption('videoStream', localStorage.videoStream);

                nscCore.sendMessage({operation: 'activate_record', 'key': 'start'});
                break;
            case 'record-stream-start':
                localStorage.videoRecordIsStream = true;
                localStorage.videoCountdown = $('#video_countdown').val();
                setOption('videoCountdown', localStorage.videoCountdown);
                setOption('videoStream', localStorage.videoStream);
                nscCore.sendMessage({operation: 'activate_record', 'key': 'start'});
                break;
            case 'record-stop':
                nscCore.sendMessage({operation: 'activate_record', 'key': 'stop'});
                break;
            case 'record-pause':
                nscCore.sendMessage({operation: 'activate_record', 'key': 'pause'});
                const {state} = await nscCore.sendMessage({operation: 'get_info_record'});
                const stateText = chrome.i18n.getMessage(state === 'recording' ? 'popupBtnStopPause' : 'popupBtnStopResume');
                $('button[name=record-pause] .nsc-button-layout').text(stateText);
                break;
            case 'video-setting':
                showRecordSetting();
                break;
            case 'select-workspace':
                const authState = await nscNimbus.authState();
                if (authState) {
                    await nscNimbus.getInfo();
                    await nscNimbus.getWorkspaces();

                    $('#workspaces_list').empty().append(function () {
                        let $workspaces = [];

                        for (let i = 0, len = nscNimbus.workspaces.length; len > i; i++) {
                            let workspace = nscNimbus.workspaces[i];

                            if (workspace.access && workspace.access.role === 'reader') continue;

                            let destruction = '';
                            if (workspace.user) {
                                if (workspace.user.id === nscNimbus.user.id) destruction = 'Business workspace'; // персональные шаренные (пищем количество мемберов)
                                else destruction = workspace.user.email; // бизнес проекты (пишем емайл овнера).
                            } else if (workspace.userId === nscNimbus.user.id) {
                                if (workspace.countMembers > 0) destruction = workspace.countMembers + ' users'; // персональные шаренные (пищем количество мемберов)
                                else destruction = 'Personal workspace'; // персональными (пишем Personal)
                            } else {
                                destruction = workspace.org.user.email; // шаренные (пишем владельца проекта)
                            }

                            $workspaces.push(
                                $('<div class="nsc-workspace-item">').data('id', workspace.globalId).append([
                                    $('<div class="nsc-workspace-logo">').text(workspace.title[0]),
                                    $('<div class="nsc-workspace-info">').append([
                                        $('<div class="nsc-workspace-title">').text(workspace.title),
                                        $('<div class="nsc-workspace-destruction">').text(destruction)
                                    ])
                                ]).on('click', function () {
                                    localStorage.nimbusWorkspaceSelect = $(this).data('id');
                                    $('.nsc-workspace-item').removeClass('select').filter(this).addClass('select');
                                }).addClass(function () {
                                    return $(this).data('id') === localStorage.nimbusWorkspaceSelect ? 'select' : '';
                                })
                            )
                        }

                        return $workspaces;
                    });

                    if (localStorage.numbusWorkspaceSelect === 'false') {
                        $('.nsc-workspace-item[isDefault=true]').addClass('select');
                    } else {
                        $('.nsc-workspace-item[id=' + localStorage.numbusWorkspaceSelect + ']').addClass('select');
                    }

                    showSelectWorkspace();
                } else {
                    chrome.runtime.sendMessage({operation: 'content_popup', action: 'nsc_popup_login_open'});
                    window.close();
                }
                break;
            case 'open-help-video-setting':
                await openPage('5812955/n38dp6mgsxobqo1beaop')
                break;
            case 'open-help-capture':
                await openPage(language === 'ru' ? '3552389/f4vdbtq17l1zmkrhs5n1?utm_source=capture&utm_medium=addon&utm_campaign=main_menu' : '3552387/mp8nr3ee75mtgyqfonnc?utm_source=capture&utm_medium=addon&utm_campaign=main_menu')
                break;
            case 'open-private-upload-help':
                await openPage('3267939/40p7p3pmtp7q4yhz63vd');
                break;
            case 'open-extensions':
                await openPage('chrome://extensions/?id=bpconcjcammlapcogcnnelfmaeghhagj', true);
                break;
            case 'open-nimbus-client':
                await openPage('https://nimbusweb.me/auth/?b=capture&su=0&utm_source=capture&utm_medium=addon&utm_campaign=my_uploads&success=/client/' +
                    '?utm_source=capture&utm_medium=addon&utm_campaign=my_uploads&sr=screens_chrome&hpts=1&sc=1', true);
                break;
            case 'open-media-access':
                nscCore.sendMessage({operation: 'content_media_access', access: false});
                break;
            case 'reset-video-setting':
                localStorage.videoResolution = 'hd';
                localStorage.videoBitrate = '4000000';
                localStorage.videoAudioBitrate = '96000';
                localStorage.videoFps = '24';
                localStorage.videoDrawingToolsDelete = '6';

                setOption('videoResolution', localStorage.videoResolution);
                setOption('videoBitrate', localStorage.videoBitrate);
                setOption('videoAudioBitrate', localStorage.videoAudioBitrate);
                setOption('videoFps', localStorage.videoFps);
                setOption('videoDrawingToolsDelete', localStorage.videoDrawingToolsDelete);

                $("input[name=video-size]").prop('checked', false).filter('[value=' + localStorage.videoResolution + ']').prop('checked', true);
                $("select[name=audio-bitrate]").val(localStorage.videoAudioBitrate);
                $("select[name=video-bitrate]").val(localStorage.videoBitrate);
                $("select[name=video-fps]").val(localStorage.videoFps);
                $("select[name=delete-drawing]").val(localStorage.videoDrawingToolsDelete);
                break;
            case 'stop-capture':
                alert('stop-capture')
                nscCore.sendMessage({operation: 'content_message', message: {operation: 'content_stop_capture'}});
                break;
        }

        if ($(this).data('closeWindow')) {
            window.close();
        }
    });

    $("input").on('change', async function () {
        switch (this.name) {
            case 'record-type':
                localStorage.videoRecordType = $(this).val();
                setOption('videoRecordType', localStorage.videoRecordType);
                await getUserMedia();

                if ($(this).val() === 'desktop' || $(this).val() === 'camera') {
                    $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopTabSound")).addClass('disabled');
                    if (localStorage.videoRecordType === 'desktop') {
                        $('input[name=enable-watermark]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
                        $('input[name=record-camera]').prop("checked", localStorage.videoCameraEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                        $('input[name=show-drawing-tools]').prop("checked", localStorage.videoDrawingToolsEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    } else {
                        $('input[name=show-drawing-tools]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopDrawingTools")).addClass('disabled');
                        $('input[name=record-camera]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation")).addClass('disabled');
                    }
                } else {
                    $('input[name=enable-watermark]').prop("checked", localStorage.watermarkEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    $('input[name=record-tab-sound]').prop("checked", localStorage.videoTabSoundEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    $('input[name=show-drawing-tools]').prop("checked", localStorage.videoDrawingToolsEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                    $('input[name=record-camera]').prop("checked", localStorage.videoCameraEnable !== 'false').prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '').removeClass('disabled');
                }
                break;
            case 'record-mic':
                localStorage.videoMicSoundEnable = $(this).prop("checked");
                setOption('videoMicSoundEnable', localStorage.videoMicSoundEnable);
                await getUserMedia();
                break;
            case 'video-animation-cursor':
                localStorage.videoAnimationCursor = $(this).prop("checked");
                setOption('videoAnimationCursor', localStorage.videoAnimationCursor);
                break;
            case 'record-camera':
                localStorage.videoCameraEnable = $(this).prop("checked");
                setOption('videoCamera', localStorage.videoCameraEnable);
                await getUserMedia();
                break;
            case 'record-tab-sound':
                localStorage.videoTabSoundEnable = $(this).prop("checked");
                setOption('videoTabSoundEnable', localStorage.videoTabSoundEnable);
                break;
            case 'show-drawing-tools':
                localStorage.videoDrawingToolsEnable = $(this).prop("checked");
                setOption('videoDrawingToolsEnable', localStorage.videoDrawingToolsEnable);
                break;
            case 'enable-watermark':
                if (localStorage.watermarkEnable === 'false' || (localStorage.watermarkFile === '' && localStorage.watermarkType === 'image')) {
                    $(this).prop("checked", false);
                    await nscCore.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
                } else {
                    localStorage.watermarkEnable = $(this).prop("checked");
                    window.nimbus_core.setOption('watermarkEnable', localStorage.watermarkEnable);
                }
                break;
            case 'video-size':
                if (localStorage.nimbusPremium === 'false' && ($(this).val() === 'fullhd' || $(this).val() === '2k' || $(this).val() === '4k')) {
                    $(this).val(localStorage.videoResolution);
                    $('#nsc_popup_premium_live').removeClass('nsc-hide');
                } else {
                    localStorage.videoResolution = $(this).val();
                    setOption('videoResolution', localStorage.videoResolution);
                }
                break;
            default:
                break;

        }
    }).filter('[name=record-mic]').prop('checked', localStorage.videoMicSoundEnable !== 'false').end()
        .filter('[name=record-camera]').prop('checked', localStorage.videoCameraEnable !== 'false').end()
        .filter('[name=record-tab-sound]').prop('checked', localStorage.videoTabSoundEnable !== 'false').end()
        .filter('[name=show-drawing-tools]').prop('checked', localStorage.videoDrawingToolsEnable !== 'false').end()
        .filter('[name=enable-watermark]').prop('checked', localStorage.watermarkEnable !== 'false').end()
        .filter('[name=record-to-gif]').prop('checked', localStorage.recordToGif !== 'false').end()
        .filter('[name=video-re-encoding]').prop('checked', localStorage.videoReEncoding !== 'false').end()
        .filter('[name=private-upload-video]').prop('checked', localStorage.videoPrivateUploadEnable !== 'false').end()
        .filter('[name=record-type][value=' + localStorage.videoRecordType + ']').prop('checked', true).end()
        .filter('[name=video-size][value=' + localStorage.videoResolution + ']').prop('checked', true).end()
        .filter('[name=video-animation-cursor]').prop('checked', localStorage.videoAnimationCursor !== 'false').end();

    $("select[name=edit-before]").val(localStorage.enableEdit).on("change", function (e) {
        localStorage.enableEdit = e.target.value;
        setOption('enableEdit', localStorage.enableEdit);
    });

    $("select[name=delete-drawing]").val(localStorage.videoDrawingToolsDelete).on("change", function (e) {
        localStorage.videoDrawingToolsDelete = e.target.value;
        setOption('videoDrawingToolsDelete', localStorage.videoDrawingToolsDelete);
    });

    $("select[name=selected-video-camera]").on("change", function (e) {
        localStorage.selectedVideoCamera = e.target.value;
        setOption('selectedVideoCamera', localStorage.selectedVideoCamera);
    });

    $("select[name=selected-microphone]").on("change", function (e) {
        localStorage.selectedMicrophone = e.target.value;
        setOption('selectedMicrophone', localStorage.selectedMicrophone);
    });

    $('#video_countdown').val(localStorage.videoCountdown).on('input', function () {
        if (this.value < 0) this.value = 0;
        if (this.value > 9999) this.value = 9999;
        localStorage.videoCountdown = this.value;
        setOption('videoCountdown', localStorage.videoCountdown);
    });

    $('#video_animation_cursor').val(localStorage.videoCountdown).on('input', function () {
        if (this.value < 0) this.value = 0;
        if (this.value > 9999) this.value = 9999;
        localStorage.videoCountdown = this.value;
        setOption('videoCountdown', localStorage.videoCountdown);
    });

    $('#nsc_open_option_watermark').on('click', async () => {
        await nscCore.sendMessage({operation: 'open_page', 'url': 'options.html?watermark'});
    });

    $('.nsc-popup-close button, .nsc-popup a').on('click', function (e) {
        $(this).closest('.nsc-popup-wrapper').addClass('nsc-hide');
    });

    const {
        recordStatus,
        streamLoading,
        entireStatus
    } = await nscCore.sendMessage({operation: 'get_extension_data'});

    const $body = $('body');

    $body.addClass('loading');
    if (recordStatus) {
        await checkRecord();
    } else {
        if (streamLoading) {
            window.close();
        } else if (entireStatus) {
            $('#progress_capture_option').addClass('nsc-hide');
        } else {
            nscCore.sendMessage({operation: 'check_tab_action', 'action': 'insert_page'});

            nscNimbus.sendAnalytics();
            nscNimbus.checkPremium(false, '', function (premium) {
                !premium && $('input[name=video-size][value=' + localStorage.videoResolution + ']').prop('checked', true);
            });

            const premium = nscExt.getOption('nimbusNotePremium');

            if (!premium) {
                $('#nsc_trial_message').removeClass('nsc-hide');
            }

            $('#capture_options').removeClass('nsc-hide');
        }
    }
    $body.removeClass('loading');

    await nscExt.initI18n();

    await nscCore.onMessage(await function (request) {
        switch (request.operation) {
            case 'check_tab_action' :
            case 'back_is_page' :
                const {chrome} = request.value;

                if (chrome) {
                    $('input[name=record-type][value=desktop]').prop('checked', true);
                    localStorage.videoRecordType = 'desktop';

                    $('input[name=record-type][value=tab]').attr('disabled', 'disabled').closest('.nsc-capture-flag').css({opacity: 0.5});
                    $('input[name=record-type][value=camera]').attr('disabled', 'disabled').closest('.nsc-capture-flag').css({opacity: 0.5});
                    $('input[name=record-tab-sound]').attr('disabled', 'disabled').closest('.nsc-capture-switcher').css({opacity: 0.5});
                    $('input[name=show-drawing-tools]').attr('disabled', 'disabled').closest('.nsc-capture-switcher').css({opacity: 0.5});
                    $('input[name=enable-watermark]').attr('disabled', 'disabled').closest('.nsc-capture-switcher').css({opacity: 0.5});
                }
                break;
        }
    });

    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(console.error);
});
