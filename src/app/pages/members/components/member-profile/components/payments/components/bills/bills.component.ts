import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html'
})

export class BillsComponent extends BaseLiteComponemntComponent implements OnInit, OnChanges {

  @Input() dataContent: any;
  @Input() reloadingStr: string;
  

  displayedColumns3: string[];
  dataSource3: any [] = [];

  constructor(
  ) {
    super()
    this.pagename="app-bills";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables();
      if(this.dataContent.bills) {
        await this.getPayment()
      }
    } catch(error) {
      console.error(error);
    } finally {
    }
  }

  async ngOnChanges() {
    
    if (this.reloadingStr && this.reloadingStr == 'bills') {
      if(this.dataContent.bills) {
        await this.getPayment();
      }
      
   }
 }

  async initializeVariables() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = ['billnumber', 'billdate', 'amount', 'discount', 'taxamount', 'totalamount', 'paidamount', 'balance', 'action' ];
  }

  async getPayment() {
    this.dataSource3 = [];
    if (this.dataContent.bills && this.dataContent.bills.length !== 0) {
      this.dataContent.bills.forEach(element => {
        this.dataSource3.push({
          billdate: element.billdate,
          amount: element.amount ? element.amount : 0,
          taxamount: element.taxamount ? element.taxamount : 0,
          discount: element.discount ? element.discount : 0,
          paidamount: element.paidamount ? element.paidamount : 0,
          totalamount: element.totalamount ? element.totalamount : 0,
          balance: element.balance ? element.balance : 0,
          couponamount: element.couponamount ? element.couponamount : 0,
          walletamount: element.walletamount ? element.walletamount : 0,
          _id: element._id,
          prefix: element.prefix,
          type: element.type,
          billnumber: element.billnumber,
          status: element.status
        });
      });
    }
    return;
  }

}
