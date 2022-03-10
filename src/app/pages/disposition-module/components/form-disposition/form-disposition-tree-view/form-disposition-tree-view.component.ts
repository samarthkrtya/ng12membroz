import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-form-disposition-tree-view',
  templateUrl: './form-disposition-tree-view.component.html',
  styles: [
  ]
})
export class FormDispositionTreeViewComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input('treeData') treeDataValue: any[] = [];
  @Input('parent') parentValue: any;
  @Input('formId') formIdValue: any;
  @Output() SubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor() { 
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
    } catch(error) {

    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    return;
  }

  getSubmittedData(submit_data: any) {
    this.SubmitData.emit(submit_data);
  }

  addSub(item: any) {
    let obj = {
      action: "add",
      item: item
    };
    this.SubmitData.emit(obj);
  }

  delete(item: any) {
    let obj = {
      action: "delete",
      item: item
    };
    this.SubmitData.emit(obj);
  }

  edit(item: any) {
    let obj = {
      action: "edit",
      item: item
    };
    this.SubmitData.emit(obj);
  }

}
