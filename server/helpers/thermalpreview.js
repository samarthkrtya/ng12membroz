
const createHeader = (header, document, branch) => `${regexrep(header, document, branch)}`
const createFooter = (footer, document, branch) => `${regexrep(footer, document, branch)}`



const createRow2 = (item , branch) =>{
  var html;
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";
  
  if(item.item.property &&  item.item.property.bookingids && item.item.property.bookingids.length > 0) {
    html =  `<div style="margin-top: 10px; border-top: 1px solid #000000;border-bottom: 1px solid #000000;padding-bottom: 10px;margin-bottom: 10px;"> 
    <div style="margin-bottom: 10px;display: flex;">
      <div class="print-head-sm" style="font-weight: bold;flex-grow: 1;">${item.item.itemname}</div>
      <div class="print-head-sm" style="padding-left: 25px;font-weight: bold;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(item.totalcost)}   </div>
    </div>
 `
 item.item.property.bookingids.forEach(ele => {
    html +=  `  <div style="margin-bottom: 15px;">
    <div class="print-head-sm" style="font-weight: bold;" >${ele.bookingid.refid.title}</div>
    <div class="print-text" style="font-weight: bold;margin-bottom: 3px;">${new Intl.DateTimeFormat(locale, branch.timezone).format(ele.bookingid.appointmentdate)}</div>
    <div class="print-text"><span style="display: inline-block;padding-right: 10px;margin-bottom: 2px;">Duration:</span> ${ele.bookingid.refid.duration} minutes</div>
    <div class="print-text"><span style="display: inline-block;padding-right: 10px;margin-bottom: 2px;">Employee:</span> ${ele.bookingid.host.fullname} </div>
    <div class="print-text"><span style="display: inline-block;padding-right: 10px;">Booking #:</span> ${ele.bookingid.prefix} - ${ele.bookingid.number}</div>
    </div>`;
});
 html +=  `</div>`;
  }else{
    html =  `<div style="margin-top: 10px; border-top: 1px solid #000000;padding-bottom: 10px;margin-bottom: 10px;"> 
    <div style="margin-bottom: 10px;display: flex;">
      <div class="print-head-sm" style="font-weight: bold;flex-grow: 1;">${item.item.itemname}</div>
      <div class="print-head-sm" style="padding-left: 25px;font-weight: bold;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(item.totalcost)}  </div>
    </div>
  </div>`
  }
  return html;
}
 
 

const  createSummary = (document , branch) => {
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";
  
 return  ` 
<div style="border-bottom: 1px solid #000000;padding-bottom: 10px;margin-bottom: 10px;">
<div style="text-align: right;margin-top: 25px;">
<div class="${!document.amount ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;font-weight: bold;">Sub Total:</div>
  <div class="print-text" style="padding-left: 20px;font-weight: bold;width: 35%; text-align: right;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.amount)} </div>
</div>
<div class="${!document.discount ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;font-weight: bold;">Discount:</div>
  <div class="print-text" style="padding-left: 20px;font-weight: bold;width: 35%; text-align: right;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.discount)}  </div>
</div>
<div class="${!document.taxamount ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;font-weight: bold;">Tax:</div>
  <div class="print-text" style="padding-left: 20px;font-weight: bold;width: 35%; text-align: right;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.taxamount)}  </div>
</div>
<div class="${!document.totalamount ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;font-weight: bold;">Total:</div>
  <div class="print-text" style="padding-left: 20px;font-weight: bold;width: 35%; text-align: right;"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.totalamount)}  </div>
</div>
<div class="${!document.paidamount ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;">Amount Paid:</div>
  <div class="print-text" style="padding-left: 20px;width: 35%; text-align: right;">  ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.paidamount)}    </div>
</div>
<div class="${!document.balance ? 'd-none' : ''}" style="margin-bottom: 2px;display: flex;">
  <div class="print-text" style="width: 65%;font-weight: bold;">Balance Due:</div>
  <div class="print-text" style="padding-left: 20px;font-weight: bold;width: 35%; text-align: right;">  ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(document.balance)} </div>
</div>
</div>
</div>`}
  
 
const createHtml = (header, table,  subtable, footer) => `
      ${header}
      ${table} 
      ${subtable}
      ${footer}
`;

function gethtml(template, document, branch) {
  var data = document.items;
  if (template.template) template = template.template;
  const header = createHeader(template.thermalheader, document, branch);
  const footer = createFooter(template.thermalfooter, document, branch);
  const table = data.map(a=> createRow2(a,branch)).join('');
  const summary = createSummary(document,branch);
  var html = createHtml(header, table, summary, footer);
  html = html.replace(/\r?\n|\r/g, "");
  return html;
}


function regexrep(str, element, branch) {

  var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg; // Changes in REGEX
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";

  str.replace(shortcode_regex, function (match, code) {

    var replace_str = match.replace('[{', '');
    replace_str = replace_str.replace('}]', '');
    var original = replace_str;
    var datatype;

    if(replace_str.startsWith("DATE@")) {
      datatype = "Date";
      replace_str = replace_str.substring("DATE@".length)
    } else if(replace_str.startsWith("DATESTRING@")) {
      datatype = "Datestring"
      replace_str = replace_str.substring("DATESTRING@".length)
    } else if(replace_str.startsWith("CURRENCY@")) {
      datatype = "Currency"
      replace_str = replace_str.substring("CURRENCY@".length)
    }
    else if(replace_str.startsWith("DATETIME@")) {
      datatype = "Datetime"
      replace_str = replace_str.substring("DATETIME@".length)
    }
    else if(replace_str.startsWith("TIME@")) {
      datatype = "Time"
      replace_str = replace_str.substring("TIME@".length)
    }

    var db_fieldValue;
    var fieldnameSplit = replace_str.split('.');

    if (fieldnameSplit[3]) {
      if (element[fieldnameSplit[0]]) {
        var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
        db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[2]) {
      if (element[fieldnameSplit[0]]) {
        var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
        db_fieldValue = obj[fieldnameSplit[2]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[1]) {
      if (element[fieldnameSplit[0]]) {
        db_fieldValue = element[fieldnameSplit[0]][fieldnameSplit[1]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[0]) {
      if (element[fieldnameSplit[0]]) {
        db_fieldValue = element[fieldnameSplit[0]];
      } else {
        db_fieldValue = '';
      }

    }

    if (datatype && datatype.toLowerCase() == "currency") {
      db_fieldValue = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(db_fieldValue);
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "date") {
      var db_fieldValue = new Date(db_fieldValue);
      var options = {
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "datestring") {
      db_fieldValue = new Date(db_fieldValue);
      var options = {
        timeZone: branch.timezone,
        dateStyle: 'long'
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "datetime") {
      var db_fieldValue = new Date(db_fieldValue);
      var options = {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "time") {
      var db_fieldValue = new Date(db_fieldValue);
      var options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    str = str.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '-');

  });


  return str;

}


module.exports = { gethtml }