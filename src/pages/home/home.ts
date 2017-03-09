import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, ActionSheetController} from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { InAppBrowser } from 'ionic-native';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public feeds: Array<any>;
  private urlApi: string = "https://www.reddit.com/new.json";
  private urlOlderPosts: string = "https://www.reddit.com/new.json?after=";
  private urlNewerPosts: string = "https://www.reddit.com/new.json?before=";
  public noFilter: Array<any>;
  public hasFilter: boolean = false;

  constructor(public navCtrl: NavController, 
              public http: Http, 
              public loadingCtrl: LoadingController, 
              public toastCtrl: ToastController,
              public actionSheetCtrl: ActionSheetController) {
    this.fetchContent();    
  }


  //Método que busca os feeds para a página principal
  fetchContent ():void {
    let loading = this.loadingCtrl.create({
      content: 'Carregando links...'
    });

    loading.present();

    this.http.get(this.urlApi).map(res => res.json())
      .subscribe(data => {
        this.feeds = data.data.children;

        // Corrigindo as imagens quebradas
        this.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
           // Corrigindo links quebrados
          if (e.data.url.indexOf('& amp;') > -1) {
            e.data.url = e.data.url.split('& amp;').join('&');
          }
        })

        this.noFilter = this.feeds;
        
       
                
        loading.dismiss();
      });  
  }


  // Método que redireciona o item selecionado para o browser
  itemSelected (url):void {
    let browser = new InAppBrowser(url, '_system');
  } 


  doInfinite(infiniteScroll): void {
    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";
    
    this.http.get(this.urlOlderPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
    
      this.feeds = this.feeds.concat(data.data.children);
    
      this.feeds.forEach((e, i, a) => {
        if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
          e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
        }
      })
      infiniteScroll.complete();
      
      this.noFilter = this.feeds;
      this.hasFilter = false;
    }); 
  }

  doRefresh(refresher) {

    if (this.hasFilter){
      this.feeds = this.noFilter;
      this.hasFilter = false;
    }
 
    let paramsUrl = this.feeds[0].data.name;
 
    this.http.get(this.urlNewerPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
      
        this.feeds = data.data.children.concat(this.feeds);
        
        this.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
        })
        refresher.complete();

        this.noFilter = this.feeds;
        this.hasFilter = false;
      });
  } 

  showFilters() :void {
 
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter options:',
      buttons: [
        {
          text: 'Music',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
            this.hasFilter = true;
          }
        },
        {
          text: 'Movies',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
            this.hasFilter = true;
          }
        },        
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.feeds = this.noFilter;
            this.hasFilter = false;
          }
        }
      ]

      
    });

    actionSheet.present();
 
  }  





  // Exemplo de como exibir um Toast
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'botton'
    });
  
    toast.present();
  }
}
