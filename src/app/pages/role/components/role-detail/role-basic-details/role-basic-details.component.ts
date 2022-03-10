import { Component, OnInit,Input } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-role-basic-details',
  templateUrl: './role-basic-details.component.html',
})
export class RoleBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  constructor(

  ) {
    super();
    this.pagename = "app-role-basic-details";
  }

  async ngOnInit() {
    super.ngOnInit()
    console.log(this.dataContent);
    
  }

}
