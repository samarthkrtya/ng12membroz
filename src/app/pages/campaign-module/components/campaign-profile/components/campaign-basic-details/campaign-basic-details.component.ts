import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../../core/services/common/common.service';
@Component({
  selector: 'app-campaign-basic-details',
  templateUrl: './campaign-basic-details.component.html',
  styles: [
  ]
})
export class CampaignBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() { 
    super();
    this.pagename="app-campaign-basic-details";
  }

  async ngOnInit() {
    
    try {
      await super.ngOnInit();
      // console.log("dataContent",this.dataContent);
    } catch(error) {

    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
