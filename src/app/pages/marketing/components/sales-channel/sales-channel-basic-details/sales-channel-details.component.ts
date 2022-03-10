import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;
@Component({
  selector: 'app-sales-channel-details',
  templateUrl: './sales-channel-details.component.html'
})
export class SaleChannelDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  constructor(

  ) {
    super();
    this.pagename = "app-sales-channel-details";
  }

  async ngOnInit() {
    super.ngOnInit()
  }

}
