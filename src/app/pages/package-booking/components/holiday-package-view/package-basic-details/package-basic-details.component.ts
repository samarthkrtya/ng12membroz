import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;
@Component({
  selector: 'app-package-basic-details',
  templateUrl: './package-basic-details.component.html'
})
export class PackageBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
  ) { 
    super(); 
  }

  async ngOnInit() {

    super.ngOnInit()
 
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
