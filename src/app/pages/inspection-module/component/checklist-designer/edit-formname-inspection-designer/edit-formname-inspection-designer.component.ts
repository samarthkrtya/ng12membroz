import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-edit-formname-inspection-designer',
  templateUrl: './edit-formname-inspection-designer.component.html',
  styles: [

    `
      .cell {
        border: 2px solid transparent;
        padding: 11px 20px;
        width: 100%;
        height: 100%;

        &:hover {
          cursor: pointer;
          border: 2px dashed #c8c8c8;
        }
      }

      .cellInput {
        border: 2px solid transparent;
        padding: 11px 20px;
        width: 100%;
        height: 100%;
      }


    `
  ]
})
export class EditFormnameInspectionDesignerComponent implements OnInit {

  @Input() data: number;
  @Output() focusOut: EventEmitter<number> = new EventEmitter<number>();

  currency = '$';
  editMode = false;
  constructor() {}

  ngOnInit() {}

  onFocusOut() {
    this.focusOut.emit(this.data);
  }

  

}
