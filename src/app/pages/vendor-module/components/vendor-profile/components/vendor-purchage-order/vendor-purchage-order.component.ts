import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-vendor-purchage-order',
  templateUrl: './vendor-purchage-order.component.html',
  styles: [
  ]
})
export class VendorPurchageOrderComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-vendor-purchage-order";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.purchaseorders) {
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
    this.displayedColumns3 = ['ordernumber', 'orderdate', 'amount', 'status', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.purchaseorders && this.dataContent.purchaseorders.length !== 0) {
      this.dataContent.purchaseorders.forEach(element => {

        this.dataSource3.push({
          ordernumber: element.ponumber,
          //vendorname: element.vendorname,
          orderdate: element.orderdate,
          prefix: element.prefix,
          amount: element.amount,
          status: element.status,
          purchageorderid: element._id,
        });
      });
      console.log("this.dataSource3", this.dataSource3);

    }
    return;
  }
}
