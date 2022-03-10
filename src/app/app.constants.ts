import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
@Injectable()
export class Configuration {

  public Server: string;
  public actionUrl: string;
  public headers: HttpHeaders = new HttpHeaders();

  public serverBaseUrl: '';
  public baseUrl: string;

  public ipAddress: any;


  constructor(private httpClient: HttpClient) {

    this.getIPAddress();

    this.headers = this.headers.set('Content-Type', 'application/json');
    this.headers = this.headers.set('Accept', 'application/json');
    this.headers = this.headers.set('Access-Control-Allow-Origin', '*');
    
    this.baseUrl = location.origin + '/#';

    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            this.Server = 'http://localhost:3001/';
            this.actionUrl = this.Server + 'api/';
    } 
    else if (location.hostname === '20.203.11.82') {
        this.Server = 'http://20.203.11.82:3001/';
        this.actionUrl = this.Server + 'api/';
    } 
    else if (location.hostname === 'demo.easyhrms.com') {
        this.Server = 'http://demo.easyhrms.com/';
        this.actionUrl = this.Server + 'api/';
    } 
    else if (location.hostname === 'app.easyhrms.com') {
        this.Server = 'http://app.easyhrms.com/';
        this.actionUrl = this.Server + 'api/';
    } 
    else if (location.hostname === 'live.easyhrms.com') {
            this.Server = 'http://live.easyhrms.com/';
            this.actionUrl = this.Server + 'api/';
    } 
        else if (location.hostname === 'forbclub.membroz.com') {
            this.Server = 'http://forbclub.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    } 
        else if (location.hostname === 'krtyahr.membroz.com') {
            this.Server = 'http://krtyahr.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    } 
        else if (location.hostname === 'crm.longvisionhospitality.com') {
            this.Server = 'http://crm.longvisionhospitality.com/';
            this.actionUrl = this.Server + 'api/';
     } 
    else if (location.hostname === 'crm.rossettegrand.com') {
            this.Server = 'https://crm.rossettegrand.com/';
            this.actionUrl = this.Server + 'api/';
    } 
        else if (location.hostname === 'app.aaryafamily.club') {
            this.Server = 'http://app.aaryafamily.club/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === '7seasons.membroz.com') {
            this.Server = 'http://7seasons.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'erp.fhiit.lk') {
            this.Server = 'http://erp.fhiit.lk/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'app.theurbancircle.in') {
            this.Server = 'http://app.theurbancircle.in/';
            this.actionUrl = this.Server + 'api/';
    } 
        else if (location.hostname === 'dashboard.vervitude.co') {
            this.Server = 'http://dashboard.vervitude.co/';
            this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'app.membroz.com') {
            this.Server = 'https://app.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'cocoonmedicalspa.membroz.com') {
        this.Server = 'http://cocoonmedicalspa.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'tulipholidays.membroz.com') {
        this.Server = 'http://tulipholidays.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'jeskir.membroz.com') {
        this.Server = 'http://jeskir.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'tfg.membroz.com') {
        this.Server = 'http://tfg.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }    
    else if (location.hostname === 'dubaiyoga.membroz.com') {
        this.Server = 'http://dubaiyoga.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'easyfitness.membroz.com') {
        this.Server = 'http://easyfitness.membroz.com/';
        this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'app.theparkpriviera.com') {
            this.Server = 'http://app.theparkpriviera.com/';
            this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'crm.tagvacationclub.com') {
        this.Server = 'https://crm.tagvacationclub.com/';
        this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'qa.membroz.com') {
            this.Server = 'http://qa.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'enterprise.membroz.com') {
            this.Server = 'https://enterprise.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'hr.commercialsafety.com.au') {
            this.Server = 'https://hr.commercialsafety.com.au/';
            this.actionUrl = this.Server + 'api/';
    }
    else if (location.hostname === 'crm.pinkshospitality.com') {
        this.Server = 'https://crm.pinkshospitality.com/';
        this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'crm.exoticaheritage.com') {
            this.Server = 'http://crm.exoticaheritage.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'crm.666fitnessstudios.com') {
            this.Server = 'http://crm.666fitnessstudios.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'app.surgefitnesslifestyle.com') {
            this.Server = 'http://app.surgefitnesslifestyle.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'cocoonmedicalspa.membroz.com') {
            this.Server = 'http://cocoonmedicalspa.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'app.dubaiyogatrainers.com') {
            this.Server = 'http://app.dubaiyogatrainers.com/';
            this.actionUrl = this.Server + 'api/';
    }
        else if (location.hostname === 'csa.membroz.com') {
            this.Server = 'http://csa.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
      else if (location.hostname === 'easyhrms.membroz.com') {
            this.Server = 'http://easyhrms.membroz.com/';
            this.actionUrl = this.Server + 'api/';
    }
    else {
        this.Server = 'http://' + location.hostname + '/';
        this.actionUrl = this.Server + 'api/';
    }
  }

  getIPAddress() {
    this.httpClient.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress = res.ip;
      
      this.headers = this.headers.set('ipaddress', this.ipAddress);
    });
  }
}
