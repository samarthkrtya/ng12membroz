import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-customer-booking',
  templateUrl: './customer-booking.component.html',
  styles: [
  ]
})
export class CustomerBookingComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-customer-booking";
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
    this.displayedColumns3 = ['bookingnumber', 'fullname', 'bookingdate','location','resort','checkin', 'checkout', 'status', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.bookings && this.dataContent.bookings.length !== 0) {
      this.dataContent.bookings.forEach(element => {

        console.log("fullname",element.property.guest);
        console.log("locationname",element._id.locationid.locationname);
        console.log("resortname",element._id.resortid.resortname);


        this.dataSource3.push({
          bookingnumber: element.bookingnumber,
          fullname: element.property.guest,
          bookingdate: element.bookingdate,
          location: element._id.locationid.locationname,
          resort: element._id.resortid.resortname,
          checkin: element.checkin,
          checkout: element.checkout,
          prefix: element.prefix,
          status: element.status,
          bookingid:element._id.id,
        });

      });

    }
    return;
  }

}
