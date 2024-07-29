import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);
  modalCtrl = inject(ModalController);


  

 async takePicture(promptLabelHeader) {
  return await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    promptLabelHeader,
    promptLabelPhoto: 'Selecciona una imagen',
    promptLabelPicture: 'Toma una foto'

  });

  
};

  //LOADING

  loading() {
    return this.loadingCtrl.create({spinner: 'crescent'})
  }

  //TOAST
  async presentToast(opts?: ToastOptions){
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // Enruta a cualquier página disponible
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  // Guarda un elemento en localstorage

  saveInLocalStorage(key: string, value: any){
    return localStorage.setItem(key, JSON.stringify(value))
  }

  // Obtine un elemento desde el localstorage
  getFromLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  //MODAL
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
  
    await modal.present();

    const {data} = await modal.onWillDismiss();

    if(data) return data;
  
  }

  dismissModal(data?: any){
    return this.modalCtrl.dismiss(data);
  }
}

