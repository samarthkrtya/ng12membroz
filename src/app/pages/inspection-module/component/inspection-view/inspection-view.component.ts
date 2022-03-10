import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {map, startWith} from 'rxjs/operators';
import { BillModel } from '../../../../core/models/sale/bill';
import { BasicValidators, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;


@Component({
  selector: 'app-inspection-view',
  templateUrl: './inspection-view.component.html',
})

export class InspectionViewComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";

  dataHtml: string;
  dataContent: any;
  
  isDisable: boolean = false;
  bindId : any;
  type : string;

  displayHTML : any;

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    public fb: FormBuilder
  ) { 

    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"]; 
      this._formId = "611257c4d0835e295cc412c4"
    }); 
  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      try {
        await super.ngOnInit()
        await this.initializeVariables()
        await this.getInspectionData(this.bindId);
        await this.getDatas();
        this.itemVisbility = true;
        this.contentVisibility = true; 

      } catch(error) {
        console.error(error)
      } finally {

      }
    });
  }

  LoadData() {}
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    this.contentVisibility = false; 
    return
  }
   
  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  async getInspectionData(id: any) {

    var url = "formdatas/view/filter"
    var method = "POST";

    let postData = {};
    postData["viewname"] = "inspectionviews";
    postData["schemaname"] = "formdatas";
    postData["search"] = [];
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {

        if(data && data[0]){
          this.dataContent = {};
          this.dataContent = data.find(p=>p.inspectionid == this.bindId);
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }


  async getDatas(){

    let url = "formdatas/generatehtml";
    let method = "POST";

    var model = {
      id : this.bindId,
      type : this.type,
      formname : "workshop",
      export: true
    };
    
    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model)
        .then((datas: any) => {
          if(datas) {
            this.displayHTML = datas.renderStr;
            return;
          }
          
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
