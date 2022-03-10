import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileSaverService } from 'ngx-filesaver';

import { BIReportsService } from '../../../../core/services/reports/bi-report.service';
import { ReportsService } from '../../../../core/services/reports/reports.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { SearchReportFilterRenderComponent } from '../../../../shared/dynamic-operation/components/search-report-filter-render/search-report-filter-render.component';

import * as Chartist from 'chartist';
import { IBarChartOptions } from 'chartist';

@Component({
    selector: 'app-report-view',
    templateUrl: './report-view.component.html',
   
})
export class ReportViewComponent extends BaseLiteComponemntComponent implements OnInit  {

    destroy$: Subject<boolean> = new Subject<boolean>();

    isLoading: boolean = false;
    isConvertloading: boolean = false;
    type: any;
    bindid: any;
    reportData: any;
    tableContent: any;
    chartContent: boolean = false;
    htmlContent : string = "<div class='media-body d-flex'><div class='font-500 mb-1 cursor-pointer flex-grow-1'>$[{title}] </div><div class='@[{isChartEnabled}]'> <i class='material-icons'> insert_chart </i>  </div></div>";

    listData: any[] = [];

    listFilterParams: any = {};

    filterFieldList: any[] = [];
    searchFieldList: any[] = [];

    defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt;";

    chartView : boolean = false;
    displayFields: any[] = [];
    
    @ViewChild('reportfilter') reportfilterComponent: SearchReportFilterRenderComponent;

    constructor(
        private _route: ActivatedRoute,
        private _bireportsService: BIReportsService,
        private _reportsService: ReportsService,
        protected _commonService: CommonService,
        private _FileSaverService: FileSaverService,
    ) {
        super();
        this.isLoading = false;
        this.isConvertloading = false;
    }

    async ngOnInit() {
        await super.ngOnInit();
        try{
            this.isLoading = true;
            this.isConvertloading = true;
            this._route.params.forEach(async (param: any) => {
                this.type = param['type'];
                this.bindid = param['id'];      
                
            await this.LoadData();
            this.isLoading = false;
            setTimeout(() => {
                 this.resetFilter();
            }, 1500);
        });
        }catch(e){
          this.isLoading = false;
          this.isConvertloading = false;
          this.chartContent = false;
        }
    }

    async LoadData() {
        try{
            if (this.type == "bireports" || this.type == "chartreports") {
              await this.getBIReportsById();
            } else {
              await this.getReportsById();
            }
        }catch(e){
            this.isLoading = false;
        }
    }
    
    async getBIReports() {
        this.isConvertloading = true;
        this.tableContent = null;
        var bireports: any = await this._bireportsService.AsyncGetByViewFilter(this.bindid, this.listFilterParams);
        // console.log("bireports",bireports);
        if (bireports.content) {
            this.tableContent = bireports.content;
        }
        if (bireports.data && bireports.data.length > 0) {
            this.makeGridView(bireports.data);
        }
        
        this.isConvertloading = false;
    } 

    async  makeGridView(data : []){
        
        let fields =  this.reportData.selectfields;
        let displayName =  [];
        let displatValue =  [];

        this.displayFields =  [];

        let obj : any  = {};
        obj.labels = [];
        obj.series = [];

        let i = 0 , array = [] , str;
        fields.forEach((fld) => {
            array = [];
            if(!fld.ishorizontal){
                data.forEach(ele => {
                    if(!displatValue[i]){ displatValue[i] = []}
                    array.push(ele[fld.fieldname]);
                });
                
                displatValue[i]  = array;
                this.displayFields.push({ 'displayFields' : fld.fieldname , 'color' : `<div style="color: hsl(${Math.floor(i * 50)}, 50%, 50%);"> ${fld.displayname} </div>`  })
                i++;
            }
            
        });

        fields.forEach(fld => {
            if(fld.ishorizontal){
                data.forEach(ele => {
                    displayName.push(ele[fld.fieldname]);
                });
            }
        });

        obj.labels = displayName;
        obj.series = displatValue;
        
        var options: IBarChartOptions  = {
            width: window.screen.availWidth * 0.6,
            height: window.screen.availHeight * 0.5, 
            axisX: {
                onlyInteger: true
            },               
            axisY: {
               onlyInteger: true
            }
        };
        const responsiveOptionsMultipleBarsChart: any = [
            ['screen and (max-width: 640px)', {
              seriesBarDistance: 5,
              axisX: {
                labelInterpolationFnc: function (value: any) {
                  return value[0];
                }
              }
            }]
          ];

        setTimeout(() => {
           var charts = document.getElementById("barchart");
           if(!charts) return;
           var chart =  new Chartist.Bar('#barchart' ,obj,options ,responsiveOptionsMultipleBarsChart);
           chart.on('draw', function(context) {
                if(context.type === 'bar') {
                  context.element.attr({
                    style: 'stroke: hsl(' + Math.floor(context.seriesIndex * 50) + ', 50%, 50%);'
                  });
                }
              });
        }, 500);
        return;
    }

    async getReports() {
        this.chartContent = false;
        this.isConvertloading = true;
        this.tableContent = null;
        

        
        if(this.searchFieldList  && this.searchFieldList.length > 0 ){
            if(!this.listFilterParams.search){
                this.listFilterParams.search = [];
            }
            this.searchFieldList.forEach(search => {
                this.listFilterParams.search.push({ searchfield: search.fieldname, searchvalue: search.default, datatype: search.type, criteria: search.criteria })
            });
        }

        // console.log("this.listFilterParams",this.listFilterParams);
        
        var reports: any = await this._reportsService.AsyncGetByViewFilter(this.bindid, this.listFilterParams);
        
        if (reports.content) {
            this.tableContent = reports.content;
            this.chartContent = false;
        }
        this.isConvertloading = false;
    }

   async getReportsById() {
      await  this._reportsService
            .AsyncGetById(this.bindid)
            .then((data) => {
                this.reportData = data;
                this.filterFieldList = [];
                this.searchFieldList = [];
                if (this.reportData.filterfields) {
                    this.filterFieldList = this.reportData.filterfields;
                }
                if (this.reportData.searchfield) {
                    this.searchFieldList = this.reportData.searchfield;
                }
            });
    }

    async  getBIReportsById() {
        await  
            this._bireportsService
                .AsyncGetById(this.bindid)
                .then((data) => {
                    this.reportData = data;
                    
                    this.filterFieldList = [];
                    if (this.reportData.filterfields) {
                        this.filterFieldList = this.reportData.filterfields;
                    }
                    this.chartView = false;
                    this.chartView = this.reportData.selectfields.filter(a=>a.ishorizontal == true).length > 0;
                    
            });
    }

    resetFilter() {
        
        try{
            this.isConvertloading = true;
            this.listFilterParams.search = [];
            if (this.filterFieldList.length > 0) {
                let today = new Date();
                this.filterFieldList.forEach(element => {
                    if (element.modelValue != undefined && element.modelValue != null && element.modelValue != "") {
                        if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange' ) {
                            element.modelValue = { beginJsDate: null, endJsDate: null };
                            if(element.defaultvalue == '-infinite'){
                                element.modelValue = { beginJsDate: new Date(1970), endJsDate: today };
                            }else if(element.defaultvalue == 'infinite'){
                                element.modelValue = { beginJsDate: new Date(1970), endJsDate: new Date(today.setFullYear(2070)) };
                            }else if(element.defaultvalue == '+infinite'){
                                element.modelValue = { beginJsDate: new Date(), endJsDate: new Date(new Date().setFullYear(today.getFullYear() + 100)) };
                            }
                        }else if(element.fieldtype == 'ngxdaterange'){
                            element.modelValue = { startDate: null, endDate: null };
                            if(element.defaultvalue == '-infinite'){
                                element.modelValue = { startDate: new Date(1970), endDate: today };
                            }else if(element.defaultvalue == 'infinite'){
                                element.modelValue = { startDate: new Date(1970), endDate: new Date(today.setFullYear(2070)) };
                            }else if(element.defaultvalue == '+infinite'){
                                element.modelValue = { startDate: new Date(), endDate: new Date(new Date().setFullYear(today.getFullYear() + 100)) };
                            }
                        } else if(element.fieldtype == 'lookup' ){
                        } else {
                            element.modelValue = null;
                        }
                    }
                });
                this.reportfilterComponent.reloadList();
            } else {
                this.reloadsList();
            }
           
           this.isConvertloading = false;
        }catch(e){
            this.isConvertloading = false;
        }
    }

    async reloadsList() {
        
        if (this.type == 'bireports') {
            await this.getBIReports();
        } else {
            await this.getReports();
        } 
    }

    onClickprint(): void {
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
                    color: #000000;
                    
                    }
                    * {
                    font-family: poppins, arial;
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
                  #invoiceprint .p-mrb-50, #receiptprint .p-mrb-50 {
                    padding-bottom: 50px;		
                  }
                  #invoiceprint, #receiptprint, #printid {
                    font-family: poppins, arial !important;
                    color: #000000 !important;
                  }
    
                  #invoiceprint .col-md-5, #receiptprint .col-md-5 {
                    width: 50% !important;
                    float: left !important;			
    
                  }
                  #invoiceprint .col-md-10, #receiptprint .col-md-10 {
                    width: 100% !important;
                    float: left !important;			
    
                  }
    
                  #invoiceprint .col-sm-offset-9, #receiptprint .col-sm-offset-9 {
                    margin-left: 75% !important; 
                  }
                  #invoiceprint .col-sm-3, #receiptprint .col-sm-3 {
                    width: 25% !important;
                    float: left !important;	
                  }
    
                  #invoiceprint .text-right, #receiptprint .text-right {
                  text-align:right;
                  }
                  .table {
                      width:100%;
                  }
             

                    .table-print-head {
                        font-family: poppins, arial;
                        color: #ffffff !important;
                        font-size: 14px;
                        font-weight: normal !important;
                        background-color: #393837;
                        padding: 5px 5px 5px 5px;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                        border: 1px solid #aaaaaa;
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

                     
                  
                  }
                </style>
              </head>
              <body onload="window.print();window.close()">${printContents}</body>
            </html>`
        );
        popupWin.document.close();
    }

    exportAsCSV() {
        let listFilterParams: any = {...this.listFilterParams};
        listFilterParams['export'] = true;
        let apiurl = '';
        let apimethod = '';
        if (this.type == 'bireports') {
            apiurl = 'bireports/view';
            apimethod = 'POST';
        } else {
            apiurl = 'reports/view';
            apimethod = 'POST';
        }
        
        this._commonService
            .commonServiceByUrlMethodDataExpo(apiurl, apimethod, listFilterParams ,this.bindid)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {                
                if (data) {
                    this._FileSaverService.save(data, "downloadedReport.csv")
                }
            });
    }
    
   async getSubmittedItemListsData(submitData : any){
        if (submitData && submitData._id) {
            this.bindid = submitData._id;
            this.type = submitData.schemaname;
            this.isLoading = true;
            this.isConvertloading = true;
            this.chartView = false;
            await this.LoadData();
            this.isLoading = false;
            setTimeout(() => {
                 this.resetFilter();
            },800);
        }
    }
}

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) { }
    transform(value: any) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}