import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-vendor-purchage-invoice',
  templateUrl: './vendor-purchage-invoice.component.html',
  styles: [
  ]
})
export class VendorPurchageInvoiceComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-vendor-purchage-invoice";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.purchaseinvoices) {
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
    this.displayedColumns3 = ['invoicenumber', 'invoicedate', 'amount', 'taxamount', 'totalamount', 'paidamount', 'balance', 'status', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.purchaseinvoices && this.dataContent.purchaseinvoices.length !== 0) {
      this.dataContent.purchaseinvoices.forEach(element => {

        this.dataSource3.push({
          invoicenumber: element.pinumber,
          //fullname: element.fullname,
          invoicedate: element.invoicedate,
          amount: element.amount,
          taxamount: element.taxamount,
          totalamount: element.totalamount,
          paidamount: element.paidamount,
          prefix: element.prefix,
          balance: element.balance,
          status: element.status,
          invoiceid: element._id,
        });

      });

    }
    return;
  }

}
