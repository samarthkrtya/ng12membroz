import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styles: [
  ]
})
export class AppointmentListComponent extends BaseLiteComponemntComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-appointment-list";
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
    this.displayedColumns3 = ['appointmentnumber', 'appointmentdate', 'charges', 'starttime', 'endtime', 'status', 'action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.appointments && this.dataContent.appointments.length !== 0) {
      this.dataContent.appointments.forEach(element => {

        this.dataSource3.push({
          appointmentdate: element.appointmentdate,
          charges: element.charges,
          appointmentnumber: element.docnumber,
          number: element.number,
          prefix: element.prefix,
          starttime: element.timeslot.starttime,
          endtime: element.timeslot.endtime,
          status: element.status,
          appointmentid: element._id,
        });
      });
    }
    return;
  }
}
