import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { RoleService } from 'src/app/core/services/role/role.service';

declare var $: any;

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
})

export class RoleDetailComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();


  dataHtml = '<img [src]="../assets/img/membroz-logo.png" class="profile-avatar-img mr-3 rounded-circle" alt=""><div class="media-body"><div class="font-500 mb-1">$[{fullname}]</div><div class="d-flex"><div class="flex-grow-1"> <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21.999" viewBox="0 0 22 21.999" class="mr-1"><g transform="translate(-13710 408)"><g transform="translate(13714 -404)"><g transform="translate(2.249)"><g transform="translate(0)"><path d="M84.743,0a4.751,4.751,0,1,0,4.751,4.751A4.751,4.751,0,0,0,84.743,0Zm2.5,4.079L86.42,5.107l.09,1.343a.43.43,0,0,1-.181.381.435.435,0,0,1-.25.08.423.423,0,0,1-.168-.035l-1.166-.495-1.165.5a.432.432,0,0,1-.6-.426l.09-1.343-.821-1.028a.432.432,0,0,1,.228-.688l1.224-.32.672-1.132a.448.448,0,0,1,.742,0l.672,1.132,1.226.32a.433.433,0,0,1,.229.688Z" transform="translate(-79.992)" class="svg-fill-secondary-icon" /></g></g><g transform="translate(0 7.732)"><path d="M2.054,279.776.06,283.238a.432.432,0,0,0,.486.633l2.536-.682.675,2.536a.433.433,0,0,0,.359.317l.057,0a.432.432,0,0,0,.374-.216l1.886-3.264a5.617,5.617,0,0,1-4.379-2.79Z" transform="translate(-0.003 -279.776)" class="svg-fill-secondary-icon" /></g><g transform="translate(7.569 7.733)"><g transform="translate(0 0)"><path d="M280.095,283.239l-1.995-3.461a5.615,5.615,0,0,1-4.38,2.789l1.886,3.264a.432.432,0,0,0,.374.216.4.4,0,0,0,.055,0,.434.434,0,0,0,.361-.316l.675-2.536,2.536.682a.432.432,0,0,0,.487-.632Z" transform="translate(-273.72 -279.778)" class="svg-fill-secondary-icon" /></g></g></g><g transform="translate(13710.479 -408)"><g transform="translate(-0.478 0)"><path d="M18.483,3.106a11.067,11.067,0,0,0-15.377,0,11.066,11.066,0,1,0,15.65,15.651,11.067,11.067,0,0,0-.273-15.651Zm-.248,15.129h0a10.329,10.329,0,1,1,3.025-7.3,10.329,10.329,0,0,1-3.025,7.3Z" transform="translate(0.137 0)" class="svg-fill-secondary-icon" /></g></g></g></svg> $[{designationid.title}]</div> <div class="text-danger">$[{status}]</div></div></div>';
  dataContent: any;


  isLoadingData: boolean = true;
  itemVisbility: boolean = true;
  disableBtn: boolean = false;
  tabPermission: any[] = [];



  constructor(
    private _route: ActivatedRoute,

    public _roleService: RoleService,
  ) {
    super();
    this.pagename = "app-role-detail";

    this._route.params.forEach((params) => {
      this._formName = 'role';
      this.bindId = params["id"];
      this.itemVisbility = false;
    });

  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
       // await this.initializeVariables();
        await this.loadData();

      } catch (err) {
        console.error(err);
      } finally {
      }
    })

  }


  async loadData() {
    await this.getMembership();
  }

  async getMembership() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "datatype": "text", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "objectId", "criteria": "eq" });

    var data = await this._roleService.Asyncgetbyfilter(postData) as any;
    this.dataContent = data[0];
    //console.log(this.dataContent);

    this.isLoadingData = true;
    this.tabPermission = []; 

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == "role")
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
    }

    this.itemVisbility = true;
    this.isLoadingData = false;
  }


  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  getUpdatedAvail(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getBIReportPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }
  getUpdatedPrices(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getFunctionPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getUpdatedPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getMenuPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getReportPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }


  getRecordPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getDispositionPermission(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }
  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
