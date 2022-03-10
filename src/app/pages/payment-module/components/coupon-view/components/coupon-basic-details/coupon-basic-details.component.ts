import { Component, Input, OnInit } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: "app-coupon-basic-details",
  templateUrl: "./coupon-basic-details.component.html",
})

export class CouponBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {
  @Input() dataContent: any;

  constructor(){super();}

  async ngOnInit() {
    super.ngOnInit();
  }
  
}
