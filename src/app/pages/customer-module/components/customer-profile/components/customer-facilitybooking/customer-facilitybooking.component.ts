import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-customer-facilitybooking',
  templateUrl: './customer-facilitybooking.component.html',
  styles: [
  ]
})
export class CustomerFacilityBookingComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-customer-facilitybooking";
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
    this.displayedColumns3 = ['title', 'categorytype', 'numberofunit', 'availabilitytype', 'starttime', 'endtime', 'duration', 'charges', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.facilitybookings && this.dataContent.facilitybookings.length !== 0) {
      this.dataContent.facilitybookings.forEach(element => {
        this.dataSource3.push({
          title: element.refid.title,
          categorytype: element.refid.category.property.name,
          numberofunit: element.refid.quantity,
          availabilitytype: element.refid.bookingtype,
          starttime: element.refid.availability.starttime,
          endtime: element.refid.availability.endtime,
          duration: element.refid.duration,
          charges: element.charges,
          facilitybookingid: element._id,
          
        });

      });

    }
    return;
  }

}
