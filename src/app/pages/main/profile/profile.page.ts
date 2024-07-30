import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Publicacion } from 'src/app/models/publicacion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilSVC = inject(UtilsService);

  ngOnInit() {
  }

  user(): User {
    return this.utilSVC.getFromLocalStorage('user');
  }

  // Tomar/Seleccionar Imagen
  async takeImage() {
   
      let user = this.user();
      let path = `users/${user.uid}`;

      
      

      const dataUrl = (await this.utilSVC.takePicture('Foto de Perfil')).dataUrl;

      const loading = await this.utilSVC.loading();
      await loading.present();

      let imagePath = `${user.uid}/profile`;
      user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

      this.firebaseSvc.updateDocument(path, { image: user.image }).then(async res => {

      this.utilSVC.saveInLocalStorage('user', user);

      this.utilSVC.presentToast({
        message: 'La imagen se ha actualizado con éxito',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

    }).catch (error => {
      console.log(error);
      this.utilSVC.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally (() =>  {
      loading.dismiss();
    })
  }
}
