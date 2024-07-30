import { Component, inject, OnInit } from '@angular/core';
import { Publicacion } from 'src/app/models/publicacion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatePublicacionComponent } from 'src/app/shared/components/add-update-publicacion/add-update-publicacion.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  publicaciones: Publicacion[] = [];
  loading: boolean = false;

  ngOnInit() {
  }

  user(): User{
    return this.utilsSvc.getFromLocalStorage('user')
  }

  ionViewWillEnter() {
    this.getProducts();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  // -- Obtener productos --
  getProducts(){
    let path = `users/${this.user().uid}/publicaciones`;

    this.loading = true;


    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.publicaciones = res;
        this.loading = false;
        sub.unsubscribe;
        
      }
    })

  }
  

  // -- Agregar Publicación --
  addUpdateProduct(publicacion?: Publicacion) {
    this.utilsSvc.presentModal({
      component: AddUpdatePublicacionComponent,
      cssClass: 'add-update-modal',
      componentProps: {publicacion}
    })
  }

  // Alerta para eliminar
  async confirmDeletePublicacion(publicacion: Publicacion) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar publicación',
      message: '¿Quieres elimnar esta publicación?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Sí. eliminar',
          handler: () => {
            this.deletePublicacion(publicacion);
          }
        }
      ]
    });
  }


  // -- Eliminar publicación --

  async deletePublicacion(publicacion: Publicacion){
    

    let path = `users/${this.user().uid}/publicaciones/${publicacion.id}`

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(publicacion.image);
    await this.firebaseSvc.deleteFile(imagePath);

    

    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.publicaciones = this.publicaciones.filter(p => p.id !== publicacion.id);


      this.utilsSvc.presentToast({
        message: 'Publicación borrada con éxito',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })


    }).catch(error => {
      console.log(error);

      this.utilsSvc.presentToast({
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
