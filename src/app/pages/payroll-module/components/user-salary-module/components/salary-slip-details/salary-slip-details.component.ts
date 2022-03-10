import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { identity } from '@fullcalendar/core';
import { FileSaverService } from 'ngx-filesaver';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-salary-slip-details',
  templateUrl: './salary-slip-details.component.html'
})
export class SalarySlipDetailsComponent extends BaseComponemntComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";
  dataHtml: string;
  dataContent: any;
  payrollData: any;

  displayThrml: boolean = false;

  isDisable: boolean = false;
  bindId: any;
  type: string;

  displayHTML: any;

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;
  viewmode: boolean = false;
  tableContent: {};

  constructor(
    private _route: ActivatedRoute,
    public fb: FormBuilder,
    private _FileSaverService: FileSaverService,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.type = params["type"];
      this._formName = this.type == 'paroll' ? "salaryslip" : "payroll";
      this.pagename = 'salary-slip-details';
    });
  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      try {
        await super.ngOnInit()
        await this.initializeVariables()
        await this.getPayroll()
        await this.getDatas();
        this.itemVisbility = true;
        this.contentVisibility = true;

      } catch (error) {
        console.error(error)
      } finally {

      }
    });
  }

  LoadData() { }
  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async initializeVariables() {
    this.contentVisibility = false;
    return
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  async getPayroll(){
    var url = "payrolls/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "paid", "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.dataContent = data[0];
          console.log("Data content : ",this.dataContent)
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getDatas() {

    let url = "payrolls/generatehtml/" + this._loginUser._id;
    let method = "POST";

    var model = {
      id: this._loginUser._id,
      type: "salaryslip",
      formname: this._formName,
      export: true
    };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then((datas: any) => {
        this.displayHTML = datas.renderStr;
        this.contentVisibility = true;
      });
  }


  public onClickprint(): void {
    let printContents, popupWin;
    printContents = document.getElementById('printid').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title></title>
            <style type="text/css">
                @page {`+ this.defaultpagesizesetting + `


                }

           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-family: poppins, arial;
                font-size: 13px;
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


         

        .tour-place-list {
            display: flex;
            flex-wrap: wrap;
            margin-right: -15px;
        }
        .tour-place-item {
          max-width:33.3333333333%;
          flex: 0 0 33.3333333333%;
          position: relative;
          width: 100%;
          padding-right: 15px;        
        }
       

              }
            </style>
          </head>
          <body onload="window.print();window.close()">${printContents}</body>
        </html>`
    );
    popupWin.document.close();
  }

  public onClickemail() {
    this._router.navigate([`pages/purchase-module/email-preview/${this.formObj._id}/${this.bindId}`]);
  }

  public onClickpdf() {
    if (this.formObj && this.formObj._id) {
      let printContent = document.getElementById('printid').innerHTML;

      let postData = {
        'formid': this.formObj._id,
        'document': printContent,
      }
      this._commonService
        .generatepdf(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this._FileSaverService.save(data, "downloaded.pdf");
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
