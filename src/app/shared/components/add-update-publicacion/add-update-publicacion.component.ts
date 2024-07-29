import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Publicacion } from 'src/app/models/publicacion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-add-update-publicacion',
  templateUrl: './add-update-publicacion.component.html',
  styleUrls: ['./add-update-publicacion.component.scss'],
})
export class AddUpdatePublicacionComponent  implements OnInit {

  @Input() publicacion: Publicacion;


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
    if (this.publicacion) this.form.setValue(this.publicacion);
  }

  // Tomar/Seleccionar Imagen
  async takeImage(){
    const dataUrl = (await this.utilSVC.takePicture('Imagen del Producto')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit(){
    if(this.form.value){
      if(this.publicacion) this.updatePublicacion();
      else this.createPublicacion();
    }

  }

  // CREAR PRODUCTO

  async createPublicacion(){
    

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

  // ACTUALIZAR PUBLICACIÓN
  async updatePublicacion(){
    let path = `users/${this.user.uid}/publicaciones/${this.publicacion.id}`;
    const loading = await this.utilSVC.loading();
    await loading.present();
  
    try {
      // Verificar si la imagen ha sido cambiada
      if(this.form.value.image !== this.publicacion.image){
        let dataUrl = this.form.value.image;
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          let imagePath = await this.firebaseSvc.getFilePath(this.publicacion.image);
          let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
          this.form.controls.image.setValue(imageUrl);
        } else {
          throw new Error('El formato de la imagen es incorrecto');
        }
      }
  
      delete this.form.value.id;
  
      await this.firebaseSvc.updateDocument(path, this.form.value);
      this.utilSVC.dismissModal({success: true});
      this.utilSVC.presentToast({
        message: 'Se ha actualizado con éxito',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
  
    } catch (error) {
      console.log(error);
      this.utilSVC.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }


 
  


}
