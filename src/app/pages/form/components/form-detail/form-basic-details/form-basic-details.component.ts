import { Component, OnInit,Input } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-form-basic-details',
  templateUrl: './form-basic-details.component.html',
})
export class FormBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {
  @Input() dataContent: any;

  constructor() {
    super();
    this.pagename = "app-form-basic-details";
   }

   async ngOnInit() {
    super.ngOnInit()
    //console.log("basic detail",this.dataContent);
    
  }
}
