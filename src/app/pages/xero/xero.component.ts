import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { XeroService } from 'src/app/core/services/xero/xero.service';
import { AuthService } from 'src/app/core/services/common/auth.service';

declare var $:any;

@Component({
  selector: 'app-xero',
  templateUrl: './xero.component.html',
  styleUrls: ['./xero.component.css']
})
export class XeroComponent implements OnInit {

  organization: any

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private XeroService: XeroService
  ) {

    var user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && user.organizationsetting) this.organization = user.organizationsetting;
    
  }

  ngOnInit(): void {
        
    this.route.queryParams.subscribe((params) => {
      if (params && params.code) {
        this.XeroService
            .XeroCallBack(params,this.organization._id)
            .subscribe((data: any) => {   
                 if(data.Status == 'success'){
                  localStorage.setItem('xeroAuth', 'true');  
                  localStorage.setItem('xeroCalendarId', data.CalendarId); 
                 }
                 this.showNotification('top', 'right', data.Message, data.Status);    
                 this.router.navigate(['pages/dynamic-dashboard']); 
              });
      } else {
        if (params.error) {
          this.showNotification('top', 'right', params.error ,'danger');    
          this.router.navigate(['pages/dynamic-dashboard']); 
        }else{
          this.showNotification('top', 'right', 'Something wnet wrong!' , 'danger');    
          this.router.navigate(['pages/dynamic-dashboard']); 
        }
      }
    });
  }
  
  showNotification(from :any, align:any, msg:any, type:any) {
    $.notify({
      icon: "notifications",
      message: msg
    }, {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align
        }
      });
  }

}