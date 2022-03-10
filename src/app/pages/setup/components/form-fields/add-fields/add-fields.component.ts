import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-add-fields',
  templateUrl: './add-fields.component.html',
  styles: [
  ]
})
export class AddFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() item: any;

  constructor() {
    super()
    
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
    } catch (error) {
      console.error(error)
    } finally {
      
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
