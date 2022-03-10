import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonDataService } from '../../../../core/services/common/common-data.service';
import { FinanceService } from '../../../../core/services/finance/finance.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.css']
})

export class BalanceSheetComponent extends BaseLiteComponemntComponent implements OnInit {

  isLoading: boolean = false;

  displayList: any[] = [];
  sortdisplayList: any[] = [];
  totaldisplayList: any[] = [];

  selecteddate = new Date();

  constructor(
    private router: Router,
    private _financeService: FinanceService,
    private _commonDataService: CommonDataService,
  ) {
    super();
    this.pagename = "balance-sheet";
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      this.isLoading = true;
      await this.getData();
      this.setData();
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }

  async getData() {
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'daterange', "searchvalue": { "$gte": new Date('1970-01-01'), "$lte": this.selecteddate }, "datatype": 'date', "criteria": "eq" });

    this.displayList = [];
    var data = await this._financeService.GetBalanceSheet(postData) as [];
    this.displayList = data;
    return;
  }

  setData() {
    this.sortdisplayList = this.groupBy(this.displayList, 'reporthead');
    this.totaldisplayList = this.setTotal(this.displayList, 'reporthead', 'amount');
  }


  addEvent(event: any) {
    this.getData();
  }

  onSelectitem(item: any) {
    this._commonDataService.isfilterData = true;
    this._commonDataService.reportFromDate = new Date('1970-01-01');
    this._commonDataService.reportToDate = this.selecteddate;
    this._commonDataService.reportParams = item._id;
    this.router.navigate(['/pages/dynamic-bireport/bireport-detail/5d5fa94abb707bb4874930fb']);
  }


  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  setTotal(collection: any, property: any, property1: any) {
    let i = 0, val, val1, index, values = [], result1 = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      val1 = collection[i][property1];
      index = values.indexOf(val);
      if (index > -1) {
        result1[index] += val1;
      } else {
        values.push(val);
        result1.push(val1);
      }
    }
    return result1;
  }


  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById('balancesheet').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
        <title></title>
 <style type="text/css">
    @page {
       size: A4 portrait;
       margin: 30pt 30pt 30pt;	
    }
  
    @media print {
  body {
     margin: 0;color: #000;
    background-color: #fff;
  }
    #invoiceprint .p-pdb-20, #receiptprint .p-pdb-20 {
       padding-bottom: 20px !important;				
    }

    .p-col-md-4 {
       width: 33.33333333% !important;
       float: left !important;	
    }

  #invoiceprint .p-mrb-50, #receiptprint .p-mrb-50 {
    padding-bottom: 50px;		
    }
  #invoiceprint, #receiptprint {
    font-family: Arial, Gotham, Helvetica Neue, Helvetica, "sans-serif" !important;
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

  .table-invoice thead th, .table-receipt thead th {
    font-family: Arial, Gotham, Helvetica Neue, Helvetica, "sans-serif";
    font-size: 14px !important;
    font-weight: bold!important;
    color: #000000 !important;
  }		
  .table-invoice tbody td, .table-receipt tbody td {
    font-family: Arial, Gotham, Helvetica Neue, Helvetica, "sans-serif";
    font-size: 14px !important;
    font-weight: normal!important;
    color: #000000 !important;
    }
  
  }
</style>
      </head>
      <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    popupWin.document.close();
  }


}

