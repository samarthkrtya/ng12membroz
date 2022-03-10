import { Component, Input } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html'
})
export class BookingDetailsComponent extends BaseLiteComponemntComponent {

  @Input() customerDetail: any;
  @Input() dataContent: any;

  constructor(
  ) {
    super();
    this.pagename = "app-booking-details";
  }


}
