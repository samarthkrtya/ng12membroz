const fs = require('fs');

module.exports = {
  gethtml,
  gettemplatehtml
}

const createFooter = (footer, document, branch) => `
      ${regexrep(footer, document, branch)}
    `
const createHeader = (header, document, branch) => `
      ${regexrep(header, document, branch)}
    `
/**
 * Take an object which has the following model
 * @param {Object} item
 * @model
 * {
 *   "invoiceId": `Number`,
 *   "createdDate": `String`,
 *   "dueDate": `String`,
 *   "address": `String`,
 *   "companyName": `String`,
 *   "invoiceName": `String`,
 *   "price": `Number`, 
 * }
 *
 * @returns {String}
 */
const createRow = (item, branch) => {
var html; 
var currency = branch.currency ? branch.currency : "USD";
var locale = branch.locale ? branch.locale : "en-US";

if(item && item.item.property &&  item.item.property.bookingids && item.item.property.bookingids.length > 0) {
  html = `
    <tr class="break-row-inside break-row-after">
    <td style="padding: 10px 5px 10px 5px;" class="print-table-td text-break text-center align-top" >${item.srno}</td>
    <td  style="padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" > ${item.item.property.packageid.membershipname}
    </td>
    <td colspan="5" style="padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(item.totalcost)}</td>
    </tr>   <tr class="break-row-inside break-row-after">
    <td colspan="7" style="border-bottom: 1px solid #aaaaaa;">
     <table class="print-company" width="100%" cellspacing="0" border="0">`;
  item.item.property.bookingids.forEach(ele => {
    html +=  `<tr>
              <td style="padding: 5px 5px 10px 5px;" class="print-table-td text-break text-center align-top" >&nbsp;</td>
              <td   style="padding: 5px 5px 10px 5px;vertical-align: top;width:108px;" >
                  <div class="attend-holiday-box min-width-108 text-center"> 
                    <div class="font-14 text-nowrap" >${ele.bookingid.timeslot.starttime} - ${ele.bookingid.timeslot.endtime} </div> 
                  </div>
                </td>
                <td  style="padding: 5px 5px 10px 5px;vertical-align: top;">
                    <div> ${ele.bookingid.refid.title}
                    </div>
                </td>
             </tr>`
    });
  html += `</table>
  </td></tr>` ;
  }else{

  html = `<tr class="break-row-inside break-row-after">
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-center align-top" >${item.srno}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" >
      ${item.item.itemname}
      <div style="font-size:14px;font-weight: bold;">${item['membershipname'] ? item['membershipname'] : ''}</div>
    </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.quantity}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.rate ? item.rate : item.cost}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.discount ?  item.discount  : ''}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.taxamount ? item.taxamount : ''}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${item.totalcost}</td>
    </tr>
  ` 
  
  }
 return html;
};

const createTaxRow = (taxdetail ,branch) => {
  var tax ='';
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";
  for(var prop in taxdetail){
    tax +=  `
    <tr >
    <td style="width: 81%;padding: 5px 5px 5px 5px;" class="align-middle text-right">Tax
      <span class="text-right" style="font-size: 12px;"> ${prop} </span></td>
    <td style="width: auto;padding: 10px 5px 10px 5px;" class="align-middle text-right">${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(taxdetail[prop])} </td>
    </tr>
  `
  }
  return tax;

};

const createOutstanding = (paidoutstanding, billpayment) => {
  var html;
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";
  
  html = ` <tr >
      <td style="width: 81%;padding: 5px 5px 5px 5px;" class="align-middle text-right"> Outstanding Payment
      </td>
      <td style="width: auto;padding: 10px 5px 10px 5px;" class="align-middle text-right"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(paidoutstanding)}</td>
      </tr>
      <tr >
      <td style="width: 81%;padding: 5px 5px 5px 5px;" class="align-middle text-right"> Total Payment
      </td>
      <td style="width: auto;padding: 10px 5px 10px 5px;" class="align-middle text-right">${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(billpayment)}</td>
      </tr>
    `;
    return html;
  }


const createSubRow = (subdetail, branch) => {
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";

  var detail ='';
  subdetail.forEach(element => {
    for(var prop in element){
      detail +=  `
      <tr >
      <td style="width: 81%;padding: 5px 5px 5px 5px;" class="align-middle text-right"> ${prop}
      </td>
      <td style="width: auto;padding: 10px 5px 10px 5px;" class="align-middle text-right"> ${new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(element[prop])}</td>
      </tr>
    `
    }
  });

  return detail;

};

/**
 * @description Generates an `html` table with all the table rows
 * @param {String} rows
 * @returns {String}
 */
const createTable = (rows, headers) => `
  <table style="width:100%;margin-top:20px;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
  <thead>
    <tr class="table-print-head-row">
      <th style="padding: 5px 5px 5px 5px;width: 6%;text-align: center;"  class="table-print-head text-break"> # </th>
      <th style="padding: 5px 5px 5px 5px;width:auto;text-align: left;"  class="table-print-head text-break"> Item &amp; Description </th>
      <th style="padding: 5px 5px 5px 5px;width: 11%;text-align: right;"  class="table-print-head text-break"> Qty </th>
      <th style="padding: 5px 5px 5px 5px;width: 13%;text-align: right;"  class="table-print-head text-break"> Rate </th>
      <th style="padding: 5px 5px 5px 5px;width: 13%;text-align: right;"  class="table-print-head text-break"> Discount </th>
      <th style="padding: 5px 5px 5px 5px;width: 13%;text-align: right;"  class="table-print-head text-break"> Tax </th>
      <th style="padding: 5px 10px 5px 5px;width: 18%;text-align: right;"  class="table-print-head text-break"> Amount </th>
    </tr>
  </thead>
  <tbody >
    ${rows}
  </tbody>
  </table>
`;

const createBillsubTable = (rows, subdetail,paidoutstanding) => `
  <div style="text-align: right;">
  <div style="width: 100%;">
  <table class="print-company" width="100%" cellspacing="0" border="0">
    <tbody>
      ${rows}
      </tr>
      <tr>
      ${subdetail}
      </tr>
      <tr>
      ${paidoutstanding}
      </tr>
    </tbody>
  </table>
  </div>
  </div>
`;
  
 


/**
 * @description Generate an `html` page with a populated table
 * @param {String} table
 * @returns {String}
 */
const createHtml = (header, table,  subtable, footer) => `
      ${header}
      ${table} 
      ${subtable}
      ${footer}
`;

function gethtml(template, document, branch) {
  /* generate rows */
  var data = []; 
  
  if (document.items)
    data = document.items;
  else 
    data = [document]

  if (document.item && document.item.paymentterms)
  {
    data[0]['membershipname'] = document.item.paymentterms.membershipid.membershipname;
  }

  var taxes = document.taxdetail;
  var subdetail = document.subdetail;

  if (template.template) template = template.template;
  const rows = data.map(a=> createRow(a,branch)).join('');
  /* generate table */
  const header = createHeader(template.header, document, branch);
  const footer = createFooter(template.footer, document, branch);

  const table = createTable(rows);
  const taxrows = createTaxRow(taxes,branch);
  const subdetails = createSubRow(subdetail ,branch);
  var outstanding  = document.property ? document.property.outstandingamount : 0;
  var paidoutstanding = '', billpayment;
  if (outstanding > 0) {
    billpayment = document.paidamount + outstanding;
    paidoutstanding = createOutstanding(outstanding, billpayment ,branch);
  }

  const subtable = createBillsubTable(taxrows, subdetails, paidoutstanding);
  /* generate html */
  var html = createHtml(header, table, subtable, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}

function gettemplatehtml(template, document, branch) {
  return regexrep(template.content, document, branch);
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
