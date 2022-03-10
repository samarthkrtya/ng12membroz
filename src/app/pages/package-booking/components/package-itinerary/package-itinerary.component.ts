import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';

import { FileSaverService } from "ngx-filesaver";

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-package-itinerary',
  templateUrl: './package-itinerary.component.html',
})

export class PackageItineraryComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";

  dataHtml: string;
  dataContent: any;
  
  isDisable: boolean = false;
  bindId : any;
  type : string;

  displayHTML : string;
  editUrl: string;

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    public fb: FormBuilder,
    private _FileSaverService: FileSaverService,
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.type = params["type"];
      this._formName = this.type == 'booking' ? "packagebooking" : "tourpackage";
      this.pagename = 'package-itinerary';
    }); 
  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      await this.initVariable();
      await this.getitinaerary();
      await this.getDatas();
    });
  }

  async initVariable(){
    this.itemVisbility = false;
    this.contentVisibility = false;

    if(this.type == 'booking'){
      this.editUrl =  `/pages/package-booking/holiday-package-booking/${this.bindId}`;
    }else{
      this.editUrl =  `/pages/package-booking/holiday-package/${this.bindId}`;
    }
    return;
  }

 async getitinaerary(){
  let url = this.type == 'booking' ?  "packagebookings/filter" : "tourpackages/filter";
  let method = "POST";

  let postData = {};
  postData["search"] = [];
  postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId , "criteria": "eq", "datatype": "ObjectId" });

  await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((datas: any) => {
        this.dataContent = datas[0];

        this.itemVisbility = true;
      });
  }

 async getDatas(){
    let url = "packagebookings/generatehtml";
    let method = "POST";

    var model = {
      id : this.bindId,
      type : this.type,
      formname : this._formName,
    };
    
    await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model,this.bindId)
        .then((datas: any) => {
          
          this.displayHTML = datas.content;
          this.contentVisibility = true;
        });
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }


  public onClickprint(): void {
    let printContents, popupWin;
    printContents = document.getElementById('printid2').innerHTML;
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


  public onClickpdf() {
    if (this.formObj && this.formObj._id) {
          let printContent = document.getElementById('printid2').innerHTML;

          let postData = {
              'formid': this.formObj._id,
              'document': printContent,
          }
          let str = this.dataContent.title ? `${this.dataContent.title}.pdf` : "downloaded.pdf";
          this._commonService
              .generatepdf(postData)
              .pipe(takeUntil(this.destroy$))
              .subscribe((data) => {
                  this._FileSaverService.save(data, str);
              });
      }
  }

  public onClickemail() {
    this._router.navigate([`pages/purchase-module/email-preview/${this.formObj._id}/${this.bindId}`]);
 }
 

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
