import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-facility-basic-details',
  templateUrl: './facility-basic-details.component.html',
})
export class FacilityBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  dataSource = new MatTableDataSource;

  propic:any [] = []
  ELEMENT_DATA:any [] = [];

  constructor(

  ) {
    super();
    this.pagename = "app-user-basic-details";
  }

  async ngOnInit() {
    super.ngOnInit()  
       
    
  }
}
