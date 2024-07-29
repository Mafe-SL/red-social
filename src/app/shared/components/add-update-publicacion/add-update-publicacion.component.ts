import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-add-update-publicacion',
  templateUrl: './add-update-publicacion.component.html',
  styleUrls: ['./add-update-publicacion.component.scss'],
})
export class AddUpdatePublicacionComponent  implements OnInit {

  form = new FormGroup({
    id: new FormControl(""),
    image: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required, Validators.minLength(4)]),
    info: new FormControl("", [Validators.required, Validators.minLength(4)]),
  })

  firebaseSvc = inject(FirebaseService);
  utilSVC = inject(UtilsService);

  user = {} as User;


  ngOnInit() {
    this.user = this.utilSVC.getFromLocalStorage('user');
  }

  // Tomar/Seleccionar Imagen
  async takeImage(){
    const dataUrl = (await this.utilSVC.takePicture('Imagen del Producto')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  async submit(){
    if (this.form.valid) {

      let path = `users/${this.user.uid}/publicaciones`

      const loading = await this.utilSVC.loading();
      await loading.present();

      // Subir la imagen y obtener la url
      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id;



      this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

        this.utilSVC.dismissModal({success: true});



        this.utilSVC.presentToast({
          message: 'Se ha publicado con éxito',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })


      }).catch(error => {
        console.log(error);

        this.utilSVC.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
        
      }).finally(() => {
        loading.dismiss();
      })
    }
  }


}
