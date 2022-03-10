const fs = require('fs');

module.exports = {
  gethtml,
  getpaymenthtml,
  getpaymentinvoicehtml,
  gettourhtml,
  getworkshophtml,
  getbillhtml,
  getreporthtml,
  getreceipthtml,
  getpayrollhtml
}

const createFooter = (footer, branch, document) => `
      ${regexrep(footer, branch, document)}
    `
const createHeader = (header, branch, document) => `
      ${regexrep(header, branch, document)}
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
const createRow = (item) => `
  <tr class="break-row-inside break-row-after">
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-center align-top" > ${item.srno} </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" >
    ${item.item.itemname}
    </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.quantity}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.cost}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${item.cost}</td>
  </tr>
`;

const createBillRow = (item) => {
  return `
  <tr class="break-row-inside break-row-after">
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-center align-top" > 1 </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" >
    ${item.item.itemname}
    </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.quantity}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-right align-top">${item.cost}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${item.discount}</td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${item.totalcost}</td>
  </tr>
`};


const createTaxRow = (taxdetail) => {

  var tax ='';
  for(var prop in taxdetail){
    tax +=  `
    <tr >
    <td style="width: 81%;padding: 5px 5px 5px 5px;" class="align-middle text-right">Tax
      <span class="text-right" style="font-size: 12px;"> ${prop} </span></td>
    <td style="width: auto;padding: 10px 5px 10px 5px;" class="align-middle text-right">${taxdetail[prop]}</td>
    </tr>
  `
  }
  return tax;

};

const createPaymentRow = (item) => `
  <tr class="break-row-inside break-row-after">
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" >
    ${item.item.paymentterms.paymentitem.paymentitemname}
    </td>
    <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 10px 10px 5px;" class="print-table-td text-break text-right align-top">${item.amount}</td>
  </tr>
`;

const createPaymentInvoiceRow = (item) => `
  <tr>
    <td>${item.paymentterms.paymentitem.paymentitemname}</td>
    <td>${item.amount}</td>
  </tr>
`;
/**
 * @description Generates an `html` table with all the table rows
 * @param {String} rows
 * @returns {String}
 */
const createTable = (rows, headers) => `
  <table class='table'>
    <tr>
        <th>Item description</td>
        <th>Qty</td>
        <th>Rate</td>
        <th>Amount</td>
    </tr>
    ${rows}
  </table>
`;

const createBillTable = (rows, headers) => `
  <table style="width:100%;margin-top:20px;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
    <thead>
    <tr class="table-print-head-row">
    <th style="padding: 5px 5px 5px 5px;width: 6%;text-align: center;"  class="table-print-head text-break"> # </th>
    <th style="padding: 5px 5px 5px 5px;width:auto;text-align: left;"  class="table-print-head text-break"> Item &amp; Description </th>
    <th style="padding: 5px 5px 5px 5px;width: 11%;text-align: right;"  class="table-print-head text-break"> Qty </th>
    <th style="padding: 5px 5px 5px 5px;width: 13%;text-align: right;"  class="table-print-head text-break"> Rate </th>
    <th style="padding: 5px 5px 5px 5px;width: 13%;text-align: right;"  class="table-print-head text-break"> Discount </th>
    <th style="padding: 5px 10px 5px 5px;width: 18%;text-align: right;"  class="table-print-head text-break"> Amount </th>
  </tr>
  </thead>
    ${rows}
  </table>
`;

const createBillsubTable = (rows, amount, totalamount) => `
  <div style="text-align: right;">
  <div style="width: 100%;">
  <table class="print-company" width="100%" cellspacing="0" border="0">
    <tbody>
      ${rows}
      </tr>
      <tr>
        <td style="width: 81%;padding: 10px 5px 10px 5px;border-top: 1px solid #aaaaaa;border-bottom: 1px solid #aaaaaa;font-weight: bold;" class="align-middle text-right">Paid amount </td>
        <td style="width: auto;padding: 10px 5px 10px 5px;border-top: 1px solid #aaaaaa;border-bottom: 1px solid #aaaaaa;font-weight: bold;" class="align-middle text-right">${totalamount}</td>
      </tr>
    </tbody>
  </table>
  </div>
  </div>
`;


const createPaymentTable = (rows, headers) => `

  <table style="width:100%;margin-top:20px;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
    <thead>
    <tr class="table-print-head-row">
    <th style="padding: 5px 5px 5px 5px;width:auto;text-align: left;"  class="table-print-head text-break"> Particulars </th>
    <th style="padding: 5px 10px 5px 5px;width: 18%;text-align: right;"  class="table-print-head text-break"> Amount </th>
  </tr>
  </thead>
    ${rows}
  </table>
`;

/**
 * @description Generate an `html` page with a populated table
 * @param {String} table
 * @returns {String}
 */
const createHtml = (header, table, subtable, footer) => `
      ${header}
      ${table}
      ${subtable}
      ${footer}
`;



function groupDatas(bookingrecords){
  var finalDayArray = [] , finaltempArray = [] , i;
  bookingrecords.destinations.forEach(destn => {
      destn['types'] = 'destination';
      i = finaltempArray.indexOf(destn.day);
      if(i == -1){
        finalDayArray[finaltempArray.length] = [];
        finalDayArray[finaltempArray.length].push(destn);
        finaltempArray.push(destn.day);
      }else{
        finalDayArray[i].push(destn);
      }
  });
  bookingrecords.activity.forEach(actvt => {
      actvt['types'] = 'activity';
      i = finaltempArray.indexOf(actvt.day)
      if(i == -1){
        finalDayArray[finaltempArray.length] = [];
        finalDayArray[finaltempArray.length].push(actvt);
        finaltempArray.push(actvt.day);
      }else{
        finalDayArray[i].push(actvt);
      }
  });
  bookingrecords.transfer.forEach(transfe => {
    transfe['types'] = 'transfer';
      i = finaltempArray.indexOf(transfe.day)
      if(i == -1){
        finalDayArray[finaltempArray.length] = [];
        finalDayArray[finaltempArray.length].push(transfe);
        finaltempArray.push(transfe.day);
      }else{
        finalDayArray[i].push(transfe);
      }
  });
  bookingrecords.flight.forEach(flight => {
    flight['types'] = 'flight';
      i = finaltempArray.indexOf(flight.day)
      if(i == -1){
        finalDayArray[finaltempArray.length] = [];
        finalDayArray[finaltempArray.length].push(flight);
        finaltempArray.push(flight.day);
      }else{
        finalDayArray[i].push(flight);
      }
  });
  return finalDayArray;
}

function customizeDatas(grpDatas,mainpackage){
  var finalArray = [] ,obj = {};
  var traveldate = mainpackage.traveldate ? new Date(mainpackage.traveldate) : null;
  grpDatas.forEach((subgrpDatas, ind) => {
    var daynumber = parseInt(subgrpDatas[0].day.substr(4));
    obj = {};
    obj['days'] = subgrpDatas[0].day;
    obj['date'] = traveldate ? new Date(traveldate.getFullYear(),traveldate.getMonth(),traveldate.getDate() + (daynumber-1)) : null;
    obj['daynumber'] = daynumber;
    obj['day'] = "Day";
    obj['destination'] = subgrpDatas.find(a=>a.types == 'destination');
    obj['activity'] = subgrpDatas.find(a=>a.types == 'activity');
    obj['transfer'] = subgrpDatas.find(a=>a.types == 'transfer');
    obj['flight'] = subgrpDatas.find(a=>a.types == 'flight');
    finalArray.push(obj);
  });
  return finalArray.sort((a, b) => a.daynumber - b.daynumber);
}


function gettourhtml(req, res, next){
  var template = req.body.template;
  var packagebooking = req.body.packagebooking;
  var tourpackage = req.body.tourpackage;
  var mainpackage = packagebooking  ? packagebooking : tourpackage;

  var finalData = customizeDatas(groupDatas(mainpackage),mainpackage);
  var renderStr = '';
  const header = createHeader(template.template.header, req.body.authkey.branchid, mainpackage );
  var offset = TIMEZONEOFFSET;
  renderStr += `${header}`;

  if(tourpackage){
      renderStr += `<div style="width: 100%;margin-top: 10px;">
        <table width="100%" cellspacing="0" border="0">
          <tbody>
            <tr>
              <td style="font-weight: bold;" >
                <span class="print-page-item-head" style="font-size: 20px;line-height: 30px;font-weight: bold;">
                ${tourpackage.title} (${tourpackage.packagetype})</span><br>
                <span style="font-weight: bold;text-transform: capitalize;" class="print-item-number">${tourpackage.duration}</span></td>
            </tr>
          </tbody>
        </table>
      </div>`;
    }


  finalData.forEach(ele => {

    var date = ele.date ?  new Date(ele.date) : null;
    if(date != null && date && date != "Invalid Date"){
      date.setUTCMinutes(date.getUTCMinutes() - offset);
      date = new Date(date).toDateString();
    }

      // header datas
      renderStr += `<table style="width:100%;margin-top:10px;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td style="border-top: 1px solid #aaaaaa;padding:10px 0 0 0;width: 65px;" class="print-table-td text-break text-center align-top">
          <div style="border:1px solid #F29015;border-radius:4px;width: 55px;height: 55px;padding: 7px 5px;">
            <div class="print-page-item-head" style="font-size: 18px;line-height: 22px;font-weight: bold;">${ele.daynumber}</div>
            <div style="font-size: 12px;line-height: 12px;font-weight: normal;text-transform: capitalize;" class="print-item-number">${ele.day}</div>

          </div>
          ${date && new Date(date) != "Invalid Date" ? `<div class="" style="font-size: 13px;line-height: 19px;font-weight: bold;">${date}</div>` : '' }
          </td>
          <td style="border-top: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top">
              <table width="100%" cellspacing="0" border="0">`;
      // 4 blocks condition wise
        renderStr += `<tr>
        <td style="border-bottom: 1px solid #aaaaaa;padding: 0 0 10px;vertical-align: middle;" class="print-table-td text-break text-left align-top" >
        <div class="print-company" style="font-weight: bold;line-height: 20px;">${ele.destination ?  'Arrival in ' + ele.destination.destination.locationname : ''} </div>
        <div style="display: flex;align-items: center;">
        <div style="margin-right: 30px;" class="print-company ${ele.flight && ele.flight._id ? '' : 'd-none'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15.323" viewBox="0 0 16 15.323">
            <path d="M17.323,12.146a.868.868,0,0,0-.4-.718L10.871,7.645V3.21a1.21,1.21,0,0,0-2.419,0V7.645L2.4,11.428a.857.857,0,0,0-.4.718.846.846,0,0,0,1.1.806l5.355-1.677V15.71L7,16.8a.387.387,0,0,0-.161.323V17.6a.406.406,0,0,0,.516.387l2.307-.661,2.307.661a.406.406,0,0,0,.516-.387v-.476a.387.387,0,0,0-.161-.323L10.871,15.71V11.275l5.355,1.677A.846.846,0,0,0,17.323,12.146Z" transform="translate(18 -2) rotate(90)" fill="#333" fill-rule="evenodd"/>
          </svg>
          <span style="margin-left: 10px;display: inline-block;"> Flights </span>
        </div>
        <div style="margin-right: 30px;" class="print-company ${ele.destination && ele.destination._id ? '' : 'd-none'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12.291" viewBox="0 0 16 12.291">
            <path id="bed" d="M15.527,0H.472A.472.472,0,0,0,0,.472V10.24a.472.472,0,0,0,.472.472h.6v1.106a.472.472,0,0,0,.472.472H4.313a.472.472,0,0,0,.472-.472V10.712h6.349v1.106a.472.472,0,0,0,.472.472h2.769a.472.472,0,0,0,.472-.472V10.712h.68A.472.472,0,0,0,16,10.24V.472A.472.472,0,0,0,15.527,0Zm-.472.945V5.462a2.245,2.245,0,0,0-.724-.343V4.4a1.72,1.72,0,0,0-1.718-1.718H9.245A1.713,1.713,0,0,0,8,3.215a1.713,1.713,0,0,0-1.246-.537H3.387A1.72,1.72,0,0,0,1.669,4.4v.722a2.245,2.245,0,0,0-.724.343V.945ZM8.472,4.4a.774.774,0,0,1,.773-.773h3.367a.774.774,0,0,1,.773.773v.645H8.472Zm-.945.645H2.614V4.4a.774.774,0,0,1,.773-.773H6.754a.774.774,0,0,1,.773.773ZM3.841,11.346H2.017v-.634H3.841Zm10.062,0H12.079v-.634H13.9Zm1.152-1.579H.945V7.294A1.31,1.31,0,0,1,2.253,5.986H13.747a1.31,1.31,0,0,1,1.308,1.308Zm0,0" transform="translate(0)" fill="#333"/>
          </svg>
          <span style="margin-left: 10px;display: inline-block;"> Hotels </span>
        </div>
        <div style="margin-right: 30px;" class="print-company ${ele.transfer && ele.transfer._id ? '' : 'd-none'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="13.435" viewBox="0 0 16 13.435">
            <path id="Car" d="M15.991,8.211A1.919,1.919,0,0,0,14.635,6.6L13.355,2.882A1.279,1.279,0,0,0,12.089,2H4.22a1.279,1.279,0,0,0-1.228.87L1.712,6.509A1.958,1.958,0,0,0,0,8.211a.326.326,0,0,0,0,.1V11.6a1.279,1.279,0,0,0,.64,1.1v1.772a.966.966,0,0,0,.966.966H3.523a.96.96,0,0,0,.953-.966V12.875h7.037v1.6a.96.96,0,0,0,.96.96h1.919a.96.96,0,0,0,.96-.96V12.7a1.279,1.279,0,0,0,.64-1.1V8.307A.314.314,0,0,0,15.991,8.211Zm-13.754,2.1a.96.96,0,1,1,.96-.96.96.96,0,0,1-.96.96Zm9.276,0H4.476V8.4h7.037ZM2.41,6.477l1.19-3.4a.64.64,0,0,1,.621-.435h7.868a.64.64,0,0,1,.64.441l1.171,3.4H2.384Zm11.342,3.838a.96.96,0,1,1,.96-.96A.96.96,0,0,1,13.752,10.316Z" transform="translate(0.006 -1.998)" fill="#333"/>
          </svg>
          <span style="margin-left: 10px;display: inline-block;"> Transfers </span>
        </div>
        <div style="margin-right: 30px;" class="print-company ${ele.activity && ele.activity._id ? '' : 'd-none'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="11.997" height="16.001" viewBox="0 0 11.997 16.001">
            <g id="location-converted" transform="translate(-64.6 511.615)">
              <path id="Path_865" data-name="Path 865" d="M69.548-511.608a5.476,5.476,0,0,0-1.974.541,5.422,5.422,0,0,0-2.82,3.545,4.917,4.917,0,0,0-.153,1.353,5.014,5.014,0,0,0,.378,2c.116.3,2.258,4.3,2.374,4.423a.317.317,0,0,0,.55-.2c.012-.064.022-1.088.025-2.275l0-2.161-.084-.115a2.6,2.6,0,0,1-.587-1.725,2.43,2.43,0,0,1,.275-1.193,2.728,2.728,0,0,1,1.721-1.419,3.026,3.026,0,0,1,1.309,0,2.693,2.693,0,0,1,1.937,2.062c.116.557.109.554.734.582a1.568,1.568,0,0,1,1.234.474c.253.226.478.255.65.08.1-.1.116-.2.116-.589a5.543,5.543,0,0,0-.75-2.746,5.329,5.329,0,0,0-3.72-2.578A7.066,7.066,0,0,0,69.548-511.608Z" transform="translate(0 0)" fill="#333"/>
              <path id="Path_866" data-name="Path 866" d="M195.217-319.693a1.311,1.311,0,0,0-.621.391l-.251.236-.713.013c-.7.013-.716.016-.91.1a1.111,1.111,0,0,0-.5.452c-.111.216-.121.433-.111,2.625l.01,2.151.111.22a1.018,1.018,0,0,0,.57.506c.213.073,6.54.073,6.753,0a1.018,1.018,0,0,0,.57-.506l.111-.22.01-2.151c.01-2.193,0-2.409-.111-2.625a1.111,1.111,0,0,0-.5-.452c-.194-.086-.21-.089-.91-.1l-.713-.013-.258-.242a2.217,2.217,0,0,0-.43-.321c-.178-.083-.181-.083-1.085-.089A9.626,9.626,0,0,0,195.217-319.693Zm1.505,1.734a2.057,2.057,0,0,1,1.292,1.085,2.027,2.027,0,0,1-.025,1.811,2.382,2.382,0,0,1-.821.85,2.085,2.085,0,0,1-1.973,0,2.381,2.381,0,0,1-.821-.85,2.025,2.025,0,0,1,.344-2.342,2.152,2.152,0,0,1,1.12-.6A2.507,2.507,0,0,1,196.722-317.959Z" transform="translate(-123.654 -185.961)" fill="#333"/>
              <path id="Path_867" data-name="Path 867" d="M278.858-244.839a1.263,1.263,0,0,0-.748.56,1.271,1.271,0,0,0-.21.741,1.319,1.319,0,0,0,1.34,1.327,1.319,1.319,0,0,0,1.34-1.327,1.334,1.334,0,0,0-.442-1.018A1.357,1.357,0,0,0,278.858-244.839Z" transform="translate(-206.655 -258.398)" fill="#333"/>
              <path id="Path_868" data-name="Path 868" d="M185.162-91.847a.34.34,0,0,0-.162.286,28.16,28.16,0,0,0,1.375,2.524.35.35,0,0,0,.42-.022c.1-.1,1.219-2.119,1.228-2.212a.318.318,0,0,0-.092-.306l-.092-.092h-.824a3.439,3.439,0,0,1-1.413-.143C185.395-91.9,185.277-91.911,185.162-91.847Z" transform="translate(-116.652 -406.637)" fill="#333"/>
            </g>
          </svg>
          <span style="margin-left: 10px;display: inline-block;"> Activity </span>
        </div>
      </div>
      </td>
      </tr>`;
      // flight block
      if(ele.flight && ele.flight._id){
        renderStr += `<tr>
        <td style="border-bottom: 1px solid #aaaaaa;padding: 5px 0 7px;" class="print-table-td text-break text-left align-top" >
          <div  style="font-weight: normal;line-height: 20px;padding-bottom: 5px;display: inline-block;">Flight from ${ele.flight.from.locationname} to ${ele.flight.to.locationname} ${ele.flight.nightscover ?    `(Nights cover)` : '' }  </div>
          <div style="display: flex;">
            <div style="margin-right: 20px;" >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="30.647" viewBox="0 0 32 30.647">
                <path  d="M32.647,22.291a1.735,1.735,0,0,0-.79-1.436L19.743,13.291V4.419a2.419,2.419,0,0,0-4.839,0v8.871L2.79,20.856A1.714,1.714,0,0,0,2,22.291,1.692,1.692,0,0,0,4.194,23.9L14.9,20.549v8.871L12,31.6a.773.773,0,0,0-.323.645V33.2a.811.811,0,0,0,1.032.774l4.613-1.323,4.613,1.323a.811.811,0,0,0,1.032-.774v-.952a.773.773,0,0,0-.323-.645l-2.9-2.178V20.549L30.453,23.9A1.692,1.692,0,0,0,32.647,22.291Z" transform="translate(34 -2) rotate(90)" fill="#333" fill-rule="evenodd"/>
              </svg>
            </div>
            <div style="margin-right: 20px;">
              <div>
                <div style="display: flex;flex-direction: row;justify-content: space-between;">
                    <div style="line-height: 16px;font-size: 14px;"> ${ele.flight.from.locationname} </div>
                    <div class="plan-start-point-print plan-start-point-view" style="position: relative;width:100px;margin: 5px 15px 5px 15px;font-size: 14px;text-align: center;font-weight: bold;">

                    <div style="margin-bottom:0;line-height: normal;">${ele.flight.duration}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="94" height="11.492" viewBox="0 0 94 11.492">
                      <g id="plane" transform="translate(-793 -371)">
                        <rect  width="90" height="1" transform="translate(795 376)" fill="#aaa"/>
                        <path  d="M13.492,9.609a.651.651,0,0,0-.3-.538L8.654,6.234V2.907a.907.907,0,1,0-1.815,0V6.234L2.3,9.071a.643.643,0,0,0-.3.538.635.635,0,0,0,.823.6L6.839,8.956v3.327L5.75,13.1a.29.29,0,0,0-.121.242V13.7a.3.3,0,0,0,.387.29l1.73-.5,1.73.5a.3.3,0,0,0,.387-.29v-.357a.29.29,0,0,0-.121-.242l-1.089-.817V8.956l4.016,1.258A.635.635,0,0,0,13.492,9.609Z" transform="translate(848 369) rotate(90)" fill="#f29015" fill-rule="evenodd"/>
                        <circle  cx="2.5" cy="2.5" r="2.5" transform="translate(793 374)" fill="#aaa"/>
                        <g  transform="translate(882 374)" fill="#fff" stroke="#aaa" stroke-width="1">
                          <circle cx="2.5" cy="2.5" r="2.5" stroke="none"/>
                          <circle cx="2.5" cy="2.5" r="2" fill="none"/>
                        </g>
                      </g>
                    </svg>
                 </div>

                    <div>
                      <div style="line-height: 16px;font-size: 14px;"> ${ele.flight.to.locationname} </div>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </td>
        </tr>`
      }
      // transfer block
      if(ele.transfer && ele.transfer._id){
        renderStr += `<tr>
        <td style="border-bottom: 1px solid #aaaaaa;padding: 5px 0 7px;" class="print-table-td text-break text-left align-top" >
          <div  style="font-weight: normal;line-height: 20px;padding-bottom: 5px;display: inline-block;">Transfer from ${ele.transfer.from.locationname} to ${ele.transfer.to.locationname} </div>
          <div style="display: flex;align-items: center;">
            <div style="margin-right: 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="26.87" viewBox="0 0 32 26.87">
                <path id="Car" d="M31.987,14.424A3.838,3.838,0,0,0,29.275,11.2L26.716,3.766A2.559,2.559,0,0,0,24.183,2H8.446A2.559,2.559,0,0,0,5.989,3.74L3.43,11.02A3.915,3.915,0,0,0,0,14.424a.652.652,0,0,0,0,.192v6.576a2.559,2.559,0,0,0,1.279,2.2v3.544a1.932,1.932,0,0,0,1.932,1.932H7.051a1.919,1.919,0,0,0,1.906-1.932V23.751H23.031v3.2a1.919,1.919,0,0,0,1.919,1.919h3.838a1.919,1.919,0,0,0,1.919-1.919V23.392a2.559,2.559,0,0,0,1.279-2.2V14.616A.627.627,0,0,0,31.987,14.424ZM4.48,18.633A1.919,1.919,0,1,1,6.4,16.714,1.919,1.919,0,0,1,4.48,18.633Zm18.552,0H8.957V14.795H23.031ZM4.825,10.956,7.2,4.15a1.279,1.279,0,0,1,1.241-.87H24.183a1.279,1.279,0,0,1,1.279.883L27.8,10.956H4.774Zm22.684,7.677a1.919,1.919,0,1,1,1.919-1.919A1.919,1.919,0,0,1,27.509,18.633Z" transform="translate(0.006 -1.998)" fill="#333"/>
              </svg>
            </div>
            <div class="${ele.transfer.transfertype ? '' : 'd-none'}" style="margin-right: 20px;">
              <div class="print-company" > ${ele.transfer.transfertype ? ele.transfer.transfertype : ''} </div>
              ${ele.transfer.nightscover ?    `<div class="print-company"> Nights cover </div>` : '' }
            </div>
            <div class="${ele.transfer.facilities ? '' : 'd-none'}">
              <div class="print-company" style="font-weight: bold;"> Facilities </div>
              <div class="print-company" > ${ele.transfer.facilities}</div>
            </div>
          </div>
        </td>
        </tr>`
      }
      // activity block
      if(ele.activity && ele.activity._id){
        renderStr +=  `<tr> <td style="border-bottom: 1px solid #aaaaaa;padding: 5px 0 7px;" class="print-table-td text-break text-left align-top">
            <div style="display: flex;align-items: flex-start;">
              <div style="margin-right: 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32.002" viewBox="0 0 32 32.002">
                  <g id="location" transform="translate(-542 -632)">
                    <rect id="Rectangle_832" data-name="Rectangle 832" width="32" height="32" transform="translate(542 632)" fill="none"/>
                    <g id="location-converted" transform="translate(481.4 1143.615)">
                      <path id="Path_865" data-name="Path 865" d="M74.5-511.6a10.953,10.953,0,0,0-3.948,1.082,10.845,10.845,0,0,0-5.641,7.09,9.834,9.834,0,0,0-.306,2.705,10.027,10.027,0,0,0,.756,4.01c.231.6,4.517,8.592,4.748,8.847a.633.633,0,0,0,1.1-.4c.025-.127.044-2.177.05-4.551l.006-4.322-.169-.229a5.2,5.2,0,0,1-1.174-3.45,4.86,4.86,0,0,1,.55-2.387,5.455,5.455,0,0,1,3.442-2.839,6.052,6.052,0,0,1,2.617,0A5.387,5.387,0,0,1,80.4-501.92c.231,1.114.219,1.107,1.468,1.165a3.137,3.137,0,0,1,2.468.948c.506.452.956.509,1.3.159.194-.2.231-.395.231-1.177a11.085,11.085,0,0,0-1.5-5.493,10.659,10.659,0,0,0-7.44-5.155A14.136,14.136,0,0,0,74.5-511.6Z" fill="#333"/>
                      <path id="Path_866" data-name="Path 866" d="M198.323-319.667a2.621,2.621,0,0,0-1.241.783l-.5.471-1.426.025c-1.4.025-1.432.032-1.82.2a2.222,2.222,0,0,0-.993.9c-.223.433-.242.866-.223,5.251l.019,4.3.223.439a2.036,2.036,0,0,0,1.139,1.012c.426.146,13.08.146,13.506,0a2.036,2.036,0,0,0,1.139-1.012l.223-.439.019-4.3c.019-4.385,0-4.818-.223-5.251a2.222,2.222,0,0,0-.993-.9c-.388-.172-.42-.178-1.82-.2l-1.426-.025-.516-.484a4.432,4.432,0,0,0-.859-.643c-.356-.165-.363-.165-2.17-.178A19.257,19.257,0,0,0,198.323-319.667Zm3.01,3.469a4.115,4.115,0,0,1,2.584,2.17,4.054,4.054,0,0,1-.051,3.622,4.763,4.763,0,0,1-1.642,1.7,4.169,4.169,0,0,1-3.946,0,4.763,4.763,0,0,1-1.642-1.7,4.051,4.051,0,0,1,.687-4.684,4.3,4.3,0,0,1,2.24-1.2A5.014,5.014,0,0,1,201.333-316.2Z" transform="translate(-119.797 -180.026)" fill="#333"/>
                      <path id="Path_867" data-name="Path 867" d="M279.816-244.781a2.527,2.527,0,0,0-1.5,1.12,2.542,2.542,0,0,0-.42,1.483,2.638,2.638,0,0,0,2.68,2.654,2.638,2.638,0,0,0,2.68-2.654,2.668,2.668,0,0,0-.885-2.037A2.713,2.713,0,0,0,279.816-244.781Z" transform="translate(-200.01 -250.077)" fill="#333"/>
                      <path id="Path_868" data-name="Path 868" d="M185.325-91.806a.68.68,0,0,0-.325.573,56.318,56.318,0,0,0,2.75,5.047.7.7,0,0,0,.84-.045c.191-.191,2.438-4.239,2.457-4.424a.636.636,0,0,0-.185-.611l-.185-.185h-1.648a6.878,6.878,0,0,1-2.826-.286C185.789-91.915,185.554-91.934,185.325-91.806Z" transform="translate(-112.904 -393.547)" fill="#333"/>
                    </g>
                  </g>
                </svg>
              </div>
              <div>
              <div class="print-company" style="font-weight: bold;"> ${ele.activity.event.title}</div>
              <div class="" style="font-size: 12px;padding-bottom: 5px;" > ${ele.activity.location.locationname} , ${ele.activity.location.property.country ? ele.activity.location.property.country : ''} </div>
                <div style="padding-bottom: 5px;">
                 ${ele.activity.description ? ele.activity.description : ''}
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="margin-right: 20px;" >
                    <div class="print-company" style="font-weight: bold;"> Duration </div>
                    <div class="print-company" > ${ele.activity.duration} </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>`;
      }

      if(ele.destination && ele.destination._id){

        var checkin = ele.destination.checkin ?  new Date(ele.destination.checkin) : null;
        var checkout = ele.destination.checkout ?  new Date(ele.destination.checkout) : null;
        if(checkin != null && checkin && checkin != "Invalid Date"){
          checkin.setUTCMinutes(checkin.getUTCMinutes() - offset);
          checkin = new Date(checkin).toDateString();
        }

        if(checkout != null && checkout && checkout != "Invalid Date"){
          checkout.setUTCMinutes(checkout.getUTCMinutes() - offset);
          checkout = new Date(checkout).toDateString();
        }

      renderStr += ` <tr> <td style="padding: 5px 0 7px;" class="print-table-td text-break text-left align-top" >
                <div style="display: flex;align-items: center;">
                  <div style="margin-right: 20px;" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24.583" viewBox="0 0 32 24.583">
                      <path  d="M31.055,0H.945A.945.945,0,0,0,0,.945V20.48a.945.945,0,0,0,.945.945h1.2v2.213a.945.945,0,0,0,.945.945H8.627a.945.945,0,0,0,.945-.945V21.425h12.7v2.213a.945.945,0,0,0,.945.945h5.537a.945.945,0,0,0,.945-.945V21.425h1.359A.945.945,0,0,0,32,20.48V.945A.945.945,0,0,0,31.055,0ZM30.11,1.89v9.034a4.491,4.491,0,0,0-1.449-.687V8.792a3.44,3.44,0,0,0-3.436-3.436H18.491A3.425,3.425,0,0,0,16,6.43a3.425,3.425,0,0,0-2.491-1.073H6.774A3.44,3.44,0,0,0,3.338,8.792v1.445a4.491,4.491,0,0,0-1.449.687V1.89Zm-13.165,6.9a1.548,1.548,0,0,1,1.546-1.546h6.734a1.548,1.548,0,0,1,1.546,1.546v1.29H16.945Zm-1.89,1.29H5.228V8.792A1.548,1.548,0,0,1,6.775,7.246h6.734a1.548,1.548,0,0,1,1.546,1.546ZM7.682,22.693H4.035V21.425H7.682Zm20.124,0H24.159V21.425h3.647Zm2.3-3.158H1.889V14.589a2.619,2.619,0,0,1,2.616-2.616H27.494a2.619,2.619,0,0,1,2.616,2.616Zm0,0" transform="translate(0)" fill="#333"/>
                    </svg>
                  </div>
                  <div style="margin-right: 20px;">
                   <div class="print-company" style="font-weight: bold;"> ${ele.destination.resortid  && ele.destination.resortid.resortname ? ele.destination.resortid.resortname : 'Hotel'} </div>
                ${ele.destination.destination  ?  `<div class="" style="font-size: 12px;padding-bottom: 5px;" > ${ele.destination.destination.locationname} </div> ` : ''}

                   </div>
                </div>

              <div style="display: flex;align-items: center;">
                <div style="margin-right: 20px;">

                ${( checkin && new Date(checkin) != "Invalid Date" &&  checkout && new Date(checkout) != "Invalid Date" ) ?   `  <div class="print-company" style="font-weight: bold;">Date </div>    <div class="print-company" >  ${checkin} - ${checkout}  </div>  `  : ''}
                </div>
              </div>

              `;
      if(ele.destination && ele.destination.occupants && ele.destination.occupants.length > 0){
        ele.destination.occupants.forEach(occupant => {
          `<div style="display: flex; align-items: center;">
          <div>
                <div class="print-company" style="font-weight: bold;"> Room Type </div>
                <div class="print-company" > ${occupant.roomtype} </div>
               </div>
               <div style="margin-right: 20px;" >
                <div class="print-company" style="font-weight: bold;"> Includes </div>
                <div class="print-company" > ${occupant.includes} </div>
               </div>
               <div>
               <div class="print-company" style="font-weight: bold;"> Cost </div>
               <div class="print-company" > ${occupant.cost} </div>
              </div>
            </div>`
        });
      }
      renderStr +=  `   </td> </tr>`;
    }


  renderStr +=  `</table></td>`;
  });


  req.body.template = template;
  req.body.data = mainpackage;
  req.body.message = {
    content: renderStr,
  }
  next()
  // res.json({groupData : finalData ,mainpackage : mainpackage , content : renderStr });
}

function getworkshophtml(req, res, next) {

  var template = req.body.template;
  var formdata = req.body.formdata;
  var formfield = req.body.formfield;

  var renderStr = '';
  const header = createHeader(template.template.header, req.body.authkey.branchid, formdata );

  renderStr += `${header}`;

  if(formdata && formdata.contextid && formdata.contextid.title){

    renderStr += `<div style="width: 100%;margin-top: 20px;">
    <table width="100%" cellspacing="0" border="0">
       <tbody>
          <tr>
             <td class="print-company" style="font-weight: bold;" >Vehicle Information</td>
          </tr>
       </tbody>
    </table>
 </div>
 <table style="width:100%;margin-top:5px;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
    <thead>
       <tr class="table-print-head-row">
          <th style="padding: 5px 5px 5px 5px;width: 18%;text-align: left;"  class="table-print-head text-break"> Make </th>
       </tr>
    </thead>
    <tbody >
       <tr class="break-row-inside break-row-after">
          <td style="border-bottom: 1px solid #aaaaaa;padding: 10px 5px 10px 5px;" class="print-table-td text-break text-left align-top" > ${formdata.contextid.title} </td>
       </tr>
    </tbody>
 </table>`;
  }

  if(formfield){
      renderStr += `<div style="width: 100%;margin-bottom:61px;">`;
      if(formfield && formfield.length > 0 ) {
        formfield.forEach(element => {
          renderStr += `<div style="width: 100%;margin-top:45px;">
          <div style="font-size: 20px;font-weight: bold;border-bottom: 1px solid #F29015;padding: 0 0 10px 0;">${element.sectiondisplayname}</div>
          <table style="width:100%;margin-top:0;margin-bottom: 0;table-layout:fixed;" class="print-text table-membroz" cellspacing="0" cellpadding="0" border="0">
            <tbody >
              <tr class="break-row-inside break-row-after">
                <td style="border-bottom: 1px solid #aaaaaa;padding: 15px 5px 15px 0;width: 82%;" class="print-table-td text-break text-left align-top" >`;

                if(element && element.fields && element.fields.length > 0) {

                  var index = 1;
                  element.fields.forEach(elementFields => {


                  renderStr +=  `<div style="margin-top: 5px;">
                    <span> ${index}. ${elementFields.displayname} : </span>
                    <span style="display: inline-block;margin: 0 15px 0 15px;color:#2F408F;" >`;
                      if(formdata && formdata.property && formdata.property[element.fieldname] && formdata.property[element.fieldname][elementFields.fieldname]) {

                        if(elementFields.fieldtype == "gallery") {

                          if(formdata.property[element.fieldname][elementFields.fieldname] && formdata.property[element.fieldname][elementFields.fieldname].length > 0) {
                            formdata.property[element.fieldname][elementFields.fieldname].forEach(elementImage => {


                              renderStr +=  `<div><img class="img-fluid img-add-product" src="${elementImage.attachment}"></div>`;

                            });
                          }

                        } else if (elementFields.fieldtype == "form") {

                          var result = formdata.property[element.fieldname][elementFields.fieldname].map(function (e) {
                            return e[elementFields.form.displayvalue];
                          }).join(', ');
                          renderStr +=  `<div>${result}</div>`;

                        }  else {
                          renderStr +=  `<div>${formdata.property[element.fieldname][elementFields.fieldname]}</div>`;
                        }

                      }
                    renderStr +=  `</span>`

                    if(formdata && formdata.property && formdata.property[element.fieldname] && formdata.property[element.fieldname][elementFields.fieldname+'_status_ok']) {
                      renderStr +=  `<span style="font-size:13px; color:#47CCBF;border:1px solid #47CCBF;border-radius:5px;padding:4px 18px;">OK</span>`;
                    } else if (formdata && formdata.property && formdata.property[element.fieldname] && formdata.property[element.fieldname][elementFields.fieldname+'_status_required'] ) {
                      renderStr +=  `<span style="font-size:13px; color:#FB3E39;border:1px solid #FB3E39;border-radius:5px;padding:4px 18px;">Required</span>`;
                    } else if (formdata && formdata.property && formdata.property[element.fieldname] && formdata.property[element.fieldname][elementFields.fieldname+'_status_suggested']) {
                      renderStr +=  `<span style="font-size:13px; color:#F57C00;border:1px solid #F57C00;border-radius:5px;padding:4px 18px;">Suggested</span>`;
                    }

                    renderStr +=  `</div>`;
                      index++;
                  });
                }

                  renderStr +=  `</td>
                <td style="border-bottom: 1px solid #aaaaaa;padding: 15px 0 15px 5px;width: 18%;white-space: nowrap;" class="print-table-td text-break text-right align-top">`;




                  renderStr +=  `</td>
              </tr>
            </tbody>
          </table>
        </div>`;
        });

      }
      renderStr +=  `</div>`;
    }



  res.json({renderStr : renderStr });
}

function gethtml(template, document, branch) {
  /* generate rows */
  var data = [];

  if (document.items)
    data = document.items;
  else
    data = [document]

  const rows = data.map(createRow).join('');
  console.log(rows)
  /* generate table */
  const header = createHeader(template.header, branch, document);
  const footer = createFooter(template.footer, branch, document);
  const table = createTable(rows);
  /* generate html */
  var html = createHtml(header, table, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}

function getreceipthtml(template, document, branch) {
  /* generate rows */
  var data = [];
  var taxes = document.taxdetail;
  data = document.billid.items;

  const rows = data.map(createBillRow).join('');
  /* generate table */
  const header = createHeader(template.header, branch, document);
  const footer = createFooter(template.footer, branch, document);
  const table = createBillTable(rows);
  const taxrows = createTaxRow(taxes);
  ////console.log("taxrows", taxrows)
  const subtable = createBillsubTable(taxrows, document.amount, document.paidamount);
  /* generate html */
  var html = createHtml(header, table, subtable, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}

function getbillhtml(template, document, branch) {
  /* generate rows */
  var data = [];
  var taxes = document.taxdetail;
  if (document.items)
    data = document.items;
  else
    data = [document]

  const rows = data.map(createBillRow).join('');
  /* generate table */
  const header = createHeader(template.header, branch, document);
  const footer = createFooter(template.footer, branch, document);
  const table = createBillTable(rows);
  const taxrows = createTaxRow(taxes);
  ////console.log("taxrows", taxrows)
  const subtable = createBillsubTable(taxrows, document.amount, document.totalamount);
  /* generate html */
  var html = createHtml(header, table, subtable, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}

function getpaymenthtml(template, document, branch) {
  /* generate rows */
  var data = [];
  var taxes = document.taxdetail;
  if (document.item)
    data = [document]

  const rows = data.map(createPaymentRow).join('');
  ////console.log("rows", rows)
  /* generate table */
  const header = createHeader(template.header, branch, document);
  const footer = createFooter(template.footer, branch, document);
  const table = createPaymentTable(rows);
  ////console.log("table", table)
  const taxrows = createTaxRow(taxes);
  // //console.log("taxrows",taxrows)
  /* generate html */
  const subtable = createBillsubTable(taxrows, document.amount, document.totalamount);
  ////console.log("subtable",subtable)
  var html = createHtml(header, table, subtable, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}


function getpaymentinvoicehtml(template, document, branch) {
  /* generate rows */
  var data = [];

  if (document.items)
    data = document.items;
  else
    data = [document]

  const rows = data.map(createPaymentInvoiceRow).join('');
  /* generate table */
  const header = createHeader(template.header, branch, document);
  const footer = createFooter(template.footer, branch, document);
  const table = createPaymentTable(rows);
  /* generate html */
  var html = createHtml(header, table, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");

  return html;

}
 

function regexrep(str, branch, document){

  var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\.?(\w+)\}]/mg;
  str.replace(shortcode_regex, function (match, code) {
    var db_fieldValue;
    var replace_str = match.replace('[{','');
    replace_str = replace_str.replace('}]','');
    if (replace_str.indexOf("branchid") == 0) {
      var fields = replace_str.split(".");
      db_fieldValue = branch[fields[1]];
      ////console.log("db_fieldValue", db_fieldValue)
      if (db_fieldValue && fields[2]) {
        db_fieldValue = db_fieldValue[fields[2]];
      }
      if (db_fieldValue && fields[3]) {
        db_fieldValue = db_fieldValue[fields[3]];
      }
    }
    else if (replace_str.indexOf(".") > 0) {
      var fields = replace_str.split(".");
      db_fieldValue = document[fields[0]];
      if (db_fieldValue && fields[1]) {
        db_fieldValue = db_fieldValue[fields[1]];
      }
      if (db_fieldValue && fields[2]) {
        db_fieldValue = db_fieldValue[fields[2]];
      }
    }
    if (db_fieldValue && new Date(db_fieldValue) != "Invalid Date" && typeof db_fieldValue == "object"){
      var db_fieldValue = new Date(db_fieldValue);
      var offset = TIMEZONEOFFSET;
      db_fieldValue.setUTCMinutes(db_fieldValue.getUTCMinutes() - offset);
      db_fieldValue = new Date(db_fieldValue).toDateString();
    }
    if(db_fieldValue) {
      str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
    }

  });

  shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\.?(\w+)\}]/mg;

  str.replace(shortcode_regex, function (match, code) {
    var db_fieldValue;
    var replace_str = match.replace('[{','');
    replace_str = replace_str.replace('}]','');
    if (replace_str.indexOf(".") > 0){
      var fields = replace_str.split(".");
      db_fieldValue = document[fields[0]];
      if (db_fieldValue && fields[1]) {
        db_fieldValue = db_fieldValue[fields[1]];
      }
      if (db_fieldValue && fields[2]){
        db_fieldValue = db_fieldValue[fields[2]];
      }

    }
    else {
      db_fieldValue = document[replace_str];
    }

    if (db_fieldValue && new Date(db_fieldValue) != "Invalid Date" && typeof db_fieldValue == "object"){
      var db_fieldValue = new Date(db_fieldValue);
      var offset = TIMEZONEOFFSET;
      db_fieldValue.setUTCMinutes(db_fieldValue.getUTCMinutes() - offset);
      db_fieldValue = new Date(db_fieldValue).toDateString();
    }
    if(db_fieldValue) {
      str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
    }
    else {
      str = str.replace("$[{" + replace_str + "}]", "");
    }

  });

  return str;

}



function getreporthtml(report, fields, rows, branch) {
  /* generate rows */

  const tableheader = createReportTableHeader(fields)

  /* generate table */
  const data = createReportTable(tableheader, rows, fields, branch);

  const header = createReportHeader(report);
  const footer = createReportFooter(report);

  /* generate html */
  var html = createReportHtml(header, data, footer);
  /* write the generated html to file */
  html = html.replace(/\r?\n|\r/g, "");
  return html;

}

const createReportFooter = (report) => `
</br></br><div style="text-align: center;font-weight: bold;font-size: large;"><b>
</div></br></br>
`;

const createReportHeader = (report) => `
<div style="text-align: center;font-family: poppins, arial;font-size: 18px;color: #000000;font-weight: bold;" >
    ${report.title}
  </div></br>
`;

function createReportTableHeader(fields){
  var str = "<thead><tr>"
  var fieldtype;
  fields.forEach(element => {
    fieldtype = element.fieldtype;
    var displaytext = element.displayname ? element.displayname : element.fieldname.split(".")[0];
    str += `<th class="table-print-head ${ fieldtype && fieldtype.toLowerCase() == 'currency' ? 'text-right' : '' }" style="border-color: #aaa;font-family: poppins, arial;" >` + displaytext + '</th>'
  });
  str += "</tr></thead>"
  return str;
}

function createReportTable(tableheader, rows, fields, branch){

  var str = `<div class="table-responsive"><table class="table table-bordered print-text table-membroz" style="border-collapse: collapse;width: 100%;border: 1px solid #dee2e6;">`;
  str += tableheader;

  var currency = branch && branch.currency ? branch.currency : "USD";
  var locale = branch && branch.locale ? branch.locale : "en-US";

  rows.forEach(row => {
    str += "<tr>"
    fields.forEach(field => {

        var fieldtype = field.fieldtype;
        var prop = field.fieldname.split(".");
        var value;
        if (prop.length == 2 && row[prop[0]]) {
            value = row[prop[0]][prop[1]]? row[prop[0]][prop[1]]: '';
        }
        else if (prop.length == 3 && row[prop[0]]) {
          var obj = row[prop[0]]
          value = obj[prop[1]][prop[2]]? obj[prop[1]][prop[2]]: '';
        }
        else if (prop.length == 4 && row[prop[0]] && row[prop[0]][prop[1]]) {
          var obj = row[prop[0]][prop[1]]
          value = obj[prop[2]][prop[3]]? obj[prop[2]][prop[3]]: '';
        }
        else {
          value = row[field.fieldname] ? row[field.fieldname]: '';
        }

        if (fieldtype && fieldtype.toLowerCase() == "currency") {
          value = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
        }
        else if (value && fieldtype && fieldtype.toLowerCase() == "date") {
          value = new Date(value);
          var options = {
            timeZone: branch.timezone
          };
          value = new Intl.DateTimeFormat(locale, options).format(value)
        }
        else if (value && fieldtype && fieldtype.toLowerCase() == "datestring") {
          value = new Date(value);
          var options = {
            timeZone: branch.timezone,
            dateStyle: 'long'
          };
          value = new Intl.DateTimeFormat(locale, options).format(value)
        }
        else if (value && fieldtype && fieldtype.toLowerCase() == "datetime") {
          value = new Date(value);
          var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            timeZone: branch.timezone
          };
          value = new Intl.DateTimeFormat(locale, options).format(value)
        }
        else if (value && fieldtype && fieldtype.toLowerCase() == "time") {
          var value = new Date(value);
          var options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZone: branch.timezone
          };
          value = new Intl.DateTimeFormat(locale, options).format(value)
        }
      str +=  `<td class="print-text ${ fieldtype && fieldtype.toLowerCase() == 'currency' ? 'text-right' : '' }" style="border:1px solid #aaaaaa;padding: 5px 5px 5px 5px;font-family: poppins, arial;font-size: 13px;">` + value + `</td>`

    });

   str += "</tr>"

  });
  str += "</table></div>"

  return str;
}

function getpayrollhtml(req, res, next) {
  var template = req.body.template;
  var payrollsalary = req.body.payrollsalary;
  var renderStr = '';

  const header = createHeader(template.template.header, req.body.authkey.branchid);
  const footer = createFooter(template.template.footer, req.body.authkey.branchid);
  renderStr += `${header}`;

  if (payrollsalary) {
    renderStr += `<div style="width: 100%;margin-top: 10px;">
    <table width="100%" cellspacing="0" border="0">
      <tbody>
        <tr style="text-align:center">
          <td colspan="2" style="border: 1px solid #aaaaaa;font-weight: bold;" >
            <span class="print-page-item-head" style="font-size: 20px;line-height: 30px;font-weight: bold;">
            Pay Slip ${payrollsalary.monthname}, ${payrollsalary.year}</span><br>
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Employee Name : ${payrollsalary.userdetail.fullname}</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;"> Week Off : ${payrollsalary.usersalarydeatil.weeklyoffdays} </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Designation : ${payrollsalary.userdetail.designationame}</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Present days : ${payrollsalary.usersalarydeatil.presentdays} </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Employee Code : ${payrollsalary.userdetail.employeecode}</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Paid days : ${payrollsalary.usersalarydeatil.paiddays} </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Joining Date : ${payrollsalary.userdetail.joiningdate ? payrollsalary.userdetail.joiningdate : ''} </td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Absent days : ${payrollsalary.usersalarydeatil.absentdays} </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Email : ${payrollsalary.userdetail.email}</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Mobile No. : ${payrollsalary.userdetail.mobile}</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Address : ${payrollsalary.userdetail.address ? payrollsalary.userdetail.address : ''} </td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > </td>
        </tr>

      </tbody>
    </table>
  </div>`;

  renderStr += `<div style="width: 100%;margin-top: 10px;">
    <table width="100%" cellspacing="0" border="0">
      <tbody>
        <tr >
          <td colspan="3" style="border: 1px solid #aaaaaa;font-weight: bold;" >
            &nbsp;Earning
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Component</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Actual Amount </td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Earnings </td>
        </tr>`;

  payrollsalary.usersalarycomponent.forEach(ele => {
      if (ele.payHeadTypeID == 101) {
        let cmpnt = payrollsalary.userdetail.salarycomponents.find(x => x.salarycomponentid == ele.salarycomponentid)
        renderStr += `<tr>
        <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > ${ele.payHeadName}</td>
        <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > ${cmpnt.amount} </td>
        <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > ${ele.amount} </td>
      </tr>
     `;
      }
    })

  renderStr += `
      <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Total</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" >  </td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > ${payrollsalary.usersalarydeatil.earnings} </td>
      </tr>
      <tr>
        <td colspan="3" style="border: 1px solid #aaaaaa;font-weight: bold;" >
          &nbsp;Deduction
        </td>
      </tr>

      <tr>
        <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Component</td>
        <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" >  </td>
        <td  style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > Deduction </td>
      </tr>`;

  payrollsalary.usersalarycomponent.forEach(ele => {
      if (ele.payHeadTypeID == 103) {
        let cmpnt = payrollsalary.userdetail.salarycomponents.find(x => x.salarycomponentid == ele.salarycomponentid)
        renderStr += `<tr>
            <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > ${ele.payHeadName}</td>
            <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" >  </td>
            <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > ${ele.amount} </td>
          </tr>
         `;
      }
    })

  renderStr += `
      <tr>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%" > Total</td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" >  </td>
          <td style="border: 1px solid #aaaaaa;padding: 5px 5px 5px 5px;width:50%%;" > ${payrollsalary.usersalarydeatil.statutorydeductions} </td>
      </tr>
      <tr>
        <td style="border: 1px solid #aaaaaa;font-weight: bold;" >
          &nbsp;Net Amount
        </td>
        <td colspan="2" style="border: 1px solid #aaaaaa;font-weight: bold;" >
        &nbsp;${payrollsalary.usersalarydeatil.netonhand}
        </td>
        <td
      </tr>
      </tbody>
      </table>
      </div>

      `;

  }
  renderStr += `${footer}`;
  req.body.template = template;
  res.json({ renderStr: renderStr });
}

const createReportHtml = (header, table, footer) => `
      ${header}
      ${table}
      ${footer}
`;
