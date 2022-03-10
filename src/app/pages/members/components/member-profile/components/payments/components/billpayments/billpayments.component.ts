import { Component, OnInit, Input } from '@angular/core';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-billpayments',
  templateUrl: './billpayments.component.html'
})

export class BillpaymentsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Input() reloadingStr: string;

  displayedColumns3: string[];
  dataSource3: any [] = [];

  constructor(
  ) {
    super()
    this.pagename="app-billpayments";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      if(this.dataContent.billpayments) {
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
    this.displayedColumns3 = [  'invoicenumber', 'paymentdate',  'taxamount', 'discount', 'paidamount', 'walletamount', 'couponamount',  'action' ];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.billpayments && this.dataContent.billpayments.length !== 0) {
      this.dataContent.billpayments.forEach(element => {

        this.dataSource3.push( {
          paymentdate: element.paymentdate,
          taxamount: element.taxamount ? element.taxamount : 0,
          discount: element.discount ? element.discount : 0,
          paidamount: element.paidamount ? element.paidamount : 0,
          couponamount: element.couponamount ? element.couponamount : 0,
          walletamount: element.walletamount ? element.walletamount : 0,
          billpaymentid: element._id,
          prefix: element.prefix,
          receiptnumber: element.receiptnumber,
          status: element.status
        });
      });
    }
    return;
  }

}
