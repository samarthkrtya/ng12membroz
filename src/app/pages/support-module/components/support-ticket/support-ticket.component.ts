import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subject } from 'rxjs';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
})
export class SupportTicketComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  bindId: any;

  content: string;
  status: string;
  docnumber: string;
  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;

  recordPermission: any[] = [];

  isHead: boolean = false;
  isAssignUser: boolean = false;
  isMember: boolean = false;

  statusList: any[] = [];
  retrvData: object = {};
  userData: any[] = [];
  supportRole: any[] = [];
  assignedUser:any;

  fields = {
    fieldname: "assignuserid",
    fieldtype: "form",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "property", value: 1 },
      { fieldname: "fullname", value: 1 }
    ],
    form: {
      apiurl: "users/filter",
      formfield: "_id",
      displayvalue: "fullname",
    },
    method: "POST",
    value: "",
  }

  constructor(
    private cloudinary: Cloudinary,
    private _route: ActivatedRoute,

    private _lookupsService: LookupsService,
    private _commonService: CommonService,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'service-form';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    
    this.isLoading = true;
    await this.getUserData();
    await this.getStatus();
    await this.getSupportById();
    this.imageConfigration();
    this.isLoading = false;
  }

  async getStatus() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "Ticket Status", "criteria": "eq", "datatype": "string" });

    await this._lookupsService
      .GetByfilterLookupNameAsync(postData)
      .then((lookupData: any[]) => {
        this.statusList = [];
        this.statusList = lookupData[0]["data"];
      });
  }

  async getUserData(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    var url = "users/filter"
    var method = "POST"
    await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any[]) => {
        this.userData = [];
        this.userData = data
      });
  }

  async getSupportById() {

    var url = "supports/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectId" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.retrvData = data[0];
          let support = this.retrvData['supportrole']
          if(support.length > 0){
            support.forEach(element => {
              this.supportRole.push(this.userData.find(x => x._id == element))
            });
          }
          else{
            this.supportRole = this.userData
          }
          this.status = this.retrvData['status'];
          this.docnumber = `${this.retrvData['prefix']}-${this.retrvData['spnumber']}`;
          this.fields['dbvalue'] = this.retrvData['assignuserid'] ? this.retrvData['assignuserid'] : '';
          this.assignedUser = this.retrvData['assignuserid'] ? this.retrvData['assignuserid']._id : '';

          this.recordPermission = [];
          this.isHead = false;
          this.isAssignUser = false;
          this.isMember = false;

          if (this._loginroletype == 'M') {
            this.isMember = true;
            this.isHead = false;
            this.isAssignUser = false;
          } else {
            if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
              var supportObj = this._loginUserRole.permissions.find(p => p.formname == "support");
              if (supportObj && supportObj.recordpermission) {
                this.recordPermission = supportObj.recordpermission;
                var avail = this.recordPermission.find(p => p.type == "edit");
                if (avail && avail.datapermission != 'My') {  // all,My branch
                  this.isHead = true;
                  this.isMember = false;
                  this.isAssignUser = false;
                }
              }
            }
            if (!this.isHead && this.retrvData['assignuserid'] && this.retrvData['assignuserid']['_id'] && this.retrvData['assignuserid']['_id'] == this._loginUserId) {
              this.isAssignUser = true;
              this.isHead = false;
              this.isMember = false;
            }
            if (!this.isHead && this.retrvData['addedby'] && this.retrvData['addedby'] == this._loginUserId) {
              this.isAssignUser = false;
              this.isHead = false;
              this.isMember = true;
            }
          }
          if (this.retrvData['status'] == 'Requested') {
            this.statusList.splice(this.statusList.findIndex(a => a.code == this.retrvData['status']), 1);
          } else if (this.retrvData['status'] == 'In queue' && this.isAssignUser) {
            var queStatus = ["Requested", "In queue"];
            for (let i = 0; i < queStatus.length; i++) {
              this.statusList.splice(this.statusList.findIndex(a => a.code == queStatus[i]), 1);
            }
          } else if (this.retrvData['status'] == 'Open') {
            var queStatus = ["Requested", "In queue", "Open"];
            for (let i = 0; i < queStatus.length; i++) {
              this.statusList.splice(this.statusList.findIndex(a => a.code == queStatus[i]), 1);
            }
          } else if (this.retrvData['status'] == 'Fixed') {
            var queStatus = ["Requested", "In queue", "Open", "Fixed"];
            for (let i = 0; i < queStatus.length; i++) {
              this.statusList.splice(this.statusList.findIndex(a => a.code == queStatus[i]), 1);
            }
          } else if (this.retrvData['status'] == 'Reopen') {
            var queStatus = ["Requested", "In queue", "Open", "Reopen"];
            for (let i = 0; i < queStatus.length; i++) {
              this.statusList.splice(this.statusList.findIndex(a => a.code == queStatus[i]), 1);
            }
          } else if (this.retrvData['status'] == 'Closed') {
            // var queStatus = ["Requested", "In queue", "Open", "Fixed", "Reopen"];
            // for (let i = 0; i < queStatus.length; i++) {
            //   this.statusList.splice(this.statusList.findIndex(a => a.code == queStatus[i]), 1);
            // }
            this.isAssignUser = false;
            this.isHead = false;
            this.isMember = false;
          }

          
          setTimeout(() => {
            this.status = this.retrvData['status'];
          }, 500);
        }
      });
  }


  protected imageConfigration() {

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ],
      // allowedFileType: element.allowedfiletype ? element.allowedfiletype : this.allowedFileType,
      //maxFileSize: element.maxfilesize ? element.maxfilesize : Number(this.maxFileSize)
    };
    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      form.append('context', `photo=${"attachment"}`);
      form.append('tags', "attachment");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = fileItem => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.formImageArray) {
          this.formImageArray = [];
        }
        let extension: any;
        if (fileItem.file) {
          extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
        }
        let fileInfo = {
          attachment: fileItem.data.secure_url,
          extension: extension,
          originalfilename: fileItem.data.original_filename
        };
        this.formImageArray.push(fileInfo);
        $('#' + fieldnameTags).val(fileItem.data.secure_url);
        $(".loading").hide();
      }
    };
    this.customeUploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );
    this.customeUploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress
        });
    this.customeUploader.onWhenAddingFileFailed = (item: any, filter: any) => {
      let message = '';
      switch (filter.name) {
        case 'fileSize':
          message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(Number(this.maxFileSize) * 1024 * 1024);
          this.showNotification("top", "right", message, "danger");
          break;
        default:
          message = 'Error trying to upload file ' + item.name;
          this.showNotification("top", "right", message, "danger");
          break;
      }
    };
  }

  protected formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  protected downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  showSwal(url: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this image file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
      }
    })
  }

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      { name: "quote", class: "quote" },
      { name: 'redText', class: 'redText' },
      { name: "titleText", class: "titleText", tag: "h1" },
    ]
  };

  onSupportRoleChange(event){
    this.assignedUser= event.value
  }


  onSubmit() {
    // if (!this.content) {
    //   super.showNotification("top", "right", "Enter required fields !!", "danger");
    //   return;
    // }
    var url = "supports";
    var method = "PATCH";

    var model = {};
    model['status'] = this.status ? this.status : this.retrvData['status'];
    model['assignuserid'] = this.assignedUser ? this.assignedUser : null;
    if (this.content || this.formImageArray.length > 0) {
      model['response'] = {}
      model['response'] = {
        responderid: this._loginUserId,
        onModel: this._loginroletype == 'M' ? 'Member' : this._loginroletype == 'C' ? 'Promotion' : this._loginroletype == 'A' ? "User" : "User",
        attachments: this.formImageArray,
        content: this.content,
        timestamp: new Date(),
      }
    }


    this.disableButton = true;
    try {
      
      this._commonService
        .commonServiceByUrlMethodData(url, method, model, this.bindId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          
          if (data) {
            this._router.navigate([`/pages/dynamic-list/list/support`]);
            this.disableButton = false;
            this.showNotification("top", "right", "Ticket updated successfully !!", "success");
          }
        });
    } catch (e) {
      this.disableButton = false;
      this.showNotification("top", "right", "Something went wrong !!", "danger");
    }
  }


  onSubmitSidebar() {
    var url = "supports";
    var method = "PATCH";

    var model = {};
    model['status'] = this.status ? this.status : this.retrvData['status'];
    model['assignuserid'] = this.fields['modelValue'] ? this.fields['modelValue']['autocomplete_id'] : null;

    this.disableButton = true;
    try {
      
      this._commonService
        .commonServiceByUrlMethodData(url, method, model, this.bindId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          
          if (data) {
            this._router.navigate([`/pages/dynamic-list/list/support`]);
            this.disableButton = false;
            this.showNotification("top", "right", "Ticket updated successfully !!", "success");
          }
        });
    } catch (e) {
      this.disableButton = false;
      this.showNotification("top", "right", "Something went wrong !!", "danger");
    }

  }


  inputModelChanged(data: any) {
    
    this.status = null;
    if (data && data._id) {
      this.status = "In queue";
    }
  }

}
