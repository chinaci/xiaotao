$(function(){
	var miniprogram = false;
	if(window.__wxjs_environment == 'miniprogram'){
		miniprogram = true;
	}else{
		if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
			if(typeof(wx) != 'undefined'){
				wx.miniProgram.getEnv(function (res) {
					miniprogram = res.miniprogram;
				});
			}
		}
	}
	var tcInfoList = [];
	if(miniprogram){
		$(".swipre00 li.wx-hide").remove();
	}
	// 滑动导航
	var tswiper = $('.swipre00 .swiper-wrapper');
	var swiperNav = [], mainNavLi = tswiper.find('li');
	for (var i = 0; i < mainNavLi.length; i++) {
		swiperNav.push('<li class="ceshi">'+tswiper.find('li:eq('+i+')').html()+'</li>');
	}

	var liArr = [];
	for(var i = 0; i < swiperNav.length; i++){
		liArr.push(swiperNav.slice(i, i + 10).join(""));
		i += 9;
	}

	tswiper.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
	$(".tabMain").removeClass("noslide");
	new Swiper('.swipre00', {pagination: '.pag00', loop: false, grabCursor: true, paginationClickable: true});



    //模块链接跳原生
    $('.tcInfo').delegate('a', 'click', function(e){
        var t = $(this), name = t.attr('data-name'), code = t.attr('data-code'), href = t.attr('href');
        if(href != 'javascript:;' && device.indexOf('huoniao') > -1){
            e.preventDefault();
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler('redirectNative', {'name': name, 'code': code, 'link': href}, function(){});
            });
        }
    });

    //同城头条动态数据
    $.ajax({
        type: "POST",
        url: "/include/ajax.php",
        dataType: "json",
        data: 'service=article&action=alist&flag=h&pageSize=10',
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info.list;
                tcNewsHtml.push('<div class="swiper-slide">');
                for (var i = 0; i < list.length; i++){
                    tcNewsHtml.push('<p><a href="'+list[i].url+'"><span>'+list[i].typeName[(list[i].typeName.length)-1]+'</span>'+list[i].title+'</a></p>');
                    if((i + 1) % 2 == 0 && i + 1 < list.length){
                      tcNewsHtml.push('</div>');
                      tcNewsHtml.push('<div class="swiper-slide swiper-no-swiping">');
                    }

                }
                tcNewsHtml.push('</div>');
                $('.tcNews .swiper-wrapper').html(tcNewsHtml.join(''));
                new Swiper('.tcNews .swiper-container', {pagination: '.tcNews .pagination',direction: 'vertical',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});

            }else{
                $('.tcNews').hide();
            }
        },
        error: function(){
            $('.tcNews').hide();
        }
    });



	//抢购倒计时
    $.ajax({
        url: "/include/ajax.php",
        dataType: "jsonp",
        data: 'service=system&action=getSysTime',
        success: function(data) {

            var date = new Date();
            //$('.nowtime span').text(date.getHours());

            var nowtime = data.now;
            var time = data.nextHour - nowtime;

            setInterval(function () {
                var hour = parseInt(time/ 60 / 60 % 24);
                var minute = parseInt(time/ 60 % 60);
                var seconds = parseInt(time% 60);

                $('#time_h').text(hour < 10 ? '0' + hour : hour);
                $('#time_m').text(minute < 10 ? '0' + minute : minute);
                $('#time_s').text(seconds < 10 ? '0' + seconds : seconds);

                time--;
            }, 1000);
        }
    });
    //抢购商品 后台数据添加必须为整点
    qgList();
    function qgList(){
        $.ajax({
          url: "/include/ajax.php?service=shop&action=systemTime&num=24",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';
                if(list.length > 0){
                    var time = list[0].nextHour;
                }
                if(time!='' && time!=undefined){
                    nextHour = time;
                }
                $.ajax({
                        url: "/include/ajax.php?service=shop&action=slist&limited=4&time="+nextHour+"&page=1&pageSize=2",
                        type: "GET",
                        dataType: "jsonp",
                        success: function (data) {
                            if(data && data.state == 100 && data.info.list.length > 0){
                                var list = data.info.list, ggoodboxhtml = [], likeboxhtml = [], html = [];

                                    for(var i = 0; i < list.length; i++){
                                         html.push('<li data-id="'+list[i].id+'" class="fn-clear">');
                                         html.push('<a href="'+list[i].url+'">');
                                         html.push('<div class="q_img">');
                                         html.push('<img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt="">');
                                         html.push('</div>');
                                         html.push('<p class="q_price"><em>'+echoCurrency('symbol')+'</em>'+list[i].price+'</p>');
                                         html.push('</a>');
                                         html.push('</li>');
                                    }
                                    $(".servericeall-box ul").html(html.join(""));

                            }else{
                                $(".servericeall-box .deadline.fn-left").remove();
                                $(".servericeall-box .adv-box3").removeClass("fn-right").addClass("all_width")
                            }
                        },
                        error: function(){
                            $('.servericeall-box ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
                        }
                });
            }
          }
        });
    }

	 //广告位滚动
    new Swiper('.banner .swiper-container', {pagination: '.banner .pagination',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});
	  $('.next-page').click(function(){
	    $('.pagination .swiper-pagination-switch').eq(1).click();
	  });




    $.fn.numberRock=function(options){
      var defaults={
        speed:24,
        count:100
      };
      var opts=$.extend({}, defaults, options);
      var div_by = 100,count = opts["count"],speed = Math.floor(count / div_by),sum=0, $display = this,run_count = 1,int_speed = opts["speed"];
      var int = setInterval(function () {
        if (run_count <= div_by&&speed!=0) {
          $display.text(sum=speed * run_count);
          run_count++;
        } else if (sum < count) {
          $display.text(++sum);
        } else {
          clearInterval(int);
        }
      }, int_speed);
    }
    //数字滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php?service=siteConfig&action=getStatistics",
        dataType: "jsonp",
        success: function (data) {
            if(data.state == 100){
                console.log(data)
                $("#datanums1").html(data.info.business);
                $("#datanums2").html(data.info.info);
                $("#datanums3").html(data.info.tieba);
                //数字滚动
                $(".row-all").on('inview', function(event, isInview) {
                    if(isInview){
                        $("#datanums1").numberRock({speed:10,count:$("#datanums1").text()  })
                        $("#datanums2").numberRock({speed:10,count:$("#datanums2").text() })
                        $("#datanums3").numberRock({speed:10,count:$("#datanums3").text() })
                    }
                })
            }
        },
        error:function(){

        }
    });
    var loadMoreLock=false,datingLoad=false,liveLoad=false,huodongLoad=false,bussinessLoad=false,tiebaLoad=false,houseload=false,jobLoad=false,infoLoad=false;
    $(window).scroll(function () {

            var t=$(window).scrollTop();
            var h=$(window).height();
            var th =t + h;

            //热门话题
            if($('.hot-talk').size()>0){
                var a1 = $(".hot-talk").offset().top -100;
                var p1 = $(".hot-talk").height();
                var tp1=a1 + p1;
                if (tp1 > t && a1 < th && !loadMoreLock) {
                    console.log('热门话题开始')
                    htList();
                }
            }

            //互动交友
            if($('.jiaoyou-online').size()>0){
                var a2 = $(".jiaoyou-online").offset().top - 100;
                var p2 = $(".jiaoyou-online").height();
                var tp2=a2 + p2;
                if (tp2 > t && a2 < th && !datingLoad) {
                    console.log('互动交友开始')
                    tjMember();
                    tjHn();
                }
            }

            //视频直播
            if($('.live_wrap').size()>0){
                var a3 = $(".live_wrap").offset().top - 100;
                var p3 = $(".live_wrap").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !liveLoad) {
                    console.log('视频直播开始')
                    liveNum();
                }
            }

            //同城活动
            if($('.tc-activity-box').size()>0){
                var a3 = $(".tc-activity-box").offset().top - 100;
                var p3 = $(".tc-activity-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !huodongLoad) {
                    console.log('同城活动开始')
                    huodong();
                }
            }

            //推荐商家
            if($('.Business-box').size()>0){
                var a3 = $(".Business-box").offset().top - 100;
                var p3 = $(".Business-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !bussinessLoad) {
                    console.log('推荐商家开始')
                    bussiness();
                    getList();
                }
            }
            //贴吧社区
            if($('.tieba_wrap').size()>0){
                var a3 = $(".tieba_wrap").offset().top - 100;
                var p3 = $(".tieba_wrap").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !tiebaLoad) {
                    console.log('贴吧社区开始')
                    tieba();
                }
            }
            //职业招聘s
            if($('.job-box').size()>0){
                var a3 = $(".job-box").offset().top - 100;
                var p3 = $(".job-box").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !jobLoad) {
                    console.log('职业招聘s开始')
                    zhiweiList();
                }
            }
            //出租房源s
            if($('.house-resource').size()>0){
                var a3 = $(".house-resource").offset().top - 100;
                var p3 = $(".house-resource").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !houseload) {
                    console.log('出租房源开始')
                    houseList();
                }
            }
            //出租房源s
            if($('.classify-info').size()>0){
                var a3 = $(".classify-info").offset().top - 100;
                var p3 = $(".classify-info").height();
                var tp3=a3 + p3;
                if (tp3 > t && a3 < th && !infoLoad) {
                    console.log('分类信息开始')
                    infoList();
                }
            }


    });
    //热门话题
    function htList(){
        loadMoreLock = true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=circle&action=ranking&mold=0&page=1&pageSize=30&flag=h&type=topic",
            dataType: "json",
            crossDomain: true,
            success: function (data) {
                if(data && data.state == 100){
                    $('.hot-con .loading').remove();
                    var html1 = [],html2 = [],html3 = [], list = data.info.list;
                    var sum1 = 0,sum2 = 0,sum3 = 0;
                    var len=list.length;
                    var ulen = Math.ceil(len/3);
                    var hlen = 2*ulen;
                    if(len%3 == 1){//当数据分三行有余数为1时  比如 7 10 13 等 需特殊处理
                        hlen = 2*ulen-1
                    }
                    var claHot = '',claTj ='',claCom ='',txt='';
                    var sumRec = 0
                    for(var k=0;k<len;k++){//求出所有数据的topic和
                        sumRec += Number(list[k].topic);
                    }
                    var lastUn = Math.round(sumRec/len);//topic的平均值，大于平均值的是热，小于平均值的是普通
                    for (var i = 0; i < len; i++){
                        if(list[i].rec == 1){
                            claTj = 'new_blue';
                            txt = '荐';
                            claHot = '',claCom ='';
                        }else{
                            if(list[i].topic >= lastUn){

                                claHot ='hot';
                                claTj ='',claCom ='';
                                txt = '热';
                            }else{
                                claCom = 'jin_grey';
                                txt = '#';
                                claHot = '',claTj ='';
                            }
                        }

                        if(len < 4){
                            html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')

                        }else if(len < 6){
                            if(i < 2){
                                html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else{
                                html2.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }
                        }else {
                            if(i < ulen){
                                html1.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else if(i < hlen){
                                html2.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }else{
                                html3.push('<li><a href="'+list[i].url+'"><span class="hot-tip '+claHot+claTj+claCom+'">'+txt+'</span><span class="hot-txt">'+list[i].title+'</span></a></li>')
                            }
                        }

                    }

                    $('.hot-con .fir_ul').html(html1.join(''));
                    $('.hot-con .sec_ul').html(html2.join(''));
                    $('.hot-con .th_ul').html(html3.join(''));

                    $('.hot-con .fir_ul li').each(function(){
                        sum1 += $(this).outerWidth(true);
                    })
                    $('.hot-con .sec_ul li').each(function(){
                        sum2 += $(this).outerWidth(true);
                    })
                    $('.hot-con .th_ul li').each(function(){
                        sum3 += $(this).outerWidth(true);
                    })
                    //取出最大值给 ul
                    var alWidth = Math.max(sum1,sum2,sum3);
                    $('.hot-con .fir_ul,.hot-con .sec_ul,.hot-con .th_ul').css('width',alWidth+10)
                }else{
                    $('.hot-con').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                }
            },
            error: function(){
                $('.hot-con').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }

    //推荐会员
    function tjMember(){
        datingLoad=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=dating&action=memberList&orderby=5&pageSize=4",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<li><img src="'+list[i].photo+'"></li>');
                    }
                    $('.head-icon').html(newsList.join(''));
                }
            },
            error: function(){

            }
        });
    }

    //专业红娘
    function tjHn(){
        datingLoad=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=dating&action=hnList&pageSize=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<div class="hn_img"><img src="'+list[i].photo+'" alt=""></div>');
                        newsList.push('<p class="hn_txt">'+list[i].advice+'</p>');
                    }
                    $('.hn-info').html(newsList.join(''));
                }
            },
            error: function(){

            }
        });
    }

    //获取正在直播人数
    function liveNum(){
        liveLoad=true;
       $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=live&action=alive&orderby=click&state=1",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var totalCount = data.info.pageInfo.totalCount;
                    $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1',totalCount));//1人正在直播
                }else{
                    $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1','0'));//1人正在直播
                }
            },
            error: function(){
                $('.live_wrap span').html(langData['siteConfig'][53][12].replace('1','0'));//1人正在直播
            }
        });
    }

    //同城活动
    function huodong(){
        huodongLoad=true;
        $.ajax({
            url: '/include/ajax.php',
            type: 'get',
            dataType: 'json',
            data:'service=huodong&action=hlist&page=1&pageSize=4&keywords=&typeid=0',

            success: function(data){
                if(data && data.state == 100){
                   var newsList = [], list = data.info.list;
                   for(var i=0; i<list.length; i++){
                        newsList.push('<div class="activity swiper-slide">');
                        newsList.push('<a href="'+list[i].url+'">');
                        newsList.push('<div class="act-img" >');
                        newsList.push('<img src="'+list[i].litpic+'"/>')
                        newsList.push('</div>');
                        newsList.push('<div class="act-info">');
                                newsList.push('<p class="act-name">'+list[i].title+'</p>');
                               newsList.push('<p class="act-time">'+huoniao.transTimes(list[i].began,2)+langData['siteConfig'][53][19]+'</p>');//开始
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</div>');

                   }
                   //newsList.push('<div class="activity-kong swiper-slide"></div>');
                   $('.tc-activity').html(newsList.join(''));
                   //同城活动滚动
                    var swiper = new Swiper('.tc-activity-box .swiper-container', {

                        slidesPerView: 2,
                        spaceBetween:0,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                    });
                }else{
                   $('.tc-activity').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                  }
            },
            error: function(){
                    $('.info-list-box ul').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
                }

        })
    }

    //商家导航
    function bussiness(){
        bussinessLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=business&action=type&pageSize=5',
            success: function (data) {
                if(data && data.state == 100){
                    var tcInfoList = [], list = data.info;
                    for (var i = 0; i < list.length; i++){
                        if(list[i].code != 'special' && list[i].code != 'paper' && list[i].code != 'website'){
                            tcInfoList.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }

                    }
                    $('.tit_ul ul').append(tcInfoList.join(''));

                }else{

                }
            },
            error: function(){

            }
        });
    }
    //精选商家导航切换
    $('.tit_ul').delegate('li','click',function(){
        $(this).addClass('active').siblings().removeClass('active');
        var typeid = $(this).data('id');
        getList();
    })
    // 获取推荐商家
    var lng = lat = 0;
    var page = 1;
    function getList(){
        bussinessLoad = true;
        var pageSize = 3;
        var typeid = $('.tit_ul li.active').data('id');
        $('.business-list-box ul').html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        $.ajax({
            url: masterDomain+'/include/ajax.php?service=business&action=blist&store=2&typeid='+typeid+'&page='+page+'&pageSize='+pageSize+'&lng='+lng+'&lat='+lat,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var html = [];
                    for(var i = 0; i < data.info.list.length; i++){
                        var d = data.info.list[i];
                        html.push('<li>');
                        html.push(' <a href="'+d.url+'">');
                        html.push('  <div class="business-img">');
                        html.push('<img src="'+(d.logo ? d.logo : (templets + 'images/fShop.png'))+'" alt="">');
                        html.push('  </div>');
                        html.push('  <p>'+d.title+'</p>')
                        html.push('  </a>');
                        html.push('</li>');
                    }
                    $('.business-list-box ul').html(html.join(''));

                }else{
                    $('.business-list-box .loading').text(langData['siteConfig'][21][64]);//暂无数据！
                }
            },
            error: function(){
                $('.business-list-box .loading').text(langData['siteConfig'][44][23]);   //    网络错误，请重试
            }
        })
    }
    //贴吧社区
    function tieba(){
        tiebaLoad = true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=tieba&action=tlist&istop=1&page=1&pageSize=5",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<div class="tiezi swiper-slide">');
                        newsList.push('<a href="'+list[i].url+'">');
                        newsList.push('<div class="tie_top fn-clear">');
                        newsList.push('<i></i><strong>'+langData['siteConfig'][53][20]+'</strong><s></s>');//热议发帖
                        newsList.push('</div>');
                        newsList.push('<p>'+list[i].title+'</p>');
                        newsList.push('<div class="tie_bot">');
                        newsList.push('<i></i><span>'+langData['siteConfig'][53][21].replace('1',list[i].reply)+'</span>');//1人参与评论
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</div>');
                    }
                    $('.tieba_con').html(newsList.join(''));
                    var swiperTieba = new Swiper('.tieba_wrap .swiper-container', {

                        slidesPerView: 'auto',
                        spaceBetween:0,
                    });
                }else{
                    $('.tieba_con').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！

                }
            },
            error: function(){
                $('.tieba_con').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
            }
        });
    }
    //企业招聘
    function zhiweiList(){
        jobLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=job&action=post&pageSize=2',
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;

                    for (var i = 0; i < list.length; i++){
                        //福利待遇
                        var welfare = list[i]['company'] ? list[i]['company']['welfare'].split(',') : '';
                        var welfare_html = '';
                        if(welfare != ''){
                            for (var j = 0; j < welfare.length; j++){
                                welfare_html += '<span>'+welfare[j]+'</span>';
                            }
                        }

                        var price= list[i].salary ;
                            newsList.push('<li class="job-list">');
                            newsList.push('<div class="job">');
                            newsList.push('<a class="go_job" href="'+list[i].url+'">');
                            newsList.push('<div class="for-margin">');
                            newsList.push('<div class="job-name"><span>'+list[i].title+'</span>');
                            if(price != '面议'){
                                newsList.push('<b class="price-area">'+ price +'<em>'+langData['siteConfig'][31][111]+'</em></b> </div>');//元/月
                            }else{
                                newsList.push('<b class="price-area">'+langData['siteConfig'][46][70]+'</b> </div>');//面议
                            }
                            newsList.push('<p class="job-need">'+list[i].addr[list[i].addr.length-1]+'<em>|</em>'+list[i].experience+'<em>|</em>'+list[i].educational+'<em>|</em>'+getNatureText(list[i].nature)+'<b class="news-state">'+list[i].timeUpdate+'</b></p>');
                           if(welfare != ''){
                                newsList.push('          <div class="welfare">'+welfare_html+'</div>');
                            }
                            newsList.push('</div>');
                            newsList.push('</a>');

                            if(list[i].company) {
                                newsList.push('<div class="enterise-info">');
                                newsList.push('<a href="' + list[i].companyUrl + '" class="go_enterise">');
                                newsList.push('<div class="enterise-logo"><img src="' + list[i].company.logo + '"></div>');
                                newsList.push('<div class="enterise-info-detail"><h3>' + list[i].company.title + '</h3>');
                                newsList.push('<p>' + list[i].company.scale + '·' + list[i].company.nature + '·' + (list[i].company.industry ? list[i].company.industry[list[i].company.industry.length-1] : '') + '</p>');
                                newsList.push('</div>');

                                newsList.push('</a>');
                                newsList.push('</div>');
                            }
                            newsList.push('</div>');
                        newsList.push('</li>');
                    }
                    $('.job-list-box ul').html(newsList.join(''));

                }else{
                    $('.job-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.job-list-box').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }

        });
    }

	//房源
    function houseList(){
        houseload=true;
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=house&action=saleList&page=1&pageSize=4",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var newsList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        newsList.push('<li class="house-list">');
                        newsList.push('<a href="'+list[i].url+'">');
                        newsList.push('<div class="for-margin">');
                        newsList.push('<div class="house-img">');
                        newsList.push('<img src="'+list[i].litpic+'">');
                        newsList.push('</div>');
                        newsList.push('<div class="house-info ">');
                        newsList.push('<h3 class="house-detail ">'+list[i].title+'</h3>');
                        newsList.push('<p class="price_p"><span class="house-spec">'+list[i].room+'<em>|</em>'+list[i].area+'㎡</span>  <span class="house-price"><b>'+(list[i].price > 0 ? list[i].price + '<em>'+langData['siteConfig'][13][27]+'</em>' : langData['siteConfig'][46][70])+'</b></span></p>');//万 面议
                        newsList.push('<p class="house-distance pub-list-style ">'+list[i].community+'<b>'+(list[i].unitprice > 0 ? list[i].unitprice+echoCurrency('short')+'/m²' : langData['siteConfig'][46][70])+'</b></p>');//面议
                        newsList.push('</div>');
                        newsList.push('</div>');
                        newsList.push('</a>');
                        newsList.push('</li>');
                    }
                    $('.house-list-box ul').html(newsList.join(''));
                }else{
                    $('.house-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.house-list-box ul').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }
        });
    }

     //同城分类信息

    function infoList(){
        infoLoad=true;
        $.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=info&action=ilist_v2&orderby=1&pageSize=3',
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        //信息过期
                            if (list[i].isvalid ==1) {
                                html.push('<li class="fn-clear over_li"><a href="'+list[i].url+'">');
                            }else{
                                html.push('<li class="fn-clear "><a href="'+list[i].url+'">');
                            }
                            var photo = !list[i].member || list[i].member.photo == null ? templets+'images/noavatar_middle.gif' : list[i].member.photo;
                            html.push('<div class="userimg "><img src="'+photo+'" alt=""></div>');
                            html.push('<div class="info_r ">');
                            var nickname = !list[i].member || list[i].member.nickname == null ? langData['info'][1][4] : list[i].member.nickname;//匿名
                            html.push('<h4 class="fn-clear"><span>'+nickname+'</span> ');
                            if(list[i].is_shop == 0){
                                html.push('<i class="panel_tab">'+langData['info'][1][5]+'</i>');//个人
                            }else if(list[i].is_shop == 1){
                                html.push('<i class="com_tab"></i>');
                            }
                            if(list[i].price_switch==0){
                                if(list[i].price==0){
                                    html.push('<span class="price fn-right">'+langData['info'][2][30]+'</span>');
                                }else{
                                    html.push('<span class="price fn-right"><i>'+echoCurrency('symbol')+'</i>'+list[i].price+'</span>');
                                }
                            }
                            html.push('</h4>');

                            html.push('<p class="con">');
                            // 置顶
                            if(list[i].isbid == 1){
                                html.push('<i class="top_tab"></i>');
                            }
                            html.push('<span class="type" >#<em>'+list[i].typename+'</em>#</span>'+list[i].title+'</p>');
                            if(list[i].video){
                                html.push(' <div class="item-box video-box commonimg">');
                                html.push('<img data-video="'+list[i].video+'" src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt="">');
                                html.push('<i class="play"></i>');
                                html.push('</div>');
                            }else if(list[i].pcount<=5){
                                html.push('<div class="item-box img-box">');
                                for(var m=0;m<list[i].picArr.length;m++){
                                    html.push('<div class="img_item commonimg"><img src="'+huoniao.changeFileSize(list[i].picArr[m]['litpic'], "small")+'" alt=""></div>');
                                }
                                html.push('</div>');
                            }else {
                                html.push('<div class="item-box img-box">');
                                for(var m=0;m<list[i].picArr.length;m++){
                                    if(m == 5){
                                        html.push('<div class="img_item commonimg"><img src="'+huoniao.changeFileSize(list[i].picArr[m]['litpic'], "small")+'" alt=""> <i>+'+list[i].pcount+'</i></div>');
                                    }else{
                                        html.push('<div class="img_item commonimg"><img src="'+huoniao.changeFileSize(list[i].picArr[m]['litpic'], "small")+'" alt=""></div>');
                                    }
                                }
                                html.push('</div>');
                            }
                            html.push(' <p class="area"><span href=""><i class="icon_area"></i>'+list[i].address+'</span></p>');
                            //信息过期标识
                            if (list[i].isvalid ==1) {
                                html.push('<i class="over_icon"></i>');
                            }
                            html.push('</a></li>');
                    }
                    $('.info-list-box ul').html(html.join(''));


                }else{
                    $('.info-list-box ul').html('<li class="loading">'+langData['siteConfig'][21][64]+'</li>');//暂无数据！

                }
            },
            error: function(){
                $('.info-list-box ul').html('<li class="loading">'+langData['siteConfig'][20][462]+'</li>');//加载失败！
            }
        });
    }

    function getNatureText(num){
        switch (num){
            case '0' :
                return langData['siteConfig'][19][129];//全职
            case '1':
                return langData['siteConfig'][19][130];//兼职
            case '2':
                return langData['siteConfig'][19][131];//临时
            case '3':
                return langData['siteConfig'][19][132];//实习
            default :
                return langData['siteConfig'][21][67];//未知
        }
    }



    function checkLocal(){
        var local = false;
        var localData = utils.getStorage("user_local");
        if(localData){
            var time = Date.parse(new Date());
            time_ = localData.time;
            // 缓存1小时
            if(time - time_ < 3600 * 1000){
                lat = localData.lat;
                lng = localData.lng;
                local = true;
            }

        }
        if(!local){
            HN_Location.init(function(data){
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    lng = lat = -1;
                    getList();
                }else{
                    lng = data.lng;
                    lat = data.lat;

                    var time = Date.parse(new Date());
                    utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));

                    getList();
                }
            })
        }else{
            getList();
        }

    }


//-------

	//切换城市、搜索跳转
	$('.head-search .areachose').bind('click', function(){
        if(device.indexOf('huoniao') > -1 ){
          setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler('goToCity', {}, function(){});
          });
          e.preventDefault();
        }else{
            location.href = $(this).data('url');
        }
	});

	$('.head-search .search').bind('click', function(){
        location.href = $(this).data('url');
	});


	//扫一扫
	$(".search-scan").delegate(".scan", "click", function(){

		//APP端
		if(device.indexOf('huoniao') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("QRCodeScan", {}, function callback(DataInfo){
					if(DataInfo){
						if(DataInfo.indexOf('http') > -1){
							location.href = DataInfo;
						}else{
							alert(DataInfo);
						}
					}
				});
			});

		//微信端
		}else if(device.toLowerCase().match(/micromessenger/) && device.toLowerCase().match(/iphone|android/)){

			wx.scanQRCode({
				// 默认为0，扫描结果由微信处理，1则直接返回扫描结果
				needResult : 1,
				desc: '扫一扫',
				success : function(res) {
					if(res.resultStr){
						if(res.resultStr.indexOf('http') > -1){
							location.href = res.resultStr;
						}else if(res.resultStr.indexOf('EAN_13,') > -1){
							var resultStr = res.resultStr.split('EAN_13,');
							location.href = '/include/ajax.php?service=shop&action=barcodeSearch&type=redirect&code=' + resultStr[1];
						}else{
							alert(res.resultStr);
						}
					}
				},
				fail: function(err){
					alert(langData['siteConfig'][20][183]);
				}
			});

		//浏览器
		}else{
			$('.downloadAppFixed').css("visibility","visible");
			$('.downloadAppFixed .con').show();
		}

	});
    var ua = navigator.userAgent;
	var appVersion = '1.0';
	if(ua.match(/(iPhone|iPod|iPad);?/i)) {
		appVersion = $('.downloadAppFixed .app dd p').attr('data-ios');
	}else{
		appVersion = $('.downloadAppFixed .app dd p').attr('data-android');
	}
	$('.downloadAppFixed .app dd em').html(appVersion);
	$('.downloadAppFixed .close').bind('click', function(){
		$('.downloadAppFixed .con').hide();
		$('.downloadAppFixed').css("visibility","hidden");
	});



	//验证当前访问页面是否为当前城市
	// var changAutoCity = $.cookie("HN_changAutoCity");
	var siteCityInfo = $.cookie("HN_siteCityInfo");
    var changeAutoCity;
	if(siteCityInfo){
		HN_Location.init(function(data){
	    if (data != undefined && data.province != "" && data.city != "" && data.district != "" && !changeAutoCity) {
	      var province = data.province, city = data.city, district = data.district;
				$.ajax({
			    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district,
			    type: "POST",
			    dataType: "json",
			    success: function(data){
			      if(data && data.state == 100){
					var siteCityInfo_ = JSON.parse(siteCityInfo);
					var nowCityInfo = data.info;
					if(siteCityInfo_.cityid != nowCityInfo.cityid){
						// $.cookie("HN_changAutoCity", '1', {expires: 1, path: '/'});

						changeAutoCity = $.dialog({
                          width: 250,
                          buttons: {
                            "取消": function() {
                              this.close();
                            },
                            "确定": function() {
								
							  var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
                              var channelDomain_1 = channelDomainClean.split('.');
                              var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

                              channelDomain_ = channelDomainClean.split("/")[0];
                              channelDomain_1_ = channelDomain_1_.split("/")[0];

                              $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
                              $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

                              location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1' : '');
                            }
                          },
                          content: '<div style="text-align: center"> '+langData['siteConfig'][53][22]+'<div style="font-size: .5rem; color: #ff6600; padding: .1rem 0;"><strong>' + nowCityInfo.name + '</strong></div>'+langData['siteConfig'][53][23]+' </div>'//检测到你目前的城市为 是否切换
                        }).open();

					}
			      }
			    }
			  })
	    }
	  })
	}

});
