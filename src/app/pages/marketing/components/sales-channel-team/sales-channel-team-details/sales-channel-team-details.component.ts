import { Component, OnInit, Input } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-sales-channel-team-details',
  templateUrl: './sales-channel-team-details.component.html'
})
export class SaleChannelDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  constructor(

  ) {
    super();
    this.pagename = "app-sales-channel-team-details";
  }

  async ngOnInit() {
    super.ngOnInit()
  }

}
