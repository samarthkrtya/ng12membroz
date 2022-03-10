import Organizationsetting from '../models/organizationsetting.model';

function loadGlobal(){

    Organizationsetting.findOne({})
        .then((organization) => {
            // console.log(organization)
            global.MEMBERSHIPIDFORMAT = organization.membershipidformat;
            global.PROPERTY = organization.property;
            global.STARTINGNUMBER = organization.startingnumber;
            global.MEMBERUSERNAME = organization.memberusername;
            global.USERNAMEFORMAT = organization.usernameformat;
            global.TIMEZONEOFFSET = -330;
            global.CALENDARWEEK = organization.calendarweek;
            global.BILLFORMAT = organization.docformat;
            global.SENDGRID_API_KEY = organization.sendgridkey;
            global.WHATSAPP_CONFIG = organization.whatsappconfig;
            global.SMS_GATEWAY = organization.smsgateway;
            global.MEMBER_LOGIN_FIELD = organization.memberloginproperty;
            global.USER_LOGIN_FIELD = organization.userloginproperty;
            global.FROM_EMAILS = organization.fromemail; 
            global.REPLY_EMAILS = organization.replyemail;
            global.ANDROID_AUTHORIZATION_KEY = organization.androidPushNotificationAuthorizationKey;
            global.IOS_OPTIONS = organization.iosPushNotificationOptions;
            global.IOS_TOPICS = organization.iosPushNotificationtopic;
            global.ROOTURL = "";
            global.WEBURL = organization.weburl;
            global.DATABASETYPE= organization.databasetype;
            global.MEMBERROLE= organization.memberrole;
            global.SECURITY= organization.systemsecurity;

    }); 
 
}
 
function checkiprestriction(ipAddress){
    var ipinclusion = global.SECURITY ? global.SECURITY.ipinclusion : []
    var result = false;    
    if (ipinclusion && ipinclusion.length > 0) {
        ipinclusion.forEach(ip => {            
            if (ip.ip==ipAddress){
               // console.log(ip, ipAddress)
                result = true;    
                return result;              
            } 
            else if (ip.ip=="0.0.0.0"){
                result = true;   
                return result;  
            }
        }); 
        return result;
    }
    else {
        result = true;      
        return result;
    }    
}



export default { loadGlobal, checkiprestriction }
