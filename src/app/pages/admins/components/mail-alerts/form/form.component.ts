import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { MailAlertsModel } from 'src/app/core/models/mailalerts/mail-alerts.model';
import { TemplateService } from 'src/app/core/services/template/template.service';
import { MailalertsService } from 'src/app/core/services/mailalerts/mailalerts.service';
import { CommunicationService } from 'src/app/core/services/communications/communications.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { BaseComponemntComponent } from '../../../../../shared/base-componemnt/base-componemnt.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AuthService } from '../../../../../core/services/common/auth.service';
import swal from 'sweetalert2';
import { Cloudinary } from '@cloudinary/angular-5.x';



declare var $: any;
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent extends BaseComponemntComponent implements OnInit {


  templateform: FormGroup;
  atachform: FormGroup;
  isLoading: boolean = true;
  _templatemodel = new MailAlertsModel();
  _bcclists: any[] = [];
  _rolelists: any[] = []
  _templatetypeVisibility: boolean = true;
  bindId: any = '';
  Communicationlists: any = [];
  selectedUser: any[];
  selectedRole: any[];

  selectedfield: any[]
  selectedschema: any[];
  totemp: any[] = [];
  to = new FormControl()
  roleid = new FormControl()
  schema: FormControl;
  selectedFile = [];
  uploader: FileUploader;
  testurl = "http://res.cloudinary.com/dlopjt9le/raw/upload/v1556268638/xd8vxm706hk77ftmi7e8.docx";
  response: any[] = [];
  selectedFileExtension: any;
  disableButton: boolean = false;
  templateData: any[] = [];

  formImageArray: any[] = [];

  _schemaList: any[] = [];
  formList: any[] = [];
  formname: any;
  selectedtype: any;
  formid: any;
  customeUploader: FileUploader;
  maxFileSize = 5 * 1024 * 1024;







  constructor(
    public FormBuilder: FormBuilder,
    private _usersService: UsersService,
    private _route: ActivatedRoute,
    private _templateService: TemplateService,
    private _mailalertsService: MailalertsService,
    private _communicationService: CommunicationService,
    private cloudinary: Cloudinary,
    private authService: AuthService
  ) {
    super();

    this.templateform = FormBuilder.group({
      'to': [this._templatemodel.to],
      'roleid': [this._templatemodel.roleid],
      'subject': [this._templatemodel.subject],
      'content': [this._templatemodel.content],
      'title': [this._templatemodel.title],
      'messagetype': [this._templatemodel.messagetype],
      'formid': [this._templatemodel.formid, Validators.required],
      'mappingfield': [this._templatemodel.mappingfield, Validators.required]
    })

    this.atachform = FormBuilder.group({
      'attachments': [this._templatemodel.attachments]

    })

    this._route.params.subscribe(
      (param: any) => {
        this.bindId = param['id'];
      })
    this.authService.isLoggedIn();

  }

  async ngOnInit() {


    try {
      super.ngOnInit()
      this.initializeVariables();
      this.getform();
      await this.getAlluserlists();
      await this.getAllrolelists()
      this.imageConfigration();



      if (this.bindId) {
        this.getCommunication(this.bindId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }


  async initializeVariables() {
    this._bcclists = [];
    this._rolelists = [];
    this.isLoading = true;
    this.Communicationlists = {};
    this.response = [];
    this.disableButton = false;
  }

  //----------------------------image funciotns------------------------------------//

  removeImg(url: any) {
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
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachments == url), 1);
        this.selectedFile.splice(this.selectedFile.findIndex(b => b == url), 1)
      }
    })
  }


  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
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
      form.append('upload_preset', auth_upload_preset);
      form.append('context', `photo=${"attachments"}`);
      form.append('tags', "attachments");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    uploaderOptions.allowedFileType = ['image']
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
          attachments: fileItem.data.secure_url,
          extension: extension,
          originalfilename: fileItem.data.original_filename
        };
        this.formImageArray.push(fileInfo);
        this.selectedFile.push(fileInfo.attachments);

        console.log(this.formImageArray)
        console.log(this.selectedFile);

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
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachments == url), 1);
      }
    })
  }

  //-----------------------------------------------------------------------------------//




  async getAlluserlists() {

    let userpostData = {};
    userpostData['search'] = [];
    userpostData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    userpostData['sort'] = { 'fullname': -1, };

    return this._usersService
      .AsyncGetByfilter(userpostData)
      .then((data: any) => {
        if (data) {
          this._bcclists = [];
          this._bcclists = data;
          return;
        }
      });
  }

  async getAllrolelists() {

    let rolepostData = {};
    rolepostData['search'] = [];
    rolepostData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    rolepostData['sort'] = { 'rolename': -1, };

    return this._roleService
      .Asyncgetbyfilter(rolepostData)
      .then((data: any) => {
        if (data) {
          this._rolelists = [];
          this._rolelists = data;
          return;
        }
      });
  }

  async getCommunication(id: any) {
    var url = "communications/" + id;
    var method = "GET";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.Communicationlists = data;


          this.templateform.controls['title'].setValue(data.title);
          this.templateform.controls['messagetype'].setValue(data.messagetype);
          this.templateform.controls['subject'].setValue(data.subject);
          this.templateform.controls['formid'].setValue(data.formid._id);

          this.formList.forEach(ele => {
            if (ele._id == data.formid._id) {
              this.getSchema(ele.formname)
            }
          })
          this.templateform.controls['mappingfield'].setValue(data.mappingfield);
          this.templateform.controls['content'].setValue(data.content);

          var to: any[] = [];
          if (this.Communicationlists && this.Communicationlists["to"] && this.Communicationlists["to"].length > 0) {
            this.Communicationlists["to"].forEach(element => {
              to.push(element._id);
            });
          }

          this.to = new FormControl(to);

          var roleid: any[] = [];
          if (this.Communicationlists && this.Communicationlists["roleid"] && this.Communicationlists["roleid"].length > 0) {
            this.Communicationlists["roleid"].forEach(element => {
              roleid.push(element._id);
            });
          }

          this.roleid = new FormControl(roleid);


          this.selectedFile = data.attachments
          this.atachform.controls['attachments'].setValue(this.selectedFile);


          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  onItemSelect(item: any) {
    this.selectedUser = item;
  }

  onRoleSelect(item: any) {
    this.selectedRole = item;
  }

  onfieldname(item: any) {
    this.selectedfield = item;
    console.log(this.selectedfield)
  }

  onSchemaSelect(item: any) {
    this.selectedschema = item;
    console.log(this.selectedschema);

  }

  ontypeSelect1(item: any) {
    this.selectedtype = item;
  }

  onformname(item: any) {
    this.formid = item
    this.formList.forEach(ele => {
      if (item == ele._id) {
        this.formname = ele.formname

      }
    })
    this.getSchema(this.formname)
  }

  getform() {

    let postData = {};
    postData['search'] = [];

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any) => {
        if (data) {

          this.formList = data;
          return;

        }
      })
  }

  getSchema(form: any) {

    var url = "common/schemas/" + form;
    var method = "GET";
    let postData = {};
    postData['search'] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          if (data.length !== 0) {
            this._schemaList = data;

          }
        }
      })
  }

  insert() {
    console.log(this.selectedschema);

  }

  onSubmit(value: any) {
    this.disableButton = true;
    if (!this.bindId) {
      let postData = {
        messagetype: this.selectedtype,
        title: this.templateform.get("title").value,
        to: this.selectedUser,
        roleid: this.selectedRole,
        subject: this.templateform.get("subject").value ? this.templateform.get("subject").value : 'No subject',
        content: this.templateform.get("content").value,
        attachments: this.selectedFile.length > 0 ? this.selectedFile : [],
        formid: this.formid,
        status: 'active',
        mappingfield: this.selectedfield

      }
      console.log(postData)
      var url = "communications/";
      var method = "POST";
      this._commonService.commonServiceByUrlMethodData(url, method, postData)
        .subscribe(data => {
          if (data) {
            this.disableButton = false;
            this.showNotification('top', 'right', 'Communication template added successfully!!!', 'success');
          }
          this.templateform.reset();
          this._router.navigateByUrl("/pages/dynamic-list/list/communication");

        })
    }
    else {
      var url = "communications/" + this.bindId;
      var method = "PUT";

      let postdata = {
        title: this.templateform.get("title").value,
        to: this.selectedUser ? this.selectedUser : this.to.value,
        roleid: this.selectedRole ? this.selectedRole : this.roleid.value,
        formid: this.templateform.get("formid").value,
        messagetype: this.templateform.get("messagetype").value,
        content: this.templateform.get("content").value,
        subject: this.templateform.get("subject").value,
        mappingfield: this.templateform.get("mappingfield").value,
        attachments: this.selectedFile.length > 0 ? this.selectedFile : [],
      }

      console.log(postdata);

      this._commonService
        .commonServiceByUrlMethodData(url, method, postdata).subscribe(data => {
          if (data) {
            console.log(data);
            this.disableButton = false;
            this.showNotification('top', 'right', 'Communication has been updated successfully!!!', 'success');
          }
          this.templateform.reset();

          this._router.navigateByUrl("/pages/dynamic-list/list/communication");
        })
    }

  }



}
