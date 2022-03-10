import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-customer-referer',
  templateUrl: './customer-referer.component.html',
  styles: [
  ]
})
export class CustomerRefererComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-customer-referer";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.billpayments) {
        await this.getReferer()
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
    this.displayedColumns3 = ['referer', 'email', 'mobile'];
    this.dataSource3 = [];
  }

  async getReferer() {

    console.log("this.dataContent", this.dataContent)
    if (this.dataContent.refers && this.dataContent.refers.length !== 0) {
      this.dataContent.refers.forEach(element => {
        this.dataSource3.push({
          referer: element && element.property && element.property.fullname ? element.property.fullname : '---',
          email: element && element.property && element.property.primaryemail ? element.property.primaryemail : '---',
          mobile: element && element.property && element.property.mobile ? element.property.mobile : '---',
        });
      });
    }
    return;
  }
}
