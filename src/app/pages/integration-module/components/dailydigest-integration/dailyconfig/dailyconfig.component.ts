import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { ActivatedRoute } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-dailyconfig',
  templateUrl: './dailyconfig.component.html',
})
export class DailyconfigComponent extends BaseComponemntComponent implements OnInit {
  configureform: FormGroup;
  userList: any[] = [];
  _formdataId: any;
  selectedFormdataList: any[] = [];
  selecteduser: any[];

  dispalyformname: any;
  userscheduleAction: any;
  typacheduleeAction: any;
  descriptionscheduleAction: any;

  description: any;
  selectedtype: any;
  isDisable: boolean = false;
  userid: FormControl;

  constructor(
    private formbuilder: FormBuilder,
    private _route: ActivatedRoute
  ) {
    super();
    this._route.params.forEach(params => {
      this._formId = params['formid'];
      this._formdataId = params['formdataid'];

      if (this._formdataId) {
        this.getformdata(this._formdataId);
      }

    });

    this.configureform = formbuilder.group({
      'frequency': [''],
      'description': [''],
      'userid': ['']
    })
  }

  async ngOnInit() {
    this.getAlluserlists();
  }

  getmainData(formname: any) {

  }


  onItemSelect(item: any) {
    this.selecteduser = item;
  }

  onItemSelect1(item: any) {
    this.selectedtype = item;
  }


  getformdata(id: any) {
    var url = "formdatas/" + this._formdataId;
    var method = "GET";
    let postData = {};
    postData['search'] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.selectedFormdataList = [];
          this.selectedFormdataList = data;

          this.dispalyformname = data.formid.dispalyformname;
          if (data && data.property) {
            this.configureform.get("frequency").setValue(this.selectedFormdataList['property']['frequency'])
            this.configureform.get("description").setValue(this.selectedFormdataList['property']['description'])

            this.typacheduleeAction = this.selectedFormdataList['property']['frequency'];
            this.descriptionscheduleAction = this.selectedFormdataList['property']['description'];
          }
          var userid: any[] = [];
          if (this.selectedFormdataList && this.selectedFormdataList["property"]["userid"] && this.selectedFormdataList["property"]["userid"].length > 0) {
            this.selectedFormdataList["property"]["userid"].forEach(element => {
              userid.push(element);

            });
          }
          this.userid = new FormControl(userid);
          this.getmainData(data.formid.workflowid.formname);

          return;
        }
      })
  }

  async getAlluserlists() {

    var url = "users/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.userList = [];
          this.userList = data;
          return;
        }
      });
  }

  onSubmit(value: any) {
    this.isDisable = true;
    if (this.selectedFormdataList['property'] == undefined) {
      this.selectedFormdataList['property'] = []
    }
    else {
      let postData = {
        property: {
          frequency: this.configureform.get("frequency").value,
          userid: this.selecteduser ? this.selecteduser : this.userid.value,

          description: this.configureform.get("description").value

        },
      }
      this.selectedFormdataList['property'] = postData

      var url = "formdatas/" + this._formdataId;
      var method = "PATCH";

      this._commonService.commonServiceByUrlMethodData(url, method, postData)
        .subscribe(data => {
          if (data) {
            this.isDisable = false;
            this.showNotification('top', 'right', 'Trigger detail added successfully!!!', 'success');
          }
        })
    }
  }

  removeTrigger() {
    this._router.navigateByUrl("/pages/integration-module/dailydigest-integration");
  }

}
