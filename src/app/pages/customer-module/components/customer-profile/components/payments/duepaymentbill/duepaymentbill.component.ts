import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { Key } from 'selenium-webdriver';
@Component({
  selector: 'app-duepaymentbill',
  templateUrl: './duepaymentbill.component.html'
})
export class DuePaymentBillComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename = "app-duepaymentbill";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.paymentinvoices) {
        await this.getDuePayment()
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
    this.displayedColumns3 = ['billdate', 'amount', 'discount', 'taxamount', 'paidamount', 'balance','status', 'action'];
  }

  async getDuePayment() {
    //console.log("this.dataContent",this.dataContent)
    if (this.dataContent.bills) {
      this.dataContent.bills.forEach(element => {

        //console.log("Tax Name:", element.taxdetail);

        this.dataSource3.push(
          {
            item: element && element.paymentterms && element.paymentterms[0] && element.paymentterms[0].paymentitem && element.paymentterms[0].paymentitem.paymentitemname ? element.paymentterms[0].paymentitem.paymentitemname : '---',
            taxdetail: element.taxdetail ? element.taxdetail : 0,
            amount: element.amount ? element.amount : 0,
            taxamount: element.taxamount ? element.taxamount : 0,
            paidamount: element.paidamount ? element.paidamount : 0,
            discount: element.discount ? element.discount : 0,
            balance: element.balance ? element.balance : 0,
            billdate: element.billdate,
            action: '',
            schduleid: element._id,
            status : element.status
          }
        );

      });
    }
    return;
  }
}
