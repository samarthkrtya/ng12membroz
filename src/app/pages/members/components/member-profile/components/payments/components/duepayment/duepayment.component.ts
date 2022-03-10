import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
@Component({
  selector: 'app-duepayment',
  templateUrl: './duepayment.component.html'
})
export class DuePaymentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any [] = [];

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename="app-duepayment";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if(this.dataContent.paymentinvoices) {
        await this.getDuePayment()
      }

    } catch(error) {
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
    this.displayedColumns3 = ['item','scheduledate', 'period', 'amount','discount', 'tax', 'taxamount', 'paidamount',  'balance',  'action' ];
  }

  async getDuePayment() {
    if (this.dataContent.paymentinvoices) {
      this.dataContent.paymentinvoices.forEach(element => {

        if (element && element.memberid) {
          
          this.dataSource3.push(
            {
              item: element && element.paymentterms && element.paymentterms[0] && element.paymentterms[0].paymentitem && element.paymentterms[0].paymentitem.paymentitemname ? element.paymentterms[0].paymentitem.paymentitemname : '---',
              period: element && element.paymentterms && element.paymentterms[0] && element.paymentterms[0].period ? element.paymentterms[0].period : '---',
              tax: element && element.paymentterms && element.paymentterms[0] && element.paymentterms[0].taxes ? element.paymentterms[0].taxes : [],
              amount: element && element.paymentterms && element.paymentterms[0] && element.paymentterms[0].amount && element.paymentterms[0].amount ? element.paymentterms[0].amount : 0,
              taxamount: element.taxamount ? element.taxamount : 0,
              paidamount: element.paidamount ? element.paidamount : 0,
              discount: parseInt(element.totaladjustment) + parseInt(element.adjustment),
              balance: element.balance ? element.balance : 0,
              scheduledate: element.scheduledate,
              action:'',
              schduleid: element._id,
            }
          );

        }
      });
    }
    return;
  }
}
