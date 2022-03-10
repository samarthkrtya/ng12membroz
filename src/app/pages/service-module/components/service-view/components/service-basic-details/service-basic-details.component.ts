import { Component, Input } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: "app-service-basic-details",
  templateUrl: "./service-basic-details.component.html",
})

export class ServiceBasicDetailsComponent extends BaseLiteComponemntComponent {

  @Input() dataContent: any;


  setStaffName(staff : []) : string{
    if(staff.length > 0){
     return staff.map(a=>a['fullname']).join(',');
    }else{
      return '---'
    }
  }
}
