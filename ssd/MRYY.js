/*
    本作品用于QuantumultX和Surge之间js执行方法的转换
    您只需书写其中任一软件的js,然后在您的js最【前面】追加上此段js即可
    无需担心影响执行问题,具体原理是将QX和Surge的方法转换为互相可调用的方法
    尚未测试是否支持import的方式进行使用,因此暂未export
    如有问题或您有更好的改进方案,请前往 https://github.com/sazs34/TaskConfig/issues 提交内容,或直接进行pull request
    您也可直接在tg中联系@wechatu
*/
// #region 固定头部
let isQuantumultX = $task !== undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient !== undefined; //判断当前运行环境是否是surge
// http请求
var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            url.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            //为了兼容qx中fetch的写法,所以永不reject
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                }
            })

        }
    }
}
// #endregion 网络请求专用转换

// #region cookie操作
if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}
// #endregion

// #region 消息通知
if (isQuantumultX) {
    $notification = {
        post: (title, subTitle, detail) => {
            $notify(title, subTitle, detail);
        }
    }
}
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}
/**
 * 
 * 写入要监测的公测tf appkey，当有空位的时候会弹出通知。
 * 建议task时间间隔小点。
 */

const title = 'testfilght';
const url = "https://testflight.apple.com/join/";

/**
 * 填入要监测的appkey。从testfligt地址获取。
 * 例如"VCIvwk2g,wArXdacJ,2vnRvOTX,LzjySbQx,IdFRwmNy,qDkBu2ur,4Qt2lIm5,ZzqOu8tX,ftCqFe6D,fy7LvHVA,QKqitFwc"
*/
const appkey = "VCIvwk2g,LzjySbQx";

//是否在没有tf位置的时候仍然弹出通知，默认不弹出,防止过多无用通知。
var isNOtify = false;
const fullstr = /(此 Beta 版本的测试员已满)|(此 Beta 版本目前不接受任何新测试员)/;
const appnamereg = /<title>加入 Beta 版"(.+)" - TestFlight - Apple<\/title>/;
var proarray = new Array();
getResult();

function getResult() {
    var upstr = '已有空位，抓紧上车';
    var apps = new Array(); //定义一数组
    apps = appkey.split(","); //字符分割
    var resultstr = false;
    var logdata={};
    for (var i = 0; i < apps.length; i++) {

        var p = new Promise(function (resolve) {
            var lol = {
                url: url + apps[i],
                headers: {
                    'User-Agent': '[{"key":"User-Agent","value":" Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2357.130 Safari/537.36 qblink wegame.exe QBCore/3.70.66.400 QQBrowser/9.0.2524.400","type":"text","enabled":true,"description":""},{"key":"X-Requested-With","value":" XMLHttpRequest","type":"text","enabled":false,"description":""}]',
                },
            };
            $httpClient.get(lol, function (error, response, data) {
                try {
                    appnamereg.test(data);
                    var appname = appnamereg.exec(data);
                    if (!appname != null) {
                        var reg = /".+"/
                        var item = reg.exec(appname[0]);
                        var name = item[0].replace('"', '').replace('"', '');
                        if (!fullstr.test(data)) {
                            logdata[name]={
                                'has':true,
                                'context':upstr + '👉:' + lol.url + '\n'
                            }
                            resultstr=true;
                        }
                        else{
                            logdata[name]={
                                'has':false,
                                'context':':暂无车位'+'\n'
                            }
                        }
                    }
                    resolve('done');
                }
                catch (errr) {
                    resolve('done');
                }

            });
        });


        proarray[i] = p;
    }
    Promise.all(proarray).then((result) => {
        var hastr='';
        var nostr='';
        for(var name in logdata){
            if(logdata[name].has){
                hastr=hastr+'[' + name + ']'+logdata[name].context;
            }
            else{
                nostr=nostr+'[' + name + ']'+logdata[name].context;
            }
        }
        if (resultstr) {
           
            $notification.post('', '', hastr+nostr);
        }
        else{
            if(isNOtify){
                $notification.post('', '', hastr+nostr);
            }
        }
        console.log(hastr+nostr);
    }).catch((error) => {
        console.log(error)
    });


}
/*
//每日英语阅读/每日外刊 
//by chamberlen
[rewrite_local]
^https:\/\/dict\.eudic\.net\/jingting\/GetThisChapterTaskStatus? url script-response-body mryy.js

mitm = dict.eudic.net
*/
let obj = JSON.parse($response.body);
obj={
 "word_count": 211,
 "task_date": "2020-01-23",
 "tasks": [
  {
   "id": "caac118b-3d0e-11ea-8356-00505686c5e6",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": 0,
   "optional": false,
   "finish_star": 0,
   "user_task": null,
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": {
    "update_time": "2020-01-22T16:47:28Z",
    "action_data": null,
    "item_type": 0,
    "file_size": 139048,
    "content_update_time": "2020-01-22T16:47:26Z",
    "download_count": 597,
    "has_translation": false,
    "book_id": null,
    "child_count": 0,
    "author_info": null,
    "source_url": "https://dict.eudic.net/webting/play?id=e5c67699-32bb-4a2c-b015-dd0f4d41df23&token=QYN+eyJ0b2tlbiI6IiIsInVzZXJpZCI6IiIsInVybHNpZ24iOiJvdVYzTnRtQThjZURqcVZ1WVRyMEFCSG81UkE9IiwidCI6IkFCSU1UVTVPVFUyTVRJNU5BPT0ifQ%3D%3D",
    "duration": 125100,
    "has_prePlay": false,
    "finish_button": 0,
    "uuid": "e5c67699-32bb-4a2c-b015-dd0f4d41df23",
    "meta": null,
    "sort_time": "2018-12-23T14:25:17Z",
    "create_time": "2020-01-23T11:58:00Z",
    "secondary_title": null,
    "user_purchase_status": 1,
    "liked": null,
    "has_audio": true,
    "image_url_origin": "http://static.frdic.com/MediaPool/e5c67699-32bb-4a2c-b015-dd0f4d41df23/data/2f0d622a-99b1-4fb7-89e9-af8d23795ca0.jpg?stamp=1579740448205",
    "parent_title": null,
    "item_action": 0,
    "purchase_type": 256,
    "tags": [],
    "excerpt": "",
    "show_transition": false,
    "log_type": null,
    "image_url_thumbnail": "http://static.frdic.com/MediaPool/e5c67699-32bb-4a2c-b015-dd0f4d41df23/index.png?stamp=1579740448205",
    "parent_uuid": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
    "scm": "",
    "title": "人体温度下降了吗?",
    "media_type": 0,
    "force_display_title": false,
    "primary_title": null,
    "specialtitle": null,
    "pre_playType": 0,
    "language": "en"
   },
   "lang": "en",
   "chapter_index": 403,
   "hidden": false,
   "task_type": 0,
   "update_time": "/Date(1579708800000)/",
   "task_meta": {
    "info": {
     "major_title": "今日阅读",
     "anchor": null,
     "chapter_task_module_meta": null,
     "word_count": 211,
     "source": "Scientific American（科学美国人）",
     "group_name": "默认分组",
     "title": "共211词 时长2分5秒",
     "chapter_info": {
      "id": "caac118b-3d0e-11ea-8356-00505686c5e6",
      "title": "",
      "source": null,
      "cover_picture": "",
      "groups": [],
      "seed": 0
     },
     "exam": null,
     "icon": "https://static.eudic.net/web/jingtingcourse/home_icon_nor_3.png",
     "cover_picture": null,
     "duration": null,
     "media_id": "e5c67699-32bb-4a2c-b015-dd0f4d41df23",
     "special_page": 0
    }
   }
  },
  {
   "id": "08fa3ae8-3d0f-11ea-8356-00505686c5e6",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": 10,
   "optional": false,
   "finish_star": 0,
   "user_task": null,
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": {
    "update_time": "2020-01-22T14:51:22Z",
    "action_data": null,
    "item_type": 0,
    "file_size": 28165954,
    "content_update_time": "2020-01-22T14:51:22Z",
    "download_count": 934,
    "has_translation": false,
    "book_id": null,
    "child_count": 0,
    "author_info": null,
    "source_url": "https://dict.eudic.net/webting/play?id=dd5d62e6-aff4-4055-b3d3-d8ae1d31ba98&token=QYN+eyJ0b2tlbiI6IiIsInVzZXJpZCI6IiIsInVybHNpZ24iOiIwTW90T1FnSTl0dEFUd1hJY2ZxaDdFb3dVRVE9IiwidCI6IkFCSU1UVTVPVFUyTVRJNU5BPT0ifQ%3D%3D",
    "duration": 1171880,
    "has_prePlay": false,
    "finish_button": 0,
    "uuid": "dd5d62e6-aff4-4055-b3d3-d8ae1d31ba98",
    "meta": null,
    "sort_time": "2018-12-23T14:15:17Z",
    "create_time": "2020-01-23T11:59:00Z",
    "secondary_title": null,
    "user_purchase_status": 1,
    "liked": null,
    "has_audio": true,
    "image_url_origin": "http://static.frdic.com/MediaPool/ChannelImg/bab580e0-89c9-4a44-b93c-15e046cb74d7.jpg?stamp=1579721700000",
    "parent_title": null,
    "item_action": 0,
    "purchase_type": 256,
    "tags": [],
    "excerpt": "",
    "show_transition": false,
    "log_type": null,
    "image_url_thumbnail": "http://static.frdic.com/MediaPool/ChannelImg/bab580e0-89c9-4a44-b93c-15e046cb74d7.jpg?stamp=1579721700000",
    "parent_uuid": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
    "scm": "",
    "title": "Are Human Body Temperatures Cooling Down?",
    "media_type": 0,
    "force_display_title": false,
    "primary_title": null,
    "specialtitle": null,
    "pre_playType": 0,
    "language": "en"
   },
   "lang": "en",
   "chapter_index": 403,
   "hidden": false,
   "task_type": 1,
   "update_time": "/Date(1579708800000)/",
   "task_meta": {
    "info": {
     "major_title": "今日讲义",
     "anchor": "Coco",
     "chapter_task_module_meta": null,
     "word_count": 0,
     "source": null,
     "group_name": "默认分组",
     "title": "主讲Coco 时长19分31秒",
     "chapter_info": {
      "id": "08fa3ae8-3d0f-11ea-8356-00505686c5e6",
      "title": "",
      "source": null,
      "cover_picture": "",
      "groups": [],
      "seed": 0
     },
     "exam": null,
     "icon": "https://static.eudic.net/web/jingtingcourse/home_ab_nor_3.png",
     "cover_picture": null,
     "duration": null,
     "media_id": "dd5d62e6-aff4-4055-b3d3-d8ae1d31ba98",
     "special_page": 0
    }
   }
  },
  {
   "id": "71959034-3d0f-11ea-8356-00505686c5e6",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": 20,
   "optional": false,
   "finish_star": 0,
   "user_task": null,
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": {
    "update_time": null,
    "action_data": null,
    "item_type": 0,
    "file_size": 0,
    "content_update_time": null,
    "download_count": 0,
    "has_translation": false,
    "book_id": null,
    "child_count": 0,
    "author_info": null,
    "source_url": "https://dict.eudic.net/jingting/jingtingexam?bookId=eeff71eb-a9df-4c18-869c-bebdab02f85a&userId=00000000-0000-0000-0000-000000000000&dayIndex=0&token=OTdDYAhHNIKNTaLy74%2f4ru9FnuY%3d&timezone=8&periodsIndex=0&taskid=71959034-3d0f-11ea-8356-00505686c5e6&tasktype=Exam_Choice",
    "duration": 0,
    "has_prePlay": false,
    "finish_button": 0,
    "uuid": "00000000-0000-0000-0000-000000000000",
    "meta": null,
    "sort_time": null,
    "create_time": null,
    "secondary_title": null,
    "user_purchase_status": 1,
    "liked": null,
    "has_audio": false,
    "image_url_origin": null,
    "parent_title": null,
    "item_action": 5,
    "purchase_type": 0,
    "tags": [],
    "excerpt": null,
    "show_transition": false,
    "log_type": null,
    "image_url_thumbnail": null,
    "parent_uuid": null,
    "scm": "",
    "title": null,
    "media_type": 0,
    "force_display_title": false,
    "primary_title": null,
    "specialtitle": null,
    "pre_playType": 0,
    "language": null
   },
   "lang": "en",
   "chapter_index": 403,
   "hidden": false,
   "task_type": 2,
   "update_time": "/Date(1579708800000)/",
   "task_meta": {
    "info": {
     "major_title": "选择题",
     "anchor": null,
     "chapter_task_module_meta": null,
     "word_count": null,
     "source": null,
     "group_name": "默认分组",
     "title": "测试对今日阅读的理解",
     "chapter_info": {
      "id": "71959034-3d0f-11ea-8356-00505686c5e6",
      "title": "",
      "source": null,
      "cover_picture": "",
      "groups": [],
      "seed": 0
     },
     "exam": {
      "Blanks": [],
      "Mp3Url": "",
      "MultipleChoices": [
       {
        "Choices": [
         {
          "Content": "obsolete;",
          "IsCorrect": true
         },
         {
          "Content": "stylish;",
          "IsCorrect": false
         },
         {
          "Content": "updated;",
          "IsCorrect": false
         }
        ],
        "Question": "The word “OUTDATED” in paragraph 1 is closest in meaning to:",
        "CorrectScore": 0,
        "IncorrectScore": 0,
        "Explain": "正确答案：A。“OUTDATED” means to be out of date and obsolete, “过时的”。与B选项（时尚的）、C选项（更新的）无关，因此，正确答案就是A选项。",
        "Id": "df04767f-fa02-4b6c-88a4-0077dd9d297b"
       },
       {
        "Choices": [
         {
          "Content": "body temperatures among American men were a degree F lower than American women;",
          "IsCorrect": false
         },
         {
          "Content": "Civil War soldiers and veterans have steadily raised over time and so do American women;",
          "IsCorrect": false
         },
         {
          "Content": "body temperatures among American men and women both run more than a degree F lower;",
          "IsCorrect": true
         }
        ],
        "Question": "According to the passage, Stanford University researchers confirmed that:",
        "CorrectScore": 0,
        "IncorrectScore": 0,
        "Explain": "正确答案：C。根据原文段二，我们不难发现数据表明美国男性及女性的平均体温均降低了一华氏度，97.5 degrees F。原文并未在男性和女性体温间做比较，因此，正确答案就是C选项。",
        "Id": "bf403985-2004-415e-bed0-fbac5d521c04"
       },
       {
        "Choices": [
         {
          "Content": "Remaining in the unchangeable surroundings;",
          "IsCorrect": false
         },
         {
          "Content": "Indoor temperature controls;",
          "IsCorrect": false
         },
         {
          "Content": "A more sanitary way of life;",
          "IsCorrect": true
         }
        ],
        "Question": "Based on the narratives in paragraph 3, which one of the following couldn’t cause the apparent temperature drop?",
        "CorrectScore": 0,
        "IncorrectScore": 0,
        "Explain": "正确答案：C。根据原文段三内容，我们不难找出相关的影响因素， “the process of altering our surroundings” “a combination of factors, including warmer clothing, indoor temperature controls, a more sedentary way of life and… a decline in infectious diseases.” 因此，可排除C选项。",
        "Id": "eb4ff577-304e-45d3-bd0a-4967b2b4fbb1"
       }
      ],
      "ExamType": 1,
      "MultipleChoicesExtra": {
       "IsNeedMp3": true,
       "Mp3Url": null,
       "SourceText": null
      },
      "ReadingComprehension": {
       "Choices": [],
       "IsNeedMp3": false,
       "Mp3Url": "",
       "SourceText": ""
      },
      "Composition": {
       "Answer": null,
       "Question": null,
       "Explain": null,
       "ImgUrl": null,
       "Id": "00000000-0000-0000-0000-000000000000"
      },
      "Count": 3,
      "Pronounces": []
     },
     "icon": "https://static.eudic.net/web/jingtingcourse/home_book_nor_3.png",
     "cover_picture": null,
     "duration": null,
     "media_id": null,
     "special_page": 0
    }
   }
  },
  {
   "id": "b4073404-3d0f-11ea-8356-00505686c5e6",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": 49,
   "optional": true,
   "finish_star": 0,
   "user_task": null,
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": {
    "update_time": null,
    "action_data": null,
    "item_type": 0,
    "file_size": 0,
    "content_update_time": null,
    "download_count": 0,
    "has_translation": false,
    "book_id": null,
    "child_count": 0,
    "author_info": null,
    "source_url": "https://dict.eudic.net/jingting/jingtingexam?bookId=eeff71eb-a9df-4c18-869c-bebdab02f85a&userId=00000000-0000-0000-0000-000000000000&dayIndex=0&token=OTdDYAhHNIKNTaLy74%2f4ru9FnuY%3d&timezone=8&periodsIndex=0&taskid=b4073404-3d0f-11ea-8356-00505686c5e6&tasktype=Exam_Pronounce",
    "duration": 0,
    "has_prePlay": false,
    "finish_button": 0,
    "uuid": "00000000-0000-0000-0000-000000000000",
    "meta": null,
    "sort_time": null,
    "create_time": null,
    "secondary_title": null,
    "user_purchase_status": 1,
    "liked": null,
    "has_audio": false,
    "image_url_origin": null,
    "parent_title": null,
    "item_action": 14,
    "purchase_type": 0,
    "tags": [],
    "excerpt": null,
    "show_transition": false,
    "log_type": null,
    "image_url_thumbnail": null,
    "parent_uuid": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
    "scm": "",
    "title": null,
    "media_type": 0,
    "force_display_title": false,
    "primary_title": null,
    "specialtitle": null,
    "pre_playType": 0,
    "language": null
   },
   "lang": "en",
   "chapter_index": 403,
   "hidden": false,
   "task_type": 3,
   "update_time": "/Date(1579708800000)/",
   "task_meta": {
    "info": {
     "major_title": "跟读",
     "anchor": null,
     "chapter_task_module_meta": null,
     "word_count": null,
     "source": null,
     "group_name": "默认分组",
     "title": "模仿跟读今日语句",
     "chapter_info": {
      "id": "b4073404-3d0f-11ea-8356-00505686c5e6",
      "title": "",
      "source": null,
      "cover_picture": "",
      "groups": [],
      "seed": 0
     },
     "exam": {
      "Blanks": [],
      "Mp3Url": "",
      "MultipleChoices": [],
      "ExamType": 0,
      "MultipleChoicesExtra": {
       "IsNeedMp3": true,
       "Mp3Url": null,
       "SourceText": null
      },
      "ReadingComprehension": {
       "Choices": [],
       "IsNeedMp3": false,
       "Mp3Url": "",
       "SourceText": ""
      },
      "Composition": {
       "Answer": null,
       "Question": null,
       "Explain": null,
       "ImgUrl": null,
       "Id": "00000000-0000-0000-0000-000000000000"
      },
      "Count": 3,
      "Pronounces": [
       {
        "OriginMp3Name": "http://static.frdic.com/MediaPool/e5c67699-32bb-4a2c-b015-dd0f4d41df23/data/jt/a6ac5ca6-3fb8-4f0d-a3d1-d8690187486920200122200705.mp3?stamp=1579740448205",
        "OriginText": " But a new study in eLife argues that that number is outdated. ",
        "Translation": "",
        "Timestamp": "[00:00:15.839],[00:00:22.789]",
        "Id": "2a803f60-50a9-4dc9-958e-069f1486bc4d"
       },
       {
        "OriginMp3Name": "http://static.frdic.com/MediaPool/e5c67699-32bb-4a2c-b015-dd0f4d41df23/data/jt/ae1f13cd-6e73-42d5-9be4-109b3638bcf320200122200705.mp3?stamp=1579740448205",
        "OriginText": "The study suggests that in the process of altering our surroundings, ",
        "Translation": "",
        "Timestamp": "[00:01:25.939],[00:01:35.629]",
        "Id": "5df8cbc7-3f57-4662-aba2-606ff493baa8"
       },
       {
        "OriginMp3Name": "http://static.frdic.com/MediaPool/e5c67699-32bb-4a2c-b015-dd0f4d41df23/data/jt/77e5f007-1371-4d24-83b3-a28c6e39f15820200122200705.mp3?stamp=1579740448205",
        "OriginText": " we have also altered ourselves, says senior author Julie Parsonnet of Stanford. ",
        "Translation": "",
        "Timestamp": "[00:01:35.629],[00:01:40.670]",
        "Id": "f95146e5-9fe0-4443-9728-57d0d0f5a568"
       }
      ]
     },
     "icon": "https://static.eudic.net/web/jingtingcourse/jt_gendu.png",
     "cover_picture": null,
     "duration": null,
     "media_id": "e5c67699-32bb-4a2c-b015-dd0f4d41df23",
     "special_page": 0
    }
   }
  },
  {
   "id": "237d4519-3d0f-11ea-8356-00505686c5e6",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": -10,
   "optional": true,
   "finish_star": 0,
   "user_task": null,
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": {
    "update_time": null,
    "action_data": null,
    "item_type": 0,
    "file_size": 0,
    "content_update_time": null,
    "download_count": 0,
    "has_translation": false,
    "book_id": null,
    "child_count": 0,
    "author_info": null,
    "source_url": null,
    "duration": 0,
    "has_prePlay": false,
    "finish_button": 0,
    "uuid": "00000000-0000-0000-0000-000000000000",
    "meta": null,
    "sort_time": null,
    "create_time": null,
    "secondary_title": null,
    "user_purchase_status": 1,
    "liked": null,
    "has_audio": false,
    "image_url_origin": "https://static.eudic.net/jingting/xwz/0f96e9a5-8772-4b05-91ef-84f6c9646e2d.jpg",
    "parent_title": null,
    "item_action": 0,
    "purchase_type": 0,
    "tags": [],
    "excerpt": null,
    "show_transition": false,
    "log_type": null,
    "image_url_thumbnail": null,
    "parent_uuid": null,
    "scm": "",
    "title": "",
    "media_type": 0,
    "force_display_title": false,
    "primary_title": null,
    "specialtitle": null,
    "pre_playType": 0,
    "language": null
   },
   "lang": "en",
   "chapter_index": 403,
   "hidden": true,
   "task_type": -1,
   "update_time": "/Date(1579708800000)/",
   "task_meta": {
    "info": {
     "major_title": "默认标题",
     "anchor": null,
     "chapter_task_module_meta": null,
     "word_count": null,
     "source": null,
     "group_name": "默认分组",
     "title": "",
     "chapter_info": {
      "id": "237d4519-3d0f-11ea-8356-00505686c5e6",
      "title": "",
      "source": null,
      "cover_picture": "https://static.eudic.net/jingting/xwz/0f96e9a5-8772-4b05-91ef-84f6c9646e2d.jpg",
      "groups": [],
      "seed": 0
     },
     "exam": {
      "Blanks": [],
      "Mp3Url": "",
      "MultipleChoices": [],
      "ExamType": 0,
      "MultipleChoicesExtra": {
       "IsNeedMp3": true,
       "Mp3Url": null,
       "SourceText": null
      },
      "ReadingComprehension": {
       "Choices": [],
       "IsNeedMp3": false,
       "Mp3Url": "",
       "SourceText": ""
      },
      "Composition": {
       "Answer": null,
       "Question": null,
       "Explain": null,
       "ImgUrl": null,
       "Id": "00000000-0000-0000-0000-000000000000"
      },
      "Count": 0,
      "Pronounces": []
     },
     "icon": "https://static.eudic.net/web/jingtingcourse/home_icon_nor_3.png",
     "cover_picture": null,
     "duration": null,
     "media_id": null,
     "special_page": 0
    }
   }
  },
  {
   "id": "bb3a1673-e7e6-481a-be3e-1708e06213c9",
   "newVersion": false,
   "finished": true,
   "total_score": 0,
   "task_order": 50,
   "optional": true,
   "finish_star": 1,
   "user_task": {
    "id": "e85d37f6-4cd6-11e9-94cd-00505686c5e6",
    "total_score": 0,
    "period_index": 0,
    "finished": true,
    "chapter_in_period": 0,
    "finish_star": 1,
    "user_id": "00000000-0000-0000-0000-000000000000",
    "task_id": "00000000-0000-0000-0000-000000000000",
    "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
    "meta": "",
    "lang": "en",
    "timezone": 8,
    "chapter_index": 34,
    "task_type": 5,
    "update_time": "/Date(1553282156000)/",
    "task_status": 0
   },
   "book_id": "eeff71eb-a9df-4c18-869c-bebdab02f85a",
   "task_action": null,
   "lang": "en",
   "chapter_index": 403,
   "hidden": true,
   "task_type": 5,
   "update_time": "/Date(1579708800000)/",
   "task_meta": null
  }
 ],
 "finished_time": "/Date(1553282156000)/",
 "word_list_name": null,
 "checkin_type": 0,
 "day_index": 0,
 "title": "人体温度下降了吗?",
 "source": "Scientific American（科学美国人）",
 "is_shared": true,
 "word_list_module_id": null,
 "word_list_item_action": 0,
 "normal_finished": true,
 "cover_picture": "https://static.eudic.net/jingting/xwz/0f96e9a5-8772-4b05-91ef-84f6c9646e2d.jpg",
 "finish_star": 1,
 "finished": true,
 "groups": [
  "默认分组"
 ]
}
$done({body: JSON.stringify(obj)})
