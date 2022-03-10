import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
@Component({
  selector: 'app-reciepts',
  templateUrl: './reciepts.component.html'
})
export class RecieptsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any [] = [];

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename="app-reciepts";
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

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = ['receiptnumberprefix', 'invoicenumber', 'period',  'paymentdate', 'amount', 'discount','taxamount', 'paidamount', 'status' ,'action' ];
    this.dataSource3 = [];
  }

  async getPayment() {
    
    if (this.dataContent.payments && this.dataContent.payments.length !== 0) {
      this.dataContent.payments.forEach(element => {

        this.dataSource3.push( {
          item: element && element._id && element.item && element.item.paymentterms && element.item.paymentterms.paymentitem && element.item.paymentterms.paymentitem['paymentitemname'] ? element.item.paymentterms.paymentitem['paymentitemname'] : '---',
          paymentscheduleid: element && element.item && element.item._id  ? element.item._id : null,
          memberid: element && element.memberid ? element.memberid : null,
          period: element && element._id && element.item && element.item.paymentterms && element.item.paymentterms.period ? element.item.paymentterms.period : null,
          tax: element && element._id && element.item && element.item.paymentterms && element.item.paymentterms.taxes ? element.item.paymentterms.taxes : null,
          paymentdate: element.paymentdate,
          amount: element.amount ? element.amount : 0,
          taxamount: element.taxamount ? element.taxamount : 0,
          discount: element.discount ? element.discount : 0,
          paidamount: element.paidamount ? element.paidamount : 0,
          paymentSuccess: true,
          PaymentID: element._id,
          prefix: element && element._id && element.item && element.item.prefix ? element.item.prefix : '---',
          invoicenumber: element && element._id && element.item && element.item.invoicenumber ? element.item.invoicenumber : '---',
          receiptnumberprefix: element.prefix,
          receiptnumber: element.receiptnumber,
          status: element.status !== "Paid" ? element && element._id && element.item.status ? element.item.status : '---' :  element.status
        });
      });
    }
    return;
  }

}
