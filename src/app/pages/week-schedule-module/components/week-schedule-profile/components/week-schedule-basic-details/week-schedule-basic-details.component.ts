import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-week-schedule-basic-details',
  templateUrl: './week-schedule-basic-details.component.html',
  styles: [
  ]
})
export class WeekScheduleBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    super()
    this.pagename="app-customer-basic-details";
   }

  async ngOnInit() {
    try {
      super.ngOnInit()
    } catch (error) {

    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
