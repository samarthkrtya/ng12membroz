import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
@Component({
  selector: 'app-billreciepts',
  templateUrl: './billreciepts.component.html'
})
export class BillRecieptsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename = "app-billreciepts";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.billpayments) {
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
    this.displayedColumns3 = ['invoicenumber', 'schduleDate', 'paymentdate', 'amount', 'discount', 'taxamount', 'paidamount', 'status', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.billpayments && this.dataContent.billpayments.length !== 0) {
      this.dataContent.billpayments.forEach(element => {

        //console.log("element", element)
        this.dataSource3.push({
          schduleDate: element && element._id && element.item && element.item.scheduledate ? element.item.scheduledate : '---',
          paymentdate: element.paymentdate,
          amount: element.amount ? element.amount : 0,
          taxamount: element.taxamount ? element.taxamount : 0,
          discount: element.discount ? element.discount : 0,
          paidamount: element.paidamount ? element.paidamount : 0,
          prefix: element.prefix,
          receiptnumber: element.receiptnumber,
          billpaymentid: element._id,
          billdate: element.billid.billdate,
          status: element.status !== "Paid" ? element && element._id && element.item.status ? element.item.status : '---' : element.status
        });

      });

    }
    return;
  }

}
