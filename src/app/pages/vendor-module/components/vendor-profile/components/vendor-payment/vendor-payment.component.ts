import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-vendor-payment',
  templateUrl: './vendor-payment.component.html',
  styles: [
  ]
})
export class VendorPaymentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-vendor-payment";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.purchaseinvoicepayments) {
        await this.getPayment()
      }

    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = ['paymentnumber', 'paidamount', 'taxamount', 'paymentdate', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.purchaseinvoicepayments && this.dataContent.purchaseinvoicepayments.length !== 0) {
      this.dataContent.purchaseinvoicepayments.forEach(element => {
        this.dataSource3.push({
          paymentnumber: element.receiptnumber,
          //vendorname: element.vendorname,
          paidamount: element.paidamount,
          taxamount: element.taxamount,
          paymentdate: element.paymentdate,
          prefix: element.prefix,
          paymentid: element._id,
        });
      });
    }
    return;
  }
}
