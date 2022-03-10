const fs = require('fs')
const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const readFile = utils.promisify(fs.readFile)
var ObjectID = require('mongodb').ObjectID;

module.exports = {
  generatePdf,
  generateMergePdf
}


async function generatePdf(document,response) {

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  //const browser = await puppeteer.launch({ headless: true, args: ['--use-gl=egl', '--no-sandbox', '--disable-setuid-sandbox'], });
  const page = await browser.newPage();
  //await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
  var content = `<html>
          <head>
            <title></title>
            <style type="text/css">
                @page {size: A4 portrait;margin: 30pt 30pt 30pt 45pt;}
           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
              }
              * {
                box-sizing: border-box;
              }
              .print-page {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
                  background: #ffffff;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .text-left {
                text-align: left;
              }

              .align-top {
                vertical-align: top;
              }
             .print-company {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
             }
             .print-text {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
                line-height: 1.24;
             }
             address {
                font-style: normal;
                line-height: inherit;

            }


             .print-page-item-head {
                font-family: poppins, arial;
                font-size: 31px;
                font-weight: 500;
                color: #000000;
                line-height: 1.24;
             }
             .print-item-number {
                font-family: poppins, arial;
                font-size: 16px;
                color: #000000;
                font-weight: bold;
                text-transform: uppercase;
            }

            .table-print-head-row {
                 height:34px;
            }
            .table-print-head {
              color: #ffffff;
              font-size: 13px;
              background-color: #393837;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;

            }

            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
            }

            @supports (-ms-ime-align:auto) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
          }

          .text-break {
            word-break: break-word !important;
            word-wrap: break-word !important;
         }

         .print-table-td {
          color: #000000;
          font-size: 13px;
         }

         .break-row-after {
          page-break-after: auto;
          }
          .break-row-inside {
              page-break-inside: avoid;
          }

          .align-middle {
            vertical-align: middle;
          }
          .d-none {
            display:none;
          }

          .d-block {
              display: block;
          }
          .row {
              display: flex;
              flex-wrap: wrap;
          }
          .col-7 {
              flex: 0 0 58.3333333333%;
              max-width: 58.3333333333%;
          }
          .col-5 {
              flex: 0 0 41.6666666667%;
              max-width: 41.6666666667%;
          }
          .table-bordered {
              border: 1px solid #dee2e6;
          }
              }
            </style>
          </head><body>` + document + `
</body></html>`        
  await page.setContent(content);
  // var dir = './uploads/';
  // if (!fs.existsSync(dir))  fs.mkdirSync(dir)
  // var filename = dir + guid() + '_invoice.pdf';

  if (!response) {
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf
  }
  else {

    var dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    var filename = dir + guid() + '_attachment.pdf';

    // we Use pdf function to generate the pdf in the same folder as this file.
    await page.pdf({ path: filename, format: 'A4' })

    await browser.close();

    response.setHeader("Content-type", "application/pdf");
    response.download(filename, guid() + filename, function (err) {
      fs.unlinkSync(filename);
    });

  }

  // //console.log("Compiing the template with handlebars")
  // const template = hb.compile(document, { strict: true });
  // // we have compile our code with handlebars
  // const result = template(data);
  // // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
  // const html = result;

  // // we are using headless mode
  // const browser = await puppeteer.launch({headless: true,args: ['--no-sandbox','--disable-setuid-sandbox']});

  // const page = await browser.newPage()

  // // We set the page content as the generated html by handlebars
  // await page.setContent(html)

  // var fs = require('fs');
  // var dir = './uploads/';
  // if (!fs.existsSync(dir))  fs.mkdirSync(dir)
  // var filename = dir + guid() + '_invoice.pdf';

  // // we Use pdf function to generate the pdf in the same folder as this file.
  // await page.pdf({ path: filename, format: 'A4' })

  // await browser.close();

  // response.setHeader("Content-type", "application/pdf");
  // response.download(filename, guid() + filename, function (err) {
  //   fs.unlinkSync(filename);
  // });

}

async function generateMergePdf(document, response) {

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  //const browser = await puppeteer.launch({ headless: true, args: ['--use-gl=egl', '--no-sandbox', '--disable-setuid-sandbox'], });
  const page = await browser.newPage();
  //await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
  var content = `<html>
          <head>
            <title></title>
            <style type="text/css">
                @page {size: A4 portrait;margin: 30pt 30pt 30pt 45pt;}
           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
              }
              * {
                box-sizing: border-box;
              }
              .print-page {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
                  background: #ffffff;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .text-left {
                text-align: left;
              }

              .align-top {
                vertical-align: top;
              }
             .print-company {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
             }
             .print-text {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
                line-height: 1.24;
             }
             address {
                font-style: normal;
                line-height: inherit;

            }


             .print-page-item-head {
                font-family: poppins, arial;
                font-size: 31px;
                font-weight: 500;
                color: #000000;
                line-height: 1.24;
             }
             .print-item-number {
                font-family: poppins, arial;
                font-size: 16px;
                color: #000000;
                font-weight: bold;
                text-transform: uppercase;
            }

            .table-print-head-row {
                 height:34px;
            }
            .table-print-head {
              color: #ffffff;
              font-size: 13px;
              background-color: #393837;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;

            }

            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
            }

            @supports (-ms-ime-align:auto) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
          }

          .text-break {
            word-break: break-word !important;
            word-wrap: break-word !important;
         }

         .print-table-td {
          color: #000000;
          font-size: 13px;
         }

         .break-row-after {
          page-break-after: auto;
          }
          .break-row-inside {
              page-break-inside: avoid;
          }

          .align-middle {
            vertical-align: middle;
          }
          .d-none {
            display:none;
          }

          .d-block {
              display: block;
          }
          .row {
              display: flex;
              flex-wrap: wrap;
          }
          .col-7 {
              flex: 0 0 58.3333333333%;
              max-width: 58.3333333333%;
          }
          .col-5 {
              flex: 0 0 41.6666666667%;
              max-width: 41.6666666667%;
          }
          .table-bordered {
              border: 1px solid #dee2e6;
          }
              }
            </style>
          </head><body>` + document + `
</body></html>`
  await page.setContent(content);

  var dir = './uploads/';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  var filename = dir + ObjectID() + '.pdf';
  // console.log("filenmae", filename)
  await page.pdf({ path: filename, format: 'A4' })
  await browser.close();
  return filename;

}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const generatehtml = async () => {
  try {
    //console.log('Starting: Generating HTML Process, Kindly wait ..');
    /** Launch a headleass browser */
    const browser = await puppeteer.launch();
    /* 1- Ccreate a newPage() object. It is created in default browser context. */
    const page = await browser.newPage();
    /* 2- Will open our generated `.html` file in the new Page instance. */
    await page.goto(buildPaths.buildPathHtml, { waitUntil: 'networkidle0' });
    /* 3- Take a snapshot of the PDF */
    await browser.close();

  } catch (error) {
    //console.log('Error generating PDF', error);
  }
};
