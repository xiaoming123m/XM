/*
^https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$ url script-response-body fantastical.js
hostname=api.flexibits.com
*/

const path1="device";
const path2="details";
const path3="appstore-receipt";
let url=$request.url;
let obj=JSON.parse($response.body);

if(url.indexOf(path1)!=-1){

  obj.subscription.autorenew=true;
  obj.subscription.expiration="2099-02-01T16:49:37Z";
  obj.subscription.expires="2099-02-01T16:49:37Z";
  obj.scope=["notify", "weather", "keyvalue-watch", "keyvalue-verification", "schedjoules", "scheduling", "account", "keyvalue", "fantastical"];

}


if(url.indexOf(path2)!=-1){

  obj.subscription.autorenew=true;
  obj.subscription.expiration="2099-02-01T16:49:37.000000Z";
  obj.subscription.subscription_type="AppStore";
  obj.subscription.is_expired=false;
  obj.subscription.trial=false;
    
}

if(url.indexOf(path3)!=-1){
	
	obj.autorenew=true;
	obj.expiration="2099-02-01T16:49:37.000000Z";
	obj.subscription_type="AppStore";
	obj.is_expired=false;
	obj.trial=false;
}

$done({body:JSON.stringify(obj)});