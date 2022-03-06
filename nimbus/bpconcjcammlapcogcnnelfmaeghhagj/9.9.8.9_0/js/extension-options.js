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

$(document).ready(async function () {
    nscExt.initI18n();
    nscNimbus.authState();
    nscNimbus.checkPremium(false);

    const location = window.location.href.match(/\?(\w+)$/);
    let watermarkEnable = localStorage.watermarkEnable === 'true';

    $("input, button, select, textarea").on('input change auto-input', async function (e) {
        let _this = this;
        let checked = $(_this).prop("checked");

        switch (this.name) {
            case 'image-format':
                localStorage.imageFormat = this.value;
                window.nimbus_core.setOption('imageFormat', localStorage.imageFormat);
                $('.nsc-settings-format .nsc-setting-quality').toggleClass('nsc-setting-quality-hidden', this.value === 'png');
                break;
            case 'show-new-button':
                localStorage.appShowButtonNew = $(this).prop("checked");
                window.nimbus_core.setOption('appShowButtonNew', localStorage.appShowButtonNew);
                break;
            case 'enable-watermark':
                if (e.type !== 'input' && e.type !== 'auto-input') return;
                if (checked) {
                    const premium = await nscNimbus.checkPremium(e.type !== 'auto-input', 'premium_banner_wotermarks');

                    if (!premium) {
                        $(_this).prop('checked', false);
                        return;
                    }

                    if(localStorage.watermarkType === 'text' ||
                        (localStorage.watermarkType === 'image' && localStorage.watermarkFile !== '')) {
                        localStorage.watermarkEnable = checked;
                        window.nimbus_core.setOption('watermarkEnable', localStorage.watermarkEnable);
                        window.nimbus_core.setEvent('enable-watermark', localStorage.watermarkEnable);
                    } else {
                        watermarkEnable = checked;
                    }

                    $('input[name=type-watermark]').prop('disabled', false);
                    $('input[name=percent-watermark]').prop('disabled', false);
                    $('select[name=font-watermark]').prop('disabled', false);
                    $('input[name=size-watermark]').prop('disabled', false);
                    $('textarea[name=text-watermark]').prop('disabled', false);
                    $('button[name=button-file-watermark]').prop('disabled', false);
                    $('input[name=time-enable-watermark]').prop('disabled', false);
                    $('select[name=time-watermark]').prop('disabled', false);
                } else {
                    localStorage.watermarkEnable = checked;
                    window.nimbus_core.setOption('watermarkEnable', localStorage.watermarkEnable);
                    window.nimbus_core.setEvent('enable-watermark', localStorage.watermarkEnable);

                    $('input[name=type-watermark]').prop('disabled', true);
                    $('input[name=percent-watermark]').prop('disabled', true);
                    $('select[name=font-watermark]').prop('disabled', true);
                    $('input[name=size-watermark]').prop('disabled', true);
                    $('textarea[name=text-watermark]').prop('disabled', true);
                    $('button[name=button-file-watermark]').prop('disabled', true);
                    $('input[name=time-enable-watermark]').prop('disabled', true);
                    $('select[name=time-watermark]').prop('disabled', true);
                }
                break;
            case 'type-watermark':
                if (e.type !== 'input') return;

                localStorage.watermarkType = this.value;
                window.nimbus_core.setOption('watermarkType', localStorage.watermarkType);
                window.nimbus_core.setEvent('type-watermark', localStorage.watermarkType);

                $('[data-type-watermark]').addClass('nsc-hide').filter('[data-type-watermark=' + this.value + ']').removeClass('nsc-hide');

                if (localStorage.watermarkType === 'image' && localStorage.watermarkFile !== '') {
                    $('.nsc-settings-watermark-image').attr('src', localStorage.watermarkFile).css('opacity', localStorage.watermarkAlpha);
                } else {
                    $('.nsc-settings-watermark-image-area').addClass('nsc-hide');
                }
                if (localStorage.watermarkType === 'text') {
                    if((localStorage.watermarkEnable === 'true') !== watermarkEnable) {
                        localStorage.watermarkEnable = watermarkEnable;
                        window.nimbus_core.setOption('watermarkEnable', localStorage.watermarkEnable);
                        window.nimbus_core.setEvent('enable-watermark', localStorage.watermarkEnable);
                    }

                    $('#nsc_settings_watermark_percent').addClass('nsc-hide');
                    $('textarea[name=text-watermark]').css('opacity', localStorage.watermarkAlpha);
                } else {
                    $('#nsc_settings_watermark_percent').removeClass('nsc-hide');
                }

                break;
            case 'file-watermark':
                const [file] = this.files;

                if (!file.type.match('image.*')) return $('#nsc_popup_watermark_unsupported').removeClass('nsc-hide');
                if (file.size >= 1048576) return $('#nsc_popup_watermark_limit').removeClass('nsc-hide');

                window.nimbus_core.blobToDataURL(file, function (dataUrl) {
                    localStorage.watermarkFile = dataUrl;
                    window.nimbus_core.setOption('watermarkFile', localStorage.watermarkFile);
                    window.nimbus_core.setEvent('file-watermark', localStorage.watermarkFile);

                    if((localStorage.watermarkEnable === 'true') !== watermarkEnable) {
                        localStorage.watermarkEnable = watermarkEnable;
                        window.nimbus_core.setOption('watermarkEnable', localStorage.watermarkEnable);
                        window.nimbus_core.setEvent('enable-watermark', localStorage.watermarkEnable);
                    }

                    $('.nsc-settings-watermark-image-area').removeClass('nsc-hide');
                    $('.nsc-settings-watermark-image').attr('src', localStorage.watermarkFile);
                });
                break;
            case 'text-watermark':
                if (e.type !== 'input') return;

                localStorage.watermarkText = this.value;
                window.nimbus_core.setOption('watermarkText', localStorage.watermarkText);
                window.nimbus_core.setEvent('text-watermark', localStorage.watermarkText);
                break;
            case 'percent-watermark':
                localStorage.watermarkPercent = +this.value / 100;
                window.nimbus_core.setOption('watermarkPercent', localStorage.watermarkPercent);
                window.nimbus_core.setEvent('percent-watermark', localStorage.watermarkPercent);
                break;
            case 'alpha-watermark':
                localStorage.watermarkAlpha = +this.value / 100;
                window.nimbus_core.setOption('watermarkAlpha', localStorage.watermarkAlpha);
                window.nimbus_core.setEvent('alpha-watermark', localStorage.watermarkAlpha);
                $('.nsc-settings-watermark-image').css('opacity', localStorage.watermarkAlpha);
                $('textarea[name=text-watermark]').css('opacity', localStorage.watermarkAlpha);
                break;
            case 'font-watermark':
                localStorage.watermarkFont = this.value;
                window.nimbus_core.setOption('watermarkFont', localStorage.watermarkFont);
                window.nimbus_core.setEvent('font-watermark', localStorage.watermarkFont);
                $('textarea[name=text-watermark]').css({'font-family': localStorage.watermarkFont});
                break;
            case 'size-watermark':
                localStorage.watermarkSize = this.value;
                window.nimbus_core.setOption('watermarkSize', localStorage.watermarkSize);
                window.nimbus_core.setEvent('size-watermark', localStorage.watermarkSize);
                $('textarea[name=text-watermark]').css({
                    'line-height': localStorage.watermarkSize + 'px',
                    'font-size': localStorage.watermarkSize + 'px'
                });
                break;
            case 'time-enable-watermark':
                localStorage.watermarkEnableTime = checked;
                window.nimbus_core.setOption('watermarkEnableTime', localStorage.watermarkEnableTime);
                window.nimbus_core.setEvent('time-enable-watermark', localStorage.watermarkEnableTime);

                break;
            case 'time-watermark':
                localStorage.watermarkTime = this.value;
                window.nimbus_core.setOption('watermarkTime', localStorage.watermarkTime);
                window.nimbus_core.setEvent('time-watermark', localStorage.watermarkTime);
                break;
        }
    }).on('click', function () {
        switch (this.name) {
            case 'button-file-watermark':
                $('[name=file-watermark]').focus().trigger('click');
                break;
        }
    }).filter('[name=image-format][value=' + localStorage.imageFormat + ']').prop('checked', true).trigger('change').end()
        .filter('[name=show-new-button]').prop('checked', localStorage.appShowButtonNew !== 'false').end()
        .filter('[name=enable-watermark]').prop('checked', localStorage.watermarkEnable !== 'false').trigger('auto-input').end()
        .filter('input[name=type-watermark][value=' + localStorage.watermarkType + ']').prop('checked', true).trigger('input').end()
        .filter('[name=time-enable-watermark]').prop('checked', localStorage.watermarkEnableTime !== 'false').end()
        .filter('[name=time-watermark]').val(localStorage.watermarkTime).end()
        .filter('[name=percent-watermark]').val(localStorage.watermarkPercent * 100).end()
        .filter('[name=alpha-watermark]').val(localStorage.watermarkAlpha * 100).end()
        .filter('[name=font-watermark]').val(localStorage.watermarkFont).trigger('change').end()
        .filter('[name=size-watermark]').val(localStorage.watermarkSize).trigger('change').end()
        .filter('[name=text-watermark]').val(localStorage.watermarkText).trigger('input').end();

    $("[name=color-watermark]").spectrum({
        color: localStorage.watermarkColor,
        flat: true,
        // showAlpha: true,
        showButtons: false,
        move: function (color) {
            if (localStorage.watermarkEnable === 'false') return;
            localStorage.watermarkColor = color.toRgbString();
            window.nimbus_core.setOption('watermarkColor', localStorage.watermarkColor);
            window.nimbus_core.setEvent('color-watermark', localStorage.watermarkColor);

            $("[name=color-watermark]").val(localStorage.watermarkColor).closest('.nsc-settings-watermark-colorpicker').find('.nsc-settings-watermark-colorpicker-fill-shape-inner').css('background', localStorage.watermarkColor);
            $('textarea[name=text-watermark]').css({'color': localStorage.watermarkColor});
        }
    }).closest('.nsc-settings-watermark-colorpicker').find('.nsc-settings-watermark-colorpicker-fill-shape-inner').css('background-color', localStorage.watermarkColor);

    let $watermark = $('.nsc-settings-watermark-box-item');
    $watermark.on('click', function () {
        if (localStorage.watermarkEnable === 'false') return;
        $watermark.removeClass('filled').filter(this).addClass('filled');
        localStorage.watermarkPosition = $(this).data('position');
        window.nimbus_core.setOption('watermarkPosition', localStorage.watermarkPosition);
        window.nimbus_core.setEvent('position-watermark', localStorage.watermarkPosition);
    }).filter('[data-position=' + localStorage.watermarkPosition + ']').addClass('filled');

    $('.nsc-settings-watermark-colorpicker-button').on('click', function () {
        $('.nsc-settings-watermark-colorpicker-drop-holder').toggleClass('nsc-hide');
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.nsc-settings-watermark-colorpicker').length) {
            $('.nsc-settings-watermark-colorpicker-drop-holder').addClass('nsc-hide');
        }
    });

    $('.nsc-popup-close button, .nsc-popup a').on('click', function (e) {
        $(this).closest('.nsc-popup').addClass('nsc-hide');
    });

    $('.nsc-open-popup-login-nimbus').on('click', function () {
        $('.nsc-popup').addClass('nsc-hide');
        $('#nsc_popup_connect_nimbus').removeClass('nsc-hide');
        return false;
    });

    $('.nsc-open-popup-register-nimbus').on('click', function () {
        $('.nsc-popup').addClass('nsc-hide');
        // $('#nsc_popup_register_nimbus').removeClass('nsc-hide');

        window.open(`https://nimbusweb.me/auth/?f=register&b=capture&hpts=1&success=/auth/t/s.html?capture-login-success=1&sr=${nimbus_core.is_firefox ? 'screens_firefox' : 'screens_chrome'}&sc=1&t=regfsour:streaming_addon`, '_blank');
        return false;
    });

    $('#nsc_connect_to_google').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').addClass('nsc-hide');
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=google', '_blank');
        return false;
    });

    $('#nsc_connect_to_facebook').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').addClass('nsc-hide');
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=facebook', '_blank');
        return false;
    });

    $('#nsc_form_login_nimbus').on("submit", function () {
        let wrong = false;
        let $form = $(this);
        let email = this.elements['email'];
        let password = this.elements['password'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }
        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.auth(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    $form.find('input').val('');
                    $('.nsc-popup').addClass('nsc-hide');

                    if ((location && location[1]) === 'streamwelcome') {
                        nimbusShare.server.user.info(function (info) {
                            $('#nsc_stream_start').removeClass('nsc-hide');
                            if (info.body.premium.active) $('.stream-start-hide-premium').addClass('nsc-hide');
                        });
                    }
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') === 'email' && !/\S+@\S+\.\S+/.test($(this).val()))) {
            $(this).addClass('wrong');
        }
    });

    $('#nsc_form_register_nimbus').on("submit", function () {
        let wrong = false;
        let $form = $(this);
        let email = this.elements['email'];
        let password = this.elements['password'];
        let password_repeat = this.elements['passrepeat'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }

        if (password.value !== password_repeat.value) {
            $(password).addClass('wrong');
            $(password_repeat).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassMatch"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbusShare.server.user.register(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    nimbusShare.server.user.auth(email.value, password.value, function () {
                        $form.find('input').val('');
                        $('.nsc-popup').addClass('nsc-hide');

                        if ((location && location[1]) === 'streamwelcome') {
                            nimbusShare.server.user.info(function (info) {
                                $('#nsc_stream_start').removeClass('nsc-hide');
                                if (info.body.premium.active) $('.stream-start-hide-premium').addClass('nsc-hide');
                            });
                        }
                    });
                } else if (res.errorCode === -4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailFail"), type: "error", timeout: 5});
                } else {
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationRegisterFail"),
                        type: "error",
                        timeout: 5
                    });
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') === 'passrepeat' && $(this).val() !== $(this).closest('form').find("[name='pass']").val()) ||
            $(this).attr('name') === 'email' && !/\S+@\S+\.\S+/.test($(this).val())) {
            $(this).addClass('wrong');
        }
    });

    $('button[name=filename-template-screencast]').on('click', function () {
        let $name = $('#filename_template_screencast');
        $name.val($name.val() + '{' + this.value + '}').trigger('input');
    });

    $('#filename_template_screencast').on('input', function () {
        localStorage.fileNamePatternScreencast = this.value;
        window.nimbus_core.setOption('fileNamePatternScreencast', localStorage.fileNamePatternScreencast);
    });
    $('#delayed_screenshot_time').on('blur', function () {
        this.value = parseInt(this.value) || 0;
        if (this.value < 0) this.value = 0;
        if (this.value > 999) this.value = 999;
        localStorage.delayedScreenshotTime = this.value;
        window.nimbus_core.setOption('delayedScreenshotTime', localStorage.delayedScreenshotTime);
    });
    $('#time_scroll_entire_page').on('blur', function () {
        this.value = parseInt(this.value) || 0;
        if (this.value < 0) this.value = 0;
        if (this.value > 9999) this.value = 9999;
        localStorage.actionEntirePageScrollDelay = this.value;
        window.nimbus_core.setOption('actionEntirePageScrollDelay', localStorage.actionEntirePageScrollDelay);
    });

    $('#enable_save_as').on('change', function () {
        localStorage.enableSaveAs = $(this).prop('checked');
        window.nimbus_core.setOption('enableSaveAs', localStorage.enableSaveAs);
    });
    $('#save_crop_position').on('change', function () {
        localStorage.saveCropPosition = $(this).prop('checked');
        window.nimbus_core.setOption('saveCropPosition', localStorage.saveCropPosition);
    });
    $('#hide_fixed_elements').on('change', function () {
        localStorage.actionHideFixedElements = $(this).prop('checked');
        window.nimbus_core.setOption('actionHideFixedElements', localStorage.actionHideFixedElements);
    });
    $('#show_content_menu').on('change', function () {
        localStorage.appContentMenuShow = $(this).prop('checked');
        window.nimbus_core.setOption('appContentMenuShow', localStorage.appContentMenuShow);
        chrome.runtime.sendMessage({operation: 'update_context_menu'});
    });
    $('#auto_short_url').on('change', function () {
        localStorage.nimbusAutoShortUrl = $(this).prop('checked');
        window.nimbus_core.setOption('nimbusAutoShortUrl', localStorage.nimbusAutoShortUrl);
    });
    $('#keep_original_resolution').on('change', function () {
        localStorage.imageOriginalResolution = $(this).prop('checked');
        window.nimbus_core.setOption('imageOriginalResolution', localStorage.imageOriginalResolution);
    });
    $('#show_info_print').on('change', function () {
        localStorage.showInfoPrint = $(this).prop('checked');
        window.nimbus_core.setOption('showInfoPrint', localStorage.showInfoPrint);
    });

    $('#image-quality').on('change', function () {
        localStorage.imageQuality = this.value;
        window.nimbus_core.setOption('imageQuality', localStorage.imageQuality);
        $('#image-quality-value').text(localStorage.imageQuality);
    });

    let $capture_type = $('#capture_type');
    let $capture_enable_edit = $('#capture_enable_edit');
    let $quick_capture_choose = $('#quick_capture_choose');
    let $quick_capture_enable = $('#quick_capture_enable');

    $quick_capture_enable.on('change', function () {
        localStorage.quickCapture = $(this).prop("checked");
        window.nimbus_core.setOption('quickCapture', localStorage.quickCapture);
        $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', localStorage.quickCapture !== 'false');
    }).prop('checked', (localStorage.quickCapture !== 'false'));

    $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', localStorage.quickCapture !== 'false');

    $capture_type.on('change', function () {
        localStorage.quickCaptureType = this.value;
        window.nimbus_core.setOption('quickCapture', localStorage.quickCaptureType);
        $capture_type.find('option[value=' + localStorage.quickCaptureType + ']').attr('selected', 'selected');
    }).find('option[value=' + localStorage.quickCaptureType + ']').attr('selected', 'selected');

    $capture_enable_edit.on('change', function () {
        localStorage.enableEdit = this.value;
        window.nimbus_core.setOption('enableEdit', localStorage.enableEdit);
        $(this).find('option[value=' + localStorage.enableEdit + ']').attr('selected', 'selected');
    }).find('option[value=' + localStorage.enableEdit + ']').attr('selected', 'selected');

    $('#shortcut_load_to_ns').on('change', function () {
        localStorage.hotkeysSendNS = JSON.stringify({key: this.value, title: $(this).find('option:selected').text()});
        window.nimbus_core.setOption('hotkeysSendNS', localStorage.hotkeysSendNS);
        chrome.runtime.sendMessage({'operation': 'shortcut_load_to_ns_change'});
    });

    $('.open-page').on('click', function (e) {
        chrome.runtime.sendMessage({'operation': 'open_page', 'url': $(this).data('url')});
        return false;
    });

    $('textarea[name=text-watermark]').css({'color': localStorage.watermarkColor});
    $("#image-quality").val(localStorage.imageQuality);
    $('#image-quality-value').text(localStorage.imageQuality);
    $('#delayed_screenshot_time').val(localStorage.delayedScreenshotTime || 3);
    $('#time_scroll_entire_page').val(localStorage.actionEntirePageScrollDelay);
    $('#depth_screenshot').val(localStorage.imageDepth);
    $('#filename_template_screenshot').val(localStorage.fileNamePatternScreenshot);
    $('#filename_template_screencast').val(localStorage.fileNamePatternScreencast);
    $("#enable_save_as").prop('checked', (localStorage.enableSaveAs !== 'false'));
    $("#save_crop_position").prop('checked', (localStorage.saveCropPosition !== 'false'));
    $("#hide_fixed_elements").prop('checked', (localStorage.actionHideFixedElements !== 'false'));
    $("#show_content_menu").prop('checked', (localStorage.appContentMenuShow !== 'false'));
    $("#auto_short_url").prop('checked', (localStorage.nimbusAutoShortUrl !== 'false'));
    $("#keep_original_resolution").prop('checked', (localStorage.imageOriginalResolution !== 'false'));
    $("#show_info_print").prop('checked', (localStorage.showInfoPrint !== 'false'));

    if (window.navigator.language !== 'ru') {
        $('[data-i18n=popupLabelQuickVideoCaptureGithubEnable]').removeAttr('data-i18n').on('click', function () {
            window.open('https://s.nimbusweb.me/share/3329590/zfyp5nvplodpsfxvzap9?utm_source=capture&utm_medium=addon&utm_campaign=edit_page', '_blank');
        });
        $('[data-i18n=popupLabelQuickVideoCaptureEnable]').removeAttr('data-i18n').on('click', function () {
            window.open('https://s.nimbusweb.me/share/3435562/44foo5ci2trkbir3m79o?utm_source=capture&utm_medium=addon&utm_campaign=edit_page', '_blank');
        });

        $('[data-i18n=popupLabelStreamMenuEnable]').removeAttr('data-i18n').on('click', function () {
            window.open('https://s.nimbusweb.me/share/3267935/99q972riouoi0b4fs19s?utm_source=capture&utm_medium=addon&utm_campaign=edit_page', '_blank');
            return false;
        });
    } else {
        $('[data-i18n=popupLabelStreamMenuEnable]').removeAttr('data-i18n').on('click', function () {
            window.open('https://s.nimbusweb.me/share/3641100/i5rr247nmw19bocl4a7c?utm_source=capture&utm_medium=addon&utm_campaign=edit_page', '_blank');
            return false;
        });
    }

    $('[data-tab]').on('click', function () {
        $('[data-tab]').removeClass('nsc-settings-tab-active').filter(this).addClass('nsc-settings-tab-active');
        $('[data-container]').removeClass('nsc-settings-container-active').filter('[data-container=' + $(this).data('tab') + ']').addClass('nsc-settings-container-active');

        if (localStorage.watermarkFile === '') {
            $('.nsc-settings-watermark-image-area').addClass('nsc-hide');
        }
    }).filter(function () {
        return $(this).data('tab') === (location && location[1]);
    }).trigger('click');
});
