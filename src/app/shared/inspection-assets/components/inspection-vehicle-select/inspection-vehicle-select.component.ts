import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-inspection-vehicle-select',
  templateUrl: './inspection-vehicle-select.component.html',
  styles: [
    `
      .example-radio-group {
        display: flex;
        flex-direction: column;
        margin: 15px 0;
      }

      .example-radio-button {
        margin: 5px;
      }

    `
  ]
})
export class InspectionVehicleSelectComponent extends BaseLiteComponemntComponent implements OnInit {

  selectedVehicle: any;
  disableBtn: boolean = false;

  constructor() {
    super()
  }

  @Input() vehicleLists: any;
  @Output() onVehicleSelectData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    $("#openVehicleSelect").click()
  }

  submit() {
    if(this.selectedVehicle) {
      this.disableBtn = true;
      $("#closeVehicle").click();
      this.onVehicleSelectData.emit(this.selectedVehicle)
    } else {
      this.disableBtn = false;
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
    }
  }

}
