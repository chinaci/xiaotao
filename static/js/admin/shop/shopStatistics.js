$(function(){

    jQuery('.chooseDate, .chooseDateTime').datepicker(jQuery.extend({
        showMonthAfterYear: false
    },
    jQuery.datepicker.regional['zh_cn'], {
        'showSecond': true,
        'changeMonth': true,
        'changeYear': true,
        'tabularLevel': null,
        'yearRange': '2013:' + new Date().getFullYear(),
        'minDate': new Date(2013, 1, 1, 00, 00, 00),
        'timeFormat': 'hh:mm:ss',
        'dateFormat': 'yy-mm-dd',
        'timeText': '时间',
        'hourText': '时',
        'minuteText': '分',
        'secondText': '秒',
        'currentText': '当前时间',
        'closeText': '关闭',
        'showOn': 'focus'
    }));

    //填充城市列表
    huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);

    $(".chosen-select").chosen();


});
