import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-viewbillbtn',
  templateUrl: './viewbillbtn.component.html', 
})
export class ViewBillBtnComponent extends BaseLiteComponemntComponent implements OnInit {
  
  @Input() btnLists: any[];
  @Input() displayTxt: string;
  
  
  constructor(
  ) {
    super();
   
  }
  

  async ngOnInit() {
    try {
      super.ngOnInit();
    } catch (error) {
      console.error("error", error)
    } finally { 

  }
}
 
         
} 