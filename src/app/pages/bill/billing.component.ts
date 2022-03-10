import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html'
})

export class BillingComponent implements OnInit {

  
  bindid: any;
  billpid: any;
  billtype: string;
  schemaname: string;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.billpid = params["pid"];
      this.billtype = params["type"];
      this.schemaname = params["schemaname"];
      
    });
  }

  async ngOnInit() {
    try {
      var url;
      if(this.bindid){ url = this.bindid }
      if(this.bindid && this.billpid){ url += '/' + this.billpid; }
      
      if(this.schemaname == 'salesorders'){
        this._router.navigate([`/pages/sale-module/sales-order/${this.billtype}/` + url]);
      }
      else if(this.schemaname == 'quotations'){
        this._router.navigate([`/pages/sale-module/sales-estimate/${this.billtype}/` + url]);
      } else {
      switch(this.billtype.toLowerCase()) {
        case "appointment":
          this._router.navigate(['/pages/appointment-module/frontdesk/view/bill/' + url]);
          break;
        case "facilitybooking":
          this._router.navigate(['/pages/facility-booking-module/frontdesk/view/bill/' + url]);
          break;
        case "pos":
          this._router.navigate(['/pages/sale-module/manage-sales/' + url]);
          break;
        case "wallet":
        case "booking":
        case "facilitybooking-daily":
        case "packagebooking":
        case "program":
          this._router.navigate(['/pages/event/booking-payment/' + url]);
          break;
        case "joborder":
          this._router.navigate(['/pages/inspection-module/job-order/view/bill/' + url]);
          break;
        default:
          this._router.navigate(['/pages/dynamic-dashboard']);
          break;
          // code block
      }
    }
    } catch (error) {
      
    }
  }
  
}
