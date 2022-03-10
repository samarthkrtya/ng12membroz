import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-campaign-timeline',
  templateUrl: './campaign-timeline.component.html',
  styles: [
  ]
})
export class CampaignTimelineComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() { 
    super();
    this.pagename="app-campaign-timeline";
  }

  async ngOnInit() {
    
    try {
      await super.ngOnInit()
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
