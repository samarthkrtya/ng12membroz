import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { FormdataService } from '../../../../../../core/services/formdata/formdata.service';
import { FormdataModel } from '../../../../../../core/models/formdata/formdata.model';
import { AuthService } from '../../../../../../core/services/common/auth.service';
import { MembershipService } from '../../../../../../core/services/membership/membership.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import swal from 'sweetalert2'
import { Cloudinary } from '@cloudinary/angular-5.x';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { FormsService } from 'src/app/core/services/forms/forms.service';
declare var $: any;

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
})

export class AnnouncementsComponent extends BaseLiteComponemntComponent implements OnInit , OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter<any>();

  @Input() actionListsValue: string[] = [];


  announcementform: FormGroup;
  formdataModel = new FormdataModel();
  isDisable: boolean = false;
  atachform: FormGroup;
  sendType: any[] = [
    { 'name': 'Sms Template', 'checked': false, 'disable': true },
    { 'name': 'Email Template', 'checked': false, 'disable': true },
    { 'name': 'Pushalert', 'checked': false, 'disable': true },
    { 'name': 'WhatsApp', 'checked': false, 'disable': true }
  ];
  sendtype: any;
  templateList: any;
  selectedFile: any;
  selectedFile1: any;
  response: any[] = [];
  response1: any;
  testurl = "http://res.cloudinary.com/dlopjt9le/raw/upload/v1556268638/xd8vxm706hk77ftmi7e8.docx";
  selectedFileExtension: any;
  formImageArray: any[] = [];
  uploader: FileUploader;
  uploader1: FileUploader;
  contactlists=[]
  membershiplists: any[] = [];
  selectedtype: any[];
  selectedmembership=[]
  formId: string;
  exannouncementsList: any[]  = [];
  announcementsPanels: any[] = [];
  currentTab: any = {};
  attachment: any;
  attachment1: any;
  extension: any;
  createform: FormGroup;
  templatetitle: any;
  subject: any;
  content: any;
  proModel: any = {};
  imageid: any;
  maxFileSize: any;
  type: any;
  selectedUser: any[];
  public _loginUserRoleType: any;
  actionLists: any[] = [];
  formLists: any[] = [];
  selectedAction: any;
  myControl = new FormControl();
  myControl1 = new FormControl()
  filteredOptions: Observable<string[]>;
  selectall: boolean;
  allselected:boolean = false;


  selectedvalue = []
  selectid = []
 

  //advance filter
  filterFieldListLoad = false;
  formList: any = {};
  listFilterParams: any = {};
 
  isLoading : boolean;
 
  constructor(
    private _formdataService: FormdataService,
    public FormBuilder: FormBuilder,
    private cloudinary: Cloudinary,
    private authService: AuthService,
    private _membershipService: MembershipService,
    private _commonService: CommonService,
    private _formsService: FormsService,
  ) {

    super();
    this.announcementform = FormBuilder.group({
      'type': [this.formdataModel.property],
      'subject': [],
      'content': [''],
      'membership': ['']

    })

    this.atachform = FormBuilder.group({
      'attachment': [this.formdataModel.property]
    })

    this.createform = FormBuilder.group({
      'templatetitle': [''],
      'subject': [this.formdataModel.property],
      'content': [''],
      'attachment': [''],
      'type': ['']

    });

    this.proModel.templatetitle = '';
    this.proModel.subject = '';
    this.proModel.content = '';
    this.proModel.attachment = '';
    this.proModel.type = '';
  }

  async ngOnInit() {
    await super.ngOnInit();

    this.isDisable = false;
    this.actionLists = [];
    this.actionLists = ["member", "prospect", "user"];
    this.selectedAction = this.actionLists && this.actionLists[0] ? this.actionLists[0] : "member";

    try {
      super.ngOnInit()
      await this.getFormdatas();//announcementlist
      await this.imageConfigration();
      await this.createimageConfigration();
      await this.getAllmemberList();
      await this.getFormDetail();
      await this.getContactLists();


    } catch (error) {
      console.error(error);
    }
    this.filteredOptions = this.myControl1.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.nickname),
        map(option => option ? this.filter(option) : this.contactlists.slice())
      );


  }


  removeFormDAnn(id : any) {
    var Temp = this;
      swal.fire({
        title: 'Do you want to Delete Announcement Data ?',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'YES, DO IT!',
        cancelButtonText: 'CANCEL',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {

          Temp._formdataService.Delete(id).subscribe(data => {
            if (data) {
              console.log(data);
              Temp.showNotification('top', 'right', 'Announcement Data Deleted Successfully!!', 'success');
              Temp.getFormdatas();
            }
          });
        }
        else {
          swal.fire({
            title: 'Cancelled',
            text: 'Your imaginary file is safe :)',
            icon: 'error',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })
    
  }

  onChanges(item: any, event: any) {
    // this.fileInput.value=''

    this.imageid = item._id;


  }

  imageConfigration() {

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;


    //attachment code
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
    };

    this.uploader = new FileUploader(uploaderOptions);
    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    const upsertResponse = fileItem => {
      $('#upload_status').show();
      this.response = fileItem;
      if (fileItem) {
        if (fileItem.status == 200) {
          this.selectedFile = fileItem.data.secure_url;
          this.selectedFileExtension = this.selectedFile.substring(this.selectedFile.lastIndexOf(".") + 1);
        }
      }
    };

    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response)
      });

    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse({
        file: fileItem.file,
        progress,
        data: {}
      });

  }

  formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  createimageConfigration() {

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    //attachment code
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
    };

    this.uploader1 = new FileUploader(uploaderOptions);
    this.uploader1.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    const upsertResponse = fileItem => {
      $('#upload_status').show();
      this.response = fileItem;
      if (fileItem) {
        if (fileItem.status == 200) {
          this.selectedFile1 = fileItem.data.secure_url;
          this.selectedFileExtension = this.selectedFile1.substring(this.selectedFile1.lastIndexOf(".") + 1);
        }
      }
    };

    this.uploader1.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response)
      });

    this.uploader1.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse({
        file: fileItem.file,
        progress,
        data: {}
      });
  }

  removeUpload() {
    this.selectedFile = '';
    this.response = [];

  }

  removeUpload1() {
    this.selectedFile1 = '';
    this.response1 = '';
  }

  onItemSelect1(item: any) {
    this.selectedtype = item;

  }

  async getFormdatas() {

    let postData = {
      "search": [{ "searchfield": "formid", "searchvalue": '5d2724f0a6ae2f159c4086be', "criteria": "eq" },
      { "searchfield": "status", "searchvalue": 'active', "criteria": "eq" }],
      "sort": "createdAt"
    };
    postData['formname'] = "announcement";

    this._formdataService
      .GetByfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data : []) => {
        if (data) {
          this.exannouncementsList = data;
          this.exannouncementsList.map(a=>a.displayname = a.property && a.property.templatetitle ?  a.property.templatetitle.replaceAll(" ",'').toLowerCase() : '')
          this.exannouncementsList.forEach(ele => {
            this.selectedFile = ele.property.attachment;
          })
        }
      })
  }

  removeTags(string) {
    return string.replace(/<[^>]*>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  AddFormDatas() {

    if(!this.templatetitle || !this.type || !this.content){
      this.showNotification('top', 'right', 'Validation Failed !!', 'danger');
      return;
    }

    if(this.exannouncementsList.findIndex(a=>a.displayname == this.templatetitle.replaceAll(" ",'').toLowerCase()) != -1){
      this.showNotification('top', 'right', `${this.templatetitle} named already exist, try with different title !! `, 'danger');
      return;
    }
 
    this.createform.controls['templatetitle'].setValue(this.templatetitle)
    this.createform.controls['subject'].setValue(this.subject)
    this.createform.controls['content'].setValue(this.content)
    this.createform.controls['attachment'].setValue(this.attachment)
    this.createform.controls['type'].setValue(this.type)

    let postData = {
      formid: '5d2724f0a6ae2f159c4086be',
      property: {
        templatetitle: this.templatetitle, subject: this.subject, content: this.content, attachment: this.selectedFile1, type: this.type
      }
    }

    this.isDisable = true;

    this._formdataService.Add(postData).subscribe(data => {
      if (data) {

        this.isDisable = false;
        this.showNotification('top', 'right', 'Announcement added successfully!!!', 'success');
        this.createform.reset();
        $('#myModal').modal('hide');
        this.getFormdatas();
      }
    })

  }

  removeImg(url: any) {
    this.formImageArray = [];
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  updateFormDAnn() {

    if (this.exannouncementsList && this.exannouncementsList.length > 0) {
      var cnt = 0;
      var len = this.exannouncementsList.length;

      
      this.exannouncementsList.forEach(element => {
        var url = "formdatas/" + element._id;
        var method = "PUT";
        
        var postData = { };
        postData['formid'] = element.formid;
        postData['property'] = {};
        postData['property']["subject"] = element.property.subject;
        postData['property']["content"] = element.property.content;
        postData['property']["attachment"] = this.selectedFile ? this.selectedFile : 'no file';
        postData['property']["templatetitle"] = element.property.templatetitle;
        postData['property']["type"] = element.property.type;
        postData['property']["title"] = 'Announcement';
        //postData.property["myControl"] = this.selectedUser ? this.selectedUser : this.to.value,
 

        this.isDisable = true;
        this._commonService
          .commonServiceByUrlMethodData(url, method, postData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            if (data) {
              cnt++;
              if (cnt == len) {
                this.isDisable = false;
                this.showNotification('top', 'right', 'Data has been updated successfully!!!', 'success');
                this.ngOnInit();
              }
            }
          })
      })
    }
  }

  senddata(value: any) {
    
    var tempvalue: any[] = [];
    tempvalue.push(this.selectid)

    let method = "POST";
    let url = "communications/announcement";
    if (this.selectedmembership && this.selectedmembership.length > 0) {
      var postData = {
        subject: value.property.subject ? value.property.subject : 'No subject',
        content: value.property.content ? value.property.content : 'No content',
        attachment: this.selectedFile ? this.selectedFile : undefined,
        type: value.property.type.toUpperCase(),
        search: [{
          "searchfield": "_id",
          "searchvalue": this.selectid,
          "criteria": "in",
          "datatype": "ObjectId"
        },
        {
          "searchfield": "_id",
          "searchvalue": this.selectedmembership,
          "criteria": "in",
          "datatype": "ObjectId"
        }]
      }
    }
    else
    {
      var postData = {
        subject: value.property.subject ? value.property.subject : 'No subject',
        content: value.property.content ? value.property.content : 'No content',
        attachment: this.selectedFile ? this.selectedFile : undefined,
        type: value.property.type.toUpperCase(),
        search: [{
          "searchfield": "_id",
          "searchvalue": this.selectid,
          "criteria": "in",
          "datatype": "ObjectId"
        }]
      }
    }

      this.isDisable = true;
      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {
            this.isDisable = false;
            this.showNotification('top', 'right', 'Notification has been sent successfully!!!', 'success');
          }
      }, (error) => {
        this.isDisable = false;
        console.error(error);
      });
  }


  getAllmemberList() {
    let userpostData = {};
    userpostData['search'] = [];
    userpostData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    userpostData['sort'] = { 'membershipname': -1, };

    return this._membershipService
      .AsyncGetByfilter(userpostData)
      .then((data: any) => {
        if (data) {
          this.membershiplists = [];
          this.membershiplists = data;
          return;
        }
      });
  }

  advanceSearchFilter() {
    this.filterFieldListLoad = !this.filterFieldListLoad;
    if (!this.filterFieldListLoad) {
    }
  }

  onMembershipSelect(item: any) {
    this.selectedmembership = item;

  }

  async getFormDetail() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "formname", searchvalue: this.actionLists, criteria: "in" });
    postData["search"].push({ searchfield: "status", searchvalue: "active", criteria: "eq" });

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any) => {
        if (data) {
          this.formLists = data;
          if (data && data[0]) {
            this.selectedAction = data[0]["formname"];
          }
          this.isLoading = false;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getContactLists() {
    this.isLoading = true;

    var url = "common/contacts/filter";
    var method = "POST";
    var type = this.selectedAction == 'member' ? 'M' : this.selectedAction == 'prospect' ? 'C' : this.selectedAction == 'user' ? 'U' : undefined;

    let postData = {};
    postData["search"] = [];
    //postData["search"].push({ searchfield: "branchid", searchvalue: this._loginUserBranchId, criteria: "eq", datatype: "ObjectId" });
    postData["search"].push({ searchfield: "type", searchvalue: type, criteria: "eq" });


    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          //console.log("data", data);
          this.contactlists = data;
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
      });
  }

  changeAction(item: any) {
    this.selectedAction = item.formname;
    this.contactlists = [];
    this.getContactLists();
  }

  enter() {
    var controlValue = this.myControl.value;
    controlValue['selectedAction'] = this.selectedAction;
    this.myControl.setValue(controlValue);
    this.onSelectOption.emit(controlValue);
    // this.getRedirect(this.myControl.value._id)
  }

  preloaddata() {
    if (this.contactlists && this.contactlists.length == 0) {
      this.getContactLists()
    }
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
    }
  }

  optionSelected(option: any) {

    option.selected = !option.selected;
    if (option.selected) {
      this.selectedvalue.push(option);
      this.selectid.push(option._id)

    } else {
      const i = this.selectedvalue.findIndex(value => value === option);
      this.selectedvalue.splice(i, 1);
    }
    this.myControl1.setValue(this.selectedvalue);
    console.log(this.selectedvalue);

  }

  selectalllang() {
    this.selectid=[]
    this.allselected = true

    if (this.selectall === true) {
        console.log("true")
          this.contactlists.forEach(ele=>{
            if(this.allselected){
              ele.selected = true;
            }
            this.selectedvalue.push(ele)
          this.selectid.push(ele._id);          
          })
      }
      else
      {
        this.contactlists.forEach(ele=>{
        ele.selected = false;
        const i = this.selectedvalue.findIndex(value => value === ele);
        this.selectedvalue.splice(i);
        return;
        })
      }
      this.myControl1.setValue(this.selectedvalue);
   }

  getformDisplayName(formname: any) {
    var formObj = this.formLists.find(p => p.formname == formname);
    if (formObj && formObj.dispalyformname) return formObj.dispalyformname;
    return formname;
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.contactlists
        .filter(option => {
          if (option.nickname) {
            //return option.nickname.toLowerCase().indexOf(value.toLowerCase()) === 0

            return option.nickname.toLowerCase().includes(value.toLowerCase())
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.contactlists.slice();
    }
    return results;
  }

  displayFn(user: any): string {
    //return user && user.nickname ? user.nickname : '';
    let displayValue: string;
    if (Array.isArray(user)) {
      user.forEach((user, index) => {
        if (index === 0) {
          displayValue = user.fullname;
        } else {
          displayValue += ', ' + user.fullname;
        }
      });
    } else {
      displayValue = user;
    }
    return displayValue;
  }

  optionClicked(event: Event, option: any) {
    event.stopPropagation();
    this.optionSelected(option);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}



