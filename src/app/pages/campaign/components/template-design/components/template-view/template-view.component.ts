import { Component, OnInit, Pipe, PipeTransform, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-template-view',
  templateUrl: './template-view.component.html',
  styleUrls: ['./template-view.component.css']
})
export class TemplateViewComponent extends BaseComponemntComponent implements OnInit {

  campaignData: any;
  constructor(private _route: ActivatedRoute,
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });

  }

  async ngOnInit() {
    await this.getCampaignData();
  }


  async getCampaignData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectId" });

    var url = "campaigns/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.campaignData = data[0]
        }
        return
      })
  }

  onEditDesign() {
    this._router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this._router.navigate(["/pages/campaign/template-design/" + this.campaignData.property.templateid + "/" + this.bindId]);

    });
  }

  onDeleteDesign() {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        let model = {
          property: {
            json: null,
            templateid: null,
            subjectline: this.campaignData.property.subjectline,
            thumbnail: null
          }
        }

        var url = "campaigns/" + this.bindId
        var method = "PATCH"
        return this._commonService
          .commonServiceByUrlMethodData(url, method, model)
          .subscribe((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'Campaign Design has been deleted successfully!!', 'success');
              this._router.navigate(["/pages/campaign/template/" + this.bindId]);
            }
            return
          })
      }
    })
  }

}
