import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

declare var $: any;

@Component({
  selector: 'app-contacts-attachment',
  templateUrl: './contacts-attachment.component.html',
  styles: [
  ]
})
export class ContactsAttachmentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  categories: any[] = [];

  uploader: FileUploader;
  response: any[] = [];
  private title: string;
  customeUploader: any[] = [];

  formImageArray: any[] = [];

  viewMoreVisible: boolean = false


  constructor(
    private _commonService: CommonService,
    private cloudinary: Cloudinary,

  ) {
    super()
    this.pagename = "app-attachment";
  }

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() schema: any;

  @Output() onAttachmentData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {

    try {

      await super.ngOnInit();
      await this.initializeVariable();
      await this.getCategories()
      await this.getAttachmentCategories()

    } catch (error) {
      console.error("error", error);
    } finally {
      await this.imageConfigration();
    }
  }

  ngOnDestroy() {

    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariable() {

    this.viewMoreVisible = false;
    if (this.dataContent && this.dataContent.attachments && this.dataContent.attachments.length !== 0) {
      this.dataContent.attachments.forEach(element => {
        if (!this.formImageArray[this.returnTitle(element.categoryname)]) {
          this.formImageArray[this.returnTitle(element.categoryname)] = []
        }
        this.formImageArray[this.returnTitle(element.categoryname)].push(element);
      });

    }
    return;
  }

  async getCategories() {

    var method = "POST";
    var url = "lookups/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "documenttype", "criteria": "eq" });


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.categories = [];
          if (data[0] && data[0]["data"]) {
            this.categories = data[0]["data"];
          }
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getAttachmentCategories() {
    
    if(this.dataContent.attachments && this.dataContent.attachments.length > 0){
        this.categories.forEach(element => {
        var attachment = this.dataContent.attachments.find(p => p.categoryname.toLowerCase() == element.name.toLowerCase())
        if (attachment) {
          element.attachment = attachment.attachment;
          this.viewMoreVisible = true;
        }
      });
    } 
  }

  addAttachment() {

    $("#addAttachment").click();
  }

  async imageConfigration() {

    this.categories.forEach(element => {
      var title = this.returnTitle(element.name);

      var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
      var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

      const uploaderOptions: FileUploaderOptions = {
        url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
        autoUpload: true,
        isHTML5: true,
        removeAfterUpload: true,
        headers: [{ name: 'X-Requested-With', value: 'XMLHttpRequest' }],
      };
      let fieldname = title;
      this.customeUploader[fieldname] = new FileUploader(uploaderOptions);
      this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {
        form.append('upload_preset', auth_upload_preset);
        let tags = title;
        if (this.title) {
          form.append('context', `photo=${title}`);
          tags = title;
        }
        form.append('tags', tags);
        form.append('file', fileItem);

        fileItem.withCredentials = false;
        return { fileItem, form };
      };
      const upsertResponse = fileItem => {
        $(".loading_" + title).show();
        if (fileItem && fileItem.status == 200) {
          let fieldnameTags = fileItem.data.tags[0];
          if (!this.formImageArray[fieldnameTags]) {
            this.formImageArray[fieldnameTags] = [];
          }
          if (!element.value) {
            element.value = "";
          }
          let extension: any;
          if (fileItem.file) {
            extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
          }
          let fileInfo = {
            attachment: fileItem.data.secure_url,
            extension: extension,
            originalfilename: fileItem.data.original_filename,
            categoryname: element.name,
          };
          this.formImageArray[fieldnameTags].push(fileInfo);
          $('#' + fieldnameTags).val(fileItem.data.secure_url);
          $(".loading_" + title).hide();
        }
      };
      this.customeUploader[fieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
        upsertResponse(
          { file: item.file, status, data: JSON.parse(response) }
        );
      this.customeUploader[fieldname].onProgressItem = (fileItem: any, progress: any) =>
        upsertResponse({ file: fileItem.file, progress });
    });
    return;
  }

  uploadAttachment(title: any) {

    $("#fileupload_" + this.returnTitle(title)).click();
  }

  downloadlink(link: any) {

    window.open(link, '_blank');
    return true;
  }

  returnTitle(title: any) {
    var strLower = title.toLowerCase()
    return strLower.replace(/\s/g, '');
  }

  advcQtyClose() {
    $("#attachmentclose").click();

    setTimeout(() => {
      this.onAttachmentData.emit();
    }, 500);
  }
  submit() {
    //debugger;
    var method = "PATCH";
    var url = this.schema + "/" + this.dataContent._id;

    let postData = {};
    postData["attachments"] = [];

    var error = true;
    this.categories.forEach(element => {
      if (this.formImageArray[this.returnTitle(element.name)] && this.formImageArray[this.returnTitle(element.name)].length > 0) {
        console.log("this.formImageArray[this.returnTitle(element.name)]", this.formImageArray[this.returnTitle(element.name)])
        this.formImageArray[this.returnTitle(element.name)].forEach(ele => {
          postData["attachments"].push(ele);
        });
        error = false;
      }
    });

    if (error) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {
      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            $("#attachmentclose").click();
            this.showNotification('top', 'right', 'Attachment has been updated successfully!!!', 'success');
            setTimeout(() => {
              this.onAttachmentData.emit();
            }, 500);
            postData["attachments"] = [];
            return;
          }
        }, (error) => {
          console.error(error);
        });
    }
  }

  removeImg(categoryname: any, attachment: any) {

    for (const key in this.formImageArray) {
      if (key == categoryname) {

        var imageObj = this.formImageArray[key].find(p => p.attachment == attachment);
        if (imageObj) {
          var index = this.formImageArray[key].findIndex(p => p.attachment == attachment);
          this.formImageArray[key].splice(index, 1);
        }
      }
    }
  }

  checkImages(category: any) {
    var img = category.find(p => p.attachment && p.attachment !== '');
    if (img) {
      return true;
    } else {
      return false;
    }

  }
}


