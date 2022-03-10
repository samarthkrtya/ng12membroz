import { Component, OnInit } from '@angular/core';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
@Component({
  selector: 'app-live-chat-components',
  templateUrl: './live-chat-components.component.html'
})
export class LiveChatComponentsComponent extends BaseComponemntComponent implements OnInit {
  chatId: any;
  chatData: any;
  messages: any;
  senderData: any[] = [];
  receiverData: any[] = [];
  sender: any;
  receiver: any;
  constructor(private firestore: AngularFirestore,
    private _route: ActivatedRoute,
    private db: AngularFireDatabase) {
    // 
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = "live-chat";
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.getSenderData();
      await this.getReceiverData();
      await this.getFormDatas();


    }
    catch (error) {
      console.error(error)
    }
  }

  async getSenderData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    var url = "users/filter"
    var method = "POST"

    this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.senderData = data
      })
  }

  async getReceiverData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    var url = "members/filter"
    var method = "POST"

    this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.receiverData = data
      })
  }

  async getFormDatas() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" })

    var url = "formdatas/filter"
    var method = "POST"
    this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        this.chatId = data[0]
        this.getChat();
      })
  }

  async getChat() {
    let getChatId = this.firestore.collection('chat');
    this.firestore.collection('chat').valueChanges({ idField: 'firebaseChatId' })
      .subscribe(val => {
        this.chatData = val
      })
    setTimeout(() => {
      let chat = this.chatData.find(x => x.firebaseChatId == this.chatId.property.fierbasechatid)
      this.firestore
        .collection('chat')
        .doc(chat.firebaseChatId)
        .collection('messages').valueChanges().subscribe(val => {
          this.isLoading = false;
          this.messages = val;
          this.senderData.forEach(element => {
            this.messages.forEach(ele => {
              if (element._id == ele.user._id) {
                this.sender = element
              }
            });
          })
          this.receiverData.forEach(element => {
            this.messages.forEach(ele => {
              if (element._id == ele.user._id) {
                this.receiver = element
              }
            });
          })
        })
    }, 1000);




  }


}
